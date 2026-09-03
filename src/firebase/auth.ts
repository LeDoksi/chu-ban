import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth } from './config';
import { ALLOWED_EMAILS } from '../types';

const provider = new GoogleAuthProvider();

export function signIn(): Promise<void> {
  // signInWithRedirect silently fails to complete on Chrome/Safari when the
  // app's hosting domain (github.io) differs from the Firebase authDomain
  // (firebaseapp.com) — third-party storage restrictions block the
  // cross-origin handoff. signInWithPopup avoids that channel entirely.
  return signInWithPopup(auth, provider).then(() => undefined);
}

export function signOutUser(): Promise<void> {
  return signOut(auth);
}

export function isEmailAllowed(email: string | null): boolean {
  return email !== null && (ALLOWED_EMAILS as readonly string[]).includes(email);
}

export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}
