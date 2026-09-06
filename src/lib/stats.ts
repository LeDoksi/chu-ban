import type { Task, SphereId } from '../types';
import { isSameDay } from './calendarGrid';

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

export interface DayActivity {
  date: Date;
  count: number;
}

export function computeDailyActivity(tasks: Task[], now: Date = new Date(), days = 7): DayActivity[] {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  const buckets: DayActivity[] = Array.from({ length: days }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return { date: d, count: 0 };
  });
  for (const task of tasks) {
    if (!task.completedAt) continue;
    const bucket = buckets.find((b) => isSameDay(b.date, task.completedAt!));
    if (bucket) bucket.count += 1;
  }
  return buckets;
}

export const MILESTONE_THRESHOLDS = [10, 50, 100, 250] as const;
export const EPIC_MILESTONE_THRESHOLD = 5;

export interface Milestones {
  totalCompleted: number;
  reachedThresholds: number[];
  hasClosedEpic: boolean;
  closedEpicCount: number;
  completedSphereIds: SphereId[];
}

export function computeMilestones(tasks: Task[]): Milestones {
  // ponytail: subtasks don't count toward milestones, only standalone tasks and epics
  const completed = tasks.filter((t) => t.status === 'done' && !t.parentEpicId);
  const totalCompleted = completed.length;
  const reachedThresholds = MILESTONE_THRESHOLDS.filter((t) => totalCompleted >= t);
  const closedEpicCount = completed.filter((t) => t.type === 'epic').length;
  const completedSphereIds = [...new Set(completed.map((t) => t.sphereId))];
  return {
    totalCompleted,
    reachedThresholds,
    hasClosedEpic: closedEpicCount > 0,
    closedEpicCount,
    completedSphereIds,
  };
}
