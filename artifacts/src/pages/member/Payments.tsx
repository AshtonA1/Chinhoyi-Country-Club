import { useState } from 'react';
import { CircleCheck, CreditCard } from 'lucide-react';
import { MemberShell, PortalHeading, PortalStat } from './MemberShell';
import { SectionLabel, usePageMeta } from '@/components/layout/Shared';

const invoices = [
  { id: 'INV-2041', label: 'June monthly subscription', date: '01 JUN 2026', amount: '$85.00', status: 'Paid' },
  { id: 'INV-2017', label: 'Guest round · 18 May', date: '18 MAY 2026', amount: '$70.00', status: 'Paid' },
  { id: 'INV-1988', label: 'Annual locker rental', date: '01 JAN 2026', amount: '$120.00', status: 'Paid' },
];

export default function MemberPayments() {
  usePageMeta('Payments', 'Review invoices, receipts and your saved payment method.');
  const [paid, setPaid] = useState(false);
  return (
    <MemberShell>
      <PortalHeading
        eyebrow="MEMBER ROOM / PAYMENTS"
        title="Clear and simple."
        copy="Review invoices, receipts and your saved payment method."
        action={<button onClick={() => setPaid(true)} className="inline-flex items-center gap-2 bg-[#C8A951] px-5 py-4 text-[10px] font-bold tracking-[.14em] text-[#17201C]">MAKE A PAYMENT <CreditCard size={14} /></button>}
      />
      {paid && <div className="mt-5 flex items-center gap-3 border border-[#2E6B4E]/20 bg-[#e4eee6] p-4 text-sm text-[#2E6B4E]"><CircleCheck size={17} />Payment portal opened securely for this demo.</div>}
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <PortalStat label="ACCOUNT BALANCE" value="$0.00" note="No payment due" dark />
        <PortalStat label="THIS YEAR" value="$1,140" note="12 transactions" />
        <PortalStat label="SAVED METHOD" value="•••• 4421" note="Visa · expires 09/28" />
      </div>
      <section className="mt-10">
        <SectionLabel>TRANSACTION HISTORY</SectionLabel>
        <div className="mt-4 overflow-x-auto border border-[#12372A]/10 bg-[#F7F5EF]">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="border-b border-[#12372A]/10 bg-[#e8e9df] font-mono-club text-[9px] tracking-[.12em] text-[#5d6b63]">
              <tr><th className="px-5 py-4">REFERENCE</th><th className="px-5 py-4">DESCRIPTION</th><th className="px-5 py-4">DATE</th><th className="px-5 py-4">AMOUNT</th><th className="px-5 py-4">STATUS</th></tr>
            </thead>
            <tbody>
              {invoices.map((row) => (
                <tr key={row.id} className="border-b border-[#12372A]/10 last:border-0">
                  <td className="px-5 py-4 font-mono-club text-[10px] text-[#2E6B4E]">{row.id}</td>
                  <td className="px-5 py-4 text-[#12372A]">{row.label}</td>
                  <td className="px-5 py-4 text-[#5d6b63]">{row.date}</td>
                  <td className="px-5 py-4 font-display text-xl text-[#12372A]">{row.amount}</td>
                  <td className="px-5 py-4"><span className="text-[10px] font-bold tracking-[.1em] text-[#2E6B4E]">{row.status.toUpperCase()}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </MemberShell>
  );
}
