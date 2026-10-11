import { useState, type FormEvent } from 'react';
import { Check } from 'lucide-react';
import { MemberShell, PortalHeading } from './MemberShell';
import { usePageMeta } from '@/components/layout/Shared';
import { SampleChip } from '@/components/layout/Portal';
import { sampleMember } from '@/data/sample';
import { useLocalObject } from '@/lib/local-store';

const DEFAULTS = {
  firstName: sampleMember.firstName, lastName: sampleMember.lastName,
  email: sampleMember.email, phone: sampleMember.phone, address: sampleMember.address,
};

export default function MemberProfile() {
  usePageMeta('Profile', 'Keep your details current.');
  const { value, replace } = useLocalObject('ccc:v1:member-profile', DEFAULTS);
  const [draft, setDraft] = useState(value);
  const [saved, setSaved] = useState<boolean | null>(null);
  const field = (label: string, key: keyof typeof DEFAULTS, type = 'text') => (
    <div>
      <label className="font-mono-club text-[9px] tracking-[.14em] text-club-ink/70">{label}</label>
      <input type={type} value={draft[key]} onChange={(e) => { setDraft({ ...draft, [key]: e.target.value }); setSaved(null); }} className="mt-2 w-full border border-club-ink/20 bg-transparent px-4 py-3 text-sm text-club-ink outline-none focus:border-club-green" />
    </div>
  );
  function submit(e: FormEvent) {
    e.preventDefault();
    setSaved(replace(draft));
  }
  return (
    <MemberShell>
      <PortalHeading eyebrow="MEMBER ROOM / PROFILE" title="Keep it current." copy="Your details help the team welcome you properly." />
      <form onSubmit={submit} className="mt-8 max-w-3xl border border-club-ink/10 bg-club-white p-6 md:p-9">
        <div className="flex items-center gap-4 border-b border-club-ink/10 pb-7">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-club-gold font-display text-3xl text-club-ink">{(draft.firstName[0] ?? '?').toUpperCase()}</span>
          <div>
            <p className="font-display text-3xl text-club-ink">{draft.firstName} {draft.lastName}</p>
            <p className="flex items-center gap-2 text-xs text-club-ink/70">{sampleMember.memberNo} <SampleChip /></p>
          </div>
        </div>
        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          {field('FIRST NAME', 'firstName')}
          {field('LAST NAME', 'lastName')}
          {field('EMAIL ADDRESS', 'email', 'email')}
          {field('PHONE NUMBER', 'phone', 'tel')}
        </div>
        <div className="mt-5">{field('ADDRESS', 'address')}</div>
        <div className="mt-7 flex flex-col gap-4 border-t border-club-ink/10 pt-6 sm:flex-row sm:items-center">
          <button type="submit" className="inline-flex items-center justify-center gap-2 bg-club-green px-5 py-4 text-[10px] font-bold tracking-[.14em] text-club-white hover:bg-club-ink">SAVE CHANGES <Check size={14} /></button>
          {saved === true && <span className="text-xs text-club-green">Saved in this browser.</span>}
          {saved === false && <span className="text-xs text-club-alert">Could not save: browser storage is full or blocked.</span>}
        </div>
      </form>
    </MemberShell>
  );
}
