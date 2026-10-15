import { useState } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/lib/auth';
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
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!auth.configured) { setRegistered(true); return; }
    if (password.length < 8) return setError('Choose a password of at least 8 characters.');
    setBusy(true);
    setError('');
    const result = await auth.signUp(email, password, `${firstName} ${lastName}`.trim(), phone);
    setBusy(false);
    if (result.error) return setError(result.error);
    setNeedsConfirmation(Boolean(result.needsConfirmation));
    setRegistered(true);
  }

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
              <h2 className="font-display mt-5 text-4xl">{auth.configured ? 'Account created.' : "You're on the list."}</h2>
              <p className="mt-3 text-sm leading-7 text-club-ink/70">
                {!auth.configured
                  ? 'Your invitation request has been recorded. Check your inbox for the next step.'
                  : needsConfirmation
                    ? 'We have sent a confirmation link to your email address. Open it, then sign in.'
                    : 'You can sign in now.'}
              </p>
              <Link href={auth.configured && !needsConfirmation ? '/member/dashboard' : '/member/login'} className="mt-7 inline-flex items-center gap-2 text-[10px] font-bold tracking-[.14em] text-club-green">
                GO TO MEMBER LOGIN <ArrowUpRight size={14} />
              </Link>
            </div>
          ) : (
            <form onSubmit={(e) => void onSubmit(e)} className="grid gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <RegField label="FIRST NAME" value={firstName} onChange={setFirstName} />
                <RegField label="LAST NAME" value={lastName} onChange={setLastName} />
              </div>
              <div>
                <label htmlFor="register-email" className="font-mono-club text-[9px] tracking-[.14em] text-club-ink/70">EMAIL ADDRESS</label>
                <input id="register-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mt-2 w-full border border-club-ink/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-club-green" />
              </div>
              <div>
                <label htmlFor="register-phone" className="font-mono-club text-[9px] tracking-[.14em] text-club-ink/70">PHONE NUMBER</label>
                <input id="register-phone" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+263 ..." className="mt-2 w-full border border-club-ink/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-club-green" />
              </div>
              {auth.configured && (
                <div>
                  <label htmlFor="register-password" className="font-mono-club text-[9px] tracking-[.14em] text-club-ink/70">PASSWORD (8+ CHARACTERS)</label>
                  <input id="register-password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" className="mt-2 w-full border border-club-ink/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-club-green" />
                </div>
              )}
              <label className="flex items-start gap-3 text-xs leading-5 text-club-ink/70">
                <input type="checkbox" required className="mt-1 accent-club-green" />
                I agree to receive club updates and understand this is a membership enquiry.
              </label>
              {error && <p role="alert" className="text-xs text-club-alert">{error}</p>}
              <button disabled={busy} className="flex items-center justify-center gap-2 bg-club-green py-4 text-[10px] font-bold tracking-[.14em] text-club-white hover:bg-club-ink disabled:opacity-60">
                {auth.configured ? (busy ? 'CREATING…' : 'CREATE ACCOUNT') : 'REQUEST AN INVITATION'} <ArrowUpRight size={14} />
              </button>
              <p className="text-center text-xs text-club-ink/70">Already have an account? <Link href="/member/login" className="font-bold text-club-green">Sign in</Link></p>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
