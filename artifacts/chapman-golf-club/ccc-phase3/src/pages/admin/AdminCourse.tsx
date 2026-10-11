import { useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { AdminShell, PortalHeading, PortalStat } from './AdminShell';
import {
  AreaField, DeleteButton, GhostButton, NumberField, Panel, PrimaryButton, SaveNotice, StorageNote, TextField, useSaveNotice,
} from '@/components/admin/Form';
import { defaultCourse, defaultHoles, type CourseConfig, type Hole, type TeeData } from '@/data/club';
import { useCourseConfig, useHoles } from '@/lib/club-data';
import { formatNumber, splitList } from '@/lib/format';
import { useCan } from '@/lib/permissions';
import { TEE_LABEL, type TeeKey, teeTotals, validateHoles } from '@/lib/scorecard';

const cell = 'w-16 border border-[#cfd4cd] bg-white px-2 py-1.5 text-center text-sm text-[#12372A] outline-none focus:border-[#2E6B4E]';

function Num({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <input
      type="number"
      min={0}
      value={Number.isFinite(value) ? value : ''}
      onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
      className={cell}
    />
  );
}

export default function AdminCourse() {
  const store = useHoles();
  const courseStore = useCourseConfig();
  const canWrite = useCan('course', 'write');
  const { notice, flash } = useSaveNotice();
  const [holes, setHoles] = useState<Hole[]>(store.items);
  const [course, setCourse] = useState<CourseConfig>(courseStore.value);
  const [selected, setSelected] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);

  const issues = useMemo(() => validateHoles(holes), [holes]);
  const totals = useMemo(() => ({ men: teeTotals(holes, course, 'men'), ladies: teeTotals(holes, course, 'ladies') }), [holes, course]);
  const gaps = (['men', 'ladies'] as TeeKey[]).flatMap((tee) => {
    const t = totals[tee];
    const out: string[] = [];
    if (t.gap.total !== 0) out.push(`${TEE_LABEL[tee]}: the card total is ${formatNumber(t.official.total ?? 0)} m but the 18 holes add up to ${formatNumber(t.computed.total)} m (${t.gap.total > 0 ? '+' : ''}${t.gap.total} m). Check the card against the club.`);
    if (t.gap.front !== 0) out.push(`${TEE_LABEL[tee]}: front nine shows ${formatNumber(t.official.front ?? 0)} m, holes add up to ${formatNumber(t.computed.front)} m.`);
    if (t.gap.back !== 0) out.push(`${TEE_LABEL[tee]}: back nine shows ${formatNumber(t.official.back ?? 0)} m, holes add up to ${formatNumber(t.computed.back)} m.`);
    return out;
  });

  const patchHole = (number: number, patch: Partial<Hole>) => { setHoles((hs) => hs.map((h) => (h.number === number ? { ...h, ...patch } : h))); setDirty(true); };
  const patchTee = (number: number, tee: TeeKey, patch: Partial<TeeData>) => {
    setHoles((hs) => hs.map((h) => (h.number === number ? { ...h, [tee]: { ...h[tee], ...patch } } : h)));
    setDirty(true);
  };
  const patchCourse = (patch: Partial<CourseConfig>) => { setCourse((c) => ({ ...c, ...patch })); setDirty(true); };

  function save() {
    const a = store.replaceAll(holes);
    const b = courseStore.replace(course);
    flash(a && b);
    setDirty(false);
  }

  function resetAll() {
    store.reset();
    courseStore.reset();
    setHoles(defaultHoles);
    setCourse(defaultCourse);
    setDirty(false);
    flash(true, 'Scorecard reset to the club card.');
  }

  const sel = holes.find((h) => h.number === selected);
  const numField = (label: string, key: keyof CourseConfig, hint?: string, step = '1') => (
    <NumberField label={label} value={course[key]} allowEmpty step={step} hint={hint} onChange={(v) => patchCourse({ [key]: v } as Partial<CourseConfig>)} />
  );

  return (
    <AdminShell>
      <PortalHeading
        eyebrow="ADMIN / COURSE & HOLES"
        title="Shape the course story."
        copy="Edit the scorecard for both tees, and add a name, description, hazards and tip to any hole. Empty fields are hidden on the public site."
        action={canWrite && (
          <PrimaryButton onClick={save} disabled={!dirty} testId="button-save-course">SAVE CHANGES</PrimaryButton>
        )}
      />
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <PortalStat label="HOLES" value={String(holes.length)} />
        <PortalStat label="PAR" value={`${totals.men.par.total} / ${totals.ladies.par.total}`} note="Men's / ladies'" />
        <PortalStat label="MEN'S METRES" value={formatNumber(totals.men.metres.total)} note="As shown on the site" />
        <PortalStat label="LADIES' METRES" value={formatNumber(totals.ladies.metres.total)} note="As shown on the site" />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <SaveNotice notice={notice} />
        {dirty && <span className="text-xs text-[#8b6e16]">Unsaved changes.</span>}
      </div>

      {(issues.length > 0 || gaps.length > 0) && (
        <div className="mt-4 border-l-2 border-[#C8A951] bg-[#fbf3d8] p-4 text-xs leading-5 text-[#5d4a12]">
          <p className="flex items-center gap-2 font-bold"><AlertTriangle size={14} /> Check these before relying on the scorecard</p>
          <ul className="mt-2 grid gap-1">
            {[...issues, ...gaps].map((m) => <li key={m}>• {m}</li>)}
          </ul>
        </div>
      )}

      <div className="mt-6 overflow-x-auto border border-[#12372A]/10 bg-[#F7F5EF]">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-[#12372A]/10 bg-[#e8e9df] font-mono-club text-[9px] tracking-[.1em] text-[#5d6b63]">
            <tr>
              <th className="px-3 py-3">HOLE</th>
              <th className="px-3 py-3 text-center" colSpan={3}>MEN'S: PAR · METRES · SI</th>
              <th className="px-3 py-3 text-center" colSpan={3}>LADIES': PAR · METRES · SI</th>
              <th className="px-3 py-3">DETAILS</th>
            </tr>
          </thead>
          <tbody>
            {holes.map((h) => (
              <tr key={h.id} className={`border-b border-[#12372A]/10 last:border-0 ${selected === h.number ? 'bg-[#e4eee6]' : ''}`}>
                <td className="px-3 py-2 font-display text-xl text-[#12372A]">{h.number}</td>
                {(['men', 'ladies'] as TeeKey[]).map((tee) => (
                  <td key={tee} colSpan={3} className="px-1 py-2">
                    <div className="flex justify-center gap-1">
                      <Num value={h[tee].par} onChange={(n) => patchTee(h.number, tee, { par: n })} />
                      <Num value={h[tee].metres} onChange={(n) => patchTee(h.number, tee, { metres: n })} />
                      <Num value={h[tee].stroke} onChange={(n) => patchTee(h.number, tee, { stroke: n })} />
                    </div>
                  </td>
                ))}
                <td className="px-3 py-2">
                  <button onClick={() => setSelected(selected === h.number ? null : h.number)} className="text-[10px] font-bold tracking-[.12em] text-[#2E6B4E]">
                    {selected === h.number ? 'CLOSE' : h.name || h.description || h.hazards.length || h.proTip ? 'EDIT' : 'ADD'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sel && (
        <div className="mt-6">
          <Panel title={`Hole ${sel.number}: public details`}>
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="Name (optional)" value={sel.name} onChange={(v) => patchHole(sel.number, { name: v })} />
              <TextField label="Hero image path" value={sel.image} onChange={(v) => patchHole(sel.number, { image: v })} hint="Path under /public, e.g. /images/hole-1.jpg" />
            </div>
            <div className="mt-4 grid gap-4">
              <AreaField label="Description" value={sel.description} onChange={(v) => patchHole(sel.number, { description: v })} />
              <div className="grid gap-4 md:grid-cols-2">
                <AreaField label="Hazards" rows={3} value={sel.hazards.join('\n')} onChange={(v) => patchHole(sel.number, { hazards: splitList(v, /\n/) })} hint="One per line" />
                <AreaField label="Tip" rows={3} value={sel.proTip} onChange={(v) => patchHole(sel.number, { proTip: v })} />
              </div>
            </div>
          </Panel>
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel title="Printed totals (metres)">
          <p className="mb-4 text-xs leading-5 text-[#5d6b63]">If the club's card prints its own totals, enter them here and they are shown instead of the sum of the holes. Leave empty to use the sum.</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {numField("Men's front", 'menFrontOfficial')}
            {numField("Men's back", 'menBackOfficial')}
            {numField("Men's total", 'menTotalOfficial')}
            {numField("Ladies' front", 'ladiesFrontOfficial')}
            {numField("Ladies' back", 'ladiesBackOfficial')}
            {numField("Ladies' total", 'ladiesTotalOfficial')}
          </div>
        </Panel>
        <Panel title="Course rating & slope">
          <p className="mb-4 text-xs leading-5 text-[#5d6b63]">Shown on the public scorecard only when both rating and slope are entered for a tee.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {numField("Men's rating", 'menRating', undefined, '0.1')}
            {numField("Men's slope", 'menSlope')}
            {numField("Ladies' rating", 'ladiesRating', undefined, '0.1')}
            {numField("Ladies' slope", 'ladiesSlope')}
          </div>
        </Panel>
      </div>
      {canWrite && (
        <div className="mt-6 flex flex-wrap gap-3">
          <GhostButton onClick={() => { setHoles(store.items); setCourse(courseStore.value); setDirty(false); }} disabled={!dirty}>DISCARD CHANGES</GhostButton>
          <DeleteButton label="RESET TO CLUB CARD" onConfirm={resetAll} />
        </div>
      )}
      <StorageNote />
    </AdminShell>
  );
}
