import { useEffect, useRef, useState } from 'react';
import { CircleCheck, Loader2 } from 'lucide-react';
import { checkPayment, startPayment, type PayMethod } from '@/lib/payments';
import { formatMoney } from '@/lib/format';

const field = 'mt-2 w-full border border-club-ink/20 bg-white px-3 py-3 text-sm text-club-ink outline-none placeholder:text-club-ink/50 focus:border-club-green';
const TIMEOUT_MS = 4 * 60 * 1000;

type Phase = 'idle' | 'starting' | 'waiting' | 'paid' | 'failed' | 'timeout';

/** Pay for an entry: EcoCash or OneMoney on the phone, or Paynow's page for cards and everything else. */
export function PaymentPanel({ entry, pollMs = 4000, onPaid }: { entry: { id: string; ref: string; total: number; phone: string }; pollMs?: number; onPaid?: (info: { reference: string; amount: number }) => void }) {
  const [method, setMethod] = useState<PayMethod>('ecocash');
  const [phone, setPhone] = useState(entry.phone);
  const [phase, setPhase] = useState<Phase>('idle');
  const [message, setMessage] = useState('');
  const [reference, setReference] = useState('');
  const [amount, setAmount] = useState(entry.total);
  const started = useRef(0);
  const onPaidRef = useRef(onPaid);
  onPaidRef.current = onPaid;

  useEffect(() => {
    if (phase !== 'waiting' || !reference) return;
    let alive = true;
    const timer = setInterval(async () => {
      const r = await checkPayment(reference);
      if (!alive) return;
      if (r.ok && r.data.status === 'paid') { setPhase('paid'); onPaidRef.current?.({ reference, amount: r.data.amount }); return; }
      if (r.ok && (r.data.status === 'failed' || r.data.status === 'refunded')) {
        setPhase('failed');
        setMessage('The payment was cancelled or declined. You can try again.');
        return;
      }
      if (Date.now() - started.current > TIMEOUT_MS) setPhase('timeout');
    }, pollMs);
    return () => { alive = false; clearInterval(timer); };
  }, [phase, reference, pollMs]);

  async function pay() {
    setPhase('starting');
    setMessage('');
    const r = await startPayment(entry.id, method, method === 'web' ? undefined : phone);
    if (!r.ok) { setPhase('failed'); setMessage(r.error); return; }
    setReference(r.data.reference);
    setAmount(r.data.amount);
    if (method === 'web' && r.data.redirectUrl) { window.location.href = r.data.redirectUrl; return; }
    started.current = Date.now();
    setMessage(r.data.instructions || 'Check your phone and approve the payment with your PIN.');
    setPhase('waiting');
  }

  if (phase === 'paid') {
    return (
      <div className="mt-5 border border-club-green bg-club-green/5 p-5" data-testid="payment-paid">
        <p className="flex items-center gap-2 font-bold text-club-green"><CircleCheck size={18} /> Payment received</p>
        <p className="mt-2 text-sm text-club-ink/70">{formatMoney(amount)} paid for entry {entry.ref}. Thank you.</p>
      </div>
    );
  }

  const busy = phase === 'starting' || phase === 'waiting';
  const options: { id: PayMethod; label: string }[] = [
    { id: 'ecocash', label: 'EcoCash' }, { id: 'onemoney', label: 'OneMoney' }, { id: 'web', label: 'Card / other' },
  ];
  return (
    <div className="mt-5 border-t border-club-ink/10 pt-5" data-testid="payment-panel">
      <p className="font-mono-club text-[9px] tracking-[.15em] text-club-green">PAY NOW · {formatMoney(entry.total)}</p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {options.map((o) => (
          <button
            key={o.id} type="button" disabled={busy} onClick={() => setMethod(o.id)} aria-pressed={method === o.id}
            className={`border px-2 py-3 text-[10px] font-bold tracking-[.1em] ${method === o.id ? 'border-club-green bg-club-green text-white' : 'border-club-ink/20 text-club-ink hover:border-club-green'}`}
          >
            {o.label.toUpperCase()}
          </button>
        ))}
      </div>
      {method !== 'web' ? (
        <label className="mt-4 block">
          <span className="font-mono-club text-[9px] tracking-[.14em] text-club-ink/70">{method === 'ecocash' ? 'ECOCASH' : 'ONEMONEY'} NUMBER</span>
          <input className={field} value={phone} disabled={busy} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="0771234567" data-testid="input-pay-phone" />
        </label>
      ) : (
        <p className="mt-4 text-xs leading-5 text-club-ink/70">You will go to Paynow's secure page to pay by card, bank or any other method the club accepts.</p>
      )}
      {message && <p role={phase === 'failed' ? 'alert' : 'status'} className={`mt-4 text-sm leading-6 ${phase === 'failed' ? 'text-club-alert' : 'text-club-ink'}`}>{message}</p>}
      {phase === 'waiting' && <p className="mt-2 flex items-center gap-2 text-xs text-club-ink/70"><Loader2 size={14} className="animate-spin" /> Waiting for your approval…</p>}
      {phase === 'timeout' && <p className="mt-3 text-xs leading-5 text-club-ink/70">Still waiting. If you approved the payment it will show as paid shortly. You can close this page; the club will see it.</p>}
      <button type="button" disabled={busy} onClick={() => void pay()} className="mt-4 w-full bg-club-green py-4 text-[10px] font-bold tracking-[.15em] text-club-white hover:bg-club-ink disabled:opacity-60" data-testid="button-pay-now">
        {phase === 'starting' ? 'STARTING…' : phase === 'failed' || phase === 'timeout' ? 'TRY AGAIN' : `PAY ${formatMoney(entry.total)}`}
      </button>
      <p className="mt-3 text-[11px] leading-5 text-club-ink/70">Prefer to pay at the club? Keep your reference <strong>{entry.ref}</strong> and pay there.</p>
    </div>
  );
}
