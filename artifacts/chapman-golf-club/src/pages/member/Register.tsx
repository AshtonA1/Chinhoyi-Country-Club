import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowUpRight, CircleCheck } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { SectionLabel } from '@/components/layout/Shared';

function RegField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="font-mono-club text-[9px] tracking-[.14em] text-club-ink/70">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full border border-club-ink/20 bg-transparent px-4 py-3 text-sm text-club-ink outline-none focus:border-club-green" />
    </div>
  );
}

export default function MemberRegister() {
  const [registered, setRegistered] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  return (
    <div className="min-h-dvh bg-club-gold/10 text-club-ink">
      <Header solid />
      <main className="mx-auto grid max-w-[1150px] gap-12 px-5 pb-20 pt-36 md:grid-cols-2 md:items-center md:px-10 md:pt-48">
        <div>
          <SectionLabel>JOIN THE MEMBER ROOM</SectionLabel>
          <h1 className="font-display mt-5 text-6xl leading-[.88] md:text-8xl">Your club,<br /><em>closer.</em></h1>
          <p className="mt-7 max-w-md text-base leading-7 text-club-ink/70">
            Create your digital club account to book rounds, follow competitions, view your membership and keep in touch.
          </p>
        </div>
        <div className="bg-club-white p-7 shadow-[0_18px_45px_rgba(32,40,32,.08)] md:p-10">
          {registered ? (
            <div>
              <CircleCheck className="text-club-green" size={34} />
              <h2 className="font-display mt-5 text-4xl">You're on the list.</h2>
              <p className="mt-3 text-sm leading-7 text-club-ink/70">Your invitation request has been recorded. Check your inbox for the next step.</p>
              <Link href="/member/login" className="mt-7 inline-flex items-center gap-2 text-[10px] font-bold tracking-[.14em] text-club-green">
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
                <label htmlFor="register-email" className="font-mono-club text-[9px] tracking-[.14em] text-club-ink/70">EMAIL ADDRESS</label>
                <input id="register-email" type="email" required placeholder="you@example.com" className="mt-2 w-full border border-club-ink/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-club-green" />
              </div>
              <div>
                <label htmlFor="register-phone" className="font-mono-club text-[9px] tracking-[.14em] text-club-ink/70">PHONE NUMBER</label>
                <input id="register-phone" required placeholder="+263 ..." className="mt-2 w-full border border-club-ink/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-club-green" />
              </div>
              <label className="flex items-start gap-3 text-xs leading-5 text-club-ink/70">
                <input type="checkbox" required className="mt-1 accent-club-green" />
                I agree to receive club updates and understand this is a membership enquiry.
              </label>
              <button className="flex items-center justify-center gap-2 bg-club-green py-4 text-[10px] font-bold tracking-[.14em] text-club-white hover:bg-club-ink">
                REQUEST AN INVITATION <ArrowUpRight size={14} />
              </button>
              <p className="text-center text-xs text-club-ink/70">Already have an account? <Link href="/member/login" className="font-bold text-club-green">Sign in</Link></p>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
