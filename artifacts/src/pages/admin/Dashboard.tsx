import { Link } from 'wouter';
import { ArrowUpRight, CalendarCheck, CalendarDays, CreditCard, Plus, UserRound } from 'lucide-react';
import { AdminShell, PortalHeading, PortalStat } from './AdminShell';
import { SectionLabel } from '@/components/layout/Shared';

const activity = [
  { text: 'New booking · Tendai Moyo', time: '8 min ago', icon: CalendarCheck },
  { text: 'Payment received · $85.00', time: '24 min ago', icon: CreditCard },
  { text: 'Event updated · Chapman Cup', time: '1 hr ago', icon: CalendarDays },
  { text: 'New member enquiry · Farai N.', time: '2 hrs ago', icon: UserRound },
];

export default function AdminDashboard() {
  return (
    <AdminShell>
      <PortalHeading
        eyebrow="ADMIN PORTAL / OVERVIEW"
        title="The club, in motion."
        copy="A considered view across today's tee sheet, members and the business behind the experience."
        action={<button className="inline-flex items-center gap-2 bg-[#C8A951] px-5 py-4 text-[10px] font-bold tracking-[.14em] text-[#17201C]"><Plus size={14} /> QUICK ACTION</button>}
      />
      <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <PortalStat label="TODAY'S ROUNDS" value="42" note="78% of available tee sheet" dark />
        <PortalStat label="ACTIVE MEMBERS" value="684" note="+18 this quarter" />
        <PortalStat label="MONTHLY REVENUE" value="$58.4k" note="+12.6% vs last month" />
        <PortalStat label="OPEN ENQUIRIES" value="17" note="5 need a response" />
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <section className="lg:col-span-7">
          <div className="flex items-end justify-between">
            <div><SectionLabel>LIVE OPERATIONS</SectionLabel><h2 className="font-display mt-2 text-4xl text-[#12372A]">Today's tee sheet.</h2></div>
            <Link href="/admin/tee-sheet" className="text-[10px] font-bold tracking-[.12em] text-[#2E6B4E]">OPEN TEE SHEET <ArrowUpRight size={14} className="inline" /></Link>
          </div>
          <div className="mt-5 grid gap-2">
            {['06:40 · 4 players', '07:30 · 2 players', '08:20 · 3 players', '09:10 · 4 players', '10:00 · 1 player'].map((slot, i) => (
              <div key={slot} className="flex items-center gap-4 border border-[#12372A]/10 bg-[#F7F5EF] px-4 py-3">
                <span className="w-14 font-mono-club text-[10px] text-[#2E6B4E]">{slot.split(' · ')[0]}</span>
                <span className="text-sm text-[#12372A]">{['M. Chikore', 'Tendai Moyo', 'A. Ncube', 'T. Moyo + guests', 'S. Dube'][i]}</span>
                <span className="ml-auto text-[10px] text-[#5d6b63]">{slot.split(' · ')[1]}</span>
                <span className={`h-2 w-2 rounded-full ${i === 4 ? 'bg-[#C8A951]' : 'bg-[#2E6B4E]'}`} />
              </div>
            ))}
          </div>
        </section>
        <section className="lg:col-span-5">
          <SectionLabel>RECENT ACTIVITY</SectionLabel>
          <h2 className="font-display mt-2 text-4xl text-[#12372A]">Just in.</h2>
          <div className="mt-5 border border-[#12372A]/10 bg-[#F7F5EF] p-5">
            {activity.map((item) => {
              const Icon = item.icon;
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
          <div><SectionLabel>PERFORMANCE</SectionLabel><h2 className="font-display mt-2 text-4xl text-[#12372A]">A healthy club.</h2></div>
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
            <p className="mt-2 text-xs text-[#5d6b63]">Including pro shop & dining</p>
            <div className="mt-5 flex items-center gap-2 text-xs text-[#2E6B4E]"><ArrowUpRight size={14} /> 6.8% this quarter</div>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
