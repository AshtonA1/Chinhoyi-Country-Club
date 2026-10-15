import { useState } from 'react';
import { CalendarPlus, Download, Loader2 } from 'lucide-react';
import { downloadPdf, type DocSpec } from '@/lib/documents';
import { downloadIcsFile, type IcsEvent } from '@/lib/ics';

type Variant = 'solid' | 'outline' | 'link';

const STYLE: Record<Variant, string> = {
  solid: 'flex items-center justify-center gap-2 bg-club-green px-5 py-3 text-[10px] font-bold tracking-[.14em] text-club-white hover:bg-club-ink disabled:opacity-60',
  outline: 'flex items-center justify-center gap-2 border border-club-ink/25 px-5 py-3 text-[10px] font-bold tracking-[.14em] text-club-ink hover:border-club-green disabled:opacity-60',
  link: 'inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[.12em] text-club-green disabled:opacity-60',
};

/** Builds the document only when pressed, then downloads it as a branded PDF. */
export function DownloadPdfButton({
  build, label, variant = 'outline', testId,
}: { build: () => DocSpec; label: string; variant?: Variant; testId?: string }) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function run() {
    setBusy(true);
    setFailed(false);
    try {
      await downloadPdf(build());
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex flex-col">
      <button type="button" onClick={() => void run()} disabled={busy} className={STYLE[variant]} data-testid={testId}>
        {busy ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
        {busy ? 'PREPARING…' : label}
      </button>
      {failed && <span role="alert" className="mt-1 text-[11px] text-club-alert">Could not create the PDF. Please try again.</span>}
    </span>
  );
}

/** Downloads a calendar file that opens in Google, Apple, Outlook and most phone calendars. */
export function CalendarButton({
  build, filename, label = 'ADD TO CALENDAR', variant = 'outline', testId,
}: { build: () => IcsEvent; filename: string; label?: string; variant?: Variant; testId?: string }) {
  return (
    <button type="button" onClick={() => downloadIcsFile(build(), filename)} className={STYLE[variant]} data-testid={testId}>
      <CalendarPlus size={14} /> {label}
    </button>
  );
}
