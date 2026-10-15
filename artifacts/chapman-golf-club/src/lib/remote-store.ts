import { useCallback, useEffect, useRef, useState } from 'react';
import { reportRemoteError, supabase } from '@/lib/supabase';

/**
 * Server-backed versions of the storage hooks in local-store.ts. Same shape,
 * so no page has to change. Data lives in the `ccc_docs` table (supabase/schema.sql).
 *
 * How it behaves:
 *  - Public site content is cached in the browser, so pages appear instantly and
 *    still work on a weak connection, then refresh from the server.
 *  - Private data (entries, bookings, pending stories) is never cached in the browser.
 *  - Saving updates the screen at once and writes to the server in the background.
 *    If the server refuses, the screen is reloaded from the server and an error banner appears.
 *  - A collection that has never been saved shows the built-in sample data. The first
 *    time staff save a change, the sample data is written first (and a marker row is
 *    added) so deleting every item does not bring the samples back.
 */

type Kind = 'list' | 'object';

/** Browser storage key -> server collection. Anything not listed stays in the browser. */
export const REMOTE_KEYS: Record<string, { collection: string; kind: Kind; cache: boolean }> = {
  'ccc:v1:events': { collection: 'events', kind: 'list', cache: true },
  'ccc:v1:holes': { collection: 'holes', kind: 'list', cache: true },
  'ccc:v1:facilities': { collection: 'facilities', kind: 'list', cache: true },
  'ccc:v1:addons': { collection: 'addons', kind: 'list', cache: true },
  'ccc:v1:pricing': { collection: 'pricing', kind: 'object', cache: true },
  'ccc:v1:course': { collection: 'course', kind: 'object', cache: true },
  'ccc:v1:booking': { collection: 'booking-settings', kind: 'object', cache: true },
  'ccc:v1:event-entries': { collection: 'event-entries', kind: 'list', cache: false },
  'ccc:v1:sponsor-requests': { collection: 'sponsor-requests', kind: 'list', cache: false },
  'chapman:club-stories': { collection: 'stories', kind: 'list', cache: false },
  'chapman:bookings': { collection: 'bookings', kind: 'list', cache: false },
};

const OBJECT_ID = '_';
const CACHE_PREFIX = 'ccc:cache:';

export function isRemoteKey(key: string): boolean {
  return supabase !== null && key in REMOTE_KEYS;
}

function readCache<T>(key: string): T | undefined {
  try {
    const raw = window.localStorage.getItem(CACHE_PREFIX + key);
    return raw === null ? undefined : (JSON.parse(raw) as T);
  } catch {
    return undefined;
  }
}
function writeCache(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(value));
  } catch {
    /* cache is best effort */
  }
}

function fail(action: string, message: string): void {
  console.error(`[club data] ${action} failed:`, message);
  reportRemoteError(`Could not ${action}. ${message}`);
}

/** Reload whenever the visitor signs in/out or comes back to the tab. */
function useReloadTriggers(reload: () => void) {
  const ref = useRef(reload);
  ref.current = reload;
  useEffect(() => {
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange(() => ref.current());
    const onFocus = () => ref.current();
    window.addEventListener('focus', onFocus);
    return () => {
      data.subscription.unsubscribe();
      window.removeEventListener('focus', onFocus);
    };
  }, []);
}

/** A list of records with add / update / remove, stored on the server. */
export function useRemoteCollection<T extends { id: string }>(key: string, seed: T[] = []) {
  const spec = REMOTE_KEYS[key];
  const seedRef = useRef(seed);
  seedRef.current = seed;
  const [items, setItemsState] = useState<T[]>(() => (spec.cache ? readCache<T[]>(key) : undefined) ?? seed);
  const itemsRef = useRef(items);
  const initialised = useRef(false);
  const queue = useRef<Promise<unknown>>(Promise.resolve());

  const setItems = useCallback((next: T[]) => {
    itemsRef.current = next;
    setItemsState(next);
    if (spec.cache) writeCache(key, next);
  }, [key, spec.cache]);

  const reload = useCallback(async () => {
    if (!supabase) return;
    const [rows, meta] = await Promise.all([
      supabase.from('ccc_docs').select('id,data').eq('collection', spec.collection).order('created_at', { ascending: false }),
      supabase.from('ccc_docs').select('id').eq('collection', '_meta').eq('id', spec.collection),
    ]);
    if (rows.error) return console.error('[club data] load failed:', rows.error.message);
    initialised.current = (meta.data?.length ?? 0) > 0;
    const loaded = (rows.data ?? []).map((r) => ({ ...(r.data as T), id: r.id as string }));
    setItems(initialised.current || seedRef.current.length === 0 ? loaded : seedRef.current);
  }, [spec.collection, setItems]);

  useEffect(() => { void reload(); }, [reload]);
  useReloadTriggers(() => { void reload(); });

  /** Run server writes one after another, so quick edits cannot overtake each other. */
  const enqueue = useCallback((action: string, job: () => Promise<{ message: string } | null>) => {
    queue.current = queue.current.then(async () => {
      try {
        const err = await job();
        if (err) { fail(action, err.message); await reload(); }
      } catch (e) {
        fail(action, e instanceof Error ? e.message : 'Unknown error');
        await reload();
      }
    });
  }, [reload]);

  /** First staff save: write the built-in samples so they become real, editable data. */
  const ensureInitialised = useCallback(async (): Promise<{ message: string } | null> => {
    if (!supabase || initialised.current || seedRef.current.length === 0) return null;
    const now = new Date().toISOString();
    const rows = seedRef.current.map((s) => ({ collection: spec.collection, id: s.id, data: s, updated_at: now }));
    const a = await supabase.from('ccc_docs').upsert(rows);
    if (a.error) return a.error;
    const b = await supabase.from('ccc_docs').upsert({ collection: '_meta', id: spec.collection, data: {} });
    if (b.error) return b.error;
    initialised.current = true;
    return null;
  }, [spec.collection]);

  const add = useCallback((item: T): boolean => {
    setItems([item, ...itemsRef.current]);
    enqueue('save the new item', async () => {
      const pre = await ensureInitialised();
      if (pre) return pre;
      const { error } = await supabase!.from('ccc_docs').insert({ collection: spec.collection, id: item.id, data: item });
      return error;
    });
    return true;
  }, [enqueue, ensureInitialised, setItems, spec.collection]);

  const update = useCallback((id: string, patch: Partial<T>): boolean => {
    const current = itemsRef.current.find((i) => i.id === id);
    if (!current) return false;
    const merged = { ...current, ...patch } as T;
    setItems(itemsRef.current.map((i) => (i.id === id ? merged : i)));
    enqueue('save the change', async () => {
      const pre = await ensureInitialised();
      if (pre) return pre;
      const { error } = await supabase!.from('ccc_docs')
        .update({ data: merged, updated_at: new Date().toISOString() })
        .eq('collection', spec.collection).eq('id', id);
      return error;
    });
    return true;
  }, [enqueue, ensureInitialised, setItems, spec.collection]);

  const remove = useCallback((id: string): boolean => {
    setItems(itemsRef.current.filter((i) => i.id !== id));
    enqueue('delete the item', async () => {
      const pre = await ensureInitialised();
      if (pre) return pre;
      const { error } = await supabase!.from('ccc_docs').delete().eq('collection', spec.collection).eq('id', id);
      return error;
    });
    return true;
  }, [enqueue, ensureInitialised, setItems, spec.collection]);

  const replaceAll = useCallback((next: T[]): boolean => {
    const keep = new Set(next.map((i) => i.id));
    const dropped = itemsRef.current.filter((i) => !keep.has(i.id)).map((i) => i.id);
    setItems(next);
    enqueue('save the changes', async () => {
      const pre = await ensureInitialised();
      if (pre) return pre;
      const now = new Date().toISOString();
      const up = await supabase!.from('ccc_docs').upsert(next.map((i) => ({ collection: spec.collection, id: i.id, data: i, updated_at: now })));
      if (up.error) return up.error;
      if (dropped.length) {
        const del = await supabase!.from('ccc_docs').delete().eq('collection', spec.collection).in('id', dropped);
        if (del.error) return del.error;
      }
      return null;
    });
    return true;
  }, [enqueue, ensureInitialised, setItems, spec.collection]);

  /** Throw away admin edits and go back to the built-in sample data (for everyone). */
  const reset = useCallback(() => {
    setItems(seedRef.current);
    enqueue('reset to the sample data', async () => {
      const del = await supabase!.from('ccc_docs').delete().eq('collection', spec.collection);
      if (del.error) return del.error;
      initialised.current = false;
      return ensureInitialised();
    });
  }, [enqueue, ensureInitialised, setItems, spec.collection]);

  return { items, add, update, remove, replaceAll, reset };
}

/** A single settings object (fees, course details...) stored on the server. */
export function useRemoteObject<T extends object>(key: string, defaults: T) {
  const spec = REMOTE_KEYS[key];
  const defaultsRef = useRef(defaults);
  defaultsRef.current = defaults;
  const [value, setValueState] = useState<T>(() => ({ ...defaults, ...(readCache<Partial<T>>(key) ?? {}) }));
  const valueRef = useRef(value);
  const queue = useRef<Promise<unknown>>(Promise.resolve());

  const setValue = useCallback((next: T) => {
    valueRef.current = next;
    setValueState(next);
    writeCache(key, next);
  }, [key]);

  const reload = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase.from('ccc_docs').select('data').eq('collection', spec.collection).eq('id', OBJECT_ID);
    if (error) return console.error('[club data] load failed:', error.message);
    setValue({ ...defaultsRef.current, ...((data?.[0]?.data as Partial<T> | undefined) ?? {}) });
  }, [spec.collection, setValue]);

  useEffect(() => { void reload(); }, [reload]);
  useReloadTriggers(() => { void reload(); });

  const write = useCallback((action: string, job: () => Promise<{ message: string } | null>) => {
    queue.current = queue.current.then(async () => {
      try {
        const err = await job();
        if (err) { fail(action, err.message); await reload(); }
      } catch (e) {
        fail(action, e instanceof Error ? e.message : 'Unknown error');
        await reload();
      }
    });
  }, [reload]);

  const replace = useCallback((next: T): boolean => {
    setValue(next);
    write('save the settings', async () => {
      const { error } = await supabase!.from('ccc_docs').upsert({ collection: spec.collection, id: OBJECT_ID, data: next, updated_at: new Date().toISOString() });
      return error;
    });
    return true;
  }, [setValue, spec.collection, write]);

  const set = useCallback((patch: Partial<T>): boolean => replace({ ...valueRef.current, ...patch }), [replace]);

  const reset = useCallback(() => {
    setValue(defaultsRef.current);
    write('reset the settings', async () => {
      const { error } = await supabase!.from('ccc_docs').delete().eq('collection', spec.collection).eq('id', OBJECT_ID);
      return error;
    });
  }, [setValue, spec.collection, write]);

  return { value, set, replace, reset };
}
