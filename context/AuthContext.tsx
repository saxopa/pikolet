import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, getProfile } from "../lib/supabase";
import type { Profile } from "../types";

type AuthCtx = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAuthenticated: boolean;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthCtx>({
  session: null, user: null, profile: null,
  loading: true, isAuthenticated: false,
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    const { data } = await getProfile(userId);
    setProfile(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) loadProfile(data.session.user.id);
      else setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) loadProfile(s.user.id);
      else { setProfile(null); setLoading(false); }
    });
    return () => listener.subscription.unsubscribe();
  }, [loadProfile]);

  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user.id);
  }, [user, loadProfile]);

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, isAuthenticated: !!session, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
