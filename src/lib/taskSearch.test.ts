import { describe, it, expect } from 'vitest';
import { matchesSearch } from './taskSearch';
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

describe('matchesSearch', () => {
  it('matches everything for an empty or blank query', () => {
    expect(matchesSearch(makeTask({}), '')).toBe(true);
    expect(matchesSearch(makeTask({}), '   ')).toBe(true);
  });

  it('matches the title case-insensitively', () => {
    expect(matchesSearch(makeTask({ title: 'Купить Молоко' }), 'молоко')).toBe(true);
    expect(matchesSearch(makeTask({ title: 'Купить молоко' }), 'хлеб')).toBe(false);
  });

  it('matches the description', () => {
    expect(matchesSearch(makeTask({ title: 'Магазин', description: 'взять молоко' }), 'молоко')).toBe(true);
  });

  it('treats ё and е as the same letter', () => {
    expect(matchesSearch(makeTask({ title: 'Ёлка' }), 'елка')).toBe(true);
    expect(matchesSearch(makeTask({ title: 'Елка' }), 'ёлка')).toBe(true);
  });

  it('requires every word of the query to match somewhere', () => {
    const task = makeTask({ title: 'Купить молоко', description: 'в Пятёрочке' });
    expect(matchesSearch(task, 'молоко пятерочке')).toBe(true);
    expect(matchesSearch(task, 'молоко хлеб')).toBe(false);
  });
});
