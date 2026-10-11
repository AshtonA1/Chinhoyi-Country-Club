import { useState } from 'react';
import { ArrowDown, ArrowUp, ImagePlus, Pencil, Plus } from 'lucide-react';
import { AdminShell, PortalHeading, PortalStat } from './AdminShell';
import {
  CheckField, DeleteButton, GhostButton, Panel, PrimaryButton, SaveNotice, SelectField, StorageNote, TextField, AreaField, useSaveNotice,
} from '@/components/admin/Form';
import { FACILITY_ICONS, FacilityIcon } from '@/components/FacilityIcon';
import type { FacilityIconId, FacilityItem } from '@/data/club';
import { useFacilities } from '@/lib/club-data';
import { makeId } from '@/lib/format';
import { resizeImage } from '@/lib/image';
import { useCan } from '@/lib/permissions';

const blank = (): FacilityItem => ({ id: makeId('fac'), title: '', text: '', icon: 'generic', access: '', image: undefined, active: true });

export default function AdminFacilities() {
  const { items, update, remove, replaceAll } = useFacilities();
  const canWrite = useCan('facilities', 'write');
  const canDelete = useCan('facilities', 'delete');
  const { notice, flash } = useSaveNotice();
  const [draft, setDraft] = useState<FacilityItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [error, setError] = useState('');
  const set = (patch: Partial<FacilityItem>) => setDraft((d) => (d ? { ...d, ...patch } : d));

  function save() {
    if (!draft) return;
    if (!draft.title.trim()) return setError('Give the facility a name.');
    const clean = { ...draft, title: draft.title.trim(), text: draft.text.trim(), access: (draft.access ?? '').trim() };
    // New facilities go to the end of the list so the public order stays sensible.
    flash(isNew ? replaceAll([...items, clean]) : update(clean.id, clean));
    setDraft(null);
    setError('');
  }

  function move(index: number, dir: -1 | 1) {
    const next = [...items];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    flash(replaceAll(next));
  }

  async function onPhoto(file: File | undefined) {
    if (!file) return;
    try {
      set({ image: await resizeImage(file, 900) });
      setError('');
    } catch {
      setError('That photo could not be used. Try a different image.');
    }
  }

  return (
    <AdminShell>
      <PortalHeading
        eyebrow="ADMIN / FACILITIES"
        title="Everything on the grounds."
        copy="Add, edit, hide or remove facilities. Use the access/price line for things like “Included with membership” or “$5 per wash”."
        action={canWrite && (
          <button onClick={() => { setDraft(blank()); setIsNew(true); setError(''); }} className="inline-flex items-center gap-2 bg-club-green px-5 py-4 text-[10px] font-bold tracking-[.14em] text-club-white hover:bg-club-ink" data-testid="button-add-facility">
            <Plus size={14} /> ADD FACILITY
          </button>
        )}
      />
      <div className="mt-8 grid gap-3 md:grid-cols-2">
        <PortalStat label="SHOWN ON SITE" value={String(items.filter((f) => f.active).length)} note="Visible to visitors" />
        <PortalStat label="HIDDEN" value={String(items.filter((f) => !f.active).length)} note="Saved but not shown" />
      </div>
      <div className="mt-4"><SaveNotice notice={notice} /></div>

      {draft && (
        <div className="mt-6">
          <Panel title={isNew ? 'New facility' : 'Edit facility'}>
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="Name" value={draft.title} onChange={(v) => set({ title: v })} />
              <SelectField label="Icon" value={draft.icon} onChange={(v) => set({ icon: v as FacilityIconId })} options={Object.entries(FACILITY_ICONS).map(([value, { label }]) => ({ value, label }))} />
              <TextField label="Access / price (optional)" value={draft.access ?? ''} onChange={(v) => set({ access: v })} placeholder="e.g. Included with membership" hint="Shown on the card. Leave empty to hide." />
              <div className="flex items-end pb-2"><CheckField label="Show on the public site" checked={draft.active} onChange={(v) => set({ active: v })} /></div>
            </div>
            <div className="mt-4"><AreaField label="Description" value={draft.text} onChange={(v) => set({ text: v })} /></div>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <label className="inline-flex cursor-pointer items-center gap-2 border border-dashed border-club-ink/20 px-4 py-3 text-xs text-club-ink/70 hover:border-club-green">
                <ImagePlus size={16} className="text-club-green" /> {draft.image ? 'Replace photo' : 'Add a photo (optional)'}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => void onPhoto(e.target.files?.[0])} />
              </label>
              {draft.image && (
                <>
                  <img src={draft.image} alt="" className="h-16 w-24 object-cover" />
                  <GhostButton onClick={() => set({ image: undefined })}>REMOVE PHOTO</GhostButton>
                </>
              )}
            </div>
            {error && <p role="alert" className="mt-4 text-xs text-club-alert">{error}</p>}
            <div className="mt-5 flex flex-wrap gap-3">
              <PrimaryButton onClick={save} testId="button-save-facility">SAVE FACILITY</PrimaryButton>
              <GhostButton onClick={() => { setDraft(null); setError(''); }}>CANCEL</GhostButton>
            </div>
          </Panel>
        </div>
      )}

      <div className="mt-6 grid gap-2">
        {items.map((f, i) => (
          <div key={f.id} className="flex flex-wrap items-center gap-4 border border-club-ink/10 bg-club-white p-4">
            <FacilityIcon icon={f.icon} size={22} className="shrink-0 text-club-green" />
            <div className="min-w-40 flex-1">
              <p className="font-medium text-club-ink">{f.title} {!f.active && <span className="ml-2 border border-club-ink/20 px-1.5 py-0.5 font-mono-club text-[8px] tracking-[.1em] text-club-ink/70">HIDDEN</span>}</p>
              <p className="text-xs text-club-ink/70">{f.access || 'No access/price line'}</p>
            </div>
            {canWrite && (
              <div className="flex flex-wrap gap-2">
                <GhostButton onClick={() => move(i, -1)} disabled={i === 0}><ArrowUp size={13} /></GhostButton>
                <GhostButton onClick={() => move(i, 1)} disabled={i === items.length - 1}><ArrowDown size={13} /></GhostButton>
                <GhostButton onClick={() => { setDraft({ ...f }); setIsNew(false); setError(''); }}><Pencil size={13} /> EDIT</GhostButton>
              </div>
            )}
            {canDelete && <DeleteButton onConfirm={() => flash(remove(f.id))} />}
          </div>
        ))}
        {items.length === 0 && <p className="border border-dashed border-club-ink/15 p-8 text-center text-sm text-club-ink/70">No facilities yet.</p>}
      </div>
      <StorageNote />
    </AdminShell>
  );
}
