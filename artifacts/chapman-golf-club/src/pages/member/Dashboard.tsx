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
        action={<Link href="/tee-times" className="inline-flex items-center justify-center gap-2 bg-[#C8A951] px-5 py-4 text-[10px] font-bold tracking-[.14em] text-[#17201C] hover:bg-[#e3c86b]">BOOK A TEE TIME <ArrowUpRight size={14} /></Link>}
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
            <div><SectionLabel>UP NEXT</SectionLabel><h2 className="font-display mt-2 text-4xl text-[#12372A]">Your tee times.</h2></div>
            <Link href="/member/tee-times" className="text-[10px] font-bold tracking-[.13em] text-[#2E6B4E]">ALL TEE TIMES <ArrowUpRight size={14} className="ml-1 inline" /></Link>
          </div>
          <div className="mt-5 grid gap-3">
            {upcoming.length === 0 && (
              <p className="border border-dashed border-[#12372A]/15 bg-[#F7F5EF] p-6 text-sm text-[#5d6b63]">
                No upcoming tee times yet. <Link href="/tee-times" className="font-semibold text-[#2E6B4E]">Request your next round</Link>.
              </p>
            )}
            {upcoming.map((t) => (
              <div key={t.id} className="flex flex-wrap items-center gap-4 border border-[#12372A]/10 bg-[#F7F5EF] p-5">
                <div className="min-w-24 border-r border-[#12372A]/10 pr-4">
                  <p className="font-mono-club text-[9px] text-[#2E6B4E]">{formatDate(t.date).toUpperCase()}</p>
                </div>
                <div>
                  <p className="font-display text-2xl text-[#12372A]">{t.time}</p>
                  <p className="mt-1 text-xs text-[#5d6b63]">{t.players} {t.players === 1 ? 'player' : 'players'} · {t.holes}</p>
                </div>
                <span className={`ml-auto border px-3 py-1 text-[9px] font-bold tracking-[.12em] ${t.status === 'Confirmed' ? 'border-[#2E6B4E]/25 bg-[#e4eee6] text-[#2E6B4E]' : 'border-[#C8A951]/40 bg-[#fbf3d8] text-[#8b6e16]'}`}>{t.status.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="lg:col-span-5">
          <SectionLabel>NEXT EVENT</SectionLabel>
          <h2 className="font-display mt-2 text-4xl text-[#12372A]">On at the club.</h2>
          {nextEvent && p ? (
            <div className="mt-5 border border-[#12372A]/10 bg-[#12372A] p-6 text-[#F7F5EF]">
              <p className="font-mono-club text-[9px] tracking-[.14em] text-[#C8A951]">{p.day} {p.month} · {nextEvent.type.toUpperCase()}{nextEvent.status === 'proposed' ? ' · PROPOSED' : ''}</p>
              <h3 className="mt-4 font-display text-3xl">{nextEvent.title}</h3>
              <Link href="/member/competitions" className="mt-6 inline-flex items-center gap-2 text-[10px] font-bold tracking-[.13em] text-[#C8A951]">VIEW EVENTS <ArrowUpRight size={14} /></Link>
            </div>
          ) : (
            <p className="mt-5 border border-dashed border-[#12372A]/15 bg-[#F7F5EF] p-6 text-sm text-[#5d6b63]">No upcoming events are listed.</p>
          )}
        </section>
      </div>
      <div className="mt-10 grid gap-3 sm:grid-cols-3">
        <Link href="/member/membership" className="border border-[#12372A]/10 bg-[#e8e9df] p-5 transition-colors hover:bg-[#dde3d8]">
          <ShieldCheck className="text-[#2E6B4E]" size={19} /><p className="mt-7 font-display text-2xl text-[#12372A]">Membership</p><p className="mt-2 text-xs text-[#5d6b63]">Fees and what is included</p>
        </Link>
        <Link href="/member/payments" className="border border-[#12372A]/10 bg-[#e8e9df] p-5 transition-colors hover:bg-[#dde3d8]">
          <ReceiptText className="text-[#2E6B4E]" size={19} /><p className="mt-7 flex items-center gap-2 font-display text-2xl text-[#12372A]">Payments <SampleChip /></p><p className="mt-2 text-xs text-[#5d6b63]">Invoices and receipts</p>
        </Link>
        <Link href="/member/profile" className="border border-[#12372A]/10 bg-[#e8e9df] p-5 transition-colors hover:bg-[#dde3d8]">
          <UserRound className="text-[#2E6B4E]" size={19} /><p className="mt-7 font-display text-2xl text-[#12372A]">Your profile</p><p className="mt-2 text-xs text-[#5d6b63]">Keep your details current</p>
        </Link>
      </div>
    </MemberShell>
  );
}
