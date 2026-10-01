import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowUpRight, CircleCheck } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { SectionLabel } from '@/components/layout/Shared';

function RegField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="font-mono-club text-[9px] tracking-[.14em] text-[#5d6b63]">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full border border-[#cfd4cd] bg-transparent px-4 py-3 text-sm text-[#12372A] outline-none focus:border-[#2E6B4E]" />
    </div>
  );
}

export default function MemberRegister() {
  const [registered, setRegistered] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  return (
    <div className="min-h-dvh bg-[#e8e9df] text-[#12372A]">
      <Header solid />
      <main className="mx-auto grid max-w-[1150px] gap-12 px-5 pb-20 pt-36 md:grid-cols-2 md:items-center md:px-10 md:pt-48">
        <div>
          <SectionLabel>JOIN THE MEMBER ROOM</SectionLabel>
          <h1 className="font-display mt-5 text-6xl leading-[.88] md:text-8xl">Your club,<br /><em>closer.</em></h1>
          <p className="mt-7 max-w-md text-base leading-7 text-[#5d6b63]">
            Create your digital club account to book rounds, follow competitions, view your membership and keep in touch.
          </p>
        </div>
        <div className="bg-[#F7F5EF] p-7 shadow-[0_18px_45px_rgba(18,55,42,.08)] md:p-10">
          {registered ? (
            <div>
              <CircleCheck className="text-[#2E6B4E]" size={34} />
              <h2 className="font-display mt-5 text-4xl">You're on the list.</h2>
              <p className="mt-3 text-sm leading-7 text-[#5d6b63]">Your invitation request has been recorded. Check your inbox for the next step.</p>
              <Link href="/member/login" className="mt-7 inline-flex items-center gap-2 text-[10px] font-bold tracking-[.14em] text-[#2E6B4E]">
                GO TO MEMBER LOGIN <ArrowUpRight size={14} />
              </Link>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setRegistered(true); }} className="grid gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <RegField label="FIRST NAME" value={firstName} onChange={setFirstName} />
                <RegField label="LAST NAME" value={lastName} onChange={setLastName} />
              </div>
              <div>
                <label htmlFor="register-email" className="font-mono-club text-[9px] tracking-[.14em] text-[#5d6b63]">EMAIL ADDRESS</label>
                <input id="register-email" type="email" required placeholder="you@example.com" className="mt-2 w-full border border-[#cfd4cd] bg-transparent px-4 py-3 text-sm outline-none focus:border-[#2E6B4E]" />
              </div>
              <div>
                <label htmlFor="register-phone" className="font-mono-club text-[9px] tracking-[.14em] text-[#5d6b63]">PHONE NUMBER</label>
                <input id="register-phone" required placeholder="+263 ..." className="mt-2 w-full border border-[#cfd4cd] bg-transparent px-4 py-3 text-sm outline-none focus:border-[#2E6B4E]" />
              </div>
              <label className="flex items-start gap-3 text-xs leading-5 text-[#5d6b63]">
                <input type="checkbox" required className="mt-1 accent-[#2E6B4E]" />
                I agree to receive club updates and understand this is a membership enquiry.
              </label>
              <button className="flex items-center justify-center gap-2 bg-[#12372A] py-4 text-[10px] font-bold tracking-[.14em] text-[#F7F5EF] hover:bg-[#2E6B4E]">
                REQUEST AN INVITATION <ArrowUpRight size={14} />
              </button>
              <p className="text-center text-xs text-[#5d6b63]">Already have an account? <Link href="/member/login" className="font-bold text-[#2E6B4E]">Sign in</Link></p>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
