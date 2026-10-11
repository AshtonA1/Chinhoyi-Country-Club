import { useState } from 'react';
import {
  Activity, BarChart3, CalendarDays, ClipboardList, Compass, CreditCard, Filter, MoreHorizontal, Plus,
  Search, Settings, ShieldCheck, ShoppingBag, SlidersHorizontal,
} from 'lucide-react';
import { AdminShell, PortalHeading, PortalStat } from './AdminShell';
import { defaultHoles as holes } from '@/data/club';

type ResourceCopy = {
  eyebrow: string; title: string; copy: string;
  stats: [string, string, string][];
  rows: [string, string, string, string][];
};

const adminResourceCopy: Record<string, ResourceCopy> = {
  bookings: {
    eyebrow: 'ADMIN PORTAL / BOOKINGS', title: 'Every round, accounted for.',
    copy: 'Search, filter and manage reservations across the club.',
    stats: [['TODAY', '42', 'Reservations'], ['THIS WEEK', '218', 'Reservations'], ['CANCELLATIONS', '6', 'Needs review']],
    rows: [['BK-0832', 'Tendai Moyo', '14 JUN · 07:30', 'Confirmed'], ['BK-0831', 'M. Chikore', '14 JUN · 06:40', 'Confirmed'], ['BK-0830', 'A. Ncube', '14 JUN · 08:20', 'Confirmed']],
  },
  course: {
    eyebrow: 'ADMIN PORTAL / COURSE & HOLES', title: 'Shape the course story.',
    copy: 'Manage the 18-hole data that powers the public course experience — par, distance in metres, stroke index, description, hazards and pro tip per hole.',
    stats: [['HOLES', String(holes.length), 'Published'], ['COURSE PAR', String(holes.reduce((s, h) => s + h.men.par, 0)), 'From tee data'], ['LAST UPDATED', '12 Jun', 'By S. Dube']],
    rows: holes.slice(0, 3).map((h) => [String(h.number).padStart(2, '0'), h.name || `Hole ${h.number}`, `PAR ${h.men.par} · ${h.men.metres} M`, 'Published']) as [string, string, string, string][],
  },
  events: {
    eyebrow: 'ADMIN PORTAL / EVENTS', title: 'Give the club a reason.',
    copy: 'Publish competitions, dinners and member moments to the calendar.',
    stats: [['UPCOMING', '12', 'Published'], ['THIS MONTH', '5', 'Events'], ['DRAFTS', '3', 'In progress']],
    rows: [['EV-019', 'Chinhoyi Cup — Final', '22 JUN · COMPETITION', 'Published'], ['EV-018', 'Sunday Sundowners', '06 JUL · SOCIAL', 'Published'], ['EV-017', 'Ladies Spring Fourball', '19 JUL · COMPETITION', 'Draft']],
  },
  memberships: {
    eyebrow: 'ADMIN PORTAL / MEMBERSHIPS', title: 'The people who belong.',
    copy: 'Keep member plans, renewals and enquiries moving.',
    stats: [['ACTIVE', '684', 'Members'], ['RENEWALS', '42', 'Due this quarter'], ['ENQUIRIES', '17', 'Open']],
    rows: [['MEM-02418', 'Tendai Moyo', 'Full membership', 'Active'], ['MEM-02417', 'Farai Ncube', 'Young professional', 'Active'], ['ENQ-01182', 'Rudo Chikore', 'Membership enquiry', 'New']],
  },
  'pro-shop': {
    eyebrow: 'ADMIN PORTAL / PRO SHOP', title: 'The details after golf.',
    copy: 'Manage products, stock and member orders from one place.',
    stats: [['PRODUCTS', '86', 'Active listings'], ['LOW STOCK', '9', 'Need attention'], ['TODAY', '$1,240', 'Sales']],
    rows: [['PS-081', 'Chinhoyi Club Cap', '24 in stock', 'Active'], ['PS-076', 'Club quarter-zip', '8 in stock', 'Low stock'], ['PS-061', 'Logo golf balls', '64 in stock', 'Active']],
  },
  payments: {
    eyebrow: 'ADMIN PORTAL / PAYMENTS', title: 'The business behind the welcome.',
    copy: 'Track incoming payments, invoices and exceptions across the club.',
    stats: [['THIS MONTH', '$58.4k', 'Collected'], ['OUTSTANDING', '$4.2k', 'Across 31 invoices'], ['REFUNDS', '$680', 'This month']],
    rows: [['PAY-5518', 'Tendai Moyo', 'Membership · $85.00', 'Paid'], ['PAY-5517', 'Guest booking', 'Tee time · $70.00', 'Paid'], ['INV-2041', 'M. Chikore', 'Annual dues · $960.00', 'Outstanding']],
  },
  analytics: {
    eyebrow: 'ADMIN PORTAL / ANALYTICS', title: 'Read the rhythm.',
    copy: 'Turn club activity into decisions that improve the experience.',
    stats: [['UTILISATION', '78%', 'Tee sheet'], ['RETENTION', '94.2%', 'Members'], ['AVG VISIT', '$64', 'Spend']],
    rows: [['TEE SHEET', '78% utilised', '+8.4% vs last period', 'Up'], ['MEMBERSHIPS', '684 active', '+18 this quarter', 'Up'], ['PRO SHOP', '$12.8k', '+6.8% this month', 'Up']],
  },
  activity: {
    eyebrow: 'ADMIN PORTAL / ACTIVITY LOGS', title: "Nothing slips through.",
    copy: 'A transparent, timestamped record of every important admin action across the club platform.',
    stats: [['TODAY', '128', 'Actions'], ['THIS WEEK', '842', 'Actions'], ['ALERTS', '2', 'Need review']],
    rows: [['08:42', 'Sarah Dube', 'Updated Chinhoyi Cup event', 'Events'], ['08:31', 'System', 'Payment received · PAY-5518', 'Payments'], ['08:18', 'Front desk', 'Created booking · BK-0832', 'Bookings']],
  },
  settings: {
    eyebrow: 'ADMIN PORTAL / SETTINGS', title: 'Make it yours.',
    copy: 'Club details, booking rules, payment settings, notifications and the foundation for multi-club configuration.',
    stats: [['CLUB STATUS', 'Live', 'Public experience'], ['TIMEZONE', 'CAT', 'Africa/Harare'], ['PLAN', 'GCT Pro', 'Reference workspace']],
    rows: [['Club profile', 'Name, location and contact details', 'Configured', 'Edit'], ['Booking rules', 'Slots, cancellation and guest policy', 'Configured', 'Edit'], ['Team notifications', 'Email and operational alerts', 'Configured', 'Edit']],
  },
};

const iconFor: Record<string, typeof Compass> = {
  bookings: ClipboardList, course: Compass, events: CalendarDays, memberships: ShieldCheck,
  'pro-shop': ShoppingBag, payments: CreditCard, analytics: BarChart3, activity: Activity, settings: Settings,
};

export function AdminResource({ section }: { section: string }) {
  const resource = adminResourceCopy[section] ?? adminResourceCopy.bookings;
  const Icon = iconFor[section] ?? ClipboardList;
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
        copy={resource.copy}
        action={
          <button
            onClick={() => window.alert(`"Add new" for ${resource.title.toLowerCase()} opens a creation form in a future update.`)}
            className="inline-flex items-center gap-2 bg-[#12372A] px-5 py-4 text-[10px] font-bold tracking-[.14em] text-[#F7F5EF] hover:bg-[#2E6B4E]"
          >
            <Plus size={14} /> ADD NEW
          </button>
        }
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
                    <button onClick={() => window.alert(`Manage ${row[0]} — full record editing lands in a future update.`)} aria-label={`Manage ${row[0]}`}>
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
