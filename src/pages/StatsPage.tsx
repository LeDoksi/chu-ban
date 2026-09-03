import type { Sphere, Task } from '../types';
import { computeStats, computeMilestones, MILESTONE_THRESHOLDS } from '../lib/stats';

export function StatsPage({ tasks, spheres }: { tasks: Task[]; spheres: Sphere[] }) {
  const stats = computeStats(tasks);
  const milestones = computeMilestones(tasks);
  const sphereById = new Map(spheres.map((s) => [s.id, s]));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
          <p className="text-3xl font-semibold text-sage">{stats.completedThisWeek}</p>
          <p className="text-xs text-ink/50">выполнено за неделю</p>
        </div>
        <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
          <p className="text-3xl font-semibold text-sage">{stats.completedThisMonth}</p>
          <p className="text-xs text-ink/50">выполнено за месяц</p>
        </div>
      </div>

      {Object.keys(stats.bySphere).length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-ink/70">По сферам в этом месяце</p>
          {Object.entries(stats.bySphere).map(([sphereId, count]) => (
            <div key={sphereId} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm shadow-sm">
              <span className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: sphereById.get(sphereId)?.color ?? '#ccc' }}
                />
                {sphereById.get(sphereId)?.name ?? 'Сфера'}
              </span>
              <span className="text-ink/60">{count}</span>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <p className="text-sm font-medium text-ink/70">Достижения</p>
        <div className="flex flex-wrap gap-2">
          {MILESTONE_THRESHOLDS.map((threshold) => (
            <span
              key={threshold}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                milestones.reachedThresholds.includes(threshold) ? 'bg-gold/30 text-ink' : 'bg-ink/5 text-ink/30'
              }`}
            >
              {threshold} задач
            </span>
          ))}
          <span
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              milestones.hasClosedEpic ? 'bg-gold/30 text-ink' : 'bg-ink/5 text-ink/30'
            }`}
          >
            Первый эпик
          </span>
        </div>
      </div>
    </div>
  );
}
