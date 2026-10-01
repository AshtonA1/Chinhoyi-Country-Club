import { Check } from 'lucide-react';
import { Link } from 'wouter';
import { Footer } from '@/components/layout/Footer';
import { ButtonLink, PageIntro, SectionLabel, usePageMeta } from '@/components/layout/Shared';
import { images, membershipPlans } from '@/data/club';

function MemberCard({ plan }: { plan: (typeof membershipPlans)[number] }) {
  return (
    <div className="border border-white/20 p-7 md:p-8">
      <SectionLabel light>{plan.title.toUpperCase()}</SectionLabel>
      <h3 className="font-display mt-6 text-4xl">{plan.title}</h3>
      <p className="mt-3 text-sm text-white/60">{plan.note}</p>
      <p className="mt-5 font-display text-3xl text-[#C8A951]">{plan.price} <span className="font-mono-club text-xs text-white/50">{plan.billing}</span></p>
      <ul className="mt-8 grid gap-3 border-t border-white/15 pt-6 text-sm text-white/75">
        {plan.perks.map((p) => (
          <li key={p} className="flex items-center gap-2"><Check size={14} className="text-[#C8A951]" />{p}</li>
        ))}
      </ul>
      <Link href="/contact" className="mt-8 inline-flex items-center gap-2 text-[10px] font-bold tracking-[.15em] text-[#C8A951]" data-testid={`link-membership-${plan.id}`}>
        ENQUIRE
      </Link>
    </div>
  );
}

const comparisonRows = ['Course access', 'Guest rounds / year', 'Clubhouse privileges', 'Competitions', 'Reciprocal clubs'];

function ComparisonCell({ value }: { value: boolean | string }) {
  if (typeof value === 'boolean') {
    return value ? <Check size={16} className="mx-auto text-[#2E6B4E]" /> : <span className="mx-auto block text-[#c9cec8]">—</span>;
  }
  return <span>{value}</span>;
}

export default function Membership() {
  usePageMeta('Membership', 'There are clubs you visit, and clubs that become part of your week.');
  return (
    <div className="bg-[#F7F5EF]">
      <PageIntro eyebrow="MEMBERSHIP" title="A place to belong." copy="There are clubs you visit, and clubs that become part of your week. This is the latter." image={images.clubhouse} />
      <main>
        <section className="mx-auto grid max-w-[1480px] gap-12 px-5 py-20 md:grid-cols-12 md:px-10 md:py-32">
          <div className="md:col-span-5">
            <SectionLabel>THE INVITATION</SectionLabel>
            <h2 className="font-display mt-5 text-5xl leading-[.92] text-[#12372A] md:text-7xl">
              Come as a<br /><em>guest. Stay for good.</em>
            </h2>
          </div>
          <div className="md:col-span-5 md:col-start-8">
            <p className="text-lg leading-8 text-[#12372A]">
              Membership is an invitation into an active, generous community. Play whenever the mood takes you,
              bring your people, and let the club take care of the details.
            </p>
            <p className="mt-6 text-sm leading-7 text-[#5d6b63]">
              Our membership team will introduce you to the club, the course and the people who make both special.
              Applications are considered monthly.
            </p>
            <ButtonLink href="/contact" dark className="mt-8">START A CONVERSATION</ButtonLink>
          </div>
        </section>
        <section className="bg-[#12372A] py-20 text-[#F7F5EF] md:py-28">
          <div className="mx-auto max-w-[1480px] px-5 md:px-10">
            <div className="grid gap-8 md:grid-cols-3">
              {membershipPlans.map((plan) => <MemberCard key={plan.id} plan={plan} />)}
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-[1480px] px-5 py-20 md:px-10 md:py-28">
          <SectionLabel>COMPARE PLANS</SectionLabel>
          <h2 className="font-display mt-5 text-4xl text-[#12372A] md:text-5xl">Find your fit.</h2>
          <div className="mt-8 overflow-x-auto border border-[#12372A]/10 bg-[#F7F5EF]">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="border-b border-[#12372A]/10 bg-[#e8e9df] font-mono-club text-[9px] tracking-[.12em] text-[#5d6b63]">
                <tr>
                  <th className="px-5 py-4">BENEFIT</th>
                  {membershipPlans.map((plan) => <th key={plan.id} className="px-5 py-4">{plan.title.toUpperCase()}</th>)}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row} className="border-b border-[#12372A]/10 last:border-0">
                    <td className="px-5 py-4 font-medium text-[#12372A]">{row}</td>
                    {membershipPlans.map((plan) => (
                      <td key={plan.id} className="px-5 py-4 text-[#5d6b63]"><ComparisonCell value={plan.comparison[row]} /></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
