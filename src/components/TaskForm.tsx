import { useState, type FormEvent } from 'react';
import { Trash2 } from 'lucide-react';
import type { Sphere, Task, TaskType } from '../types';
import { addTask, updateTask } from '../firebase/tasks';
import { useReminders } from '../hooks/useReminders';
import { ReminderPicker } from './ReminderPicker';

function toDatetimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function TaskForm({
  uid,
  mode,
  initialTask,
  spheres,
  parentEpicId,
  onDone,
  onDelete,
}: {
  uid: string;
  mode: 'create' | 'edit';
  initialTask?: Task;
  spheres: Sphere[];
  parentEpicId: string | null;
  onDone: () => void;
  onDelete?: () => Promise<void>;
}) {
  const [type, setType] = useState<TaskType>(initialTask?.type ?? 'task');
  const [sphereId, setSphereId] = useState(initialTask?.sphereId ?? spheres[0]?.id ?? '');
  const [title, setTitle] = useState(initialTask?.title ?? '');
  const [description, setDescription] = useState(initialTask?.description ?? '');
  const [deadlineValue, setDeadlineValue] = useState(
    initialTask?.deadline ? toDatetimeLocalValue(initialTask.deadline) : ''
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ponytail: reminders need a task id, so on create the picker only appears
  // after reopening the saved task in edit mode. Add an inline "save then keep
  // editing" flow if that extra tap turns out to bother her.
  const taskId = initialTask?.id ?? null;
  const { reminders, addReminder, deleteReminder } = useReminders(uid, taskId);
  const deadline = deadlineValue ? new Date(deadlineValue) : null;

  const fieldClass = 'w-full rounded-xl border border-ink/20 px-3 py-2 text-base';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !sphereId) return;
    setSaving(true);
    setError(null);
    const input = {
      type,
      sphereId,
      title: title.trim(),
      description: description.trim() || null,
      deadline,
      parentEpicId: initialTask ? initialTask.parentEpicId : parentEpicId,
    };
    try {
      if (mode === 'create') {
        await addTask(uid, input);
      } else if (initialTask) {
        await updateTask(uid, initialTask.id, input);
      }
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!onDelete) return;
    const warning =
      type === 'epic'
        ? `Удалить эпик «${title}» вместе со всеми подзадачами? Это нельзя отменить.`
        : `Удалить задачу «${title}»? Это нельзя отменить.`;
    if (!confirm(warning)) return;
    setSaving(true);
    setError(null);
    try {
      await onDelete();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold text-ink">
        {mode === 'create' ? 'Новая задача' : 'Редактировать задачу'}
      </h2>

      {!parentEpicId && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setType('task')}
            className={`flex-1 rounded-xl border px-3 py-2 text-sm ${type === 'task' ? 'border-sage bg-sage/10' : 'border-ink/20'}`}
          >
            Задача
          </button>
          <button
            type="button"
            onClick={() => setType('epic')}
            className={`flex-1 rounded-xl border px-3 py-2 text-sm ${type === 'epic' ? 'border-sage bg-sage/10' : 'border-ink/20'}`}
          >
            Эпик
          </button>
        </div>
      )}

      <select value={sphereId} onChange={(e) => setSphereId(e.target.value)} className={fieldClass}>
        {spheres.map((sphere) => (
          <option key={sphere.id} value={sphere.id}>
            {sphere.name}
          </option>
        ))}
      </select>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Название"
        className={fieldClass}
        required
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Описание (необязательно)"
        className={fieldClass}
        rows={3}
      />

      <div className="space-y-1">
        <label className="text-xs font-medium text-ink/50">Срок (необязательно)</label>
        <input
          type="datetime-local"
          value={deadlineValue}
          onChange={(e) => setDeadlineValue(e.target.value)}
          className={fieldClass}
        />
      </div>

      {mode === 'edit' && (
        <div className="space-y-1.5 rounded-2xl bg-ink/[0.03] p-3">
          <label className="text-xs font-medium text-ink/50">
            Напоминания — пришлём push, чтобы не забыть
          </label>
          <ReminderPicker deadline={deadline} reminders={reminders} onAdd={addReminder} onRemove={deleteReminder} />
        </div>
      )}

      {error && (
        <p className="rounded-xl bg-terracotta/15 px-3 py-2 text-sm text-ink">
          Не сохранилось: {error}. Попробуй ещё раз.
        </p>
      )}

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onDone}
          className="flex-1 rounded-full border border-ink/20 px-4 py-2 text-sm font-medium text-ink"
        >
          Отмена
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-full bg-sage px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Сохранить
        </button>
      </div>

      {onDelete && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={saving}
          className="flex w-full items-center justify-center gap-1.5 py-1 text-sm font-medium text-terracotta disabled:opacity-50"
        >
          <Trash2 size={15} strokeWidth={1.75} />
          {type === 'epic' ? 'Удалить эпик и подзадачи' : 'Удалить задачу'}
        </button>
      )}
    </form>
  );
}
