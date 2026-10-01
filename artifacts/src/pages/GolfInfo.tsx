import { useState } from 'react';
import { Download, Printer } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { PageIntro, SectionLabel, usePageMeta } from '@/components/layout/Shared';
import { club, golfInfo, holes, images } from '@/data/club';

const TABS = ['Scorecard', 'Course rules', 'Local rules', 'Etiquette', 'Hazards'] as const;

function ScorecardTable() {
  const front = holes.slice(0, 9);
  const back = holes.slice(9, 18);
  const totalPar = holes.reduce((sum, h) => sum + h.par, 0);
  const totalYards = holes.reduce((sum, h) => sum + h.yards, 0);

  function renderHalf(half: typeof front, label: string) {
    return (
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="border-b border-[#12372A]/10 bg-[#e8e9df] font-mono-club text-[9px] tracking-[.1em] text-[#5d6b63]">
          <tr>
            <th className="px-3 py-3">HOLE</th>
            {half.map((h) => <th key={h.number} className="px-3 py-3 text-center">{h.number}</th>)}
            <th className="px-3 py-3 text-center">{label}</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-[#12372A]/10">
            <td className="px-3 py-3 font-medium text-[#12372A]">Par</td>
            {half.map((h) => <td key={h.number} className="px-3 py-3 text-center text-[#5d6b63]">{h.par}</td>)}
            <td className="px-3 py-3 text-center font-semibold text-[#12372A]">{half.reduce((s, h) => s + h.par, 0)}</td>
          </tr>
          <tr className="border-b border-[#12372A]/10">
            <td className="px-3 py-3 font-medium text-[#12372A]">Yards</td>
            {half.map((h) => <td key={h.number} className="px-3 py-3 text-center text-[#5d6b63]">{h.yards}</td>)}
            <td className="px-3 py-3 text-center font-semibold text-[#12372A]">{half.reduce((s, h) => s + h.yards, 0)}</td>
          </tr>
          <tr>
            <td className="px-3 py-3 font-medium text-[#12372A]">Stroke Index</td>
            {half.map((h) => <td key={h.number} className="px-3 py-3 text-center text-[#5d6b63]">{h.stroke}</td>)}
            <td className="px-3 py-3 text-center text-[#5d6b63]">—</td>
          </tr>
        </tbody>
      </table>
    );
  }

  return (
    <div id="scorecard-print-area">
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {golfInfo.scorecard.tees.map((tee) => (
          <div key={tee.name} className="border border-[#12372A]/10 bg-white p-4">
            <p className="font-mono-club text-[9px] tracking-[.14em] text-[#2E6B4E]">{tee.name.toUpperCase()} TEES</p>
            <p className="mt-2 text-sm text-[#5d6b63]">Rating {tee.rating} · Slope {tee.slope}</p>
          </div>
        ))}
      </div>
      <div className="overflow-x-auto border border-[#12372A]/10 bg-[#F7F5EF]">{renderHalf(front, 'OUT')}</div>
      <div className="mt-4 overflow-x-auto border border-[#12372A]/10 bg-[#F7F5EF]">{renderHalf(back, 'IN')}</div>
      <div className="mt-4 flex justify-end gap-8 border border-[#12372A]/10 bg-white p-4 text-sm">
        <span>Total Par <strong className="text-[#12372A]">{totalPar}</strong></span>
        <span>Total Yards <strong className="text-[#12372A]">{totalYards}</strong></span>
      </div>
    </div>
  );
}

export default function GolfInfo() {
  usePageMeta('Golf Information', 'Scorecard, course rules, local rules, etiquette and hazards.');
  const [tab, setTab] = useState<(typeof TABS)[number]>('Scorecard');

  function handlePrint() {
    window.print();
  }

  return (
    <div className="bg-[#F7F5EF]">
      <PageIntro eyebrow="GOLF INFORMATION" title="Know before you play." copy="Scorecard, course rules, local rules and etiquette — everything you need before your round." image={images.green} />
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
              <SectionLabel>OFFICIAL SCORECARD</SectionLabel>
              <h2 className="font-display mt-4 text-4xl text-[#12372A] md:text-5xl">{club.name}</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#5d6b63]">
                Use "Download / Print PDF" to save this scorecard using your browser's print dialog — choose "Save as PDF" as the destination.
              </p>
              <div className="mt-8"><ScorecardTable /></div>
            </>
          )}
          {tab === 'Course rules' && (
            <>
              <SectionLabel>COURSE RULES</SectionLabel>
              <ul className="mt-5 grid gap-3 border-t border-[#12372A]/15 pt-6 text-sm leading-6 text-[#5d6b63]">
                {golfInfo.courseRules.map((rule) => <li key={rule} className="flex gap-3"><span className="text-[#C8A951]">—</span>{rule}</li>)}
              </ul>
            </>
          )}
          {tab === 'Local rules' && (
            <>
              <SectionLabel>LOCAL RULES</SectionLabel>
              <ul className="mt-5 grid gap-3 border-t border-[#12372A]/15 pt-6 text-sm leading-6 text-[#5d6b63]">
                {golfInfo.localRules.map((rule) => <li key={rule} className="flex gap-3"><span className="text-[#C8A951]">—</span>{rule}</li>)}
              </ul>
            </>
          )}
          {tab === 'Etiquette' && (
            <>
              <SectionLabel>GOLF ETIQUETTE</SectionLabel>
              <ul className="mt-5 grid gap-3 border-t border-[#12372A]/15 pt-6 text-sm leading-6 text-[#5d6b63]">
                {golfInfo.etiquette.map((rule) => <li key={rule} className="flex gap-3"><span className="text-[#C8A951]">—</span>{rule}</li>)}
              </ul>
            </>
          )}
          {tab === 'Hazards' && (
            <>
              <SectionLabel>HAZARDS OVERVIEW</SectionLabel>
              <ul className="mt-5 grid gap-3 border-t border-[#12372A]/15 pt-6 text-sm leading-6 text-[#5d6b63]">
                {golfInfo.hazardsOverview.map((rule) => <li key={rule} className="flex gap-3"><span className="text-[#C8A951]">—</span>{rule}</li>)}
              </ul>
              <p className="mt-6 text-xs text-[#5d6b63]">See individual hole pages under The Course for hole-specific hazard notes.</p>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
