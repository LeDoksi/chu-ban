import {
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth } from './config';
import { ALLOWED_EMAILS } from '../types';

const provider = new GoogleAuthProvider();

export function signIn(): Promise<void> {
  return signInWithRedirect(auth, provider);
}

export function signOutUser(): Promise<void> {
  return signOut(auth);
}

export function consumeRedirectResult() {
  return getRedirectResult(auth);
}

export function isEmailAllowed(email: string | null): boolean {
  return email !== null && (ALLOWED_EMAILS as readonly string[]).includes(email);
}

export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}
