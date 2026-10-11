import { useState } from 'react';
import { Check, Search, X } from 'lucide-react';
import { AdminShell, PortalHeading, PortalStat } from './AdminShell';
import { DeleteButton, GhostButton, StorageNote } from '@/components/admin/Form';
import { type BookingRecord, type BookingStatus, useBookings } from '@/lib/bookings';
import { usePricing } from '@/lib/club-data';
import { formatDate } from '@/lib/dates';
import { formatMoney } from '@/lib/format';
import { useCan } from '@/lib/permissions';

const STATUSES: ('All' | BookingStatus)[] = ['All', 'Requested', 'Confirmed', 'Cancelled'];
const STYLE: Record<BookingStatus, string> = {
  Requested: 'text-club-gold-deep', Confirmed: 'text-club-green', Cancelled: 'text-club-alert',
};

export default function AdminBookings() {
  const { items, update, remove } = useBookings();
  const { value: pricing } = usePricing();
  const canWrite = useCan('bookings', 'write');
  const canDelete = useCan('bookings', 'delete');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<(typeof STATUSES)[number]>('All');

  const q = query.trim().toLowerCase();
  const rows = [...items]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .filter((b) => status === 'All' || b.status === status)
    .filter((b) => !q || [b.reference, b.name, b.email, b.phone, b.date].join(' ').toLowerCase().includes(q));
  const count = (s: BookingStatus) => items.filter((b) => b.status === s).length;

  return (
    <AdminShell>
      <PortalHeading
        eyebrow="ADMIN / BOOKINGS"
        title="Every round, accounted for."
        copy="Tee time requests made through the website. Confirm or cancel them here."
      />
      <div className="mt-8 grid gap-3 md:grid-cols-3">
        <PortalStat label="NEEDS A DECISION" value={String(count('Requested'))} note="Requested" dark={count('Requested') > 0} />
        <PortalStat label="CONFIRMED" value={String(count('Confirmed'))} />
        <PortalStat label="CANCELLED" value={String(count('Cancelled'))} />
      </div>
      <section className="mt-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Search className="text-club-ink/70" size={16} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, reference, phone" className="w-64 border-b border-club-ink/20 bg-transparent px-2 py-2 text-sm text-club-ink outline-none focus:border-club-green" />
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <button key={s} onClick={() => setStatus(s)} className={`border px-3 py-1.5 text-[10px] font-bold tracking-[.1em] ${status === s ? 'border-club-green bg-club-green text-white' : 'border-club-ink/15 text-club-ink/70'}`}>{s.toUpperCase()}</button>
            ))}
          </div>
        </div>
        <div className="mt-4 overflow-x-auto border border-club-ink/10 bg-club-white">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-club-ink/10 bg-club-gold/10 font-mono-club text-[9px] tracking-[.12em] text-club-ink/70">
              <tr><th className="px-5 py-4">REF</th><th className="px-5 py-4">WHEN</th><th className="px-5 py-4">WHO</th><th className="px-5 py-4">ROUND</th><th className="px-5 py-4">TOTAL</th><th className="px-5 py-4">STATUS</th><th className="px-5 py-4" /></tr>
            </thead>
            <tbody>
              {rows.map((b: BookingRecord) => (
                <tr key={b.id} className="border-b border-club-ink/10 last:border-0 align-top">
                  <td className="px-5 py-4 font-mono-club text-[10px] text-club-green">{b.reference}</td>
                  <td className="px-5 py-4 text-club-ink">{formatDate(b.date)}<br /><span className="text-club-ink/70">{b.time}</span></td>
                  <td className="px-5 py-4 text-club-ink">{b.name}<br /><span className="text-xs text-club-ink/70">{b.phone} · {b.email}</span></td>
                  <td className="px-5 py-4 text-xs text-club-ink/70">{b.players} {b.players === 1 ? 'player' : 'players'} · {b.holes}<br />{b.playerType}{b.addOns.length ? ` · ${b.addOns.join(', ')}` : ''}</td>
                  <td className="px-5 py-4 text-club-ink">{formatMoney(b.totalPrice, pricing.currencySymbol)}</td>
                  <td className="px-5 py-4"><span className={`text-[10px] font-bold tracking-[.1em] ${STYLE[b.status]}`}>{b.status.toUpperCase()}</span></td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      {canWrite && b.status !== 'Confirmed' && b.status !== 'Cancelled' && <GhostButton onClick={() => update(b.id, { status: 'Confirmed' })}><Check size={13} /> CONFIRM</GhostButton>}
                      {canWrite && b.status !== 'Cancelled' && <GhostButton onClick={() => update(b.id, { status: 'Cancelled' })}><X size={13} /> CANCEL</GhostButton>}
                      {canDelete && <DeleteButton onConfirm={() => remove(b.id)} />}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <div className="p-10 text-center text-sm text-club-ink/70">{items.length === 0 ? 'No tee time requests yet. They appear here when someone books on the website.' : 'No bookings match this search.'}</div>}
        </div>
      </section>
      <StorageNote />
    </AdminShell>
  );
}
