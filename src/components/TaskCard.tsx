import { useState } from 'react';
import { Check, Pencil, ChevronDown, ChevronRight } from 'lucide-react';
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
  onEdit,
}: {
  task: Task;
  sphere: Sphere | undefined;
  subtaskProgress?: { done: number; total: number };
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onToggleDone: () => void;
  onEdit: () => void;
}) {
  const [showDescription, setShowDescription] = useState(false);
  const isOverdue = !!task.deadline && task.deadline.getTime() < Date.now() && task.status === 'open';
  const tint = sphere ? hexToRgba(sphere.color, 0.08) : undefined;
  const progressPct = subtaskProgress && subtaskProgress.total > 0 ? (subtaskProgress.done / subtaskProgress.total) * 100 : 0;

  return (
    <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: tint ?? 'var(--color-surface)' }}>
      <div className="flex items-start gap-3">
        <button
          onClick={onToggleDone}
          aria-label={task.status === 'done' ? 'Снять отметку выполнено' : 'Отметить выполненным'}
          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition active:scale-90 ${
            task.status === 'done' ? 'border-sage bg-sage text-white' : 'border-ink/25 bg-white/40 hover:border-sage hover:bg-sage/10'
          }`}
        >
          {task.status === 'done' && <Check size={15} strokeWidth={3} />}
        </button>

        <div
          className="min-w-0 flex-1 cursor-pointer"
          onClick={() => task.description && setShowDescription((v) => !v)}
        >
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
          {showDescription && task.description && (
            <p className="mt-2 whitespace-pre-wrap text-sm text-ink/60">{task.description}</p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              aria-label={isExpanded ? 'Свернуть подзадачи' : 'Показать подзадачи'}
              className="rounded-full p-1.5 text-ink/40 transition hover:bg-ink/5 hover:text-ink"
            >
              {isExpanded ? <ChevronDown size={16} strokeWidth={2} /> : <ChevronRight size={16} strokeWidth={2} />}
            </button>
          )}
          <button
            onClick={onEdit}
            aria-label="Редактировать"
            className="rounded-full p-1.5 text-ink/40 transition hover:bg-ink/5 hover:text-ink"
          >
            <Pencil size={15} strokeWidth={1.75} />
          </button>
        </div>
      </div>
      {isOverdue && <OverdueBanner onComplete={onToggleDone} onReschedule={onEdit} />}
    </div>
  );
}
