/**
 * Builds a downloadable .ics calendar file entirely client-side (no backend).
 *
 * Follows RFC 5545 where calendar apps are strict about it:
 *  - CRLF line endings and a trailing CRLF
 *  - backslash, comma, semicolon and newline escaping
 *  - lines folded at 75 bytes (never inside a multi-byte character)
 *  - an optional reminder (VALARM) so the event actually alerts the person
 */

import { club } from '@/data/club';
import { teeInstant } from '@/lib/dates';

export type IcsEvent = {
  title: string;
  description: string;
  location: string;
  /** Start instant (ignored when allDayDate is set). */
  start: Date;
  durationMinutes: number;
  uid: string;
  /** For a whole-day event: the date, YYYY-MM-DD. Used for club events that have no fixed start time. */
  allDayDate?: string;
  /** Minutes before the start to show a reminder. Default: one day and two hours before. Pass [] for none. */
  reminderMinutes?: number[];
  /** Link back to the club's page for this event. */
  url?: string;
  status?: 'CONFIRMED' | 'TENTATIVE' | 'CANCELLED';
};

const pad = (n: number): string => n.toString().padStart(2, '0');

function toIcsDate(date: Date): string {
  return (
    date.getUTCFullYear().toString() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    'Z'
  );
}

/** "2026-11-07" -> "20261107". */
function toIcsDay(iso: string): string {
  return iso.replaceAll('-', '');
}

function nextDayIso(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/** Folds one content line to at most 75 bytes per physical line, continuing with a leading space. */
export function foldIcsLine(line: string): string {
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= 75) return line;
  const parts: string[] = [];
  let current = '';
  let bytes = 0;
  // The first line may hold 75 bytes; continuation lines start with a space, so they hold 74.
  let limit = 75;
  for (const ch of line) {
    const size = encoder.encode(ch).length;
    if (bytes + size > limit) {
      parts.push(current);
      current = '';
      bytes = 0;
      limit = 74;
    }
    current += ch;
    bytes += size;
  }
  if (current) parts.push(current);
  return parts.join('\r\n ');
}

export function buildIcsFile(event: IcsEvent): string {
  const reminders = event.reminderMinutes ?? [1440, 120];
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Chinhoyi Country Club//Website//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.uid}`,
    `DTSTAMP:${toIcsDate(new Date())}`,
  ];

  if (event.allDayDate) {
    lines.push(`DTSTART;VALUE=DATE:${toIcsDay(event.allDayDate)}`);
    // For a whole-day event the end date is exclusive.
    lines.push(`DTEND;VALUE=DATE:${toIcsDay(nextDayIso(event.allDayDate))}`);
  } else {
    const end = new Date(event.start.getTime() + event.durationMinutes * 60_000);
    lines.push(`DTSTART:${toIcsDate(event.start)}`);
    lines.push(`DTEND:${toIcsDate(end)}`);
  }

  lines.push(`SUMMARY:${escapeIcsText(event.title)}`);
  if (event.description) lines.push(`DESCRIPTION:${escapeIcsText(event.description)}`);
  if (event.location) lines.push(`LOCATION:${escapeIcsText(event.location)}`);
  if (event.url) lines.push(`URL:${event.url}`);
  lines.push(`STATUS:${event.status ?? 'CONFIRMED'}`);
  lines.push('TRANSP:OPAQUE');

  for (const minutes of reminders) {
    if (!Number.isFinite(minutes) || minutes <= 0) continue;
    lines.push(
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapeIcsText(event.title)}`,
      `TRIGGER:-PT${Math.round(minutes)}M`,
      'END:VALARM',
    );
  }

  lines.push('END:VEVENT', 'END:VCALENDAR');
  return lines.map(foldIcsLine).join('\r\n') + '\r\n';
}

export function downloadIcsFile(event: IcsEvent, filename = 'tee-time.ics'): void {
  const blob = new Blob([buildIcsFile(event)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** A club event for a calendar: timed when the event has a start like "07:30", otherwise a whole-day entry. */
export function clubEventIcs(
  event: { id: string; title: string; date: string; time?: string; text?: string; status?: string },
  extra: { uidSuffix?: string; note?: string } = {},
): IcsEvent {
  const timed = event.time && /^\d{1,2}:\d{2}$/.test(event.time.trim());
  const description = [event.text, extra.note].filter(Boolean).join('\n');
  return {
    uid: `${event.id}${extra.uidSuffix ? `-${extra.uidSuffix}` : ''}@chinhoyicountryclub`,
    title: `${event.title} - ${club.name}`,
    description,
    location: `${club.name}, ${club.address}`,
    start: timed ? teeInstant(event.date, event.time!.trim().padStart(5, '0')) : new Date(`${event.date}T00:00:00Z`),
    durationMinutes: timed ? 300 : 0,
    allDayDate: timed ? undefined : event.date,
    status: event.status === 'cancelled' ? 'CANCELLED' : 'CONFIRMED',
  };
}
