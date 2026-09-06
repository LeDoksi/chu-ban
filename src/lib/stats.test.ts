import { describe, it, expect } from 'vitest';
import { computeStats, computeMilestones, MILESTONE_THRESHOLDS } from './stats';
import type { Task } from '../types';

function makeTask(overrides: Partial<Task>): Task {
  return {
    id: 'id',
    type: 'task',
    sphereId: 'sphere-1',
    title: 'title',
    description: null,
    deadline: null,
    status: 'open',
    parentEpicId: null,
    createdAt: new Date('2026-08-01T00:00:00Z'),
    completedAt: null,
    ...overrides,
  };
}

describe('computeStats', () => {
  it('counts tasks completed within the current week and month', () => {
    const now = new Date('2026-09-10T12:00:00Z'); // Thursday
    const tasks = [
      makeTask({ id: 'a', sphereId: 's1', completedAt: new Date('2026-09-09T00:00:00Z') }), // this week
      makeTask({ id: 'b', sphereId: 's2', completedAt: new Date('2026-09-02T00:00:00Z') }), // this month, not this week
      makeTask({ id: 'c', sphereId: 's1', completedAt: new Date('2026-08-01T00:00:00Z') }), // neither
      makeTask({ id: 'd', sphereId: 's1', completedAt: null }), // not completed
    ];
    const result = computeStats(tasks, now);
    expect(result.completedThisWeek).toBe(1);
    expect(result.completedThisMonth).toBe(2);
    expect(result.bySphere).toEqual({ s1: 1, s2: 1 });
  });
});

describe('computeMilestones', () => {
  it('reports reached thresholds and whether an epic was closed', () => {
    const tasks = [
      ...Array.from({ length: 10 }, (_, i) => makeTask({ id: `t${i}`, status: 'done' })),
      makeTask({ id: 'epic-1', type: 'epic', status: 'done' }),
      makeTask({ id: 'open-1', status: 'open' }),
    ];
    const result = computeMilestones(tasks);
    expect(result.totalCompleted).toBe(11);
    expect(result.reachedThresholds).toEqual([10]);
    expect(result.hasClosedEpic).toBe(true);
  });

  it('excludes subtasks from the completed count', () => {
    const tasks = [
      makeTask({ id: 'epic-1', type: 'epic', status: 'done' }),
      makeTask({ id: 'sub-1', parentEpicId: 'epic-1', status: 'done' }),
      makeTask({ id: 'sub-2', parentEpicId: 'epic-1', status: 'done' }),
    ];
    const result = computeMilestones(tasks);
    expect(result.totalCompleted).toBe(1);
  });

  it('reports no reached thresholds when nothing is completed', () => {
    const result = computeMilestones([]);
    expect(result.totalCompleted).toBe(0);
    expect(result.reachedThresholds).toEqual([]);
    expect(result.hasClosedEpic).toBe(false);
  });

  it('exposes the threshold list used by the UI', () => {
    expect(MILESTONE_THRESHOLDS).toEqual([10, 50, 100, 250]);
  });
});
