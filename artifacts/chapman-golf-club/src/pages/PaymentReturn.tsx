import { useEffect, useState } from 'react';
import { Link, useSearch } from 'wouter';
import { CircleCheck, Loader2, TriangleAlert } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { usePageMeta } from '@/components/layout/Shared';
import { checkPayment, type PaymentStatus } from '@/lib/payments';
import { formatMoney } from '@/lib/format';

/** Where Paynow sends the customer after paying on its page. */
export default function PaymentReturn() {
  usePageMeta('Payment', 'Payment status.');
  const ref = new URLSearchParams(useSearch()).get('ref') ?? '';
  const [status, setStatus] = useState<PaymentStatus | 'unknown'>('pending');
  const [amount, setAmount] = useState<number | null>(null);
  const [tries, setTries] = useState(0);

  useEffect(() => {
    if (!ref || status === 'paid' || status === 'failed' || tries >= 20) return;
    const t = setTimeout(async () => {
      const r = await checkPayment(ref);
      if (r.ok) { setStatus(r.data.status); setAmount(r.data.amount); }
      setTries((n) => n + 1);
    }, tries === 0 ? 200 : 3000);
    return () => clearTimeout(t);
  }, [ref, status, tries]);

  const waiting = !!ref && status !== 'paid' && status !== 'failed' && tries < 20;
  return (
    <div className="min-h-dvh bg-club-white">
      <Header solid />
      <main className="mx-auto max-w-[640px] px-5 pb-24 pt-40 md:px-10">
        {!ref ? (
          <p className="text-sm text-club-ink/70">No payment reference was given.</p>
        ) : status === 'paid' ? (
          <div data-testid="return-paid">
            <CircleCheck className="text-club-green" size={40} />
            <h1 className="font-display mt-5 text-5xl text-club-ink">Payment received.</h1>
            <p className="mt-4 text-sm leading-7 text-club-ink/70">{amount !== null ? `${formatMoney(amount)} paid. ` : ''}Reference <strong>{ref}</strong>. Thank you, the club has your entry.</p>
          </div>
        ) : status === 'failed' ? (
          <div data-testid="return-failed">
            <TriangleAlert className="text-club-alert" size={40} />
            <h1 className="font-display mt-5 text-5xl text-club-ink">Payment not completed.</h1>
            <p className="mt-4 text-sm leading-7 text-club-ink/70">The payment was cancelled or declined, so nothing was charged. Open the event again to try another way to pay.</p>
          </div>
        ) : waiting ? (
          <div>
            <Loader2 className="animate-spin text-club-green" size={36} />
            <h1 className="font-display mt-5 text-5xl text-club-ink">Checking your payment…</h1>
            <p className="mt-4 text-sm leading-7 text-club-ink/70">This usually takes a few seconds.</p>
          </div>
        ) : (
          <div>
            <h1 className="font-display text-5xl text-club-ink">Still waiting.</h1>
            <p className="mt-4 text-sm leading-7 text-club-ink/70">We have not had confirmation yet. If you paid, it will be recorded shortly. Keep reference <strong>{ref}</strong> and contact the club if it does not appear.</p>
          </div>
        )}
        <Link href="/events" className="mt-10 inline-block text-[10px] font-bold tracking-[.14em] text-club-green">BACK TO EVENTS</Link>
      </main>
      <Footer />
    </div>
  );
}
