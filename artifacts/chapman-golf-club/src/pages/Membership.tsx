import { Check } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { ButtonLink, PageIntro, SectionLabel, usePageMeta } from '@/components/layout/Shared';
import { images } from '@/data/club';
import { usePricing } from '@/lib/club-data';
import { formatMoney } from '@/lib/format';

function FeeCard({ label, price, billing, note, perks }: { label: string; price: string; billing: string; note: string; perks: string[] }) {
  return (
    <div className="border border-club-ink/10 bg-club-white p-7 md:p-8">
      <SectionLabel>{label.toUpperCase()}</SectionLabel>
      <p className="mt-6 font-display text-5xl text-club-ink">{price}</p>
      {billing && <p className="mt-1 font-mono-club text-[10px] tracking-[.1em] text-club-ink/60">{billing.toUpperCase()}</p>}
      <p className="mt-4 text-sm text-club-ink/70">{note}</p>
      {perks.length > 0 && (
        <ul className="mt-6 grid gap-3 border-t border-club-ink/10 pt-5 text-sm text-club-ink/80">
          {perks.map((p) => <li key={p} className="flex items-center gap-2"><Check size={14} className="shrink-0 text-club-green" />{p}</li>)}
        </ul>
      )}
    </div>
  );
}

export default function Membership() {
  usePageMeta('Membership & fees', 'Joining fee, membership fee and green fees at Chinhoyi Country Club.');
  const { value: p } = usePricing();
  const s = p.currencySymbol;
  return (
    <div className="bg-club-white">
      <PageIntro eyebrow="MEMBERSHIP & FEES" title="A place to belong." copy="One membership gives you the golf course and the club’s other facilities." image={images.clubhouse} />
      <main>
        <section className="mx-auto grid max-w-[1480px] gap-12 px-5 py-20 md:grid-cols-12 md:px-10 md:py-32">
          <div className="md:col-span-5">
            <SectionLabel>JOINING THE CLUB</SectionLabel>
            <h2 className="font-display mt-5 text-5xl leading-[.92] text-club-ink md:text-7xl">
              Come as a<br /><em>guest. Stay for good.</em>
            </h2>
          </div>
          <div className="md:col-span-5 md:col-start-8">
            <p className="text-lg leading-8 text-club-ink">
              The membership fee covers the club as a whole. Members may use the other facilities as well as playing golf.
            </p>
            <p className="mt-6 text-sm leading-7 text-club-ink/70">
              Prices are in {p.currency}. Contact the club to join or to ask about anything below.
            </p>
            <ButtonLink href="/contact" dark className="mt-8">ENQUIRE ABOUT JOINING</ButtonLink>
          </div>
        </section>
        <section className="on-gold py-20 md:py-28">
          <div className="mx-auto max-w-[1480px] px-5 md:px-10">
            <div className="grid gap-8 md:grid-cols-3">
              <FeeCard label="Joining fee" price={formatMoney(p.joiningFee, s)} billing={p.joiningBilling} note="Paid when you join the club." perks={[]} />
              <FeeCard
                label="Membership fee"
                price={formatMoney(p.membershipFee, s)}
                billing={p.membershipBilling}
                note="Includes everything."
                perks={['Golf course access', 'Use of the club’s other facilities']}
              />
              <FeeCard
                label="HNA handicap (optional)"
                price={formatMoney(p.hnaFee, s)}
                billing={p.hnaBilling}
                note="Handicap Network Africa, the national handicapping system."
                perks={[]}
              />
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-[1480px] px-5 py-20 md:px-10 md:py-28">
          <SectionLabel>GREEN FEES</SectionLabel>
          <h2 className="font-display mt-5 text-4xl text-club-ink md:text-5xl">Playing a round.</h2>
          <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-2">
            <div className="border border-club-ink/10 bg-white p-6">
              <p className="font-mono-club text-[9px] tracking-[.14em] text-club-green">MEMBERS</p>
              <p className="mt-3 font-display text-4xl text-club-ink">{formatMoney(p.greenFeeMember, s)}</p>
            </div>
            <div className="border border-club-ink/10 bg-white p-6">
              <p className="font-mono-club text-[9px] tracking-[.14em] text-club-green">NON-MEMBERS</p>
              <p className="mt-3 font-display text-4xl text-club-ink">{formatMoney(p.greenFeeNonMember, s)}</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-club-ink/70">Green fee per player for 18 holes.</p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
