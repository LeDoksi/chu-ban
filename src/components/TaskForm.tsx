import { useState, type FormEvent } from 'react';
import type { Sphere, TaskType } from '../types';
import { addTask } from '../firebase/tasks';
import { addReminder as addReminderFn } from '../firebase/reminders';
import { ReminderPicker, type ReminderLike } from './ReminderPicker';
import { DateTimePicker } from './DateTimePicker';

export function TaskForm({
  uid,
  spheres,
  parentEpicId,
  defaultDeadline = null,
  onDone,
}: {
  uid: string;
  spheres: Sphere[];
  parentEpicId: string | null;
  defaultDeadline?: Date | null;
  onDone: () => void;
}) {
  const [type, setType] = useState<TaskType>('task');
  const [sphereId, setSphereId] = useState(spheres[0]?.id ?? '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState<Date | null>(defaultDeadline);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reminders need a task id, which doesn't exist yet — held locally and
  // written to Firestore right after the task itself is created.
  const [pendingReminders, setPendingReminders] = useState<ReminderLike[]>([]);

  function addReminder(fireAt: Date) {
    setPendingReminders((prev) => [...prev, { id: crypto.randomUUID(), fireAt }]);
  }

  function removeReminder(id: string) {
    setPendingReminders((prev) => prev.filter((r) => r.id !== id));
  }

  const fieldClass = 'w-full rounded-xl border border-ink/20 px-3 py-2 text-base';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !sphereId) return;
    setSaving(true);
    setError(null);
    try {
      const newId = await addTask(uid, {
        type,
        sphereId,
        title: title.trim(),
        description: description.trim() || null,
        deadline,
        parentEpicId,
      });
      for (const reminder of pendingReminders) {
        await addReminderFn(uid, { taskId: newId, fireAt: reminder.fireAt });
      }
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold text-ink">Новая задача</h2>

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
        <ReminderPicker deadline={deadline} reminders={pendingReminders} onAdd={addReminder} onRemove={removeReminder} />
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
    </form>
  );
}
