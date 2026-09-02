import type { Task, SphereId } from '../types';

export interface StatsResult {
  completedThisWeek: number;
  completedThisMonth: number;
  bySphere: Record<SphereId, number>;
}

function startOfWeek(now: Date): Date {
  const d = new Date(now);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // Monday as start of week
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + diff);
  return d;
}

function startOfMonth(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export function computeStats(tasks: Task[], now: Date = new Date()): StatsResult {
  const weekStart = startOfWeek(now);
  const monthStart = startOfMonth(now);
  const bySphere: Record<SphereId, number> = {};
  let completedThisWeek = 0;
  let completedThisMonth = 0;

  for (const task of tasks) {
    if (!task.completedAt) continue;
    if (task.completedAt >= monthStart) {
      completedThisMonth += 1;
      bySphere[task.sphereId] = (bySphere[task.sphereId] ?? 0) + 1;
    }
    if (task.completedAt >= weekStart) {
      completedThisWeek += 1;
    }
  }

  return { completedThisWeek, completedThisMonth, bySphere };
}

export const MILESTONE_THRESHOLDS = [10, 50, 100, 250] as const;

export interface Milestones {
  totalCompleted: number;
  reachedThresholds: number[];
  hasClosedEpic: boolean;
}

export function computeMilestones(tasks: Task[]): Milestones {
  const completed = tasks.filter((t) => t.status === 'done');
  const totalCompleted = completed.length;
  const reachedThresholds = MILESTONE_THRESHOLDS.filter((t) => totalCompleted >= t);
  const hasClosedEpic = completed.some((t) => t.type === 'epic');
  return { totalCompleted, reachedThresholds, hasClosedEpic };
}
