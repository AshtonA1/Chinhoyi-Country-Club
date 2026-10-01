import { useState } from 'react';
import { Check } from 'lucide-react';
import { MemberShell, PortalHeading } from './MemberShell';
import { usePageMeta } from '@/components/layout/Shared';

function ProfileField({ label, value, type = 'text' }: { label: string; value: string; type?: string }) {
  return (
    <div>
      <label className="font-mono-club text-[9px] tracking-[.14em] text-[#5d6b63]">{label}</label>
      <input type={type} defaultValue={value} className="mt-2 w-full border border-[#cfd4cd] bg-transparent px-4 py-3 text-sm text-[#12372A] outline-none focus:border-[#2E6B4E]" />
    </div>
  );
}

export default function MemberProfile() {
  usePageMeta('Profile', 'Keep your details current.');
  const [saved, setSaved] = useState(false);
  return (
    <MemberShell>
      <PortalHeading eyebrow="MEMBER ROOM / PROFILE" title="Keep it current." copy="Your details help the team welcome you properly." />
      <form onSubmit={(e) => { e.preventDefault(); setSaved(true); }} className="mt-8 max-w-3xl border border-[#12372A]/10 bg-[#F7F5EF] p-6 md:p-9">
        <div className="flex items-center gap-4 border-b border-[#12372A]/10 pb-7">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-[#C8A951] font-display text-3xl text-[#12372A]">T</span>
          <div><p className="font-display text-3xl text-[#12372A]">Tendai Moyo</p><p className="text-xs text-[#5d6b63]">Full member · CCG-02418</p></div>
        </div>
        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          <ProfileField label="FIRST NAME" value="Tendai" />
          <ProfileField label="LAST NAME" value="Moyo" />
          <ProfileField label="EMAIL ADDRESS" value="tendai@example.com" type="email" />
          <ProfileField label="PHONE NUMBER" value="+263 77 123 4567" />
        </div>
        <div className="mt-5">
          <label className="font-mono-club text-[9px] tracking-[.14em] text-[#5d6b63]" htmlFor="profile-address">ADDRESS</label>
          <textarea id="profile-address" defaultValue="12 Borrowdale Brooke, Harare" rows={3} className="mt-2 w-full resize-none border border-[#cfd4cd] bg-transparent px-4 py-3 text-sm text-[#12372A] outline-none focus:border-[#2E6B4E]" />
        </div>
        <div className="mt-7 flex flex-col gap-4 border-t border-[#12372A]/10 pt-6 sm:flex-row sm:items-center">
          <button type="submit" className="inline-flex items-center justify-center gap-2 bg-[#12372A] px-5 py-4 text-[10px] font-bold tracking-[.14em] text-[#F7F5EF] hover:bg-[#2E6B4E]">SAVE CHANGES <Check size={14} /></button>
          {saved && <span className="text-xs text-[#2E6B4E]">Profile updated for this demo.</span>}
        </div>
      </form>
    </MemberShell>
  );
}
