import { useCallback, useEffect, useState } from 'react';

/**
 * This project currently has no backend — every "admin" and "member" screen
 * is a visual prototype. To let flows like Club Story submission → admin
 * approval actually demonstrate end-to-end behaviour in a browser demo, we
 * persist a small amount of state to localStorage and broadcast changes
 * across the app via a custom event. Swap this out for real API calls when
 * a backend exists; the call sites (useLocalCollection) won't need to change.
 */

const CHANGE_EVENT = 'chapman:local-store-change';

function readAll<T>(key: string): T[] {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function writeAll<T>(key: string, items: T[]): void {
  window.localStorage.setItem(key, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { key } }));
}

export function useLocalCollection<T extends { id: string }>(key: string, seed: T[] = []) {
  const [items, setItems] = useState<T[]>(() => {
    const existing = readAll<T>(key);
    if (existing.length === 0 && seed.length > 0) {
      writeAll(key, seed);
      return seed;
    }
    return existing;
  });

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ key: string }>).detail;
      if (!detail || detail.key === key) {
        setItems(readAll<T>(key));
      }
    };
    window.addEventListener(CHANGE_EVENT, handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener(CHANGE_EVENT, handler);
      window.removeEventListener('storage', handler);
    };
  }, [key]);

  const add = useCallback(
    (item: T) => {
      const next = [item, ...readAll<T>(key)];
      writeAll(key, next);
      setItems(next);
    },
    [key],
  );

  const update = useCallback(
    (id: string, patch: Partial<T>) => {
      const next = readAll<T>(key).map((existing) => (existing.id === id ? { ...existing, ...patch } : existing));
      writeAll(key, next);
      setItems(next);
    },
    [key],
  );

  const remove = useCallback(
    (id: string) => {
      const next = readAll<T>(key).filter((existing) => existing.id !== id);
      writeAll(key, next);
      setItems(next);
    },
    [key],
  );

  return { items, add, update, remove };
}
