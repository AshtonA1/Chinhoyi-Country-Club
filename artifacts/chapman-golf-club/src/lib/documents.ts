/**
 * Branded documents: booking confirmations, event entries and receipts, and the playable scorecard.
 *
 * Two layers, on purpose:
 *  1. Builders (bookingDocument, eventEntryDocument, scorecardDocument, ...) are plain functions that turn
 *     club data into a DocSpec. They contain the wording and the facts, and are easy to test.
 *  2. renderPdf(spec) draws any DocSpec with the club logo and colours. It does not know what a booking is.
 *
 * jsPDF is imported lazily, so it is only downloaded when someone actually presses a download button.
 * renderPdf has no browser-only calls apart from loading the logo, so the same code can later build PDFs
 * on the server for emails.
 */
import { club, type CourseConfig, type EventEntry, type EventItem, type Hole } from '@/data/club';
import type { BookingRecord } from '@/lib/bookings';
import { formatDate, todayIso } from '@/lib/dates';
import { formatMoney, formatNumber } from '@/lib/format';
import { backNine, frontNine, teeRating, teeTotals, TEE_LABEL, type TeeKey } from '@/lib/scorecard';

/* ------------------------------------------------------------------ spec */

export type Tone = 'green' | 'gold' | 'ink';
type Align = 'l' | 'c' | 'r';

export type PdfTable = {
  heading?: string;
  columns: string[];
  rows: string[][];
  align?: Align[];
  /** Relative column widths. Default: the first column is wider, the rest equal. */
  weights?: number[];
  /** Fixed row height in mm (used for score rows people write in). */
  rowHeight?: number;
  /** Row numbers to print in bold. */
  boldRows?: number[];
  /** Column numbers to tint and print in bold (OUT / IN / TOTAL). */
  tintCols?: number[];
  fontSize?: number;
};

export type DocSpec = {
  /** Small label above the title, e.g. "BOOKING CONFIRMATION". */
  kind: string;
  title: string;
  intro?: string;
  reference?: string;
  status?: { label: string; tone: Tone };
  facts?: Array<[string, string]>;
  tables?: PdfTable[];
  /** Fill-in lines, e.g. Date / Competition / Marker on a scorecard. */
  blanks?: string[];
  total?: { label: string; value: string; note?: string };
  notes?: string[];
  filename: string;
  orientation?: 'portrait' | 'landscape';
};

/* ----------------------------------------------------------------- brand */

type Rgb = [number, number, number];
const C = {
  ink: [32, 40, 32] as Rgb,
  green: [23, 107, 58] as Rgb,
  gold: [232, 164, 24] as Rgb,
  goldTint: [253, 245, 222] as Rgb,
  grey: [104, 112, 104] as Rgb,
  line: [222, 224, 216] as Rgb,
  white: [255, 255, 255] as Rgb,
};

/** Contact details are placeholders until the club supplies the real ones: never print those on a document. */
function realContact(): string[] {
  const parts: string[] = [club.name];
  if (club.address && !/example/i.test(club.address)) parts.push(club.address);
  if (club.phone && !/0{4,}/.test(club.phone.replace(/\D/g, ''))) parts.push(club.phone);
  if (club.email && !/@example\./i.test(club.email)) parts.push(club.email);
  return parts;
}

/** jsPDF's built-in fonts are Latin-1: keep to characters they can draw. */
export function pdfSafe(value: string): string {
  return value
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/[^\n\x20-\x7E -ÿ]/g, '?');
}

/* ------------------------------------------------------------------ logo */

let logoPromise: Promise<string | null> | null = null;

/** Draws the image at a small size, so every PDF carries a light logo (people download these on mobile data). Falls back to the original. */
function shrinkImage(dataUrl: string, px: number): Promise<string> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = px;
          canvas.height = px;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(dataUrl);
          ctx.drawImage(img, 0, 0, px, px);
          const small = canvas.toDataURL('image/png');
          resolve(small.length < dataUrl.length ? small : dataUrl);
        } catch {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    } catch {
      resolve(dataUrl);
    }
  });
}

/** The club badge as a data URL, or null if it cannot be loaded (the PDF then uses a text badge). */
export function loadLogo(): Promise<string | null> {
  if (!logoPromise) {
    logoPromise = (async () => {
      try {
        const res = await fetch(club.logo);
        if (!res.ok) return null;
        const blob = await res.blob();
        const full = await new Promise<string | null>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        });
        return full ? await shrinkImage(full, 200) : null;
      } catch {
        return null;
      }
    })().then((v) => {
      if (!v) logoPromise = null; // try again next time rather than caching a failure
      return v;
    });
  }
  return logoPromise;
}

/* -------------------------------------------------------------- rendering */

export type RenderOptions = {
  /** Logo as a data URL. Default: load the club badge. Pass null to force the text badge. */
  logo?: string | null;
  /** "Generated on" date, YYYY-MM-DD. Default: today. */
  today?: string;
};

export async function renderPdf(spec: DocSpec, options: RenderOptions = {}): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const logo = options.logo === undefined ? await loadLogo() : options.logo;
  const generated = formatDate(options.today ?? todayIso());

  const landscape = spec.orientation === 'landscape';
  const doc = new jsPDF({ orientation: landscape ? 'landscape' : 'portrait', unit: 'mm', format: 'a4', compress: true });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 18;
  const CW = W - M * 2;
  const FOOT = 20;

  const fill = (c: Rgb) => doc.setFillColor(c[0], c[1], c[2]);
  const stroke = (c: Rgb) => doc.setDrawColor(c[0], c[1], c[2]);
  const ink = (c: Rgb) => doc.setTextColor(c[0], c[1], c[2]);
  const font = (style: 'normal' | 'bold', size: number, family: 'helvetica' | 'courier' = 'helvetica') => {
    doc.setFont(family, style);
    doc.setFontSize(size);
  };
  const wrap = (text: string, width: number): string[] => doc.splitTextToSize(pdfSafe(text), width) as string[];

  let y = 0;

  function drawHeader(first: boolean) {
    const size = first ? (landscape ? 14 : 18) : 11;
    const top = first ? (landscape ? 8 : 11) : 8;
    if (logo) {
      try {
        doc.addImage(logo, 'PNG', M, top, size, size);
      } catch {
        drawTextBadge(M, top, size);
      }
    } else {
      drawTextBadge(M, top, size);
    }
    ink(C.ink);
    font('bold', first ? (landscape ? 13 : 15) : 11);
    doc.text(pdfSafe(club.name), M + size + 4, top + (first ? (landscape ? 6.2 : 8) : 5.2));
    font('normal', first ? 8.5 : 7.5);
    ink(C.grey);
    doc.text(pdfSafe(`${club.city}, ${club.country}`), M + size + 4, top + (first ? (landscape ? 10.6 : 13.5) : 9.2));
    stroke(C.gold);
    doc.setLineWidth(0.9);
    const ruleY = top + size + 4;
    doc.line(M, ruleY, W - M, ruleY);
    y = ruleY + (first ? (landscape ? 9 : 12) : 9);
  }

  function drawTextBadge(x: number, top: number, size: number) {
    fill(C.green);
    doc.circle(x + size / 2, top + size / 2, size / 2, 'F');
    ink(C.white);
    font('bold', size * 0.9);
    doc.text(pdfSafe(club.shortCode), x + size / 2, top + size / 2 + size * 0.11, { align: 'center' });
  }

  function newPage() {
    doc.addPage();
    drawHeader(false);
  }

  function ensure(height: number) {
    if (y + height > H - FOOT) newPage();
  }

  /* -- title block -- */
  drawHeader(true);

  const refW = spec.reference ? 56 : 0;
  ink(C.green);
  font('bold', 8);
  doc.setCharSpace(0.6);
  doc.text(pdfSafe(spec.kind.toUpperCase()), M, y);
  doc.setCharSpace(0);
  const titleTop = y;
  y += 9;
  ink(C.ink);
  font('bold', 22);
  const titleLines = wrap(spec.title, CW - refW - 4);
  doc.text(titleLines, M, y);
  y += titleLines.length * 8.6;

  if (spec.reference) {
    const bx = W - M - refW;
    stroke(C.line);
    doc.setLineWidth(0.3);
    doc.roundedRect(bx, titleTop - 4, refW, spec.status ? 27 : 19, 1.5, 1.5, 'S');
    ink(C.grey);
    font('bold', 6.8);
    doc.setCharSpace(0.5);
    doc.text('REFERENCE', bx + 4, titleTop + 1);
    doc.setCharSpace(0);
    ink(C.ink);
    font('bold', 13, 'courier');
    doc.text(pdfSafe(spec.reference), bx + 4, titleTop + 8.5);
    if (spec.status) {
      const label = pdfSafe(spec.status.label.toUpperCase());
      font('bold', 7.5);
      const tw = doc.getTextWidth(label) + 8;
      const tone = spec.status.tone;
      fill(tone === 'green' ? C.green : tone === 'gold' ? C.gold : C.ink);
      doc.roundedRect(bx + 4, titleTop + 12, tw, 6.4, 3.2, 3.2, 'F');
      ink(tone === 'gold' ? C.ink : C.white);
      doc.text(label, bx + 4 + tw / 2, titleTop + 16.4, { align: 'center' });
    }
    y = Math.max(y, titleTop + (spec.status ? 27 : 19) + 2);
  }

  if (spec.intro) {
    ink(C.grey);
    font('normal', 10);
    const lines = wrap(spec.intro, CW);
    doc.text(lines, M, y + 1, { lineHeightFactor: 1.5 });
    y += lines.length * 5.4 + 3;
  }
  y += 4;

  /* -- facts grid -- */
  if (spec.facts && spec.facts.length > 0) {
    const perRow = landscape ? 4 : 2;
    const gap = 8;
    const colW = (CW - gap * (perRow - 1)) / perRow;
    for (let i = 0; i < spec.facts.length; i += perRow) {
      const group = spec.facts.slice(i, i + perRow);
      const heights = group.map(([, v]) => wrap(v || '-', colW).length * 5 + 9);
      const rowH = Math.max(...heights);
      ensure(rowH);
      group.forEach(([k, v], j) => {
        const x = M + j * (colW + gap);
        ink(C.grey);
        font('bold', 6.8);
        doc.setCharSpace(0.5);
        doc.text(pdfSafe(k.toUpperCase()), x, y);
        doc.setCharSpace(0);
        ink(C.ink);
        font('normal', 10.5);
        doc.text(wrap(v || '-', colW), x, y + 5.4, { lineHeightFactor: 1.35 });
      });
      stroke(C.line);
      doc.setLineWidth(0.25);
      doc.line(M, y + rowH - 3.2, W - M, y + rowH - 3.2);
      y += rowH;
    }
    y += 3;
  }

  /* -- tables -- */
  for (const table of spec.tables ?? []) {
    const size = table.fontSize ?? 9;
    const cols = table.columns.length;
    const weights = table.weights ?? table.columns.map((_, i) => (i === 0 && cols > 3 ? 1.8 : 1));
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    const widths = weights.map((w) => (w / totalWeight) * CW);
    const align = table.align ?? table.columns.map((_, i) => (i === 0 ? 'l' : cols > 3 ? 'c' : 'l'));
    const textX = (i: number, x: number): { x: number; a: 'left' | 'center' | 'right' } => {
      if (align[i] === 'c') return { x: x + widths[i] / 2, a: 'center' };
      if (align[i] === 'r') return { x: x + widths[i] - 2.5, a: 'right' };
      return { x: x + 2.5, a: 'left' };
    };

    if (table.heading) {
      ensure(16);
      ink(C.green);
      font('bold', 8);
      doc.setCharSpace(0.6);
      doc.text(pdfSafe(table.heading.toUpperCase()), M, y);
      doc.setCharSpace(0);
      y += 4;
    }

    const drawHeaderRow = () => {
      fill(C.green);
      doc.rect(M, y, CW, 8, 'F');
      ink(C.white);
      font('bold', size - 0.5);
      let x = M;
      table.columns.forEach((c, i) => {
        const t = textX(i, x);
        doc.text(pdfSafe(c), t.x, y + 5.3, { align: t.a });
        x += widths[i];
      });
      y += 8;
    };

    ensure(8 + (table.rowHeight ?? 9));
    drawHeaderRow();

    table.rows.forEach((row, r) => {
      font(table.boldRows?.includes(r) ? 'bold' : 'normal', size);
      const cellLines = row.map((cell, i) => wrap(cell, widths[i] - 5));
      const rowH = table.rowHeight ?? Math.max(...cellLines.map((l) => l.length)) * (size * 0.42) + 4.6;
      if (y + rowH > H - FOOT) {
        newPage();
        drawHeaderRow();
      }
      if (r % 2 === 1) {
        fill([250, 250, 246]);
        doc.rect(M, y, CW, rowH, 'F');
      }
      let x = M;
      row.forEach((_, i) => {
        if (table.tintCols?.includes(i)) {
          fill(C.goldTint);
          doc.rect(x, y, widths[i], rowH, 'F');
        }
        const bold = table.boldRows?.includes(r) || table.tintCols?.includes(i);
        font(bold ? 'bold' : 'normal', size);
        ink(C.ink);
        const t = textX(i, x);
        const baseline = table.rowHeight ? y + rowH / 2 + size * 0.17 : y + 3.4 + size * 0.17;
        doc.text(cellLines[i], t.x, baseline, { align: t.a, lineHeightFactor: 1.25 });
        x += widths[i];
      });
      stroke(C.line);
      doc.setLineWidth(0.2);
      doc.line(M, y + rowH, W - M, y + rowH);
      // vertical lines make the score rows easy to write in
      if (table.rowHeight) {
        let vx = M;
        widths.forEach((w) => {
          doc.line(vx, y, vx, y + rowH);
          vx += w;
        });
        doc.line(vx, y, vx, y + rowH);
      }
      y += rowH;
    });
    y += landscape ? 5 : 7;
  }

  /* -- blanks to fill in -- */
  if (spec.blanks && spec.blanks.length > 0) {
    ensure(10);
    const slot = CW / spec.blanks.length;
    spec.blanks.forEach((label, i) => {
      const x = M + i * slot;
      ink(C.grey);
      font('bold', 7);
      doc.text(pdfSafe(label.toUpperCase()), x, y);
      stroke(C.ink);
      doc.setLineWidth(0.25);
      doc.line(x, y + 7, x + slot - 8, y + 7);
    });
    y += 14;
  }

  /* -- total -- */
  if (spec.total) {
    ensure(26);
    const bw = 84;
    const bx = W - M - bw;
    fill(C.green);
    doc.roundedRect(bx, y, bw, 17, 1.5, 1.5, 'F');
    ink(C.white);
    font('bold', 7.5);
    doc.setCharSpace(0.5);
    doc.text(pdfSafe(spec.total.label.toUpperCase()), bx + 5, y + 6.4);
    doc.setCharSpace(0);
    font('bold', 17);
    doc.text(pdfSafe(spec.total.value), bx + bw - 5, y + 12.6, { align: 'right' });
    if (spec.total.note) {
      ink(C.grey);
      font('normal', 8.5);
      const lines = wrap(spec.total.note, bw);
      doc.text(lines, W - M, y + 22, { align: 'right' });
      y += lines.length * 4;
    }
    y += 24;
  }

  /* -- notes -- */
  if (spec.notes && spec.notes.length > 0) {
    ensure(18);
    ink(C.green);
    font('bold', 8);
    doc.setCharSpace(0.6);
    doc.text('GOOD TO KNOW', M, y);
    doc.setCharSpace(0);
    y += 5.5;
    spec.notes.forEach((note) => {
      font('normal', 9.5);
      const lines = wrap(note, CW - 7);
      ensure(lines.length * 4.8 + 2);
      fill(C.gold);
      doc.rect(M, y - 2.2, 2, 2, 'F');
      ink(C.ink);
      doc.text(lines, M + 6, y, { lineHeightFactor: 1.4 });
      y += lines.length * 4.8 + 2;
    });
  }

  /* -- footer on every page -- */
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    stroke(C.gold);
    doc.setLineWidth(0.5);
    doc.line(M, H - 15, W - M, H - 15);
    ink(C.grey);
    font('normal', 7.5);
    doc.text(pdfSafe(realContact().join('  |  ')), M, H - 10);
    doc.text(pdfSafe(`Generated ${generated}  |  Page ${p} of ${pages}`), W - M, H - 10, { align: 'right' });
  }

  doc.setProperties({ title: pdfSafe(`${club.name} - ${spec.kind}`), author: club.name, creator: club.name });
  return doc.output('blob');
}

/** Renders the document and hands it to the browser as a download. */
export async function downloadPdf(spec: DocSpec, options: RenderOptions = {}): Promise<void> {
  const blob = await renderPdf(spec, options);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = spec.filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/* -------------------------------------------------------------- builders */

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** A tee-time booking: a request until the club confirms it. */
export function bookingDocument(b: BookingRecord, symbol = '$'): DocSpec {
  const status: DocSpec['status'] =
    b.status === 'Confirmed' ? { label: 'Confirmed', tone: 'green' }
    : b.status === 'Cancelled' ? { label: 'Cancelled', tone: 'ink' }
    : { label: 'Requested', tone: 'gold' };
  const kind = b.status === 'Confirmed' ? 'Booking confirmation' : b.status === 'Cancelled' ? 'Booking cancelled' : 'Booking request';
  const notes: string[] = [];
  if (b.status === 'Requested') notes.push('This is a request. Your tee time is only confirmed once the club confirms it.');
  if (b.status !== 'Cancelled') notes.push('The total is paid at the club. Quote your reference when you arrive.');
  notes.push('To change or cancel, use My tee times on the club website or contact the club.');
  return {
    kind,
    title: b.status === 'Confirmed' ? 'Your tee time is confirmed.' : b.status === 'Cancelled' ? 'This booking was cancelled.' : 'We have your request.',
    reference: b.reference,
    status,
    facts: [
      ['Date', formatDate(b.date)],
      ['Tee time', b.time],
      ['Players', plural(b.players, 'player')],
      ['Round', b.holes],
      ['Player type', b.playerType],
      ['Add-ons', b.addOns.length > 0 ? b.addOns.join(', ') : 'None'],
      ['Booked by', b.name],
      ['Contact', [b.email, b.phone].filter(Boolean).join('  |  ')],
    ],
    total: b.status === 'Cancelled' ? undefined : { label: 'Total to pay at the club', value: formatMoney(b.totalPrice, symbol) },
    notes,
    filename: `booking-${b.reference}.pdf`,
  };
}

/** An entry plus the payment details the payment service adds once it is paid. */
export type PaidEntry = EventEntry & { paidAt?: string; paymentReference?: string };

export type PaymentInfo = {
  /** Paynow / site payment reference. */
  reference?: string;
  paidAt?: string;
};

/** An event entry: a confirmation while it is unpaid, a payment receipt once it is paid. */
export function eventEntryDocument(entry: PaidEntry, payment: PaymentInfo = {}): DocSpec {
  const paid = entry.status === 'paid';
  const cancelled = entry.status === 'cancelled';
  const facts: Array<[string, string]> = [
    ['Event', entry.eventTitle],
    ['Event date', formatDate(entry.eventDate)],
    ['Entry', entry.format === 'fourball' ? 'Four-ball (team of four)' : 'Single player'],
    [entry.players.length > 1 ? 'Players' : 'Player', entry.players.join(', ')],
    ['Contact', [entry.email, entry.phone].filter(Boolean).join('  |  ')],
  ];
  if (paid) {
    const reference = payment.reference ?? entry.paymentReference;
    const paidAt = payment.paidAt ?? entry.paidAt;
    if (paidAt) facts.push(['Paid on', formatDate(paidAt.slice(0, 10))]);
    if (reference) facts.push(['Payment reference', reference]);
  }
  const notes: string[] = paid
    ? ['Keep this receipt. It is proof that your entry has been paid.', 'The club will confirm tee times and format before the event.']
    : cancelled
      ? ['This entry was cancelled.']
      : ['Your place is reserved until payment is received. Pay online from the event page, or contact the club.'];
  return {
    kind: paid ? 'Payment receipt' : cancelled ? 'Entry cancelled' : 'Entry confirmation',
    title: paid ? 'Payment received. Thank you.' : cancelled ? 'This entry was cancelled.' : 'Your entry is reserved.',
    reference: entry.ref,
    status: paid ? { label: 'Paid', tone: 'green' } : cancelled ? { label: 'Cancelled', tone: 'ink' } : { label: 'Awaiting payment', tone: 'gold' },
    facts,
    total: cancelled ? undefined : { label: paid ? 'Amount paid' : 'Amount due', value: formatMoney(entry.total) },
    notes,
    filename: `${paid ? 'receipt' : 'entry'}-${entry.ref}.pdf`,
  };
}

/** A sample round receipt for the member room, until real round data is connected. */
export function roundReceiptDocument(row: { date: string; time: string; detail: string; score: string | number }): DocSpec {
  return {
    kind: 'Round summary',
    title: 'Round summary.',
    status: { label: 'Sample', tone: 'gold' },
    facts: [
      ['Date', formatDate(row.date)],
      ['Tee time', row.time],
      ['Round', row.detail],
      ['Score', String(row.score)],
    ],
    notes: ['This is sample data. Real rounds will appear here once the club connects round records.'],
    filename: `round-${row.date}.pdf`,
  };
}

/** A club event for the calendar and for sharing: details, prices and how to enter. */
export function eventDocument(event: EventItem): DocSpec {
  const facts: Array<[string, string]> = [['Date', formatDate(event.date)], ['Type', event.type]];
  if (event.time) facts.push(['Start', event.time]);
  if (event.entryFee) facts.push(['Entry fee', event.entryFee]);
  if (event.registrationDeadline) facts.push(['Register by', event.registrationDeadline]);
  const priceRows: string[][] = [];
  if (event.singlePrice !== undefined) priceRows.push(['Single player', formatMoney(event.singlePrice)]);
  if (event.fourBallPrice !== undefined) priceRows.push(['Four-ball (team of four)', formatMoney(event.fourBallPrice)]);
  const tables: PdfTable[] = [];
  if (priceRows.length > 0) tables.push({ heading: 'Entry prices (USD)', columns: ['Entry', 'Price'], rows: priceRows, align: ['l', 'r'], weights: [3, 1] });
  if (event.schedule && event.schedule.length > 0) tables.push({ heading: 'Schedule', columns: ['Programme'], rows: event.schedule.map((s) => [s]), align: ['l'], weights: [1] });
  const notes = [...(event.prizes ?? []).map((p) => `Prize: ${p}`), ...(event.rules ?? [])];
  return {
    kind: event.type,
    title: event.title,
    intro: event.text,
    status: event.status === 'cancelled' ? { label: 'Cancelled', tone: 'ink' } : { label: 'Confirmed', tone: 'green' },
    facts,
    tables,
    notes,
    filename: `event-${event.id}.pdf`,
  };
}

/** The course scorecard, A4 landscape, with room for four players to write their scores. */
export function scorecardDocument(holes: Hole[], course: CourseConfig, tee: TeeKey): DocSpec {
  const front = frontNine(holes);
  const back = backNine(holes);
  const totals = teeTotals(holes, course, tee);
  const rating = teeRating(course, tee);

  const header = ['HOLE', ...front.map((h) => String(h.number)), 'OUT', ...back.map((h) => String(h.number)), 'IN', 'TOT'];
  const line = (pick: (h: Hole) => number, out: string, inn: string, tot: string) => [
    ...front.map((h) => String(pick(h))), out,
    ...back.map((h) => String(pick(h))), inn, tot,
  ];
  const metres = ['Metres', ...line((h) => h[tee].metres, formatNumber(totals.metres.front), formatNumber(totals.metres.back), formatNumber(totals.metres.total))];
  const par = ['Par', ...line((h) => h[tee].par, String(totals.par.front), String(totals.par.back), String(totals.par.total))];
  const stroke = ['Stroke index', ...line((h) => h[tee].stroke, '', '', '')];
  const players = [1, 2, 3, 4].map((n) => [`Player ${n}`, ...Array(header.length - 1).fill('')]);

  const cols = header.length;
  const weights = header.map((_, i) => (i === 0 ? 2.7 : i === 10 || i === 20 || i === 21 ? 1.35 : 1));
  const facts: Array<[string, string]> = [
    ['Tees', TEE_LABEL[tee]],
    ['Par', String(totals.par.total)],
    ['Total distance', `${formatNumber(totals.metres.total)} m`],
  ];
  if (rating) facts.push(['Course rating / slope', `${rating.rating} / ${rating.slope}`]);

  return {
    kind: 'Scorecard',
    title: 'Course scorecard',
    facts,
    tables: [
      {
        heading: `${TEE_LABEL[tee]} - par ${totals.par.total}`,
        columns: header,
        rows: [metres, par, stroke],
        weights,
        tintCols: [10, 20, 21],
        align: Array(cols).fill('c').map((a, i) => (i === 0 ? 'l' : a)) as Align[],
        boldRows: [1],
        fontSize: 9,
      },
      {
        columns: header.map((c, i) => (i === 0 ? 'SCORES' : c)),
        rows: players,
        weights,
        tintCols: [10, 20, 21],
        rowHeight: 9,
        fontSize: 9,
      },
    ],
    blanks: ['Date', 'Competition', 'Marker', 'Player signature'],
    filename: `scorecard-${tee}.pdf`,
    orientation: 'landscape',
  };
}
