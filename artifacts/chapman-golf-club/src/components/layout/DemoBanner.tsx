import { useState } from 'react';
import { X } from 'lucide-react';
import { club } from '@/data/club';

const DISMISS_KEY = 'ccc:demo-banner-dismissed';

function wasDismissed(): boolean {
  try {
    return window.sessionStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

/** Small "preview" notice shown while `club.demoMode` is true. Remove by setting demoMode to false. */
export function DemoBanner() {
  const [hidden, setHidden] = useState(wasDismissed);
  if (!club.demoMode || hidden) return null;
  return (
    <div
      role="note"
      className="fixed bottom-3 left-3 z-[60] flex max-w-[calc(100vw-1.5rem)] items-center gap-3 border border-club-gold/60 bg-club-ink py-2 pl-3 pr-2 text-club-white shadow-lg"
      data-testid="demo-banner"
    >
      <span className="font-mono-club text-[9px] font-bold tracking-[.16em] text-club-gold">PREVIEW</span>
      <span className="text-[11px] leading-4 text-white/80">Draft for review: some details are sample data.</span>
      <button
        onClick={() => {
          setHidden(true);
          try {
            window.sessionStorage.setItem(DISMISS_KEY, '1');
          } catch {
            /* ignore */
          }
        }}
        className="grid h-6 w-6 shrink-0 place-items-center text-white/60 hover:text-white"
        aria-label="Dismiss preview notice"
      >
        <X size={14} />
      </button>
    </div>
  );
}
