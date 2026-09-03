import type { Task } from '../types';

export function subtaskIdsToClose(tasks: Task[], epicId: string): string[] {
  return tasks
    .filter((t) => t.parentEpicId === epicId && t.status === 'open')
    .map((t) => t.id);
}

export function subtaskIdsOf(tasks: Task[], epicId: string): string[] {
  return tasks.filter((t) => t.parentEpicId === epicId).map((t) => t.id);
}
