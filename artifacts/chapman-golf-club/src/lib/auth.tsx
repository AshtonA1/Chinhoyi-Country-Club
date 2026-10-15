import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { ROLES, type RoleId } from '@/data/club';
import { supabase } from '@/lib/supabase';

export type Profile = { id: string; email: string; fullName: string; role: string };

type SignInResult = { error?: string; profile?: Profile };
type SignUpResult = { error?: string; needsConfirmation?: boolean };

export type AuthState = {
  /** False in demo mode (no Supabase settings): nobody has to sign in. */
  configured: boolean;
  loading: boolean;
  session: Session | null;
  profile: Profile | null;
  /** True for any staff role (not a plain member). In demo mode this is always true. */
  isStaff: boolean;
  /** The staff role used for permission checks; 'none' for members and signed-out visitors. */
  role: RoleId | 'none';
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<string | undefined>;
};

/** What components see when there is no provider (tests, demo mode). */
const DEMO: AuthState = {
  configured: false, loading: false, session: null, profile: null, isStaff: true, role: 'super_admin',
  signIn: async () => ({}), signUp: async () => ({}), signOut: async () => {}, resetPassword: async () => undefined,
};

const AuthContext = createContext<AuthState>(DEMO);
export const useAuth = () => useContext(AuthContext);

export function isStaffRole(role: string | undefined): role is RoleId {
  return !!role && ROLES.some((r) => r.id === role);
}

async function loadProfile(userId: string, email: string): Promise<Profile | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('profiles').select('id,email,full_name,role').eq('id', userId).maybeSingle();
  if (error || !data) return { id: userId, email, fullName: '', role: 'member' };
  return { id: data.id as string, email: (data.email as string) ?? email, fullName: (data.full_name as string) ?? '', role: (data.role as string) ?? 'member' };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(supabase !== null);

  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    const apply = async (s: Session | null) => {
      const p = s ? await loadProfile(s.user.id, s.user.email ?? '') : null;
      if (!alive) return;
      setSession(s);
      setProfile(p);
      setLoading(false);
    };
    void supabase.auth.getSession().then(({ data }) => apply(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, s) => { void apply(s); });
    return () => { alive = false; data.subscription.unsubscribe(); };
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<SignInResult> => {
    if (!supabase) return {};
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error || !data.user) return { error: error?.message === 'Invalid login credentials' ? 'That email and password do not match.' : (error?.message ?? 'Could not sign in.') };
    return { profile: (await loadProfile(data.user.id, data.user.email ?? email)) ?? undefined };
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string, phone = ''): Promise<SignUpResult> => {
    if (!supabase) return {};
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { full_name: fullName.trim(), phone: phone.trim() } } });
    if (error) return { error: error.message };
    return { needsConfirmation: !data.session };
  }, []);

  const signOut = useCallback(async () => { if (supabase) await supabase.auth.signOut(); }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (!supabase) return undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/member/login` });
    return error?.message;
  }, []);

  const value = useMemo<AuthState>(() => {
    const staff = isStaffRole(profile?.role);
    return {
      configured: supabase !== null, loading, session, profile,
      isStaff: staff, role: staff ? (profile!.role as RoleId) : 'none',
      signIn, signUp, signOut, resetPassword,
    };
  }, [loading, session, profile, signIn, signUp, signOut, resetPassword]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
