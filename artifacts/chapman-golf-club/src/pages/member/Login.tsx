import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowUpRight, CircleCheck, LockKeyhole } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { SectionLabel } from '@/components/layout/Shared';

export default function MemberLogin() {
  const [submitted, setSubmitted] = useState(false);
  const [resetRequested, setResetRequested] = useState(false);
  return (
    <div className="min-h-dvh bg-[#12372A] text-[#F7F5EF]">
      <Header />
      <main className="mx-auto grid max-w-[1200px] gap-14 px-5 pb-24 pt-36 md:grid-cols-2 md:items-center md:px-10 md:pt-48">
        <div>
          <SectionLabel light>THE MEMBER'S ROOM</SectionLabel>
          <h1 className="font-display mt-5 text-6xl leading-[.88] md:text-8xl">Welcome<br /><em>back.</em></h1>
          <p className="mt-7 max-w-sm text-base leading-7 text-white/65">Your tee sheet, club calendar and the people who make the club feel like home.</p>
        </div>
        <div className="bg-[#F7F5EF] p-7 text-[#12372A] md:p-10">
          {submitted ? (
            <div className="py-5">
              <CircleCheck className="text-[#2E6B4E]" size={34} />
              <h2 className="font-display mt-5 text-4xl">Check your inbox.</h2>
              <p className="mt-3 text-sm leading-7 text-[#5d6b63]">We've sent a secure sign-in link to your email address.</p>
              <Link href="/member/dashboard" className="mt-7 inline-flex items-center gap-2 text-[10px] font-bold tracking-[.14em] text-[#2E6B4E]" data-testid="link-login-dashboard">
                OPEN MEMBER ROOM <ArrowUpRight size={14} />
              </Link>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="grid gap-5">
              <div>
                <label htmlFor="login-email" className="font-mono-club text-[9px] tracking-[.15em] text-[#5d6b63]">MEMBER EMAIL</label>
                <input id="login-email" type="email" required placeholder="you@example.com" className="mt-2 w-full border border-[#cfd4cd] bg-transparent px-4 py-4 text-sm outline-none placeholder:text-[#9aa29b] focus:border-[#2E6B4E]" data-testid="input-login-email" />
              </div>
              <div>
                <label htmlFor="login-password" className="font-mono-club text-[9px] tracking-[.15em] text-[#5d6b63]">PASSWORD</label>
                <input id="login-password" type="password" required placeholder="Your password" className="mt-2 w-full border border-[#cfd4cd] bg-transparent px-4 py-4 text-sm outline-none placeholder:text-[#9aa29b] focus:border-[#2E6B4E]" data-testid="input-login-password" />
              </div>
              <button type="submit" className="mt-2 flex items-center justify-center gap-2 bg-[#12372A] py-4 text-[10px] font-bold tracking-[.15em] text-[#F7F5EF] hover:bg-[#2E6B4E]" data-testid="button-login-submit">
                SIGN IN <ArrowUpRight size={14} />
              </button>
              <div className="flex items-center justify-between text-[10px] text-[#5d6b63]">
                <button type="button" onClick={() => setResetRequested(true)} className="hover:text-[#2E6B4E]" data-testid="button-forgot-password">FORGOT PASSWORD?</button>
                <span className="flex items-center gap-1"><LockKeyhole size={12} /> SECURE MEMBER ACCESS</span>
              </div>
              {resetRequested && (
                <p className="flex items-center gap-2 text-xs text-[#2E6B4E]">
                  <CircleCheck size={14} /> If that email is on file, a reset link is on its way.
                </p>
              )}
              <p className="border-t border-[#12372A]/10 pt-5 text-center text-[10px] text-[#5d6b63]">
                NEW TO THE CLUB? <Link href="/member/register" className="font-bold tracking-[.1em] text-[#2E6B4E]" data-testid="link-login-register">CREATE ACCOUNT</Link>
              </p>
            </form>
          )}
        </div>
      </main>
      <div className="mx-auto max-w-[1200px] border-t border-white/15 px-5 py-6 text-center font-mono-club text-[9px] tracking-[.12em] text-white/35 md:px-10">
        NEED AN ACCOUNT? <Link href="/contact" className="text-[#C8A951]" data-testid="link-login-contact">CONTACT THE CLUB</Link>
      </div>
    </div>
  );
}
