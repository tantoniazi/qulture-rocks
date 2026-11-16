import { useCallback, useMemo, useState, type ReactNode } from "react";
import { readStoredSession, writeStoredSession } from "../../lib/storage";
import { AuthContext, type AuthContextValue } from "./AuthContext";
import * as authService from "./authService";
import type { Session, SignupInput } from "./types";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => readStoredSession());

  const persist = useCallback((next: Session | null) => {
    writeStoredSession(next);
    setSession(next);
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => persist(await authService.login(email, password)),
    [persist],
  );

  const signUp = useCallback(
    async (input: SignupInput) => persist(await authService.signup(input)),
    [persist],
  );

  const signOut = useCallback(async () => {
    const current = readStoredSession();
    if (current) {
      try {
        await authService.logout(current.token);
      } catch {
        // The token may already be revoked or expired; clearing local state is still correct.
      }
    }
    persist(null);
  }, [persist]);

  const value = useMemo<AuthContextValue>(
    () => ({ session, signIn, signUp, signOut }),
    [session, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
