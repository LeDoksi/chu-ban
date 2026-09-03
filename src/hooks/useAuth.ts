import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { subscribeToAuth, consumeRedirectResult, isEmailAllowed } from '../firebase/auth';

export type AuthStatus = 'loading' | 'signedOut' | 'denied' | 'signedIn';

export interface AuthState {
  status: AuthStatus;
  user: User | null;
  error: string | null;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({ status: 'loading', user: null, error: null });

  useEffect(() => {
    consumeRedirectResult().catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      setState((prev) => ({ ...prev, error: message }));
    });
    const unsubscribe = subscribeToAuth((user) => {
      if (!user) {
        setState((prev) => ({ status: 'signedOut', user: null, error: prev.error }));
      } else if (!isEmailAllowed(user.email)) {
        setState({ status: 'denied', user, error: null });
      } else {
        setState({ status: 'signedIn', user, error: null });
      }
    });
    return unsubscribe;
  }, []);

  return state;
}
