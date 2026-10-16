import { type ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Activity, CalendarCheck, CalendarDays, ClipboardList, Compass, CreditCard, Image as ImageIcon,
  LayoutDashboard, LogOut, Mail, Menu, Settings, ShieldCheck, Shapes, Users, X, BarChart3,
} from 'lucide-react';
import { SampleChip } from '@/components/layout/Portal';
import { sampleAdmin } from '@/data/sample';
import { getRole } from '@/lib/permissions';
import { useAuth } from '@/lib/auth';

export const adminNav = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Tee sheet', href: '/admin/tee-sheet', icon: CalendarCheck },
  { label: 'Bookings', href: '/admin/bookings', icon: ClipboardList },
  { label: 'Course & holes', href: '/admin/course', icon: Compass },
  { label: 'Events', href: '/admin/events', icon: CalendarDays },
  { label: 'Memberships', href: '/admin/memberships', icon: ShieldCheck },
  { label: 'Gallery & stories', href: '/admin/gallery', icon: ImageIcon },
  { label: 'Facilities', href: '/admin/facilities', icon: Shapes },
  { label: 'Payments', href: '/admin/payments', icon: CreditCard },
  { label: 'Emails', href: '/admin/emails', icon: Mail },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Users & roles', href: '/admin/users', icon: Users },
  { label: 'Activity logs', href: '/admin/activity', icon: Activity },
  { label: 'Fees & settings', href: '/admin/settings', icon: Settings },
];

function greeting(): string {
  const hour = new Date(Date.now() + 2 * 3_600_000).getUTCHours(); // club time, UTC+2
  return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
}

export function AdminShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const auth = useAuth();
  const shownName = auth.configured ? (auth.profile?.fullName || auth.profile?.email || 'Staff') : sampleAdmin.name;
  const shownTitle = auth.configured ? (getRole(auth.role)?.label ?? 'Staff') : sampleAdmin.title;
  return (
    <div className="min-h-dvh bg-club-gold/5 text-club-ink">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-club-ink px-5 py-6 text-club-white md:flex">
        <div className="flex items-center justify-between px-2">
          <Link href="/" className="font-display text-2xl">Chinhoyi <em>HQ</em></Link>
          <span className="rounded-full border border-club-gold/40 px-2 py-1 font-mono-club text-[8px] text-club-gold">ADMIN</span>
        </div>
        <div className="mt-8 border-y border-white/10 px-2 py-4">
          <p className="font-mono-club text-[9px] tracking-[.14em] text-club-gold">OPERATIONS</p>
          <p className="mt-2 text-xs text-white/55">Chinhoyi Country Club</p>
        </div>
        <nav className="mt-5 grid gap-0.5 overflow-y-auto" aria-label="Admin navigation">
          {adminNav.map((item) => {
            const Icon = item.icon;
            const active = location === item.href || (item.href !== '/admin' && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 text-xs transition-colors ${active ? 'bg-club-green text-white' : 'text-white/55 hover:bg-white/5 hover:text-white'}`}>
                <Icon size={15} strokeWidth={1.5} />{item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-white/10 pt-4">
          {auth.configured
            ? <button onClick={() => void auth.signOut()} className="flex w-full items-center gap-3 px-3 py-2 text-xs text-white/50 hover:text-white" data-testid="button-admin-signout"><LogOut size={15} />Sign out</button>
            : <Link href="/" className="flex items-center gap-3 px-3 py-2 text-xs text-white/50 hover:text-white"><LogOut size={15} />Exit portal</Link>}
        </div>
      </aside>
      <div className="md:pl-64">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-club-ink/10 bg-club-white/95 px-5 backdrop-blur md:px-10">
          <div>
            <p className="font-mono-club text-[9px] tracking-[.17em] text-club-ink/70">CHINHOYI COUNTRY CLUB / ADMIN</p>
            <p className="mt-1 font-display text-2xl text-club-ink">{greeting()}.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden border-l border-club-ink/10 pl-3 text-xs md:block">
              <strong className="block text-club-ink">{shownName}</strong><small className="flex items-center gap-1 text-club-ink/70">{shownTitle} {!auth.configured && <SampleChip />}</small>
            </span>
            <button className="grid h-10 w-10 place-items-center border border-club-ink/15 md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle admin menu">
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </header>
        {menuOpen && (
          <div className="border-b border-white/10 bg-club-ink px-5 py-4 text-club-white md:hidden">
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

export { PortalHeading, PortalStat } from '@/components/layout/Portal';
