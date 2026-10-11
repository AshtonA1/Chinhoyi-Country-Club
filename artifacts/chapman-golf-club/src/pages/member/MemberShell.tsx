import { type ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  CalendarCheck, CreditCard, LayoutDashboard, LogOut, Menu, ShieldCheck, Trophy, UserRound, X,
} from 'lucide-react';
import { Brand } from '@/components/layout/Brand';
import { SectionLabel } from '@/components/layout/Shared';
import { SampleChip } from '@/components/layout/Portal';
import { sampleMember } from '@/data/sample';

const memberNav = [
  { label: 'Overview', href: '/member/dashboard', icon: LayoutDashboard },
  { label: 'My tee times', href: '/member/tee-times', icon: CalendarCheck },
  { label: 'Membership', href: '/member/membership', icon: ShieldCheck },
  { label: 'Competitions', href: '/member/competitions', icon: Trophy },
  { label: 'Payments', href: '/member/payments', icon: CreditCard },
  { label: 'Profile', href: '/member/profile', icon: UserRound },
];

function greeting(): string {
  const hour = new Date(Date.now() + 2 * 3_600_000).getUTCHours(); // club time, UTC+2
  return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
}

export function MemberShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="min-h-dvh bg-club-gold/5 text-club-ink">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-club-ink/10 bg-club-ink px-6 py-7 text-club-white md:flex">
        <Brand light />
        <div className="mt-12 border-y border-white/10 py-5">
          <SectionLabel light>MEMBER ROOM</SectionLabel>
          <p className="mt-3 font-display text-2xl">{greeting()},<br /><em>{sampleMember.firstName}.</em></p>
          <div className="mt-3"><SampleChip dark /></div>
        </div>
        <nav className="mt-8 grid gap-1" aria-label="Member navigation">
          {memberNav.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-3 text-sm transition-colors ${location === item.href ? 'bg-club-green text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
                <Icon size={16} strokeWidth={1.5} />{item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-white/10 pt-5">
          <Link href="/" className="flex items-center gap-3 px-3 py-3 text-xs text-white/60 hover:text-white">
            <LogOut size={15} />Back to club website
          </Link>
        </div>
      </aside>
      <div className="md:pl-64">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-club-ink/10 bg-club-white/95 px-5 backdrop-blur md:px-10">
          <div className="md:hidden"><Brand /></div>
          <div className="hidden md:block">
            <p className="font-mono-club text-[9px] tracking-[.18em] text-club-ink/70">MEMBER ROOM</p>
            <p className="mt-1 font-display text-2xl text-club-ink">Your club, at a glance.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/member/profile" className="flex items-center gap-2 border-l border-club-ink/10 pl-3 text-left" aria-label="Open profile">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-club-gold font-display text-lg text-club-ink">{sampleMember.firstName[0]}</span>
              <span className="hidden text-xs md:block"><strong className="block text-club-ink">{sampleMember.firstName} {sampleMember.lastName}</strong><small className="text-club-ink/70">Sample member</small></span>
            </Link>
            <button className="grid h-10 w-10 place-items-center border border-club-ink/15 md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle member menu">
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </header>
        {menuOpen && (
          <div className="border-b border-club-ink/10 bg-club-ink px-5 py-4 text-club-white md:hidden">
            <nav className="grid gap-1">
              {memberNav.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className={`flex items-center gap-3 px-3 py-3 text-sm ${location === item.href ? 'bg-club-green' : 'text-white/70'}`}>
                  <item.icon size={16} />{item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
        <main className="mx-auto max-w-[1480px] px-5 py-8 md:px-10 md:py-12">{children}</main>
      </div>
    </div>
  );
}

export { PortalHeading, PortalStat } from '@/components/layout/Portal';
