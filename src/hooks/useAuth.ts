import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { subscribeToAuth, consumeRedirectResult, isEmailAllowed } from '../firebase/auth';

export type AuthStatus = 'loading' | 'signedOut' | 'denied' | 'signedIn';

export interface AuthState {
  status: AuthStatus;
  user: User | null;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({ status: 'loading', user: null });

  useEffect(() => {
    consumeRedirectResult().catch(() => {
      // ignore: onAuthStateChanged still fires with the correct final state
    });
    const unsubscribe = subscribeToAuth((user) => {
      if (!user) {
        setState({ status: 'signedOut', user: null });
      } else if (!isEmailAllowed(user.email)) {
        setState({ status: 'denied', user });
      } else {
        setState({ status: 'signedIn', user });
      }
    });
    return unsubscribe;
  }, []);

  return state;
}
