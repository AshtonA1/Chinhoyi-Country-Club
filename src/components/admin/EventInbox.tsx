import type { EntryStatus, SponsorStatus } from '@/data/club';
import { Panel, DeleteButton } from '@/components/admin/Form';
import { useEventEntries, useSponsorRequests } from '@/lib/club-data';
import { formatDate } from '@/lib/dates';
import { formatMoney } from '@/lib/format';
import { useCan } from '@/lib/permissions';

const sel = 'border border-club-ink/20 bg-white px-2 py-1.5 text-xs text-club-ink';

/** Online event entries and sponsorship requests, for the admin to follow up. */
export function EventInbox() {
  const entries = useEventEntries();
  const requests = useSponsorRequests();
  const canWrite = useCan('events', 'write');
  const canDelete = useCan('events', 'delete');

  return (
    <div className="mt-10 grid gap-6">
      <Panel title={`Event entries (${entries.items.length})`}>
        {entries.items.length === 0 ? (
          <p className="text-sm text-club-ink/70">No online entries yet. Entries appear here when someone enters an event that has a price.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-club-ink/10 font-mono-club text-[9px] tracking-[.12em] text-club-ink/70">
                <tr><th className="py-3 pr-4">REF</th><th className="pr-4">EVENT</th><th className="pr-4">ENTRY</th><th className="pr-4">CONTACT</th><th className="pr-4">DUE</th><th className="pr-4">STATUS</th><th /></tr>
              </thead>
              <tbody>
                {entries.items.map((en) => (
                  <tr key={en.id} className="border-b border-club-ink/10 align-top last:border-0">
                    <td className="py-3 pr-4 font-mono-club text-[10px] text-club-green">{en.ref}</td>
                    <td className="pr-4 text-club-ink">{en.eventTitle}<br /><span className="text-xs text-club-ink/70">{formatDate(en.eventDate)}</span></td>
                    <td className="pr-4 text-club-ink/70">{en.format === 'fourball' ? 'Four-ball' : 'Single'}<br /><span className="text-xs">{en.players.join(', ')}</span></td>
                    <td className="pr-4 text-club-ink/70">{en.contactName}<br /><span className="text-xs">{en.phone} · {en.email}</span></td>
                    <td className="pr-4 font-medium text-club-ink">{formatMoney(en.total)}</td>
                    <td className="pr-4">
                      <select className={sel} value={en.status} disabled={!canWrite} onChange={(e) => entries.update(en.id, { status: e.target.value as EntryStatus })} aria-label={`Status for ${en.ref}`}>
                        <option value="pending_payment">Awaiting payment</option><option value="paid">Paid</option><option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>{canDelete && <DeleteButton onConfirm={() => entries.remove(en.id)} />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Panel title={`Sponsorship requests (${requests.items.length})`}>
        {requests.items.length === 0 ? (
          <p className="text-sm text-club-ink/70">No sponsorship requests yet. They appear here when a company uses “Sponsor this event”.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-club-ink/10 font-mono-club text-[9px] tracking-[.12em] text-club-ink/70">
                <tr><th className="py-3 pr-4">COMPANY</th><th className="pr-4">EVENT</th><th className="pr-4">WANTS TO SPONSOR</th><th className="pr-4">CONTACT</th><th className="pr-4">STATUS</th><th /></tr>
              </thead>
              <tbody>
                {requests.items.map((r) => (
                  <tr key={r.id} className="border-b border-club-ink/10 align-top last:border-0">
                    <td className="py-3 pr-4 font-medium text-club-ink">{r.company}</td>
                    <td className="pr-4 text-club-ink/70">{r.eventTitle}</td>
                    <td className="pr-4 text-club-ink/70">{r.interest}{r.message && <><br /><span className="text-xs">{r.message}</span></>}</td>
                    <td className="pr-4 text-club-ink/70">{r.contactName}<br /><span className="text-xs">{r.phone} · {r.email}</span></td>
                    <td className="pr-4">
                      <select className={sel} value={r.status} disabled={!canWrite} onChange={(e) => requests.update(r.id, { status: e.target.value as SponsorStatus })} aria-label={`Status for ${r.company}`}>
                        <option value="new">New</option><option value="contacted">Contacted</option><option value="confirmed">Confirmed</option><option value="declined">Declined</option>
                      </select>
                    </td>
                    <td>{canDelete && <DeleteButton onConfirm={() => requests.remove(r.id)} />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
