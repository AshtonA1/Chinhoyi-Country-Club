import { Link } from 'wouter';
import { ArrowUpRight, ReceiptText, ShieldCheck, UserRound } from 'lucide-react';
import { MemberShell, PortalHeading, PortalStat } from './MemberShell';
import { SectionLabel, usePageMeta } from '@/components/layout/Shared';
import { SampleChip } from '@/components/layout/Portal';
import { sampleMember } from '@/data/sample';
import { byDateAsc, isUpcomingBooking, useBookings } from '@/lib/bookings';
import { upcomingEvents, useEvents, usePricing } from '@/lib/club-data';
import { dateParts, formatDate } from '@/lib/dates';
import { formatMoney } from '@/lib/format';

export default function MemberDashboard() {
  usePageMeta('Member room', 'Your tee times, competitions and membership at a glance.');
  const { items: bookings } = useBookings();
  const { items: events } = useEvents();
  const { value: pricing } = usePricing();
  const upcoming = bookings.filter((b) => isUpcomingBooking(b)).sort(byDateAsc).slice(0, 3);
  const nextEvent = upcomingEvents(events)[0];
  const p = nextEvent ? dateParts(nextEvent.date) : null;

  return (
    <MemberShell>
      <PortalHeading
        eyebrow="MEMBER ROOM / OVERVIEW"
        title="Your club, at a glance."
        copy="Your tee times, competitions and membership in one place."
        action={<Link href="/tee-times" className="inline-flex items-center justify-center gap-2 bg-club-gold px-5 py-4 text-[10px] font-bold tracking-[.14em] text-club-ink hover:bg-club-gold/85">BOOK A TEE TIME <ArrowUpRight size={14} /></Link>}
      />
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <PortalStat label="HANDICAP INDEX" value={sampleMember.handicapIndex} note="Sample figure" sample />
        <PortalStat label="TEE TIME REQUESTS" value={String(bookings.filter((b) => b.status !== 'Cancelled').length)} note="Made in this browser" />
        <PortalStat label="MEMBER SINCE" value={sampleMember.memberSince} note="Sample figure" sample />
        <PortalStat label="MEMBERSHIP FEE" value={formatMoney(pricing.membershipFee, pricing.currencySymbol)} note="Includes everything" dark />
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <section className="lg:col-span-7">
          <div className="flex items-center justify-between">
            <div><SectionLabel>UP NEXT</SectionLabel><h2 className="font-display mt-2 text-4xl text-club-ink">Your tee times.</h2></div>
            <Link href="/member/tee-times" className="text-[10px] font-bold tracking-[.13em] text-club-green">ALL TEE TIMES <ArrowUpRight size={14} className="ml-1 inline" /></Link>
          </div>
          <div className="mt-5 grid gap-3">
            {upcoming.length === 0 && (
              <p className="border border-dashed border-club-ink/15 bg-club-white p-6 text-sm text-club-ink/70">
                No upcoming tee times yet. <Link href="/tee-times" className="font-semibold text-club-green">Request your next round</Link>.
              </p>
            )}
            {upcoming.map((t) => (
              <div key={t.id} className="flex flex-wrap items-center gap-4 border border-club-ink/10 bg-club-white p-5">
                <div className="min-w-24 border-r border-club-ink/10 pr-4">
                  <p className="font-mono-club text-[9px] text-club-green">{formatDate(t.date).toUpperCase()}</p>
                </div>
                <div>
                  <p className="font-display text-2xl text-club-ink">{t.time}</p>
                  <p className="mt-1 text-xs text-club-ink/70">{t.players} {t.players === 1 ? 'player' : 'players'} · {t.holes}</p>
                </div>
                <span className={`ml-auto border px-3 py-1 text-[9px] font-bold tracking-[.12em] ${t.status === 'Confirmed' ? 'border-club-green/25 bg-club-green/10 text-club-green' : 'border-club-gold/40 bg-club-gold/15 text-club-gold-deep'}`}>{t.status.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="lg:col-span-5">
          <SectionLabel>NEXT EVENT</SectionLabel>
          <h2 className="font-display mt-2 text-4xl text-club-ink">On at the club.</h2>
          {nextEvent && p ? (
            <div className="mt-5 border border-club-ink/10 bg-club-green p-6 text-club-white">
              <p className="font-mono-club text-[9px] tracking-[.14em] text-club-gold">{p.day} {p.month} · {nextEvent.type.toUpperCase()}</p>
              <h3 className="mt-4 font-display text-3xl">{nextEvent.title}</h3>
              <Link href="/member/competitions" className="mt-6 inline-flex items-center gap-2 text-[10px] font-bold tracking-[.13em] text-club-gold">VIEW EVENTS <ArrowUpRight size={14} /></Link>
            </div>
          ) : (
            <p className="mt-5 border border-dashed border-club-ink/15 bg-club-white p-6 text-sm text-club-ink/70">No upcoming events are listed.</p>
          )}
        </section>
      </div>
      <div className="mt-10 grid gap-3 sm:grid-cols-3">
        <Link href="/member/membership" className="border border-club-ink/10 bg-club-gold/10 p-5 transition-colors hover:bg-club-gold/20">
          <ShieldCheck className="text-club-green" size={19} /><p className="mt-7 font-display text-2xl text-club-ink">Membership</p><p className="mt-2 text-xs text-club-ink/70">Fees and what is included</p>
        </Link>
        <Link href="/member/payments" className="border border-club-ink/10 bg-club-gold/10 p-5 transition-colors hover:bg-club-gold/20">
          <ReceiptText className="text-club-green" size={19} /><p className="mt-7 flex items-center gap-2 font-display text-2xl text-club-ink">Payments <SampleChip /></p><p className="mt-2 text-xs text-club-ink/70">Invoices and receipts</p>
        </Link>
        <Link href="/member/profile" className="border border-club-ink/10 bg-club-gold/10 p-5 transition-colors hover:bg-club-gold/20">
          <UserRound className="text-club-green" size={19} /><p className="mt-7 font-display text-2xl text-club-ink">Your profile</p><p className="mt-2 text-xs text-club-ink/70">Keep your details current</p>
        </Link>
      </div>
    </MemberShell>
  );
}
