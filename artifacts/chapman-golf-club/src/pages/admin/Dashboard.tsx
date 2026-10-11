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
        action={<Link href="/admin/events" className="inline-flex items-center gap-2 bg-club-gold px-5 py-4 text-[10px] font-bold tracking-[.14em] text-club-ink hover:bg-club-gold/85">MANAGE EVENTS <ArrowUpRight size={14} /></Link>}
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
            <div><SectionLabel>LIVE OPERATIONS</SectionLabel><h2 className="font-display mt-2 text-4xl text-club-ink">Today's tee sheet.</h2></div>
            <Link href="/admin/tee-sheet" className="text-[10px] font-bold tracking-[.12em] text-club-green">OPEN TEE SHEET <ArrowUpRight size={14} className="inline" /></Link>
          </div>
          <div className="mt-5 grid gap-2">
            {todays.length === 0 && <p className="border border-dashed border-club-ink/15 bg-club-white p-6 text-sm text-club-ink/70">No tee times booked for today.</p>}
            {todays.map((b) => (
              <div key={b.id} className="flex items-center gap-4 border border-club-ink/10 bg-club-white px-4 py-3">
                <span className="w-14 font-mono-club text-[10px] text-club-green">{b.time}</span>
                <span className="text-sm text-club-ink">{b.name}</span>
                <span className="ml-auto text-[10px] text-club-ink/70">{b.players} {b.players === 1 ? 'player' : 'players'}</span>
                <span className={`h-2 w-2 rounded-full ${b.status === 'Confirmed' ? 'bg-club-green' : 'bg-club-gold'}`} />
              </div>
            ))}
          </div>
        </section>
        <section className="lg:col-span-5">
          <div className="flex items-center gap-3"><SectionLabel>RECENT ACTIVITY</SectionLabel><SampleChip /></div>
          <h2 className="font-display mt-2 text-4xl text-club-ink">Just in.</h2>
          <div className="mt-5 border border-club-ink/10 bg-club-white p-5">
            {sampleActivity.map((item) => {
              const Icon = ICONS[item.kind as keyof typeof ICONS];
              return (
                <div key={item.text} className="flex gap-3 border-b border-club-ink/10 py-3 first:pt-0 last:border-0 last:pb-0">
                  <Icon className="mt-0.5 shrink-0 text-club-green" size={16} />
                  <div><p className="text-sm text-club-ink">{item.text}</p><p className="mt-1 text-[10px] text-club-ink/50">{item.time}</p></div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
      <section className="mt-10">
        <div className="flex items-end justify-between">
          <div><div className="flex items-center gap-3"><SectionLabel>PERFORMANCE</SectionLabel><SampleChip /></div><h2 className="font-display mt-2 text-4xl text-club-ink">A healthy club.</h2></div>
          <Link href="/admin/analytics" className="text-[10px] font-bold tracking-[.12em] text-club-green">VIEW ANALYTICS <ArrowUpRight size={14} className="inline" /></Link>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="border border-club-ink/10 bg-club-white p-5">
            <div className="flex items-center justify-between"><span className="font-mono-club text-[9px] text-club-ink/70">TEE SHEET UTILISATION</span><span className="text-xs text-club-green">+8.4%</span></div>
            <div className="mt-5 flex h-20 items-end gap-1">
              {[32, 42, 38, 55, 49, 68, 62, 74, 82, 76, 89, 94].map((height, i) => (
                <span key={i} className="flex-1 bg-club-green" style={{ height: `${height}%`, opacity: 0.35 + i / 24 }} />
              ))}
            </div>
            <p className="mt-3 text-xs text-club-ink/70">Last 12 weeks</p>
          </div>
          <div className="border border-club-ink/10 bg-club-white p-5">
            <span className="font-mono-club text-[9px] text-club-ink/70">MEMBERSHIP RETENTION</span>
            <p className="mt-4 font-display text-5xl text-club-ink">94.2%</p>
            <p className="mt-2 text-xs text-club-ink/70">+2.1% compared with last year</p>
            <div className="mt-5 h-1.5 bg-club-gold/10"><div className="h-full w-[94%] bg-club-gold" /></div>
          </div>
          <div className="border border-club-ink/10 bg-club-white p-5">
            <span className="font-mono-club text-[9px] text-club-ink/70">AVERAGE SPEND / VISIT</span>
            <p className="mt-4 font-display text-5xl text-club-ink">$64</p>
            <p className="mt-2 text-xs text-club-ink/70">Across the club</p>
            <div className="mt-5 flex items-center gap-2 text-xs text-club-green"><ArrowUpRight size={14} /> 6.8% this quarter</div>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
