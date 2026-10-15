import { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowUpRight, LockKeyhole } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { SectionLabel } from '@/components/layout/Shared';

/**
 * Entry point to the admin portal for club staff.
 * Demo only: there is no real authentication yet, so any details open the portal.
 * Real staff sign-in (with roles) arrives with the backend phase.
 */
export default function StaffLogin() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState('');
  return (
    <div className="min-h-dvh bg-club-ink text-club-white">
      <Header />
      <main className="mx-auto grid max-w-[1200px] gap-14 px-5 pb-24 pt-36 md:grid-cols-2 md:items-center md:px-10 md:pt-48">
        <div>
          <SectionLabel light>CLUB STAFF</SectionLabel>
          <h1 className="font-display mt-5 text-6xl leading-[.88] md:text-8xl">Staff<br /><em>room.</em></h1>
          <p className="mt-7 max-w-sm text-base leading-7 text-white/65">Manage events, bookings, the course, facilities and the gallery.</p>
        </div>
        <div className="bg-club-white p-7 text-club-ink md:p-10">
          <form onSubmit={(e) => { e.preventDefault(); navigate('/admin'); }} className="grid gap-5">
            <div>
              <label htmlFor="staff-email" className="font-mono-club text-[9px] tracking-[.15em] text-club-ink/70">STAFF EMAIL</label>
              <input id="staff-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@chinhoyicountryclub.co.zw" className="mt-2 w-full border border-club-ink/20 bg-transparent px-4 py-4 text-sm outline-none placeholder:text-club-ink/50 focus:border-club-green" data-testid="input-staff-email" />
            </div>
            <div>
              <label htmlFor="staff-password" className="font-mono-club text-[9px] tracking-[.15em] text-club-ink/70">PASSWORD</label>
              <input id="staff-password" type="password" required placeholder="Your password" className="mt-2 w-full border border-club-ink/20 bg-transparent px-4 py-4 text-sm outline-none placeholder:text-club-ink/50 focus:border-club-green" data-testid="input-staff-password" />
            </div>
            <button type="submit" className="mt-2 flex items-center justify-center gap-2 bg-club-green py-4 text-[10px] font-bold tracking-[.15em] text-club-white hover:bg-club-ink" data-testid="button-staff-login">
              SIGN IN <ArrowUpRight size={14} />
            </button>
            <p className="flex items-center gap-2 border-t border-club-ink/10 pt-5 text-[11px] leading-5 text-club-ink/70">
              <LockKeyhole size={12} className="shrink-0" /> Preview: any details open the portal. Secure staff accounts with roles are added when the club goes live.
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
