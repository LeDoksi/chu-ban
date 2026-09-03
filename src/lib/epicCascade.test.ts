import { describe, it, expect } from 'vitest';
import { subtaskIdsToClose, subtaskIdsOf } from './epicCascade';
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
    createdAt: new Date(),
    completedAt: null,
    ...overrides,
  };
}

describe('subtaskIdsToClose', () => {
  it('returns ids of open subtasks belonging to the given epic', () => {
    const tasks = [
      makeTask({ id: 'a', parentEpicId: 'epic-1', status: 'open' }),
      makeTask({ id: 'b', parentEpicId: 'epic-1', status: 'done' }),
      makeTask({ id: 'c', parentEpicId: 'epic-2', status: 'open' }),
      makeTask({ id: 'd', parentEpicId: null, status: 'open' }),
    ];
    expect(subtaskIdsToClose(tasks, 'epic-1')).toEqual(['a']);
  });

  it('returns an empty array when the epic has no open subtasks', () => {
    const tasks = [makeTask({ id: 'a', parentEpicId: 'epic-1', status: 'done' })];
    expect(subtaskIdsToClose(tasks, 'epic-1')).toEqual([]);
  });
});

describe('subtaskIdsOf', () => {
  it('returns ids of all subtasks belonging to the given epic regardless of status', () => {
    const tasks = [
      makeTask({ id: 'a', parentEpicId: 'epic-1', status: 'open' }),
      makeTask({ id: 'b', parentEpicId: 'epic-1', status: 'done' }),
      makeTask({ id: 'c', parentEpicId: 'epic-2', status: 'open' }),
      makeTask({ id: 'd', parentEpicId: null, status: 'open' }),
    ];
    expect(subtaskIdsOf(tasks, 'epic-1')).toEqual(['a', 'b']);
  });
});
