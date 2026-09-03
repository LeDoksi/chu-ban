import { useState } from 'react';
import type { Sphere, Task, TaskStatus } from '../types';
import { TaskCard } from '../components/TaskCard';

export function TasksPage({
  tasks,
  spheres,
  onOpenCreate,
  onOpenEdit,
  onToggleDone,
  onCloseEpic,
}: {
  tasks: Task[];
  spheres: Sphere[];
  onOpenCreate: (parentEpicId: string | null) => void;
  onOpenEdit: (task: Task) => void;
  onToggleDone: (taskId: string, status: TaskStatus) => void;
  onCloseEpic: (epicId: string) => void;
}) {
  const [sphereFilter, setSphereFilter] = useState<string | null>(null);
  const sphereById = new Map(spheres.map((s) => [s.id, s]));
  const matchesFilter = (t: Task) => !sphereFilter || t.sphereId === sphereFilter;
  const topLevel = tasks.filter((t) => !t.parentEpicId && t.status === 'open' && matchesFilter(t));
  const done = tasks.filter((t) => t.status === 'done' && matchesFilter(t));

  function subtasksOf(epicId: string) {
    return tasks.filter((t) => t.parentEpicId === epicId);
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => onOpenCreate(null)}
        className="w-full rounded-2xl border-2 border-dashed border-sage/40 py-3 text-sm font-medium text-sage"
      >
        + Новая задача
      </button>

      {spheres.length > 0 && (
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          <button
            onClick={() => setSphereFilter(null)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              sphereFilter === null ? 'bg-ink text-cream' : 'bg-ink/5 text-ink/60'
            }`}
          >
            Все
          </button>
          {spheres.map((sphere) => (
            <button
              key={sphere.id}
              onClick={() => setSphereFilter(sphere.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                sphereFilter === sphere.id ? 'text-white' : 'bg-ink/5 text-ink/60'
              }`}
              style={sphereFilter === sphere.id ? { backgroundColor: sphere.color } : undefined}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: sphere.color }} />
              {sphere.name}
            </button>
          ))}
        </div>
      )}

      {topLevel.length === 0 && done.length === 0 && (
        <p className="pt-6 text-center text-sm text-ink/50">
          {sphereFilter ? 'В этой сфере пока нет задач.' : 'Пока пусто. Добавь первую задачу, когда будешь готова 🌱'}
        </p>
      )}

      <div className="space-y-3">
        {topLevel.map((task) => {
          const subtasks = task.type === 'epic' ? subtasksOf(task.id) : [];
          return (
            <div key={task.id}>
              <TaskCard
                task={task}
                sphere={sphereById.get(task.sphereId)}
                subtaskProgress={
                  task.type === 'epic'
                    ? { done: subtasks.filter((s) => s.status === 'done').length, total: subtasks.length }
                    : undefined
                }
                onToggleDone={() =>
                  task.type === 'epic' ? onCloseEpic(task.id) : onToggleDone(task.id, 'done')
                }
                onOpen={() => onOpenEdit(task)}
              />
              {task.type === 'epic' && (
                <div className="ml-6 mt-2 space-y-2">
                  {subtasks.map((subtask) => (
                    <TaskCard
                      key={subtask.id}
                      task={subtask}
                      sphere={sphereById.get(subtask.sphereId)}
                      onToggleDone={() => onToggleDone(subtask.id, subtask.status === 'done' ? 'open' : 'done')}
                      onOpen={() => onOpenEdit(subtask)}
                    />
                  ))}
                  <button onClick={() => onOpenCreate(task.id)} className="text-xs font-medium text-sage">
                    + Подзадача
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {done.length > 0 && (
        <details className="pt-2">
          <summary className="cursor-pointer text-sm text-ink/50">Выполнено ({done.length})</summary>
          <div className="mt-2 space-y-2">
            {done.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                sphere={sphereById.get(task.sphereId)}
                onToggleDone={() => onToggleDone(task.id, 'open')}
                onOpen={() => onOpenEdit(task)}
              />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
