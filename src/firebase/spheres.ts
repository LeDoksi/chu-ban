import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  orderBy,
  query,
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';
import type { Sphere } from '../types';
import { DEFAULT_SPHERES } from '../types';

function spheresCol(uid: string) {
  return collection(db, 'users', uid, 'spheres');
}

export function subscribeSpheres(uid: string, callback: (spheres: Sphere[]) => void): () => void {
  const q = query(spheresCol(uid), orderBy('order'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Sphere, 'id'>) })));
  });
}

export async function addSphere(uid: string, name: string, color: string, order: number): Promise<void> {
  await addDoc(spheresCol(uid), { name, color, order });
}

export async function updateSphere(
  uid: string,
  sphereId: string,
  changes: Partial<Pick<Sphere, 'name' | 'color' | 'order'>>
): Promise<void> {
  await updateDoc(doc(db, 'users', uid, 'spheres', sphereId), changes);
}

export async function deleteSphere(uid: string, sphereId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'spheres', sphereId));
}

export async function seedDefaultSpheresIfEmpty(uid: string, existing: Sphere[]): Promise<void> {
  if (existing.length > 0) return;
  const batch = writeBatch(db);
  DEFAULT_SPHERES.forEach((sphere, index) => {
    const ref = doc(spheresCol(uid));
    batch.set(ref, { name: sphere.name, color: sphere.color, order: index });
  });
  await batch.commit();
}
