import { useEffect, useState } from 'react';
import { Pencil, X, Trash2 } from 'lucide-react';
import type { Sphere, Task } from '../types';
import { updateTask } from '../firebase/tasks';
import { useReminders } from '../hooks/useReminders';
import { ReminderPicker } from './ReminderPicker';
import { DateTimePicker } from './DateTimePicker';
import { SphereBadge } from './SphereBadge';

type Field = 'sphere' | 'title' | 'description' | 'deadline' | null;

function formatDeadline(d: Date): string {
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) +
    ', ' +
    d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function FieldPencil({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={active ? 'Закрыть' : 'Редактировать'}
      className="shrink-0 rounded-full p-1.5 text-ink/40 transition hover:bg-ink/5 hover:text-ink"
    >
      {active ? <X size={15} strokeWidth={1.75} /> : <Pencil size={15} strokeWidth={1.75} />}
    </button>
  );
}

export function TaskDetailView({
  uid,
  task,
  spheres,
  onClose,
  onDelete,
}: {
  uid: string;
  task: Task;
  spheres: Sphere[];
  onClose: () => void;
  onDelete?: () => Promise<void>;
}) {
  const [editingField, setEditingField] = useState<Field>(null);
  const [titleDraft, setTitleDraft] = useState(task.title);
  const [descDraft, setDescDraft] = useState(task.description ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sphere = spheres.find((s) => s.id === task.sphereId);
  const { reminders, addReminder, deleteReminder } = useReminders(uid, task.id, task.title);

  useEffect(() => {
    if (editingField !== 'title') setTitleDraft(task.title);
  }, [task.title, editingField]);
  useEffect(() => {
    if (editingField !== 'description') setDescDraft(task.description ?? '');
  }, [task.description, editingField]);

  function toggleField(field: Field) {
    setError(null);
    setEditingField((current) => (current === field ? null : field));
  }

  async function save(changes: { sphereId?: string; title?: string; description?: string | null; deadline?: Date | null }) {
    setSaving(true);
    setError(null);
    try {
      await updateTask(uid, task.id, changes);
      setEditingField(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!onDelete) return;
    const warning =
      task.type === 'epic'
        ? `Удалить эпик «${task.title}» вместе со всеми подзадачами? Это нельзя отменить.`
        : `Удалить задачу «${task.title}»? Это нельзя отменить.`;
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
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-ink">{task.type === 'epic' ? 'Эпик' : 'Задача'}</h2>

      <div>
        <div className="flex items-center justify-between gap-2">
          {editingField === 'sphere' ? (
            <select
              autoFocus
              value={task.sphereId}
              onChange={(e) => save({ sphereId: e.target.value })}
              className="w-full rounded-xl border border-ink/20 px-3 py-2 text-base"
            >
              {spheres.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          ) : (
            <SphereBadge sphere={sphere} />
          )}
          <FieldPencil active={editingField === 'sphere'} onClick={() => toggleField('sphere')} />
        </div>
      </div>

      <div>
        <div className="flex items-start justify-between gap-2">
          {editingField === 'title' ? (
            <input
              autoFocus
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={() => titleDraft.trim() && titleDraft.trim() !== task.title && save({ title: titleDraft.trim() })}
              onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
              className="w-full rounded-xl border border-ink/20 px-3 py-2 text-base font-medium"
            />
          ) : (
            <p className={`text-lg font-medium text-ink ${task.status === 'done' ? 'line-through opacity-50' : ''}`}>
              {task.title}
            </p>
          )}
          <FieldPencil active={editingField === 'title'} onClick={() => toggleField('title')} />
        </div>
      </div>

      <div>
        <div className="flex items-start justify-between gap-2">
          {editingField === 'description' ? (
            <textarea
              autoFocus
              value={descDraft}
              onChange={(e) => setDescDraft(e.target.value)}
              onBlur={() => descDraft.trim() !== (task.description ?? '') && save({ description: descDraft.trim() || null })}
              placeholder="Описание"
              rows={3}
              className="w-full rounded-xl border border-ink/20 px-3 py-2 text-base"
            />
          ) : (
            <p className="whitespace-pre-wrap text-sm text-ink/60">
              {task.description || 'Описание не добавлено'}
            </p>
          )}
          <FieldPencil active={editingField === 'description'} onClick={() => toggleField('description')} />
        </div>
      </div>

      <div>
        <div className="flex items-start justify-between gap-2">
          {editingField === 'deadline' ? (
            <div className="w-full">
              <DateTimePicker value={task.deadline} onChange={(d) => save({ deadline: d })} />
            </div>
          ) : (
            <p className="text-sm text-ink/60">{task.deadline ? formatDeadline(task.deadline) : 'Срок не указан'}</p>
          )}
          <FieldPencil active={editingField === 'deadline'} onClick={() => toggleField('deadline')} />
        </div>
      </div>

      <div className="space-y-1.5 rounded-2xl bg-ink/[0.03] p-3">
        <label className="text-xs font-medium text-ink/50">
          Напоминания — пришлём push, чтобы не забыть
        </label>
        <ReminderPicker deadline={task.deadline} reminders={reminders} onAdd={addReminder} onRemove={deleteReminder} />
      </div>

      {error && (
        <p className="rounded-xl bg-terracotta/15 px-3 py-2 text-sm text-ink">
          Не сохранилось: {error}. Попробуй ещё раз.
        </p>
      )}

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-full border border-ink/20 px-4 py-2 text-sm font-medium text-ink"
        >
          Закрыть
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
          {task.type === 'epic' ? 'Удалить эпик и подзадачи' : 'Удалить задачу'}
        </button>
      )}
    </div>
  );
}
