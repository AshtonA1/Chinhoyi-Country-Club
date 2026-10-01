import { type ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Bell, CalendarCheck, CreditCard, LayoutDashboard, LogOut, Menu, ShieldCheck, Trophy, UserRound, X,
} from 'lucide-react';
import { Brand } from '@/components/layout/Brand';
import { SectionLabel } from '@/components/layout/Shared';

const memberNav = [
  { label: 'Overview', href: '/member/dashboard', icon: LayoutDashboard },
  { label: 'My tee times', href: '/member/tee-times', icon: CalendarCheck },
  { label: 'Membership', href: '/member/membership', icon: ShieldCheck },
  { label: 'Competitions', href: '/member/competitions', icon: Trophy },
  { label: 'Payments', href: '/member/payments', icon: CreditCard },
  { label: 'Profile', href: '/member/profile', icon: UserRound },
];

export function MemberShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="min-h-dvh bg-[#f4f4ee] text-[#17201C]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-[#12372A]/10 bg-[#12372A] px-6 py-7 text-[#F7F5EF] md:flex">
        <Brand light />
        <div className="mt-12 border-y border-white/10 py-5">
          <SectionLabel light>MEMBER ROOM</SectionLabel>
          <p className="mt-3 font-display text-2xl">Good morning,<br /><em>Tendai.</em></p>
        </div>
        <nav className="mt-8 grid gap-1" aria-label="Member navigation">
          {memberNav.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-3 text-sm transition-colors ${location === item.href ? 'bg-[#2E6B4E] text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
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
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-[#12372A]/10 bg-[#f4f4ee]/95 px-5 backdrop-blur md:px-10">
          <div className="md:hidden"><Brand /></div>
          <div className="hidden md:block">
            <p className="font-mono-club text-[9px] tracking-[.18em] text-[#5d6b63]">MEMBER ROOM</p>
            <p className="mt-1 font-display text-2xl text-[#12372A]">Your club, in your pocket.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative grid h-10 w-10 place-items-center border border-[#12372A]/15 text-[#12372A]" aria-label="Notifications">
              <Bell size={16} /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#C8A951]" />
            </button>
            <button className="flex items-center gap-2 border-l border-[#12372A]/10 pl-3 text-left" aria-label="Open profile">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#C8A951] font-display text-lg text-[#12372A]">T</span>
              <span className="hidden text-xs md:block"><strong className="block text-[#12372A]">Tendai Moyo</strong><small className="text-[#5d6b63]">Full member</small></span>
            </button>
            <button className="grid h-10 w-10 place-items-center border border-[#12372A]/15 md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle member menu">
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </header>
        {menuOpen && (
          <div className="border-b border-[#12372A]/10 bg-[#12372A] px-5 py-4 text-[#F7F5EF] md:hidden">
            <nav className="grid gap-1">
              {memberNav.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className={`flex items-center gap-3 px-3 py-3 text-sm ${location === item.href ? 'bg-[#2E6B4E]' : 'text-white/70'}`}>
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

export function PortalHeading({
  eyebrow, title, copy, action,
}: { eyebrow: string; title: string; copy?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col justify-between gap-6 border-b border-[#12372A]/10 pb-8 md:flex-row md:items-end">
      <div>
        <SectionLabel>{eyebrow}</SectionLabel>
        <h1 className="font-display mt-3 text-5xl leading-[.9] text-[#12372A] md:text-7xl">{title}</h1>
        {copy && <p className="mt-4 max-w-xl text-sm leading-7 text-[#5d6b63]">{copy}</p>}
      </div>
      {action}
    </div>
  );
}

export function PortalStat({
  label, value, note, dark = false,
}: { label: string; value: string; note?: string; dark?: boolean }) {
  return (
    <div className={`border p-5 ${dark ? 'border-white/15 bg-[#12372A] text-[#F7F5EF]' : 'border-[#12372A]/10 bg-[#F7F5EF] text-[#12372A]'}`}>
      <p className={`font-mono-club text-[9px] tracking-[.15em] ${dark ? 'text-[#C8A951]' : 'text-[#5d6b63]'}`}>{label}</p>
      <p className="mt-4 font-display text-4xl">{value}</p>
      {note && <p className={`mt-2 text-xs ${dark ? 'text-white/50' : 'text-[#5d6b63]'}`}>{note}</p>}
    </div>
  );
}
