import { type ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Activity, Bell, CalendarCheck, CalendarDays, ClipboardList, Compass, CreditCard, Image as ImageIcon,
  LayoutDashboard, LogOut, Menu, Search, Settings, ShieldCheck, ShoppingBag, Users, X, BarChart3,
} from 'lucide-react';
import { SectionLabel } from '@/components/layout/Shared';

export const adminNav = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Tee sheet', href: '/admin/tee-sheet', icon: CalendarCheck },
  { label: 'Bookings', href: '/admin/bookings', icon: ClipboardList },
  { label: 'Course & holes', href: '/admin/course', icon: Compass },
  { label: 'Events', href: '/admin/events', icon: CalendarDays },
  { label: 'Memberships', href: '/admin/memberships', icon: ShieldCheck },
  { label: 'Gallery & stories', href: '/admin/gallery', icon: ImageIcon },
  { label: 'Pro shop', href: '/admin/pro-shop', icon: ShoppingBag },
  { label: 'Payments', href: '/admin/payments', icon: CreditCard },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Users & roles', href: '/admin/users', icon: Users },
  { label: 'Activity logs', href: '/admin/activity', icon: Activity },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="min-h-dvh bg-[#f4f4ee] text-[#17201C]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-[#17201C] px-5 py-6 text-[#F7F5EF] md:flex">
        <div className="flex items-center justify-between px-2">
          <Link href="/" className="font-display text-2xl">Chapman <em>HQ</em></Link>
          <span className="rounded-full border border-[#C8A951]/40 px-2 py-1 font-mono-club text-[8px] text-[#C8A951]">GCT</span>
        </div>
        <div className="mt-8 border-y border-white/10 px-2 py-4">
          <p className="font-mono-club text-[9px] tracking-[.14em] text-[#C8A951]">OPERATIONS</p>
          <p className="mt-2 text-xs text-white/55">Chapman Golf Club</p>
        </div>
        <nav className="mt-5 grid gap-0.5 overflow-y-auto" aria-label="Admin navigation">
          {adminNav.map((item) => {
            const Icon = item.icon;
            const active = location === item.href || (item.href !== '/admin' && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 text-xs transition-colors ${active ? 'bg-[#2E6B4E] text-white' : 'text-white/55 hover:bg-white/5 hover:text-white'}`}>
                <Icon size={15} strokeWidth={1.5} />{item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-white/10 pt-4">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 text-xs text-white/50 hover:text-white"><LogOut size={15} />Exit portal</Link>
        </div>
      </aside>
      <div className="md:pl-64">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-[#12372A]/10 bg-[#f4f4ee]/95 px-5 backdrop-blur md:px-10">
          <div>
            <p className="font-mono-club text-[9px] tracking-[.17em] text-[#5d6b63]">GCT CLUB OS / ADMIN PORTAL</p>
            <p className="mt-1 font-display text-2xl text-[#12372A]">Good morning, Sarah.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="grid h-10 w-10 place-items-center border border-[#12372A]/15" aria-label="Search"><Search size={16} /></button>
            <button className="relative grid h-10 w-10 place-items-center border border-[#12372A]/15" aria-label="Notifications">
              <Bell size={16} /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#C8A951]" />
            </button>
            <span className="hidden border-l border-[#12372A]/10 pl-3 text-xs md:block">
              <strong className="block text-[#12372A]">Sarah Dube</strong><small className="text-[#5d6b63]">Super Admin</small>
            </span>
            <button className="grid h-10 w-10 place-items-center border border-[#12372A]/15 md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle admin menu">
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </header>
        {menuOpen && (
          <div className="border-b border-white/10 bg-[#17201C] px-5 py-4 text-[#F7F5EF] md:hidden">
            <nav className="grid gap-0.5">
              {adminNav.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 text-sm text-white/70">
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
