/**
 * Date helpers. The club is in Zimbabwe (Africa/Harare, UTC+2, no daylight
 * saving), so every "today" and every tee-time instant is computed against that
 * offset rather than the visitor's device time zone.
 *
 * Dates are stored as ISO strings (YYYY-MM-DD) so they sort and compare
 * correctly; they are only turned into words at display time.
 */

export const CLUB_UTC_OFFSET = '+02:00';
const CLUB_OFFSET_MS = 2 * 60 * 60 * 1000;

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const LONG_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const d = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

/** Today's date at the club (YYYY-MM-DD), whatever the device time zone is. */
export function todayIso(now: number = Date.now()): string {
  return new Date(now + CLUB_OFFSET_MS).toISOString().slice(0, 10);
}

/** The instant a tee time starts, interpreted in club time. */
export function teeInstant(date: string, time: string): Date {
  return new Date(`${date}T${time}:00${CLUB_UTC_OFFSET}`);
}

export function addDaysIso(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export type DateParts = { day: string; month: string; year: string; weekday: string; monthLong: string };

export function dateParts(date: string): DateParts {
  const d = new Date(`${date}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return { day: '--', month: '---', year: '----', weekday: '---', monthLong: '' };
  return {
    day: String(d.getUTCDate()).padStart(2, '0'),
    month: MONTHS[d.getUTCMonth()],
    year: String(d.getUTCFullYear()),
    weekday: WEEKDAYS[d.getUTCDay()],
    monthLong: LONG_MONTHS[d.getUTCMonth()],
  };
}

/** "Sat 24 Oct 2026" */
export function formatDate(date: string): string {
  const p = dateParts(date);
  const weekday = p.weekday.charAt(0) + p.weekday.slice(1).toLowerCase();
  const month = p.month.charAt(0) + p.month.slice(1).toLowerCase();
  return `${weekday} ${Number(p.day)} ${month} ${p.year}`;
}

/** "SAT 24 OCT" — used on compact cards. */
export function formatDateShort(date: string): string {
  const p = dateParts(date);
  return `${p.weekday} ${p.day} ${p.month}`;
}

export function isUpcoming(date: string, now: number = Date.now()): boolean {
  return date >= todayIso(now);
}

/** True once the tee time has started (club time). */
export function hasStarted(date: string, time: string, now: number = Date.now()): boolean {
  return teeInstant(date, time).getTime() <= now;
}

export function hoursUntil(date: string, time: string, now: number = Date.now()): number {
  return (teeInstant(date, time).getTime() - now) / 3_600_000;
}
