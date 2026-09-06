import { useState } from 'react';
import type { ReminderPreset } from '../types';
import { REMINDER_PRESET_LABELS } from '../types';
import { presetToFireAt, isFireAtInFuture } from '../lib/reminderTime';

// Loose enough to accept both real Firestore reminders (edit mode) and
// not-yet-saved local ones held in memory until the new task gets an id.
export interface ReminderLike {
  id: string;
  fireAt: Date;
}

const PRESETS: ReminderPreset[] = ['weekBefore', 'dayBefore', 'hourBefore', 'onDeadline'];

function toDatetimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function ReminderPicker({
  deadline,
  reminders,
  onAdd,
  onRemove,
}: {
  deadline: Date | null;
  reminders: ReminderLike[];
  onAdd: (fireAt: Date) => void;
  onRemove: (id: string) => void;
}) {
  const [customValue, setCustomValue] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const now = new Date();

  if (!deadline) {
    return <p className="text-sm text-ink/50">Укажи срок, чтобы добавить напоминания.</p>;
  }

  const customFireAt = customValue ? new Date(customValue) : null;
  const customValid = customFireAt !== null && isFireAtInFuture(customFireAt, now);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => {
          const fireAt = presetToFireAt(deadline, preset);
          const disabled = !isFireAtInFuture(fireAt, now);
          return (
            <button
              key={preset}
              type="button"
              disabled={disabled}
              title={disabled ? 'Это время уже прошло' : undefined}
              onClick={() => onAdd(fireAt)}
              className="rounded-full border border-ink/20 px-3 py-1.5 text-xs text-ink disabled:cursor-not-allowed disabled:opacity-40"
            >
              + {REMINDER_PRESET_LABELS[preset]}
            </button>
          );
        })}
      </div>

      {showCustom ? (
        <div className="flex gap-2">
          <input
            type="datetime-local"
            value={customValue}
            min={toDatetimeLocalValue(now)}
            onChange={(e) => setCustomValue(e.target.value)}
            autoFocus
            className="flex-1 rounded-xl border border-ink/20 px-3 py-1.5 text-sm"
          />
          <button
            type="button"
            disabled={!customValid}
            onClick={() => {
              if (!customFireAt) return;
              onAdd(customFireAt);
              setCustomValue('');
              setShowCustom(false);
            }}
            className="rounded-full bg-sage px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
          >
            Добавить
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowCustom(true)}
          className="text-xs font-medium text-ink/50 underline decoration-dotted underline-offset-2"
        >
          Своё время
        </button>
      )}
      {reminders.length > 0 && (
        <ul className="space-y-1">
          {reminders.map((reminder) => (
            <li key={reminder.id} className="flex items-center justify-between text-sm text-ink/70">
              <span>
                {reminder.fireAt.toLocaleString('ru-RU', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <button onClick={() => onRemove(reminder.id)} className="text-xs text-terracotta">
                Убрать
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
