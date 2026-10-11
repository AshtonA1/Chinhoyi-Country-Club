import { useState } from 'react';
import { Printer } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { PageIntro, SectionLabel, usePageMeta } from '@/components/layout/Shared';
import { TeeToggle } from '@/components/TeeToggle';
import { club, golfInfo, images } from '@/data/club';
import { useCourseConfig, useHoles } from '@/lib/club-data';
import { formatNumber } from '@/lib/format';
import { backNine, frontNine, teeRating, teeTotals, type TeeKey } from '@/lib/scorecard';
import type { Hole } from '@/data/club';

const BASE_TABS = ['Scorecard', 'Course rules', 'Local rules', 'Etiquette', 'Hazards'] as const;
type Tab = (typeof BASE_TABS)[number];

function Half({ holes, label, tee, par, metres }: { holes: Hole[]; label: string; tee: TeeKey; par: number; metres: number }) {
  return (
    <table className="w-full min-w-[560px] text-left text-sm">
      <thead className="border-b border-[#12372A]/10 bg-[#e8e9df] font-mono-club text-[9px] tracking-[.1em] text-[#5d6b63]">
        <tr>
          <th className="px-3 py-3">HOLE</th>
          {holes.map((h) => <th key={h.id} className="px-3 py-3 text-center">{h.number}</th>)}
          <th className="px-3 py-3 text-center">{label}</th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-b border-[#12372A]/10">
          <td className="px-3 py-3 font-medium text-[#12372A]">Par</td>
          {holes.map((h) => <td key={h.id} className="px-3 py-3 text-center text-[#5d6b63]">{h[tee].par}</td>)}
          <td className="px-3 py-3 text-center font-semibold text-[#12372A]">{par}</td>
        </tr>
        <tr className="border-b border-[#12372A]/10">
          <td className="px-3 py-3 font-medium text-[#12372A]">Metres</td>
          {holes.map((h) => <td key={h.id} className="px-3 py-3 text-center text-[#5d6b63]">{h[tee].metres}</td>)}
          <td className="px-3 py-3 text-center font-semibold text-[#12372A]">{formatNumber(metres)}</td>
        </tr>
        <tr>
          <td className="px-3 py-3 font-medium text-[#12372A]">Stroke index</td>
          {holes.map((h) => <td key={h.id} className="px-3 py-3 text-center text-[#5d6b63]">{h[tee].stroke}</td>)}
          <td className="px-3 py-3 text-center text-[#5d6b63]">—</td>
        </tr>
      </tbody>
    </table>
  );
}

function ScorecardTable() {
  const { items: holes } = useHoles();
  const { value: course } = useCourseConfig();
  const [tee, setTee] = useState<TeeKey>('men');
  const totals = teeTotals(holes, course, tee);
  const rating = teeRating(course, tee);
  return (
    <div id="scorecard-print-area">
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <TeeToggle value={tee} onChange={setTee} />
        {rating && <span className="text-sm text-[#5d6b63]">Course rating {rating.rating} · Slope {rating.slope}</span>}
      </div>
      <div className="overflow-x-auto border border-[#12372A]/10 bg-[#F7F5EF]">
        <Half holes={frontNine(holes)} label="OUT" tee={tee} par={totals.par.front} metres={totals.metres.front} />
      </div>
      <div className="mt-4 overflow-x-auto border border-[#12372A]/10 bg-[#F7F5EF]">
        <Half holes={backNine(holes)} label="IN" tee={tee} par={totals.par.back} metres={totals.metres.back} />
      </div>
      <div className="mt-4 flex justify-end gap-8 border border-[#12372A]/10 bg-white p-4 text-sm">
        <span>Total par <strong className="text-[#12372A]">{totals.par.total}</strong></span>
        <span>Total metres <strong className="text-[#12372A]">{formatNumber(totals.metres.total)}</strong></span>
      </div>
    </div>
  );
}

function RuleList({ label, lines }: { label: string; lines: string[] }) {
  return (
    <>
      <SectionLabel>{label}</SectionLabel>
      <ul className="mt-5 grid gap-3 border-t border-[#12372A]/15 pt-6 text-sm leading-6 text-[#5d6b63]">
        {lines.map((rule) => <li key={rule} className="flex gap-3"><span className="text-[#C8A951]">—</span>{rule}</li>)}
      </ul>
    </>
  );
}

export default function GolfInfo() {
  usePageMeta('Golf Information', 'Scorecard, course rules, local rules and etiquette.');
  const TABS = BASE_TABS.filter((t) => t !== 'Hazards' || golfInfo.hazardsOverview.length > 0);
  const [tab, setTab] = useState<Tab>('Scorecard');

  function handlePrint() {
    window.print();
  }

  return (
    <div className="bg-[#F7F5EF]">
      <PageIntro eyebrow="GOLF INFORMATION" title="Know before you play." copy="The scorecard, course rules and etiquette: everything you need before your round." image={images.green} />
      <main className="mx-auto max-w-[1200px] px-5 py-20 md:px-10 md:py-28">
        <div className="flex flex-wrap gap-2 border-b border-[#12372A]/15 pb-6">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`border px-4 py-2 text-[10px] font-bold tracking-[.12em] transition-colors ${tab === t ? 'border-[#2E6B4E] bg-[#2E6B4E] text-white' : 'border-[#12372A]/20 text-[#5d6b63] hover:border-[#2E6B4E]'}`}
              data-testid={`button-golfinfo-tab-${t.toLowerCase().replaceAll(' ', '-')}`}
            >
              {t.toUpperCase()}
            </button>
          ))}
          {tab === 'Scorecard' && (
            <button
              onClick={handlePrint}
              className="ml-auto flex items-center gap-2 bg-[#12372A] px-4 py-2 text-[10px] font-bold tracking-[.12em] text-[#F7F5EF] hover:bg-[#2E6B4E]"
              data-testid="button-download-scorecard"
            >
              <Printer size={13} /> DOWNLOAD / PRINT PDF
            </button>
          )}
        </div>

        <div className="mt-10">
          {tab === 'Scorecard' && (
            <>
              <SectionLabel>SCORECARD · PAR 72</SectionLabel>
              <h2 className="font-display mt-4 text-4xl text-[#12372A] md:text-5xl">{club.name}</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#5d6b63]">
                Use "Download / Print PDF" to save this scorecard using your browser's print dialog — choose "Save as PDF" as the destination.
              </p>
              <div className="mt-8"><ScorecardTable /></div>
            </>
          )}
          {tab === 'Course rules' && <RuleList label="COURSE RULES" lines={golfInfo.courseRules} />}
          {tab === 'Local rules' && <RuleList label="LOCAL RULES" lines={golfInfo.localRules} />}
          {tab === 'Etiquette' && <RuleList label="GOLF ETIQUETTE" lines={golfInfo.etiquette} />}
          {tab === 'Hazards' && <RuleList label="HAZARDS OVERVIEW" lines={golfInfo.hazardsOverview} />}
        </div>
      </main>
      <Footer />
    </div>
  );
}
