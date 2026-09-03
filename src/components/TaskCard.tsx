import { Check } from 'lucide-react';
import type { Sphere, Task } from '../types';
import { SphereBadge } from './SphereBadge';
import { OverdueBanner } from './OverdueBanner';

function formatDeadline(deadline: Date): string {
  return deadline.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function TaskCard({
  task,
  sphere,
  subtaskProgress,
  onToggleDone,
  onOpen,
}: {
  task: Task;
  sphere: Sphere | undefined;
  subtaskProgress?: { done: number; total: number };
  onToggleDone: () => void;
  onOpen: () => void;
}) {
  const isOverdue = !!task.deadline && task.deadline.getTime() < Date.now() && task.status === 'open';
  const tint = sphere ? hexToRgba(sphere.color, 0.06) : undefined;

  return (
    <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: tint ?? '#fffdfa' }}>
      <div className="flex items-start gap-3">
        <button
          onClick={onToggleDone}
          aria-label={task.status === 'done' ? 'Снять отметку выполнено' : 'Отметить выполненным'}
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
            task.status === 'done' ? 'border-sage bg-sage text-white' : 'border-ink/30'
          }`}
        >
          {task.status === 'done' && <Check size={14} strokeWidth={3} />}
        </button>
        <div className="flex-1 cursor-pointer" onClick={onOpen}>
          <p className={`font-medium text-ink ${task.status === 'done' ? 'line-through opacity-50' : ''}`}>
            {task.title}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <SphereBadge sphere={sphere} />
            {task.deadline && (
              <span className="text-xs text-ink/50">до {formatDeadline(task.deadline)}</span>
            )}
            {subtaskProgress && (
              <span className="text-xs text-ink/50">
                {subtaskProgress.done} из {subtaskProgress.total}
              </span>
            )}
          </div>
        </div>
      </div>
      {isOverdue && <OverdueBanner onComplete={onToggleDone} onReschedule={onOpen} />}
    </div>
  );
}
