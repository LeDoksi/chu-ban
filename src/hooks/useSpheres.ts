import { useEffect, useState } from 'react';
import type { Sphere } from '../types';
import {
  subscribeSpheres,
  addSphere as addSphereFn,
  updateSphere as updateSphereFn,
  deleteSphere as deleteSphereFn,
} from '../firebase/spheres';

export function useSpheres(uid: string) {
  const [spheres, setSpheres] = useState<Sphere[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeSpheres(uid, (data) => {
      setSpheres(data);
      setLoaded(true);
    });
    return unsubscribe;
  }, [uid]);

  return {
    spheres,
    loaded,
    addSphere: (name: string, color: string) => addSphereFn(uid, name, color, spheres.length),
    updateSphere: (sphereId: string, changes: Partial<Pick<Sphere, 'name' | 'color' | 'order'>>) =>
      updateSphereFn(uid, sphereId, changes),
    deleteSphere: (sphereId: string) => deleteSphereFn(uid, sphereId),
  };
}
