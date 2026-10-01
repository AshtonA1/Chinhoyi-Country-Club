import { FileText } from 'lucide-react';
import { MemberShell, PortalHeading, PortalStat } from './MemberShell';
import { SectionLabel, usePageMeta } from '@/components/layout/Shared';

export default function MemberMembership() {
  usePageMeta('Membership', 'Membership details, benefits and renewal information.');
  return (
    <MemberShell>
      <PortalHeading
        eyebrow="MEMBER ROOM / MEMBERSHIP"
        title="Your place here."
        copy="Membership details, benefits and renewal information."
        action={<button className="inline-flex items-center gap-2 border border-[#12372A]/20 px-5 py-4 text-[10px] font-bold tracking-[.14em] text-[#12372A] hover:border-[#2E6B4E]">DOWNLOAD STATEMENT <FileText size={14} /></button>}
      />
      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="relative overflow-hidden bg-[#12372A] p-7 text-[#F7F5EF] md:p-10">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full border border-[#C8A951]/30" />
            <SectionLabel light>ACTIVE MEMBERSHIP</SectionLabel>
            <div className="mt-8 flex flex-col justify-between gap-8 sm:flex-row">
              <div><p className="font-display text-5xl">Full Membership</p><p className="mt-3 text-sm text-white/60">Member no. CCG-02418</p></div>
              <div className="text-left sm:text-right"><p className="font-mono-club text-[9px] tracking-[.14em] text-[#C8A951]">VALID THROUGH</p><p className="mt-2 font-display text-3xl">31 DEC 2026</p></div>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-4 border-t border-white/15 pt-5 text-xs text-white/65">
              <span>Unlimited course access</span><span>Full clubhouse privileges</span><span>Member competitions</span><span>Guest rounds included</span>
            </div>
          </div>
        </div>
        <div className="lg:col-span-5">
          <SectionLabel>RENEWAL</SectionLabel>
          <h2 className="font-display mt-3 text-4xl text-[#12372A]">Ready for another year?</h2>
          <p className="mt-4 text-sm leading-7 text-[#5d6b63]">Your 2027 renewal invitation will be available from 01 November. We'll send a reminder to your preferred email.</p>
          <button className="mt-7 flex items-center gap-2 bg-[#C8A951] px-5 py-4 text-[10px] font-bold tracking-[.14em] text-[#17201C]">UPDATE RENEWAL PREFERENCES</button>
        </div>
      </div>
      <div className="mt-10 grid gap-3 sm:grid-cols-3">
        <PortalStat label="MEMBERSHIP STATUS" value="Active" note="Good standing" />
        <PortalStat label="GUEST ROUNDS" value="6 / 12" note="Used this year" />
        <PortalStat label="RECIPROCAL CLUBS" value="14" note="Available to you" />
      </div>
    </MemberShell>
  );
}
