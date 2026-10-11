import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Browser-side persistence for the demo.
 *
 * There is no backend yet, so everything an admin edits (events, holes,
 * facilities, fees, bookings, club stories) is kept in this browser's
 * localStorage. IMPORTANT consequence: changes are per-browser. An admin who
 * edits the events on their laptop will not change what a visitor sees on
 * their phone. When Supabase arrives, replace the three read/write helpers at
 * the top of this file; the hooks (and every call site) stay the same.
 *
 * Rules this file follows:
 *  - A collection is seeded only when its key has never been written, so an
 *    admin who deletes every item does not get the sample items back.
 *  - Nothing is dispatched or written during render.
 *  - A failed write (storage full / blocked) is reported to the caller instead
 *    of silently pretending it worked.
 */

const CHANGE_EVENT = 'ccc:local-store-change';

/** Used only if localStorage itself is unavailable (private mode, blocked). */
const memory = new Map<string, string>();

function getRaw(key: string): string | null {
  if (memory.has(key)) return memory.get(key) ?? null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Returns true when the value reached localStorage. */
function setRaw(key: string, value: string): boolean {
  try {
    window.localStorage.setItem(key, value);
    memory.delete(key);
    return true;
  } catch {
    memory.set(key, value);
    return false;
  }
}

function removeRaw(key: string): void {
  memory.delete(key);
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

function notify(key: string): void {
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { key } }));
}

function parse<T>(raw: string | null): T | undefined {
  if (raw === null) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

function readCollection<T>(key: string, seed: T[]): T[] {
  const raw = getRaw(key);
  if (raw === null) {
    // First visit for this key: persist the seed once (no event, we are in render).
    if (seed.length > 0) setRaw(key, JSON.stringify(seed));
    return seed;
  }
  const parsed = parse<T[]>(raw);
  return Array.isArray(parsed) ? parsed : seed;
}

function readObject<T extends object>(key: string, defaults: T): T {
  const parsed = parse<Partial<T>>(getRaw(key));
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return defaults;
  // Defaults first so fields added in a later version still have a value.
  return { ...defaults, ...parsed };
}

function useStoreListener(key: string, reload: () => void) {
  const reloadRef = useRef(reload);
  reloadRef.current = reload;
  useEffect(() => {
    const handler = (event: Event) => {
      if (event.type === 'storage') {
        const changed = (event as StorageEvent).key;
        if (changed !== null && changed !== key) return;
      } else {
        const detail = (event as CustomEvent<{ key: string }>).detail;
        if (detail && detail.key !== key) return;
      }
      reloadRef.current();
    };
    window.addEventListener(CHANGE_EVENT, handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener(CHANGE_EVENT, handler);
      window.removeEventListener('storage', handler);
    };
  }, [key]);
}

/**
 * A list of records with add / update / remove.
 * `seed` should be a module-level constant (it is only used when the key is empty).
 * Every mutator returns whether the change was saved to the browser.
 */
export function useLocalCollection<T extends { id: string }>(key: string, seed: T[] = []) {
  const seedRef = useRef(seed);
  seedRef.current = seed;
  const [items, setItems] = useState<T[]>(() => readCollection<T>(key, seed));

  useEffect(() => {
    setItems(readCollection<T>(key, seedRef.current));
  }, [key]);

  useStoreListener(key, () => setItems(readCollection<T>(key, seedRef.current)));

  const commit = useCallback(
    (next: T[]): boolean => {
      const ok = setRaw(key, JSON.stringify(next));
      setItems(next);
      notify(key);
      return ok;
    },
    [key],
  );

  const current = useCallback(() => readCollection<T>(key, seedRef.current), [key]);

  const add = useCallback((item: T) => commit([item, ...current()]), [commit, current]);
  const update = useCallback(
    (id: string, patch: Partial<T>) =>
      commit(current().map((existing) => (existing.id === id ? { ...existing, ...patch } : existing))),
    [commit, current],
  );
  const remove = useCallback((id: string) => commit(current().filter((existing) => existing.id !== id)), [commit, current]);
  const replaceAll = useCallback((next: T[]) => commit(next), [commit]);
  /** Throw away admin edits and go back to the built-in sample data. */
  const reset = useCallback(() => {
    removeRaw(key);
    setItems(seedRef.current);
    notify(key);
  }, [key]);

  return { items, add, update, remove, replaceAll, reset };
}

/** A single settings object (e.g. fees). `defaults` should be a module-level constant. */
export function useLocalObject<T extends object>(key: string, defaults: T) {
  const defaultsRef = useRef(defaults);
  defaultsRef.current = defaults;
  const [value, setValue] = useState<T>(() => readObject<T>(key, defaults));

  useEffect(() => {
    setValue(readObject<T>(key, defaultsRef.current));
  }, [key]);

  useStoreListener(key, () => setValue(readObject<T>(key, defaultsRef.current)));

  const replace = useCallback(
    (next: T): boolean => {
      const ok = setRaw(key, JSON.stringify(next));
      setValue(next);
      notify(key);
      return ok;
    },
    [key],
  );

  const set = useCallback(
    (patch: Partial<T>): boolean => replace({ ...readObject<T>(key, defaultsRef.current), ...patch }),
    [key, replace],
  );

  const reset = useCallback(() => {
    removeRaw(key);
    setValue(defaultsRef.current);
    notify(key);
  }, [key]);

  return { value, set, replace, reset };
}
