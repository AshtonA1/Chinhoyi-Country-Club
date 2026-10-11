import { MemberShell, PortalHeading, PortalStat } from './MemberShell';
import { SectionLabel, usePageMeta } from '@/components/layout/Shared';
import { SampleChip } from '@/components/layout/Portal';
import { sampleMember } from '@/data/sample';
import { useFacilities, usePricing } from '@/lib/club-data';
import { formatMoney } from '@/lib/format';

export default function MemberMembership() {
  usePageMeta('Membership', 'Your membership fee and what it includes.');
  const { value: p } = usePricing();
  const { items: facilities } = useFacilities();
  const included = facilities.filter((f) => f.active && (f.access ?? '').toLowerCase().includes('included'));
  const s = p.currencySymbol;
  return (
    <MemberShell>
      <PortalHeading eyebrow="MEMBER ROOM / MEMBERSHIP" title="Your place here." copy="Your membership fee and what it includes." />
      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="relative overflow-hidden bg-club-green p-7 text-club-white md:p-10">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full border border-club-gold/30" />
            <div className="flex items-center gap-3"><SectionLabel light>MEMBERSHIP</SectionLabel><SampleChip dark /></div>
            <div className="mt-8 flex flex-col justify-between gap-8 sm:flex-row">
              <div>
                <p className="font-display text-5xl">{formatMoney(p.membershipFee, s)}</p>
                <p className="mt-3 text-sm text-white/60">{p.membershipBilling ? `${p.currency} ${p.membershipBilling}` : p.currency} · includes everything</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="font-mono-club text-[9px] tracking-[.14em] text-club-gold">MEMBER NO.</p>
                <p className="mt-2 font-display text-3xl">{sampleMember.memberNo}</p>
              </div>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-4 border-t border-white/15 pt-5 text-xs text-white/65">
              <span>Golf course access</span>
              {included.map((f) => <span key={f.id}>{f.title}</span>)}
            </div>
          </div>
        </div>
        <div className="lg:col-span-5">
          <SectionLabel>FEES</SectionLabel>
          <div className="mt-4 grid gap-2 border border-club-ink/10 bg-club-white p-5 text-sm text-club-ink/70">
            <div className="flex justify-between"><span>Joining fee</span><strong className="text-club-ink">{formatMoney(p.joiningFee, s)}</strong></div>
            <div className="flex justify-between"><span>Membership fee</span><strong className="text-club-ink">{formatMoney(p.membershipFee, s)}</strong></div>
            <div className="flex justify-between"><span>HNA handicap (optional)</span><strong className="text-club-ink">{formatMoney(p.hnaFee, s)}</strong></div>
            <div className="flex justify-between border-t border-club-ink/10 pt-2"><span>Green fee, member</span><strong className="text-club-ink">{formatMoney(p.greenFeeMember, s)}</strong></div>
          </div>
        </div>
      </div>
      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        <PortalStat label="MEMBERSHIP STATUS" value="Active" note="Sample record" sample />
        <PortalStat label="MEMBER SINCE" value={sampleMember.memberSince} note="Sample record" sample />
      </div>
    </MemberShell>
  );
}
