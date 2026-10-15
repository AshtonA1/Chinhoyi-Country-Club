import { useState } from 'react';
import { DownloadPdfButton } from '@/components/DownloadButtons';
import { Footer } from '@/components/layout/Footer';
import { PageIntro, SectionLabel, usePageMeta } from '@/components/layout/Shared';
import { TeeToggle } from '@/components/TeeToggle';
import { club, golfInfo, images } from '@/data/club';
import { useCourseConfig, useHoles } from '@/lib/club-data';
import { formatNumber } from '@/lib/format';
import { scorecardDocument } from '@/lib/documents';
import { backNine, frontNine, teeRating, teeTotals, type TeeKey } from '@/lib/scorecard';
import type { Hole } from '@/data/club';

const BASE_TABS = ['Scorecard', 'Course rules', 'Local rules', 'Etiquette', 'Hazards'] as const;
type Tab = (typeof BASE_TABS)[number];

function Half({ holes, label, tee, par, metres }: { holes: Hole[]; label: string; tee: TeeKey; par: number; metres: number }) {
  return (
    <table className="w-full min-w-[560px] text-left text-sm">
      <thead className="border-b border-club-ink/10 bg-club-gold/10 font-mono-club text-[9px] tracking-[.1em] text-club-ink/70">
        <tr>
          <th className="px-3 py-3">HOLE</th>
          {holes.map((h) => <th key={h.id} className="px-3 py-3 text-center">{h.number}</th>)}
          <th className="px-3 py-3 text-center">{label}</th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-b border-club-ink/10">
          <td className="px-3 py-3 font-medium text-club-ink">Par</td>
          {holes.map((h) => <td key={h.id} className="px-3 py-3 text-center text-club-ink/70">{h[tee].par}</td>)}
          <td className="px-3 py-3 text-center font-semibold text-club-ink">{par}</td>
        </tr>
        <tr className="border-b border-club-ink/10">
          <td className="px-3 py-3 font-medium text-club-ink">Metres</td>
          {holes.map((h) => <td key={h.id} className="px-3 py-3 text-center text-club-ink/70">{h[tee].metres}</td>)}
          <td className="px-3 py-3 text-center font-semibold text-club-ink">{formatNumber(metres)}</td>
        </tr>
        <tr>
          <td className="px-3 py-3 font-medium text-club-ink">Stroke index</td>
          {holes.map((h) => <td key={h.id} className="px-3 py-3 text-center text-club-ink/70">{h[tee].stroke}</td>)}
          <td className="px-3 py-3 text-center text-club-ink/70">—</td>
        </tr>
      </tbody>
    </table>
  );
}

function ScorecardTable({ tee, setTee }: { tee: TeeKey; setTee: (t: TeeKey) => void }) {
  const { items: holes } = useHoles();
  const { value: course } = useCourseConfig();
  const totals = teeTotals(holes, course, tee);
  const rating = teeRating(course, tee);
  return (
    <div id="scorecard-print-area">
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <TeeToggle value={tee} onChange={setTee} />
        {rating && <span className="text-sm text-club-ink/70">Course rating {rating.rating} · Slope {rating.slope}</span>}
      </div>
      <div className="overflow-x-auto border border-club-ink/10 bg-club-white">
        <Half holes={frontNine(holes)} label="OUT" tee={tee} par={totals.par.front} metres={totals.metres.front} />
      </div>
      <div className="mt-4 overflow-x-auto border border-club-ink/10 bg-club-white">
        <Half holes={backNine(holes)} label="IN" tee={tee} par={totals.par.back} metres={totals.metres.back} />
      </div>
      <div className="mt-4 flex justify-end gap-8 border border-club-ink/10 bg-white p-4 text-sm">
        <span>Total par <strong className="text-club-ink">{totals.par.total}</strong></span>
        <span>Total metres <strong className="text-club-ink">{formatNumber(totals.metres.total)}</strong></span>
      </div>
    </div>
  );
}

function RuleList({ label, lines }: { label: string; lines: string[] }) {
  return (
    <>
      <SectionLabel>{label}</SectionLabel>
      <ul className="mt-5 grid gap-3 border-t border-club-ink/15 pt-6 text-sm leading-6 text-club-ink/70">
        {lines.map((rule) => <li key={rule} className="flex gap-3"><span className="text-club-gold">—</span>{rule}</li>)}
      </ul>
    </>
  );
}

export default function GolfInfo() {
  usePageMeta('Golf Information', 'Scorecard, course rules, local rules and etiquette.');
  const TABS = BASE_TABS.filter((t) => t !== 'Hazards' || golfInfo.hazardsOverview.length > 0);
  const [tab, setTab] = useState<Tab>('Scorecard');
  const [tee, setTee] = useState<TeeKey>('men');
  const { items: holes } = useHoles();
  const { value: course } = useCourseConfig();

  return (
    <div className="bg-club-white">
      <PageIntro eyebrow="GOLF INFORMATION" title="Know before you play." copy="The scorecard, course rules and etiquette: everything you need before your round." image={images.green} />
      <main className="mx-auto max-w-[1200px] px-5 py-20 md:px-10 md:py-28">
        <div className="flex flex-wrap gap-2 border-b border-club-ink/15 pb-6">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`border px-4 py-2 text-[10px] font-bold tracking-[.12em] transition-colors ${tab === t ? 'border-club-green bg-club-green text-white' : 'border-club-ink/20 text-club-ink/70 hover:border-club-green'}`}
              data-testid={`button-golfinfo-tab-${t.toLowerCase().replaceAll(' ', '-')}`}
            >
              {t.toUpperCase()}
            </button>
          ))}
          {tab === 'Scorecard' && (
            <span className="ml-auto"><DownloadPdfButton variant="solid" label="DOWNLOAD SCORECARD (PDF)" build={() => scorecardDocument(holes, course, tee)} testId="button-download-scorecard" /></span>
          )}
        </div>

        <div className="mt-10">
          {tab === 'Scorecard' && (
            <>
              <SectionLabel>SCORECARD · PAR 72</SectionLabel>
              <h2 className="font-display mt-4 text-4xl text-club-ink md:text-5xl">{club.name}</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-club-ink/70">
                Download a printable A4 scorecard for the tees you choose, with space for four players to write their scores.
              </p>
              <div className="mt-8"><ScorecardTable tee={tee} setTee={setTee} /></div>
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
