import { useEffect, useRef } from 'react';
import type { Sphere } from '../types';
import { seedDefaultSpheresIfEmpty } from '../firebase/spheres';

export function useEnsureDefaultSpheres(uid: string, spheres: Sphere[], loaded: boolean): void {
  const seeded = useRef(false);
  useEffect(() => {
    if (!loaded || seeded.current) return;
    seeded.current = true;
    if (spheres.length === 0) {
      seedDefaultSpheresIfEmpty(uid, spheres);
    }
  }, [uid, spheres, loaded]);
}
