import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { DEMO_MODE } from '@/lib/config';

// Local, backend-free session used for guest entry (and demo mode).
const GUEST_SESSION = { user: { id: 'guest' } } as unknown as Session;

type AuthValue = {
  session: Session | null;
  loading: boolean;
  /** True when the session is a local guest (no server-side account exists). */
  isGuest: boolean;
  /** Send a one-time login code to the email (creates the account if new). */
  sendCode: (email: string) => Promise<void>;
  /** Verify the 6-digit code the user typed; on success a session is created. */
  verifyCode: (email: string, code: string) => Promise<void>;
  signInGuest: () => void;
  signOut: () => Promise<void>;
  /** Permanently delete the signed-in user's account (App Store 5.1.1 requirement). */
  deleteAccount: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (DEMO_MODE) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s) setIsGuest(false);
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Passwordless: one flow serves both sign-in and sign-up. signInWithOtp
  // emails a 6-digit code (and creates the account if it doesn't exist yet).
  const sendCode = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: true },
    });
    if (error) throw error;
  };

  const verifyCode = async (email: string, code: string) => {
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: code.trim(),
      type: 'email',
    });
    if (error) throw error;
    // onAuthStateChange picks up the new session and persists it via AsyncStorage.
  };

  const signInGuest = () => {
    setIsGuest(true);
    setSession(GUEST_SESSION);
  };

  const signOut = async () => {
    setIsGuest(false);
    setSession(null);
    if (!DEMO_MODE) await supabase.auth.signOut({ scope: 'local' }).catch(() => undefined);
  };

  // Guests have no server-side account — deletion is just a local sign-out.
  // Real users are deleted server-side by the `delete-account` Edge Function,
  // which resolves the target strictly from the caller's own JWT.
  const deleteAccount = async () => {
    if (!isGuest && !DEMO_MODE) {
      const { error } = await supabase.functions.invoke('delete-account', { method: 'POST' });
      if (error) throw error;
    }
    await signOut();
  };

  return (
    <AuthContext.Provider
      value={{ session, loading, isGuest, sendCode, verifyCode, signInGuest, signOut, deleteAccount }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
