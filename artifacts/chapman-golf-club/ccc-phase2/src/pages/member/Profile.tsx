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
      <label className="font-mono-club text-[9px] tracking-[.14em] text-[#5d6b63]">{label}</label>
      <input type={type} value={draft[key]} onChange={(e) => { setDraft({ ...draft, [key]: e.target.value }); setSaved(null); }} className="mt-2 w-full border border-[#cfd4cd] bg-transparent px-4 py-3 text-sm text-[#12372A] outline-none focus:border-[#2E6B4E]" />
    </div>
  );
  function submit(e: FormEvent) {
    e.preventDefault();
    setSaved(replace(draft));
  }
  return (
    <MemberShell>
      <PortalHeading eyebrow="MEMBER ROOM / PROFILE" title="Keep it current." copy="Your details help the team welcome you properly." />
      <form onSubmit={submit} className="mt-8 max-w-3xl border border-[#12372A]/10 bg-[#F7F5EF] p-6 md:p-9">
        <div className="flex items-center gap-4 border-b border-[#12372A]/10 pb-7">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-[#C8A951] font-display text-3xl text-[#12372A]">{(draft.firstName[0] ?? '?').toUpperCase()}</span>
          <div>
            <p className="font-display text-3xl text-[#12372A]">{draft.firstName} {draft.lastName}</p>
            <p className="flex items-center gap-2 text-xs text-[#5d6b63]">{sampleMember.memberNo} <SampleChip /></p>
          </div>
        </div>
        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          {field('FIRST NAME', 'firstName')}
          {field('LAST NAME', 'lastName')}
          {field('EMAIL ADDRESS', 'email', 'email')}
          {field('PHONE NUMBER', 'phone', 'tel')}
        </div>
        <div className="mt-5">{field('ADDRESS', 'address')}</div>
        <div className="mt-7 flex flex-col gap-4 border-t border-[#12372A]/10 pt-6 sm:flex-row sm:items-center">
          <button type="submit" className="inline-flex items-center justify-center gap-2 bg-[#12372A] px-5 py-4 text-[10px] font-bold tracking-[.14em] text-[#F7F5EF] hover:bg-[#2E6B4E]">SAVE CHANGES <Check size={14} /></button>
          {saved === true && <span className="text-xs text-[#2E6B4E]">Saved in this browser.</span>}
          {saved === false && <span className="text-xs text-[#9b2c2c]">Could not save: browser storage is full or blocked.</span>}
        </div>
      </form>
    </MemberShell>
  );
}
