import { useState } from 'react';
import {
  Activity, BarChart3, CreditCard, Filter, MoreHorizontal, Search, ShieldCheck, SlidersHorizontal,
} from 'lucide-react';
import { AdminShell, PortalHeading, PortalStat } from './AdminShell';
import { SampleChip } from '@/components/layout/Portal';

type ResourceCopy = {
  eyebrow: string; title: string; copy: string;
  stats: [string, string, string][];
  rows: [string, string, string, string][];
};

const adminResourceCopy: Record<string, ResourceCopy> = {
  memberships: {
    eyebrow: 'ADMIN PORTAL / MEMBERSHIPS', title: 'The people who belong.',
    copy: 'Keep member plans, renewals and enquiries moving.',
    stats: [['ACTIVE', '684', 'Members'], ['RENEWALS', '42', 'Due this quarter'], ['ENQUIRIES', '17', 'Open']],
    rows: [['MEM-02418', 'Tendai Moyo', 'Member', 'Active'], ['MEM-02417', 'Farai Ncube', 'Member', 'Active'], ['ENQ-01182', 'Rudo Chikore', 'Membership enquiry', 'New']],
  },
  payments: {
    eyebrow: 'ADMIN PORTAL / PAYMENTS', title: 'The business behind the welcome.',
    copy: 'Track incoming payments, invoices and exceptions across the club.',
    stats: [['THIS MONTH', '$58.4k', 'Collected'], ['OUTSTANDING', '$4.2k', 'Across 31 invoices'], ['REFUNDS', '$680', 'This month']],
    rows: [['PAY-5518', 'Tendai Moyo', 'Membership · $175.00', 'Paid'], ['PAY-5517', 'Guest booking', 'Green fee · $15.00', 'Paid'], ['INV-2041', 'M. Chikore', 'Membership · $175.00', 'Outstanding']],
  },
  analytics: {
    eyebrow: 'ADMIN PORTAL / ANALYTICS', title: 'Read the rhythm.',
    copy: 'Turn club activity into decisions that improve the experience.',
    stats: [['UTILISATION', '78%', 'Tee sheet'], ['RETENTION', '94.2%', 'Members'], ['AVG VISIT', '$64', 'Spend']],
    rows: [['TEE SHEET', '78% utilised', '+8.4% vs last period', 'Up'], ['MEMBERSHIPS', '684 active', '+18 this quarter', 'Up'], ['FACILITIES', 'Sample', 'Not connected yet', 'Up']],
  },
  activity: {
    eyebrow: 'ADMIN PORTAL / ACTIVITY LOGS', title: "Nothing slips through.",
    copy: 'A transparent, timestamped record of every important admin action across the club platform.',
    stats: [['TODAY', '128', 'Actions'], ['THIS WEEK', '842', 'Actions'], ['ALERTS', '2', 'Need review']],
    rows: [['08:42', 'Sample Admin', 'Updated an event', 'Events'], ['08:31', 'System', 'Payment received · PAY-5518', 'Payments'], ['08:18', 'Front desk', 'Created booking · BK-0832', 'Bookings']],
  },
};

const iconFor: Record<string, typeof ShieldCheck> = {
  memberships: ShieldCheck, payments: CreditCard, analytics: BarChart3, activity: Activity,
};

export function AdminResource({ section }: { section: string }) {
  const resource = adminResourceCopy[section] ?? adminResourceCopy.memberships;
  const Icon = iconFor[section] ?? ShieldCheck;
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [view, setView] = useState<'table' | 'compact'>('table');

  const statuses = Array.from(new Set(resource.rows.map((row) => row[3])));
  const filteredRows = resource.rows
    .filter((row) => row.join(' ').toLowerCase().includes(query.toLowerCase()))
    .filter((row) => statusFilter === 'All' || row[3] === statusFilter);

  return (
    <AdminShell>
      <PortalHeading
        eyebrow={resource.eyebrow}
        title={resource.title}
        copy={`${resource.copy} The figures on this screen are sample data until payments and member records are connected.`}
        action={<SampleChip />}
      />
      <div className="mt-8 grid gap-3 md:grid-cols-3">
        {resource.stats.map((stat) => <PortalStat key={stat[0]} label={stat[0]} value={stat[1]} note={stat[2]} />)}
      </div>
      <section className="mt-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Search className="text-[#5d6b63]" size={16} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search this area" className="w-56 border-b border-[#12372A]/20 bg-transparent px-2 py-2 text-sm text-[#12372A] outline-none focus:border-[#2E6B4E]" />
          </div>
          <div className="flex items-center gap-2">
            <Icon size={16} className="text-[#2E6B4E]" />
            <button onClick={() => setShowFilters((v) => !v)} className={`flex items-center gap-2 border px-3 py-2 text-[10px] font-bold tracking-[.12em] ${showFilters ? 'border-[#2E6B4E] bg-[#e8e9df] text-[#12372A]' : 'border-[#12372A]/15 text-[#5d6b63]'}`}><Filter size={14} /> FILTER</button>
            <button onClick={() => setView((v) => (v === 'table' ? 'compact' : 'table'))} className="flex items-center gap-2 border border-[#12372A]/15 px-3 py-2 text-[10px] font-bold tracking-[.12em] text-[#5d6b63] hover:border-[#2E6B4E]"><SlidersHorizontal size={14} /> {view === 'table' ? 'COMFORTABLE' : 'COMPACT'}</button>
          </div>
        </div>
        {showFilters && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border border-[#12372A]/10 bg-white p-3">
            <span className="font-mono-club text-[9px] tracking-[.12em] text-[#5d6b63]">STATUS:</span>
            {['All', ...statuses].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`border px-3 py-1.5 text-[10px] font-bold tracking-[.1em] ${statusFilter === s ? 'border-[#2E6B4E] bg-[#2E6B4E] text-white' : 'border-[#12372A]/15 text-[#5d6b63]'}`}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>
        )}
        <div className="mt-4 overflow-x-auto border border-[#12372A]/10 bg-[#F7F5EF]">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b border-[#12372A]/10 bg-[#e8e9df] font-mono-club text-[9px] tracking-[.12em] text-[#5d6b63]">
              <tr><th className="px-5 py-4">REFERENCE</th><th className="px-5 py-4">NAME / DETAIL</th><th className="px-5 py-4">CONTEXT</th><th className="px-5 py-4">STATUS</th><th className="px-5 py-4" /></tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row[0]} className="border-b border-[#12372A]/10 last:border-0">
                  <td className={`px-5 font-mono-club text-[10px] text-[#2E6B4E] ${view === 'table' ? 'py-4' : 'py-2'}`}>{row[0]}</td>
                  <td className={`px-5 font-medium text-[#12372A] ${view === 'table' ? 'py-4' : 'py-2'}`}>{row[1]}</td>
                  <td className={`px-5 text-[#5d6b63] ${view === 'table' ? 'py-4' : 'py-2'}`}>{row[2]}</td>
                  <td className={`px-5 ${view === 'table' ? 'py-4' : 'py-2'}`}>
                    <span className={`text-[10px] font-bold tracking-[.1em] ${row[3] === 'Draft' || row[3] === 'Outstanding' || row[3] === 'Low stock' ? 'text-[#8b6e16]' : 'text-[#2E6B4E]'}`}>{row[3].toUpperCase()}</span>
                  </td>
                  <td className={`px-5 text-right ${view === 'table' ? 'py-4' : 'py-2'}`}>
                    <button disabled aria-label={`Manage ${row[0]} (not available in the demo)`} title="Not available in the demo">
                      <MoreHorizontal size={17} className="text-[#5d6b63] hover:text-[#12372A]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredRows.length === 0 && <div className="p-10 text-center text-sm text-[#5d6b63]">No records match this search{statusFilter !== 'All' ? ` with status "${statusFilter}"` : ''}.</div>}
        </div>
      </section>
    </AdminShell>
  );
}
