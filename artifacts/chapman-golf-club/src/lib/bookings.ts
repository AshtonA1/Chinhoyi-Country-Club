import type { BookingSettings } from '@/data/club';
import { hasStarted, hoursUntil, isUpcoming } from '@/lib/dates';
import { useLocalCollection } from '@/lib/local-store';

/** Legacy key kept so any bookings already made in a browser keep showing up. */
export const BOOKINGS_KEY = 'chapman:bookings';

export type BookingStatus = 'Requested' | 'Confirmed' | 'Cancelled';

export type BookingRecord = {
  id: string;
  reference: string;
  /** ISO date, YYYY-MM-DD (club time). */
  date: string;
  /** HH:MM, club time. */
  time: string;
  players: number;
  holes: string;
  playerType: string;
  addOns: string[];
  name: string;
  email: string;
  phone: string;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
};

export function useBookings() {
  return useLocalCollection<BookingRecord>(BOOKINGS_KEY);
}

/** Still on the tee sheet: not cancelled and the tee time has not started. */
export function isUpcomingBooking(b: BookingRecord, now: number = Date.now()): boolean {
  return b.status !== 'Cancelled' && isUpcoming(b.date, now) && !hasStarted(b.date, b.time, now);
}

export function canCancel(b: BookingRecord, settings: BookingSettings, now: number = Date.now()): boolean {
  return b.status !== 'Cancelled' && hoursUntil(b.date, b.time, now) >= settings.cancellationHours;
}

export function byDateAsc(a: BookingRecord, b: BookingRecord): number {
  return `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`);
}

export function makeReference(): string {
  return `CCC-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}
