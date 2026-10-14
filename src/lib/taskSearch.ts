import type { Task } from '../types';

function normalize(text: string): string {
  return text.toLowerCase().replace(/ё/g, 'е');
}

// Every word of the query has to appear in the title or description, so
// "молоко магазин" narrows the list instead of widening it.
export function matchesSearch(task: Task, query: string): boolean {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const haystack = normalize(`${task.title} ${task.description ?? ''}`);
  return words.every((word) => haystack.includes(word));
}
