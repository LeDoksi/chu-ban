import { useState, type FormEvent } from 'react';
import { Trash2 } from 'lucide-react';
import type { Sphere, Task, TaskType } from '../types';
import { addTask, updateTask } from '../firebase/tasks';
import { addReminder as addReminderFn } from '../firebase/reminders';
import { useReminders } from '../hooks/useReminders';
import { ReminderPicker, type ReminderLike } from './ReminderPicker';
import { DateTimePicker } from './DateTimePicker';

export function TaskForm({
  uid,
  mode,
  initialTask,
  spheres,
  parentEpicId,
  defaultDeadline = null,
  onDone,
  onDelete,
}: {
  uid: string;
  mode: 'create' | 'edit';
  initialTask?: Task;
  spheres: Sphere[];
  parentEpicId: string | null;
  defaultDeadline?: Date | null;
  onDone: () => void;
  onDelete?: () => Promise<void>;
}) {
  const [type, setType] = useState<TaskType>(initialTask?.type ?? 'task');
  const [sphereId, setSphereId] = useState(initialTask?.sphereId ?? spheres[0]?.id ?? '');
  const [title, setTitle] = useState(initialTask?.title ?? '');
  const [description, setDescription] = useState(initialTask?.description ?? '');
  const [deadline, setDeadline] = useState<Date | null>(initialTask?.deadline ?? defaultDeadline);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const taskId = initialTask?.id ?? null;
  const savedReminders = useReminders(uid, taskId);
  // Before the task exists (create mode) reminders live only in local state,
  // then get written to Firestore right after the task itself is created.
  const [pendingReminders, setPendingReminders] = useState<ReminderLike[]>([]);
  const reminders: ReminderLike[] = taskId ? savedReminders.reminders : pendingReminders;

  function addReminder(fireAt: Date) {
    if (taskId) {
      savedReminders.addReminder(fireAt);
    } else {
      setPendingReminders((prev) => [...prev, { id: crypto.randomUUID(), fireAt }]);
    }
  }

  function removeReminder(id: string) {
    if (taskId) {
      savedReminders.deleteReminder(id);
    } else {
      setPendingReminders((prev) => prev.filter((r) => r.id !== id));
    }
  }

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
        const newId = await addTask(uid, input);
        for (const reminder of pendingReminders) {
          await addReminderFn(uid, { taskId: newId, fireAt: reminder.fireAt });
        }
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

      <DateTimePicker value={deadline} onChange={setDeadline} label="Срок (необязательно)" />

      <div className="space-y-1.5 rounded-2xl bg-ink/[0.03] p-3">
        <label className="text-xs font-medium text-ink/50">
          Напоминания — пришлём push, чтобы не забыть
        </label>
        <ReminderPicker deadline={deadline} reminders={reminders} onAdd={addReminder} onRemove={removeReminder} />
      </div>

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
