import { useMemo } from 'react';
import {
  defaultAddOns, defaultBookingSettings, defaultCourse, defaultEvents, defaultFacilities, defaultHoles,
  defaultPricing, type AddOn, type EventItem, type FacilityItem, type Hole,
} from '@/data/club';
import { isUpcoming } from '@/lib/dates';
import { useLocalCollection, useLocalObject } from '@/lib/local-store';
import { sortHoles, teeTotals } from '@/lib/scorecard';

/**
 * Admin-editable club data. Each hook returns the live (possibly edited) data;
 * see local-store.ts for the per-browser caveat until a backend exists.
 */
export const STORE_KEYS = {
  events: 'ccc:v1:events',
  holes: 'ccc:v1:holes',
  facilities: 'ccc:v1:facilities',
  pricing: 'ccc:v1:pricing',
  addOns: 'ccc:v1:addons',
  course: 'ccc:v1:course',
  booking: 'ccc:v1:booking',
} as const;

export function useHoles() {
  const store = useLocalCollection<Hole>(STORE_KEYS.holes, defaultHoles);
  const items = useMemo(() => sortHoles(store.items), [store.items]);
  return { ...store, items };
}

export function useEvents() {
  const store = useLocalCollection<EventItem>(STORE_KEYS.events, defaultEvents);
  const items = useMemo(() => [...store.items].sort((a, b) => a.date.localeCompare(b.date)), [store.items]);
  return { ...store, items };
}

/** Events that have not happened yet and have not been cancelled, soonest first. */
export function upcomingEvents(events: EventItem[], now: number = Date.now()): EventItem[] {
  return events.filter((e) => e.status !== 'cancelled' && isUpcoming(e.date, now));
}

export function useFacilities() {
  return useLocalCollection<FacilityItem>(STORE_KEYS.facilities, defaultFacilities);
}

export function usePricing() {
  return useLocalObject(STORE_KEYS.pricing, defaultPricing);
}

export function useAddOns() {
  return useLocalCollection<AddOn>(STORE_KEYS.addOns, defaultAddOns);
}

export function useCourseConfig() {
  return useLocalObject(STORE_KEYS.course, defaultCourse);
}

export function useBookingSettings() {
  return useLocalObject(STORE_KEYS.booking, defaultBookingSettings);
}

/** Headline numbers for the Home page, derived from the scorecard (never typed by hand). */
export function useCourseStats() {
  const { items: holes } = useHoles();
  const { value: course } = useCourseConfig();
  return useMemo(() => {
    const men = teeTotals(holes, course, 'men');
    return { holes: holes.length, par: men.par.total, metres: men.metres.total };
  }, [holes, course]);
}
