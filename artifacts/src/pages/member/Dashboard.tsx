import { Link } from 'wouter';
import { ArrowUpRight, ReceiptText, ShieldCheck, UserRound } from 'lucide-react';
import { MemberShell, PortalHeading, PortalStat } from './MemberShell';
import { SectionLabel, usePageMeta } from '@/components/layout/Shared';
import { useLocalCollection } from '@/lib/local-store';

type BookingRecord = { id: string; reference: string; date: string; time: string; players: number; holes: string };

export default function MemberDashboard() {
  usePageMeta('Member room', 'Your tee times, competitions and membership at a glance.');
  const { items: bookings } = useLocalCollection<BookingRecord>('chapman:bookings');
  const upcoming = bookings.slice(0, 2);

  return (
    <MemberShell>
      <PortalHeading
        eyebrow="MEMBER ROOM / OVERVIEW"
        title="Your club, at a glance."
        copy="Everything you need for the week ahead, with a little more time left for the game."
        action={<Link href="/tee-times" className="inline-flex items-center justify-center gap-2 bg-[#C8A951] px-5 py-4 text-[10px] font-bold tracking-[.14em] text-[#17201C] hover:bg-[#e3c86b]">BOOK A TEE TIME <ArrowUpRight size={14} /></Link>}
      />
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <PortalStat label="HANDICAP INDEX" value="12.4" note="Down 1.2 this season" />
        <PortalStat label="ROUNDS THIS YEAR" value={String(18 + bookings.length)} note={`${bookings.length} booked via this app`} />
        <PortalStat label="MEMBER SINCE" value="2019" note="Full membership" />
        <PortalStat label="ACCOUNT BALANCE" value="$0.00" note="All paid up" dark />
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <section className="lg:col-span-7">
          <div className="flex items-center justify-between">
            <div><SectionLabel>UP NEXT</SectionLabel><h2 className="font-display mt-2 text-4xl text-[#12372A]">Your tee sheet.</h2></div>
            <Link href="/member/tee-times" className="text-[10px] font-bold tracking-[.13em] text-[#2E6B4E]">VIEW HISTORY <ArrowUpRight size={14} className="ml-1 inline" /></Link>
          </div>
          <div className="mt-5 grid gap-3">
            {upcoming.length === 0 && (
              <p className="border border-dashed border-[#12372A]/15 bg-[#F7F5EF] p-6 text-sm text-[#5d6b63]">
                No upcoming tee times yet. <Link href="/tee-times" className="font-semibold text-[#2E6B4E]">Book your next round</Link>.
              </p>
            )}
            {upcoming.map((t) => (
              <div key={t.id} className="flex flex-wrap items-center gap-4 border border-[#12372A]/10 bg-[#F7F5EF] p-5">
                <div className="w-20 border-r border-[#12372A]/10">
                  <p className="font-mono-club text-[9px] text-[#2E6B4E]">{t.date}</p>
                </div>
                <div>
                  <p className="font-display text-2xl text-[#12372A]">{t.time}</p>
                  <p className="mt-1 text-xs text-[#5d6b63]">{t.players} players · {t.holes}</p>
                </div>
                <span className="ml-auto border border-[#2E6B4E]/25 bg-[#e4eee6] px-3 py-1 text-[9px] font-bold tracking-[.12em] text-[#2E6B4E]">CONFIRMED</span>
              </div>
            ))}
          </div>
        </section>
        <section className="lg:col-span-5">
          <SectionLabel>THIS MONTH</SectionLabel>
          <h2 className="font-display mt-2 text-4xl text-[#12372A]">On at the club.</h2>
          <div className="mt-5 border border-[#12372A]/10 bg-[#12372A] p-6 text-[#F7F5EF]">
            <p className="font-mono-club text-[9px] tracking-[.14em] text-[#C8A951]">22 JUN · COMPETITION</p>
            <h3 className="mt-4 font-display text-3xl">Chapman Cup — Final</h3>
            <p className="mt-3 text-sm leading-6 text-white/60">The club championship reaches its final, followed by prizegiving on the veranda.</p>
            <Link href="/member/competitions" className="mt-6 inline-flex items-center gap-2 text-[10px] font-bold tracking-[.13em] text-[#C8A951]">VIEW COMPETITIONS <ArrowUpRight size={14} /></Link>
          </div>
        </section>
      </div>
      <div className="mt-10 grid gap-3 sm:grid-cols-3">
        <Link href="/member/membership" className="border border-[#12372A]/10 bg-[#e8e9df] p-5 transition-colors hover:bg-[#dde3d8]">
          <ShieldCheck className="text-[#2E6B4E]" size={19} /><p className="mt-7 font-display text-2xl text-[#12372A]">Membership</p><p className="mt-2 text-xs text-[#5d6b63]">Renewal due 01 Jan 2027</p>
        </Link>
        <Link href="/member/payments" className="border border-[#12372A]/10 bg-[#e8e9df] p-5 transition-colors hover:bg-[#dde3d8]">
          <ReceiptText className="text-[#2E6B4E]" size={19} /><p className="mt-7 font-display text-2xl text-[#12372A]">Payments</p><p className="mt-2 text-xs text-[#5d6b63]">View invoices and receipts</p>
        </Link>
        <Link href="/member/profile" className="border border-[#12372A]/10 bg-[#e8e9df] p-5 transition-colors hover:bg-[#dde3d8]">
          <UserRound className="text-[#2E6B4E]" size={19} /><p className="mt-7 font-display text-2xl text-[#12372A]">Your profile</p><p className="mt-2 text-xs text-[#5d6b63]">Keep your details current</p>
        </Link>
      </div>
    </MemberShell>
  );
}
