import { Link } from 'wouter';
import { ArrowUpRight, CalendarCheck, CalendarDays, CreditCard, UserRound } from 'lucide-react';
import { AdminShell, PortalHeading, PortalStat } from './AdminShell';
import { SectionLabel } from '@/components/layout/Shared';
import { SampleChip } from '@/components/layout/Portal';
import { sampleActivity } from '@/data/sample';
import { useBookings } from '@/lib/bookings';
import { upcomingEvents, useEvents } from '@/lib/club-data';
import { todayIso } from '@/lib/dates';

const ICONS = { booking: CalendarCheck, payment: CreditCard, event: CalendarDays, member: UserRound } as const;

export default function AdminDashboard() {
  const { items: bookings } = useBookings();
  const { items: events } = useEvents();
  const today = todayIso();
  const live = bookings.filter((b) => b.status !== 'Cancelled');
  const todays = live.filter((b) => b.date === today).sort((a, b) => a.time.localeCompare(b.time));
  const pending = bookings.filter((b) => b.status === 'Requested').length;
  return (
    <AdminShell>
      <PortalHeading
        eyebrow="ADMIN PORTAL / OVERVIEW"
        title="The club, in motion."
        copy="A considered view across today's tee sheet, members and the business behind the experience."
        action={<Link href="/admin/events" className="inline-flex items-center gap-2 bg-[#C8A951] px-5 py-4 text-[10px] font-bold tracking-[.14em] text-[#17201C] hover:bg-[#e3c86b]">MANAGE EVENTS <ArrowUpRight size={14} /></Link>}
      />
      <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <PortalStat label="TODAY'S REQUESTS" value={String(todays.length)} note="Tee times booked for today" dark />
        <PortalStat label="NEEDS A DECISION" value={String(pending)} note="Requested, not yet confirmed" />
        <PortalStat label="UPCOMING EVENTS" value={String(upcomingEvents(events).length)} note="On the public calendar" />
        <PortalStat label="ACTIVE MEMBERS" value="684" note="Sample figure" sample />
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <section className="lg:col-span-7">
          <div className="flex items-end justify-between">
            <div><SectionLabel>LIVE OPERATIONS</SectionLabel><h2 className="font-display mt-2 text-4xl text-[#12372A]">Today's tee sheet.</h2></div>
            <Link href="/admin/tee-sheet" className="text-[10px] font-bold tracking-[.12em] text-[#2E6B4E]">OPEN TEE SHEET <ArrowUpRight size={14} className="inline" /></Link>
          </div>
          <div className="mt-5 grid gap-2">
            {todays.length === 0 && <p className="border border-dashed border-[#12372A]/15 bg-[#F7F5EF] p-6 text-sm text-[#5d6b63]">No tee times booked for today.</p>}
            {todays.map((b) => (
              <div key={b.id} className="flex items-center gap-4 border border-[#12372A]/10 bg-[#F7F5EF] px-4 py-3">
                <span className="w-14 font-mono-club text-[10px] text-[#2E6B4E]">{b.time}</span>
                <span className="text-sm text-[#12372A]">{b.name}</span>
                <span className="ml-auto text-[10px] text-[#5d6b63]">{b.players} {b.players === 1 ? 'player' : 'players'}</span>
                <span className={`h-2 w-2 rounded-full ${b.status === 'Confirmed' ? 'bg-[#2E6B4E]' : 'bg-[#C8A951]'}`} />
              </div>
            ))}
          </div>
        </section>
        <section className="lg:col-span-5">
          <div className="flex items-center gap-3"><SectionLabel>RECENT ACTIVITY</SectionLabel><SampleChip /></div>
          <h2 className="font-display mt-2 text-4xl text-[#12372A]">Just in.</h2>
          <div className="mt-5 border border-[#12372A]/10 bg-[#F7F5EF] p-5">
            {sampleActivity.map((item) => {
              const Icon = ICONS[item.kind as keyof typeof ICONS];
              return (
                <div key={item.text} className="flex gap-3 border-b border-[#12372A]/10 py-3 first:pt-0 last:border-0 last:pb-0">
                  <Icon className="mt-0.5 shrink-0 text-[#2E6B4E]" size={16} />
                  <div><p className="text-sm text-[#12372A]">{item.text}</p><p className="mt-1 text-[10px] text-[#9aa29b]">{item.time}</p></div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
      <section className="mt-10">
        <div className="flex items-end justify-between">
          <div><div className="flex items-center gap-3"><SectionLabel>PERFORMANCE</SectionLabel><SampleChip /></div><h2 className="font-display mt-2 text-4xl text-[#12372A]">A healthy club.</h2></div>
          <Link href="/admin/analytics" className="text-[10px] font-bold tracking-[.12em] text-[#2E6B4E]">VIEW ANALYTICS <ArrowUpRight size={14} className="inline" /></Link>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="border border-[#12372A]/10 bg-[#F7F5EF] p-5">
            <div className="flex items-center justify-between"><span className="font-mono-club text-[9px] text-[#5d6b63]">TEE SHEET UTILISATION</span><span className="text-xs text-[#2E6B4E]">+8.4%</span></div>
            <div className="mt-5 flex h-20 items-end gap-1">
              {[32, 42, 38, 55, 49, 68, 62, 74, 82, 76, 89, 94].map((height, i) => (
                <span key={i} className="flex-1 bg-[#2E6B4E]" style={{ height: `${height}%`, opacity: 0.35 + i / 24 }} />
              ))}
            </div>
            <p className="mt-3 text-xs text-[#5d6b63]">Last 12 weeks</p>
          </div>
          <div className="border border-[#12372A]/10 bg-[#F7F5EF] p-5">
            <span className="font-mono-club text-[9px] text-[#5d6b63]">MEMBERSHIP RETENTION</span>
            <p className="mt-4 font-display text-5xl text-[#12372A]">94.2%</p>
            <p className="mt-2 text-xs text-[#5d6b63]">+2.1% compared with last year</p>
            <div className="mt-5 h-1.5 bg-[#e8e9df]"><div className="h-full w-[94%] bg-[#C8A951]" /></div>
          </div>
          <div className="border border-[#12372A]/10 bg-[#F7F5EF] p-5">
            <span className="font-mono-club text-[9px] text-[#5d6b63]">AVERAGE SPEND / VISIT</span>
            <p className="mt-4 font-display text-5xl text-[#12372A]">$64</p>
            <p className="mt-2 text-xs text-[#5d6b63]">Across the club</p>
            <div className="mt-5 flex items-center gap-2 text-xs text-[#2E6B4E]"><ArrowUpRight size={14} /> 6.8% this quarter</div>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
