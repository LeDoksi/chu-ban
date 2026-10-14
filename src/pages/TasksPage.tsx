import { useState } from 'react';
import { Search, X } from 'lucide-react';
import type { Sphere, Task, TaskStatus } from '../types';
import { TaskCard } from '../components/TaskCard';
import { matchesSearch } from '../lib/taskSearch';

export function TasksPage({
  tasks,
  spheres,
  onOpenCreate,
  onOpenEdit,
  onToggleDone,
  onToggleSubtask,
  onCloseEpic,
}: {
  tasks: Task[];
  spheres: Sphere[];
  onOpenCreate: (parentEpicId: string | null, sphereId: string | null) => void;
  onOpenEdit: (task: Task) => void;
  onToggleDone: (taskId: string, status: TaskStatus) => void;
  onToggleSubtask: (subtaskId: string, status: TaskStatus) => void;
  onCloseEpic: (epicId: string) => void;
}) {
  const [sphereFilter, setSphereFilter] = useState<string | null>(null);
  const [expandedEpics, setExpandedEpics] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState('');
  const isSearching = query.trim().length > 0;
  const sphereById = new Map(spheres.map((s) => [s.id, s]));
  const matchesFilter = (t: Task) => !sphereFilter || t.sphereId === sphereFilter;
  // Top-level = has no parent epic. Subtasks always render nested under their
  // epic instead, whether the epic is open or done — never as their own row,
  // which is what caused a completed subtask to show up twice.
  const topLevel = tasks.filter((t) => !t.parentEpicId && t.status === 'open' && matchesFilter(t));
  const done = tasks.filter((t) => t.status === 'done' && !t.parentEpicId && matchesFilter(t));
  // While searching, subtasks are matched too and shown as their own rows —
  // otherwise a match hidden inside a collapsed epic would be invisible.
  const searchResults = isSearching
    ? tasks
        .filter((t) => matchesFilter(t) && matchesSearch(t, query))
        .sort((a, b) => Number(a.status === 'done') - Number(b.status === 'done'))
    : [];

  function subtasksOf(epicId: string) {
    return tasks
      .filter((t) => t.parentEpicId === epicId)
      .sort((a, b) => Number(a.status === 'done') - Number(b.status === 'done'));
  }

  function toggleExpanded(epicId: string) {
    setExpandedEpics((prev) => ({ ...prev, [epicId]: !prev[epicId] }));
  }

  function renderSearchResult(task: Task) {
    const isEpic = task.type === 'epic';
    const subtasks = isEpic ? subtasksOf(task.id) : [];
    const nextStatus: TaskStatus = task.status === 'done' ? 'open' : 'done';
    const toggle = () => {
      if (isEpic && task.status === 'open') onCloseEpic(task.id);
      else if (task.parentEpicId) onToggleSubtask(task.id, nextStatus);
      else onToggleDone(task.id, nextStatus);
    };
    return (
      <TaskCard
        key={task.id}
        task={task}
        sphere={sphereById.get(task.sphereId)}
        subtaskProgress={
          isEpic ? { done: subtasks.filter((s) => s.status === 'done').length, total: subtasks.length } : undefined
        }
        onToggleDone={toggle}
        onOpen={() => onOpenEdit(task)}
      />
    );
  }

  function renderEpicRow(task: Task) {
    const subtasks = subtasksOf(task.id);
    const isExpanded = !!expandedEpics[task.id];
    return (
      <div key={task.id}>
        <TaskCard
          task={task}
          sphere={sphereById.get(task.sphereId)}
          subtaskProgress={{ done: subtasks.filter((s) => s.status === 'done').length, total: subtasks.length }}
          isExpanded={isExpanded}
          onToggleExpand={() => toggleExpanded(task.id)}
          onToggleDone={() => (task.status === 'open' ? onCloseEpic(task.id) : onToggleDone(task.id, 'open'))}
          onOpen={() => onOpenEdit(task)}
        />
        {isExpanded && (
          <div className="ml-6 mt-2 space-y-2">
            {subtasks.map((subtask) => (
              <TaskCard
                key={subtask.id}
                task={subtask}
                sphere={sphereById.get(subtask.sphereId)}
                onToggleDone={() => onToggleSubtask(subtask.id, subtask.status === 'done' ? 'open' : 'done')}
                onOpen={() => onOpenEdit(subtask)}
              />
            ))}
            <button onClick={() => onOpenCreate(task.id, null)} className="text-xs font-medium text-sage">
              + Подзадача
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => onOpenCreate(null, sphereFilter)}
        className="w-full rounded-2xl border-2 border-dashed border-sage/40 py-3 text-sm font-medium text-sage"
      >
        + Новая задача
      </button>

      <div className="relative">
        <Search size={16} strokeWidth={1.75} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск задач"
          aria-label="Поиск задач"
          className="w-full rounded-xl border border-ink/15 bg-surface py-2 pl-9 pr-9 text-base text-ink placeholder:text-ink/40 [&::-webkit-search-cancel-button]:hidden"
        />
        {isSearching && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Очистить поиск"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink/40"
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        )}
      </div>

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

      {isSearching ? (
        searchResults.length === 0 ? (
          <p className="pt-6 text-center text-sm text-ink/50">Ничего не нашлось.</p>
        ) : (
          <div className="space-y-3">{searchResults.map(renderSearchResult)}</div>
        )
      ) : (
        <>
          {topLevel.length === 0 && done.length === 0 && (
            <p className="pt-6 text-center text-sm text-ink/50">
              {sphereFilter ? 'В этой сфере пока нет задач.' : 'Пока пусто. Добавь первую задачу, когда будешь готова 🌱'}
            </p>
          )}

          <div className="space-y-3">
            {topLevel.map((task) =>
              task.type === 'epic' ? (
                renderEpicRow(task)
              ) : (
                <TaskCard
                  key={task.id}
                  task={task}
                  sphere={sphereById.get(task.sphereId)}
                  onToggleDone={() => onToggleDone(task.id, 'done')}
                  onOpen={() => onOpenEdit(task)}
                />
              )
            )}
          </div>

          {done.length > 0 && (
            <details className="pt-2">
              <summary className="cursor-pointer text-sm text-ink/50">Выполнено ({done.length})</summary>
              <div className="mt-2 space-y-3">
                {done.map((task) => (task.type === 'epic' ? renderEpicRow(task) : (
                  <TaskCard
                    key={task.id}
                    task={task}
                    sphere={sphereById.get(task.sphereId)}
                    onToggleDone={() => onToggleDone(task.id, 'open')}
                    onOpen={() => onOpenEdit(task)}
                  />
                )))}
              </div>
            </details>
          )}
        </>
      )}
    </div>
  );
}
