import type { Session } from "../features/auth/types";

const SESSION_KEY = "qulture.session";

// localStorage can be unavailable (private mode, blocked storage); the app must keep working without it.
export function readStoredSession(): Session | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function writeStoredSession(session: Session | null): void {
  try {
    if (session) {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      window.localStorage.removeItem(SESSION_KEY);
    }
  } catch {
    // Ignore storage failures: the session simply will not survive a reload.
  }
}
