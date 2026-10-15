import type { ReactNode } from 'react';
import { Redirect } from 'wouter';
import { useAuth } from '@/lib/auth';

function Loading() {
  return <div className="grid min-h-dvh place-items-center bg-club-ink font-mono-club text-[10px] tracking-[.18em] text-white/60">LOADING…</div>;
}

/** Only club staff get through. In demo mode (no backend) everyone does. */
export function RequireStaff({ children }: { children: ReactNode }) {
  const auth = useAuth();
  if (!auth.configured) return <>{children}</>;
  if (auth.loading) return <Loading />;
  if (!auth.session || !auth.isStaff) return <Redirect to="/staff-login" />;
  return <>{children}</>;
}

/** Any signed-in person gets through. In demo mode everyone does. */
export function RequireMember({ children }: { children: ReactNode }) {
  const auth = useAuth();
  if (!auth.configured) return <>{children}</>;
  if (auth.loading) return <Loading />;
  if (!auth.session) return <Redirect to="/member/login" />;
  return <>{children}</>;
}
