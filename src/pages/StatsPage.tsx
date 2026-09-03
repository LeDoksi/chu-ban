import { Sparkles, Trophy, Rocket, Check } from 'lucide-react';
import type { Sphere, Task } from '../types';
import { computeStats, computeMilestones, MILESTONE_THRESHOLDS } from '../lib/stats';

export function StatsPage({ tasks, spheres }: { tasks: Task[]; spheres: Sphere[] }) {
  const stats = computeStats(tasks);
  const milestones = computeMilestones(tasks);
  const sphereRows = spheres
    .map((sphere) => ({ sphere, count: stats.bySphere[sphere.id] ?? 0 }))
    .filter((row) => row.count > 0);
  const maxSphereCount = Math.max(1, ...sphereRows.map((row) => row.count));

  return (
    <div className="space-y-6">
      {stats.completedThisMonth === 0 && milestones.totalCompleted === 0 && (
        <p className="text-center text-sm text-ink/40">
          Здесь появятся твои победы, как только закроешь первую задачу 🌿
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-3xl bg-sage/15 p-5 text-center">
          <Sparkles size={22} strokeWidth={1.75} className="mx-auto mb-2 text-sage" />
          <p className="text-4xl font-bold text-sage">{stats.completedThisWeek}</p>
          <p className="mt-1 text-xs font-medium text-ink/50">выполнено за неделю</p>
        </div>
        <div className="rounded-3xl bg-gold/20 p-5 text-center">
          <Trophy size={22} strokeWidth={1.75} className="mx-auto mb-2 text-gold" />
          <p className="text-4xl font-bold text-ink">{stats.completedThisMonth}</p>
          <p className="mt-1 text-xs font-medium text-ink/50">выполнено за месяц</p>
        </div>
      </div>

      {sphereRows.length > 0 && (
        <div className="space-y-3 rounded-3xl bg-surface p-4 shadow-sm">
          <p className="text-sm font-semibold text-ink">По сферам в этом месяце</p>
          <div className="space-y-2.5">
            {sphereRows.map(({ sphere, count }) => (
              <div key={sphere.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium text-ink/60">
                  <span>{sphere.name}</span>
                  <span>{count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-ink/5">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(count / maxSphereCount) * 100}%`, backgroundColor: sphere.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <p className="text-sm font-semibold text-ink">Достижения</p>
        <div className="grid grid-cols-2 gap-3">
          {MILESTONE_THRESHOLDS.map((threshold) => {
            const achieved = milestones.reachedThresholds.includes(threshold);
            const progress = Math.min(1, milestones.totalCompleted / threshold);
            return (
              <div
                key={threshold}
                className={`space-y-2 rounded-2xl p-4 ${achieved ? 'bg-gold/20' : 'bg-surface shadow-sm'}`}
              >
                <div className="flex items-center justify-between">
                  <Trophy size={20} strokeWidth={1.75} className={achieved ? 'text-gold' : 'text-ink/25'} />
                  {achieved && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold text-white">
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                </div>
                <p className={`text-sm font-semibold ${achieved ? 'text-ink' : 'text-ink/60'}`}>{threshold} задач</p>
                {!achieved && (
                  <div className="h-1.5 overflow-hidden rounded-full bg-ink/5">
                    <div className="h-full rounded-full bg-sage/60" style={{ width: `${progress * 100}%` }} />
                  </div>
                )}
              </div>
            );
          })}

          <div
            className={`space-y-2 rounded-2xl p-4 ${milestones.hasClosedEpic ? 'bg-gold/20' : 'bg-surface shadow-sm'}`}
          >
            <div className="flex items-center justify-between">
              <Rocket size={20} strokeWidth={1.75} className={milestones.hasClosedEpic ? 'text-gold' : 'text-ink/25'} />
              {milestones.hasClosedEpic && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold text-white">
                  <Check size={12} strokeWidth={3} />
                </span>
              )}
            </div>
            <p className={`text-sm font-semibold ${milestones.hasClosedEpic ? 'text-ink' : 'text-ink/60'}`}>
              Первый эпик
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
