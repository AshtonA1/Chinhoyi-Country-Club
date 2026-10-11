import { MemberShell, PortalHeading, PortalStat } from './MemberShell';
import { SectionLabel, usePageMeta } from '@/components/layout/Shared';
import { SampleChip } from '@/components/layout/Portal';
import { sampleInvoices } from '@/data/sample';
import { usePricing } from '@/lib/club-data';
import { formatDate } from '@/lib/dates';
import { formatMoney } from '@/lib/format';

export default function MemberPayments() {
  usePageMeta('Payments', 'Your invoices and receipts.');
  const { value: p } = usePricing();
  const total = sampleInvoices.reduce((sum, i) => sum + i.amount, 0);
  return (
    <MemberShell>
      <PortalHeading eyebrow="MEMBER ROOM / PAYMENTS" title="Clear and simple." copy="Your invoices and receipts. Payments are made at the club for now." />
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <PortalStat label="ACCOUNT BALANCE" value={formatMoney(0, p.currencySymbol)} note="No payment due" dark sample />
        <PortalStat label="TOTAL PAID" value={formatMoney(total, p.currencySymbol)} note={`${sampleInvoices.length} transactions`} sample />
      </div>
      <section className="mt-10">
        <div className="flex items-center gap-3"><SectionLabel>TRANSACTION HISTORY</SectionLabel><SampleChip /></div>
        <div className="mt-4 overflow-x-auto border border-club-ink/10 bg-club-white">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="border-b border-club-ink/10 bg-club-gold/10 font-mono-club text-[9px] tracking-[.12em] text-club-ink/70">
              <tr><th className="px-5 py-4">REFERENCE</th><th className="px-5 py-4">DESCRIPTION</th><th className="px-5 py-4">DATE</th><th className="px-5 py-4">AMOUNT</th><th className="px-5 py-4">STATUS</th></tr>
            </thead>
            <tbody>
              {sampleInvoices.map((row) => (
                <tr key={row.id} className="border-b border-club-ink/10 last:border-0">
                  <td className="px-5 py-4 font-mono-club text-[10px] text-club-green">{row.id}</td>
                  <td className="px-5 py-4 text-club-ink">{row.label}</td>
                  <td className="px-5 py-4 text-club-ink/70">{formatDate(row.date)}</td>
                  <td className="px-5 py-4 font-display text-xl text-club-ink">{formatMoney(row.amount, p.currencySymbol)}</td>
                  <td className="px-5 py-4"><span className="text-[10px] font-bold tracking-[.1em] text-club-green">{row.status.toUpperCase()}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </MemberShell>
  );
}
