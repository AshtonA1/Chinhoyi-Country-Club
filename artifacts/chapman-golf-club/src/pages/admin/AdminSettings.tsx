import { useState } from 'react';
import { Plus } from 'lucide-react';
import { AdminShell, PortalHeading } from './AdminShell';
import {
  AreaField, CheckField, DeleteButton, GhostButton, NumberField, Panel, PrimaryButton, SaveNotice, StorageNote, TextField, useSaveNotice,
} from '@/components/admin/Form';
import { defaultBookingSettings, defaultPricing, type AddOn, type BookingSettings, type PricingConfig } from '@/data/club';
import { useAddOns, useBookingSettings, usePricing } from '@/lib/club-data';
import { makeId, splitList } from '@/lib/format';
import { useCan } from '@/lib/permissions';

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

function FeesPanel() {
  const store = usePricing();
  const canWrite = useCan('settings', 'write');
  const { notice, flash } = useSaveNotice();
  const [p, setP] = useState<PricingConfig>(store.value);
  const [error, setError] = useState('');
  const set = (patch: Partial<PricingConfig>) => setP((c) => ({ ...c, ...patch }));
  const money = (label: string, key: 'joiningFee' | 'membershipFee' | 'hnaFee' | 'greenFeeMember' | 'greenFeeNonMember') => (
    <NumberField label={`${label} (${p.currencySymbol})`} value={p[key]} step="0.5" onChange={(v) => set({ [key]: v ?? 0 } as Partial<PricingConfig>)} />
  );

  function save() {
    if (p.nineHoleFactor < 0 || p.nineHoleFactor > 1) return setError('The 9-hole share must be between 0 and 1 (for example 0.6 for 60%).');
    setError('');
    flash(store.replace(p));
  }

  return (
    <Panel title="Fees">
      <div className="grid gap-4 sm:grid-cols-3">
        <TextField label="Currency code" value={p.currency} onChange={(v) => set({ currency: v.toUpperCase() })} />
        <TextField label="Currency symbol" value={p.currencySymbol} onChange={(v) => set({ currencySymbol: v })} />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {money('Joining fee', 'joiningFee')}
        <TextField label="Joining fee: billing" value={p.joiningBilling} onChange={(v) => set({ joiningBilling: v })} placeholder="e.g. once-off" />
        <span />
        {money('Membership fee', 'membershipFee')}
        <TextField label="Membership: billing" value={p.membershipBilling} onChange={(v) => set({ membershipBilling: v })} placeholder="e.g. per year" hint="Not confirmed yet. Left empty." />
        <span />
        {money('HNA handicap fee', 'hnaFee')}
        <TextField label="HNA: billing" value={p.hnaBilling} onChange={(v) => set({ hnaBilling: v })} placeholder="e.g. per year" />
        <span />
        {money('Green fee: members', 'greenFeeMember')}
        {money('Green fee: non-members', 'greenFeeNonMember')}
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="flex items-end pb-2"><CheckField label="Offer 9-hole rounds" checked={p.nineHoleEnabled} onChange={(v) => set({ nineHoleEnabled: v })} /></div>
        <NumberField label="9-hole share of the 18-hole fee" value={p.nineHoleFactor} step="0.05" onChange={(v) => set({ nineHoleFactor: v ?? 0 })} hint="0.6 = 60%. A sample value: confirm with the club." />
      </div>
      {error && <p role="alert" className="mt-4 text-xs text-[#9b2c2c]">{error}</p>}
      {canWrite && (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <PrimaryButton onClick={save} testId="button-save-fees">SAVE FEES</PrimaryButton>
          <GhostButton onClick={() => { setP(defaultPricing); store.reset(); flash(true, 'Fees reset to the starting values.'); }}>RESET</GhostButton>
          <SaveNotice notice={notice} />
        </div>
      )}
    </Panel>
  );
}

function AddOnsPanel() {
  const { items, add, update, remove, reset } = useAddOns();
  const canWrite = useCan('settings', 'write');
  const { notice, flash } = useSaveNotice();
  const [label, setLabel] = useState('');
  const [price, setPrice] = useState<number | null>(0);
  const { value: pricing } = usePricing();
  return (
    <Panel title="Booking add-ons (per player)">
      <p className="mb-4 text-xs text-[#5d6b63]">Extras offered in the booking flow. The starting prices are samples: confirm them with the club.</p>
      <div className="grid gap-2">
        {items.map((a) => (
          <div key={a.id} className="flex flex-wrap items-center gap-3 border border-[#12372A]/10 bg-white p-3">
            <input value={a.label} disabled={!canWrite} onChange={(e) => update(a.id, { label: e.target.value })} className="min-w-40 flex-1 border border-[#cfd4cd] px-3 py-2 text-sm text-[#12372A] outline-none focus:border-[#2E6B4E]" aria-label="Add-on name" />
            <span className="text-sm text-[#5d6b63]">{pricing.currencySymbol}</span>
            <input type="number" min={0} step="0.5" value={a.price} disabled={!canWrite} onChange={(e) => update(a.id, { price: Math.max(0, Number(e.target.value) || 0) })} className="w-24 border border-[#cfd4cd] px-3 py-2 text-sm text-[#12372A] outline-none focus:border-[#2E6B4E]" aria-label="Price" />
            <CheckField label="Offered" checked={a.active} onChange={(v) => update(a.id, { active: v })} />
            {canWrite && <DeleteButton onConfirm={() => flash(remove(a.id))} />}
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-[#5d6b63]">No add-ons.</p>}
      </div>
      {canWrite && (
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div className="min-w-48 flex-1"><TextField label="New add-on" value={label} onChange={setLabel} placeholder="e.g. Trolley hire" /></div>
          <div className="w-28"><NumberField label="Price" value={price} step="0.5" onChange={setPrice} /></div>
          <PrimaryButton
            disabled={!label.trim()}
            onClick={() => { const a: AddOn = { id: makeId('addon'), label: label.trim(), price: price ?? 0, active: true }; flash(add(a)); setLabel(''); setPrice(0); }}
          >
            <Plus size={13} /> ADD
          </PrimaryButton>
          <GhostButton onClick={() => { reset(); flash(true, 'Add-ons reset to the starting list.'); }}>RESET LIST</GhostButton>
        </div>
      )}
      <div className="mt-3"><SaveNotice notice={notice} /></div>
    </Panel>
  );
}

function RulesPanel() {
  const store = useBookingSettings();
  const canWrite = useCan('settings', 'write');
  const { notice, flash } = useSaveNotice();
  const [slots, setSlots] = useState(store.value.slots.join(', '));
  const [rest, setRest] = useState<Omit<BookingSettings, 'slots'>>({
    maxPlayers: store.value.maxPlayers, cancellationHours: store.value.cancellationHours, advanceDays: store.value.advanceDays,
  });
  const [error, setError] = useState('');

  function save() {
    const list = [...new Set(splitList(slots))].sort();
    const bad = list.filter((t) => !TIME.test(t));
    if (list.length === 0) return setError('Add at least one tee time.');
    if (bad.length) return setError(`These are not valid 24-hour times (HH:MM): ${bad.join(', ')}`);
    if (rest.maxPlayers < 1 || rest.maxPlayers > 8) return setError('Players per booking must be between 1 and 8.');
    setError('');
    setSlots(list.join(', '));
    flash(store.replace({ slots: list, ...rest }));
  }

  return (
    <Panel title="Tee time rules">
      <AreaField label="Tee time slots (club time)" rows={2} value={slots} onChange={setSlots} hint="24-hour HH:MM, separated by commas. Starting values are samples: use the club's real tee sheet." />
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <NumberField label="Max players per booking" value={rest.maxPlayers} onChange={(v) => setRest({ ...rest, maxPlayers: v ?? 1 })} />
        <NumberField label="Free cancellation (hours before)" value={rest.cancellationHours} onChange={(v) => setRest({ ...rest, cancellationHours: v ?? 0 })} />
        <NumberField label="Book up to (days ahead)" value={rest.advanceDays} onChange={(v) => setRest({ ...rest, advanceDays: v ?? 1 })} />
      </div>
      {error && <p role="alert" className="mt-4 text-xs text-[#9b2c2c]">{error}</p>}
      {canWrite && (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <PrimaryButton onClick={save} testId="button-save-rules">SAVE RULES</PrimaryButton>
          <GhostButton onClick={() => { store.reset(); setSlots(defaultBookingSettings.slots.join(', ')); setRest({ maxPlayers: defaultBookingSettings.maxPlayers, cancellationHours: defaultBookingSettings.cancellationHours, advanceDays: defaultBookingSettings.advanceDays }); flash(true, 'Rules reset to the starting values.'); }}>RESET</GhostButton>
          <SaveNotice notice={notice} />
        </div>
      )}
    </Panel>
  );
}

export default function AdminSettings() {
  return (
    <AdminShell>
      <PortalHeading
        eyebrow="ADMIN / FEES & SETTINGS"
        title="Make it yours."
        copy="Change any fee, add charges for other extras, and set the tee time rules. Public pages and the booking flow update straight away."
      />
      <div className="mt-8 grid gap-6">
        <FeesPanel />
        <AddOnsPanel />
        <RulesPanel />
        <Panel title="Contact details & opening hours">
          <p className="text-sm leading-6 text-[#5d6b63]">
            The phone number, email, address and opening hours are still placeholders. For now they are set in <code className="bg-[#e8e9df] px-1">src/data/club.ts</code>; an editable version comes with the online database.
          </p>
        </Panel>
      </div>
      <StorageNote />
    </AdminShell>
  );
}
