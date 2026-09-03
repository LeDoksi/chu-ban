import { useEffect, useRef } from 'react';
import type { Sphere } from '../types';
import { seedDefaultSpheresIfEmpty } from '../firebase/spheres';

export function useEnsureDefaultSpheres(uid: string, spheres: Sphere[], loaded: boolean): void {
  const seeded = useRef(false);
  useEffect(() => {
    if (!loaded || seeded.current) return;
    if (spheres.length === 0) {
      seeded.current = true;
      seedDefaultSpheresIfEmpty(uid, spheres).catch((err) => {
        console.error('Не удалось создать сферы по умолчанию:', err);
        seeded.current = false;
      });
    } else {
      seeded.current = true;
    }
  }, [uid, spheres, loaded]);
}
