import { Check, ChevronDown, ChevronRight, Layers } from 'lucide-react';
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
  isExpanded,
  onToggleExpand,
  onToggleDone,
  onOpen,
}: {
  task: Task;
  sphere: Sphere | undefined;
  subtaskProgress?: { done: number; total: number };
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onToggleDone: () => void;
  onOpen: () => void;
}) {
  const isEpic = task.type === 'epic';
  const isOverdue = !!task.deadline && task.deadline.getTime() < Date.now() && task.status === 'open';
  const tint = sphere ? hexToRgba(sphere.color, 0.08) : undefined;
  const progressPct = subtaskProgress && subtaskProgress.total > 0 ? (subtaskProgress.done / subtaskProgress.total) * 100 : 0;

  return (
    <div
      onClick={onOpen}
      className={`cursor-pointer rounded-2xl p-4 shadow-sm ${isEpic ? 'border-l-[3px] border-sage/60' : ''}`}
      style={{ backgroundColor: tint ?? 'var(--color-surface)' }}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          {isEpic && (
            <div className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-sage">
              <Layers size={11} strokeWidth={2.5} />
              Эпик
            </div>
          )}
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
          {subtaskProgress && subtaskProgress.total > 0 && (
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/5">
              <div
                className="h-full rounded-full bg-sage/70 transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          {onToggleExpand && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand();
              }}
              aria-label={isExpanded ? 'Свернуть подзадачи' : 'Показать подзадачи'}
              className="rounded-full p-1 text-ink/40 transition hover:bg-ink/5 hover:text-ink"
            >
              {isExpanded ? <ChevronDown size={16} strokeWidth={2} /> : <ChevronRight size={16} strokeWidth={2} />}
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleDone();
            }}
            className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition active:scale-95 ${
              task.status === 'done'
                ? 'bg-sage text-white'
                : 'border border-ink/25 text-ink/60 hover:border-sage hover:text-sage'
            }`}
          >
            {task.status === 'done' && <Check size={13} strokeWidth={3} />}
            Выполнено
          </button>
        </div>
      </div>
      {isOverdue && (
        <div onClick={(e) => e.stopPropagation()}>
          <OverdueBanner onComplete={onToggleDone} onReschedule={onOpen} />
        </div>
      )}
    </div>
  );
}
