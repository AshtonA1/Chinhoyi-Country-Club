import { useState } from 'react';
import { CircleCheck } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { PageIntro, usePageMeta } from '@/components/layout/Shared';
import { club, images } from '@/data/club';
import { mailerCall } from '@/lib/mailer';

/**
 * Opened from the link at the bottom of club news emails.
 * It only unsubscribes after the person presses the button: mail scanners open links on their own,
 * and that must not quietly unsubscribe anybody.
 */
export default function Unsubscribe() {
  usePageMeta('Unsubscribe', 'Stop club news emails.');
  const token = typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('token') ?? '';
  const [phase, setPhase] = useState<'ask' | 'working' | 'done' | 'error'>('ask');
  const [message, setMessage] = useState('');

  async function confirm() {
    setPhase('working');
    const r = await mailerCall<{ email: string }>('unsubscribe', { token });
    if (r.ok) setPhase('done');
    else { setPhase('error'); setMessage(r.error); }
  }

  return (
    <div className="bg-club-white">
      <PageIntro eyebrow="EMAIL PREFERENCES" title="Club news emails." copy={`Choose whether ${club.name} sends you news by email.`} image={images.green} />
      <main className="mx-auto max-w-[640px] px-5 py-20 md:py-28">
        {!token && <p className="text-sm leading-7 text-club-ink/70" data-testid="unsub-missing">This page needs the link from the bottom of a club email. Please open it from there.</p>}
        {token && phase === 'ask' && (
          <div data-testid="unsub-ask">
            <p className="text-sm leading-7 text-club-ink/70">Stop club news emails such as event reminders? You will still get receipts and booking messages about your own activity.</p>
            <button onClick={() => void confirm()} className="mt-6 bg-club-green px-6 py-4 text-[10px] font-bold tracking-[.15em] text-club-white hover:bg-club-ink" data-testid="button-unsubscribe">YES, UNSUBSCRIBE ME</button>
          </div>
        )}
        {phase === 'working' && <p className="text-sm text-club-ink/70">One moment…</p>}
        {phase === 'done' && (
          <div className="border border-club-green/30 p-6" data-testid="unsub-done">
            <CircleCheck className="text-club-green" size={30} />
            <h2 className="font-display mt-3 text-3xl text-club-ink">You are unsubscribed.</h2>
            <p className="mt-2 text-sm leading-6 text-club-ink/70">You will not get club news by email any more. Receipts and booking messages about your own activity will still reach you.</p>
          </div>
        )}
        {phase === 'error' && <p role="alert" className="text-sm text-club-alert" data-testid="unsub-error">{message}</p>}
      </main>
      <Footer />
    </div>
  );
}
