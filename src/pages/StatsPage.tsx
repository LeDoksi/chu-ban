import { Sparkles, Trophy, Rocket, Crown, Target, Flame, Check } from 'lucide-react';
import type { Sphere, Task } from '../types';
import { computeStats, computeMilestones, computeDailyActivity, MILESTONE_THRESHOLDS, EPIC_MILESTONE_THRESHOLD } from '../lib/stats';

const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export function StatsPage({ tasks, spheres }: { tasks: Task[]; spheres: Sphere[] }) {
  const stats = computeStats(tasks);
  const milestones = computeMilestones(tasks);
  const dailyActivity = computeDailyActivity(tasks);
  const sphereRows = spheres
    .map((sphere) => ({ sphere, count: stats.bySphere[sphere.id] ?? 0 }))
    .filter((row) => row.count > 0);
  const maxSphereCount = Math.max(1, ...sphereRows.map((row) => row.count));
  const topSphereRow = sphereRows.reduce<{ sphere: Sphere; count: number } | null>(
    (top, row) => (!top || row.count > top.count ? row : top),
    null
  );
  const maxDailyCount = Math.max(1, ...dailyActivity.map((d) => d.count));
  const hasAllSpheres = spheres.length > 0 && spheres.every((s) => milestones.completedSphereIds.includes(s.id));

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

      <div className="flex items-center gap-3 rounded-2xl bg-blush/20 px-4 py-3">
        <Flame size={20} strokeWidth={1.75} className="shrink-0 text-blush" />
        <p className="text-sm text-ink">
          <span className="font-bold">{milestones.totalCompleted}</span> задач и эпиков выполнено за всё время
        </p>
      </div>

      <div className="space-y-2 rounded-3xl bg-surface p-4 shadow-sm">
        <p className="text-sm font-semibold text-ink">Активность за неделю</p>
        <div className="flex items-end justify-between gap-1.5 pt-2">
          {dailyActivity.map(({ date, count }) => (
            <div key={date.toISOString()} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="flex h-16 w-full items-end">
                <div
                  className={`w-full rounded-md transition-all ${count > 0 ? 'bg-sage/70' : 'bg-ink/5'}`}
                  style={{ height: `${count > 0 ? Math.max(12, (count / maxDailyCount) * 100) : 8}%` }}
                />
              </div>
              <span className="text-[10px] font-medium text-ink/40">{WEEKDAY_LABELS[(date.getDay() + 6) % 7]}</span>
            </div>
          ))}
        </div>
      </div>

      {topSphereRow && (
        <div className="flex items-center gap-2 rounded-2xl bg-surface px-4 py-3 shadow-sm">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: topSphereRow.sphere.color }} />
          <p className="text-sm text-ink/70">
            Больше всего сил в этом месяце ушло в сферу <span className="font-semibold text-ink">{topSphereRow.sphere.name}</span>
          </p>
        </div>
      )}

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

          <AchievementCard
            achieved={milestones.hasClosedEpic}
            Icon={Rocket}
            label="Первый эпик"
          />

          <AchievementCard
            achieved={milestones.closedEpicCount >= EPIC_MILESTONE_THRESHOLD}
            Icon={Crown}
            label={`${EPIC_MILESTONE_THRESHOLD} эпиков`}
            progress={Math.min(1, milestones.closedEpicCount / EPIC_MILESTONE_THRESHOLD)}
          />

          {spheres.length > 0 && (
            <AchievementCard
              achieved={hasAllSpheres}
              Icon={Target}
              label="Задача в каждой сфере"
              progress={milestones.completedSphereIds.length / spheres.length}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function AchievementCard({
  achieved,
  Icon,
  label,
  progress,
}: {
  achieved: boolean;
  Icon: typeof Trophy;
  label: string;
  progress?: number;
}) {
  return (
    <div className={`space-y-2 rounded-2xl p-4 ${achieved ? 'bg-gold/20' : 'bg-surface shadow-sm'}`}>
      <div className="flex items-center justify-between">
        <Icon size={20} strokeWidth={1.75} className={achieved ? 'text-gold' : 'text-ink/25'} />
        {achieved && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold text-white">
            <Check size={12} strokeWidth={3} />
          </span>
        )}
      </div>
      <p className={`text-sm font-semibold ${achieved ? 'text-ink' : 'text-ink/60'}`}>{label}</p>
      {!achieved && progress !== undefined && (
        <div className="h-1.5 overflow-hidden rounded-full bg-ink/5">
          <div className="h-full rounded-full bg-sage/60" style={{ width: `${progress * 100}%` }} />
        </div>
      )}
    </div>
  );
}
