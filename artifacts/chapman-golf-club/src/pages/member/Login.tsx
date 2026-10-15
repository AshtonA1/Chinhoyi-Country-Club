import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowUpRight, CircleCheck, LockKeyhole } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { SectionLabel } from '@/components/layout/Shared';
import { useAuth } from '@/lib/auth';

export default function MemberLogin() {
  const [submitted, setSubmitted] = useState(false);
  const [resetRequested, setResetRequested] = useState(false);
  const auth = useAuth();
  const [, navigate] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!auth.configured) { setSubmitted(true); return; }
    setBusy(true);
    setError('');
    const result = await auth.signIn(email, password);
    setBusy(false);
    if (result.error) return setError(result.error);
    navigate('/member/dashboard');
  }

  async function onForgot() {
    if (!auth.configured) { setResetRequested(true); return; }
    if (!email.includes('@')) return setError('Enter your email address above first, then press Forgot password.');
    setError('');
    const problem = await auth.resetPassword(email);
    if (problem) return setError(problem);
    setResetRequested(true);
  }
  return (
    <div className="min-h-dvh bg-club-ink text-club-white">
      <Header />
      <main className="mx-auto grid max-w-[1200px] gap-14 px-5 pb-24 pt-36 md:grid-cols-2 md:items-center md:px-10 md:pt-48">
        <div>
          <SectionLabel light>THE MEMBER'S ROOM</SectionLabel>
          <h1 className="font-display mt-5 text-6xl leading-[.88] md:text-8xl">Welcome<br /><em>back.</em></h1>
          <p className="mt-7 max-w-sm text-base leading-7 text-white/65">Your tee sheet, club calendar and the people who make the club feel like home.</p>
        </div>
        <div className="bg-club-white p-7 text-club-ink md:p-10">
          {submitted ? (
            <div className="py-5">
              <CircleCheck className="text-club-green" size={34} />
              <h2 className="font-display mt-5 text-4xl">Check your inbox.</h2>
              <p className="mt-3 text-sm leading-7 text-club-ink/70">We've sent a secure sign-in link to your email address.</p>
              <Link href="/member/dashboard" className="mt-7 inline-flex items-center gap-2 text-[10px] font-bold tracking-[.14em] text-club-green" data-testid="link-login-dashboard">
                OPEN MEMBER ROOM <ArrowUpRight size={14} />
              </Link>
            </div>
          ) : (
            <form onSubmit={(e) => void onSubmit(e)} className="grid gap-5">
              <div>
                <label htmlFor="login-email" className="font-mono-club text-[9px] tracking-[.15em] text-club-ink/70">MEMBER EMAIL</label>
                <input id="login-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mt-2 w-full border border-club-ink/20 bg-transparent px-4 py-4 text-sm outline-none placeholder:text-club-ink/50 focus:border-club-green" data-testid="input-login-email" />
              </div>
              <div>
                <label htmlFor="login-password" className="font-mono-club text-[9px] tracking-[.15em] text-club-ink/70">PASSWORD</label>
                <input id="login-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" className="mt-2 w-full border border-club-ink/20 bg-transparent px-4 py-4 text-sm outline-none placeholder:text-club-ink/50 focus:border-club-green" data-testid="input-login-password" />
              </div>
              <button type="submit" disabled={busy} className="mt-2 flex items-center justify-center gap-2 bg-club-green py-4 disabled:opacity-60 text-[10px] font-bold tracking-[.15em] text-club-white hover:bg-club-ink" data-testid="button-login-submit">
                {busy ? 'SIGNING IN…' : 'SIGN IN'} <ArrowUpRight size={14} />
              </button>
              <div className="flex items-center justify-between text-[10px] text-club-ink/70">
                <button type="button" onClick={() => void onForgot()} className="hover:text-club-green" data-testid="button-forgot-password">FORGOT PASSWORD?</button>
                <span className="flex items-center gap-1"><LockKeyhole size={12} /> SECURE MEMBER ACCESS</span>
              </div>
              {error && <p role="alert" className="text-xs text-club-alert" data-testid="login-error">{error}</p>}
              {resetRequested && (
                <p className="flex items-center gap-2 text-xs text-club-green">
                  <CircleCheck size={14} /> If that email is on file, a reset link is on its way.
                </p>
              )}
              <p className="border-t border-club-ink/10 pt-5 text-center text-[10px] text-club-ink/70">
                NEW TO THE CLUB? <Link href="/member/register" className="font-bold tracking-[.1em] text-club-green" data-testid="link-login-register">CREATE ACCOUNT</Link>
              </p>
            </form>
          )}
        </div>
      </main>
      <div className="mx-auto max-w-[1200px] border-t border-white/15 px-5 py-6 text-center font-mono-club text-[9px] tracking-[.12em] text-white/35 md:px-10">
        NEED AN ACCOUNT? <Link href="/contact" className="text-club-gold" data-testid="link-login-contact">CONTACT THE CLUB</Link>
        {' · '}CLUB STAFF? <Link href="/staff-login" className="text-club-gold" data-testid="link-login-staff">STAFF LOGIN</Link>
      </div>
    </div>
  );
}
