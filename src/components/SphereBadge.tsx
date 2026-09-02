import type { Sphere } from '../types';

export function SphereBadge({ sphere }: { sphere: Sphere | undefined }) {
  if (!sphere) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/60 px-2.5 py-1 text-xs font-medium text-ink/70">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: sphere.color }} />
      {sphere.name}
    </span>
  );
}
