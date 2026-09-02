import { useState } from 'react';
import type { Reminder, ReminderPreset } from '../types';
import { REMINDER_PRESET_LABELS } from '../types';
import { presetToFireAt } from '../lib/reminderTime';

const PRESETS: ReminderPreset[] = ['weekBefore', 'dayBefore', 'hourBefore', 'onDeadline'];

export function ReminderPicker({
  deadline,
  reminders,
  onAdd,
  onRemove,
}: {
  deadline: Date | null;
  reminders: Reminder[];
  onAdd: (fireAt: Date) => void;
  onRemove: (id: string) => void;
}) {
  const [customValue, setCustomValue] = useState('');

  if (!deadline) {
    return <p className="text-sm text-ink/50">Укажи срок, чтобы добавить напоминания.</p>;
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onAdd(presetToFireAt(deadline, preset))}
            className="rounded-full border border-ink/20 px-3 py-1.5 text-xs text-ink"
          >
            + {REMINDER_PRESET_LABELS[preset]}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="datetime-local"
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          className="flex-1 rounded-xl border border-ink/20 px-3 py-1.5 text-sm"
        />
        <button
          type="button"
          disabled={!customValue}
          onClick={() => {
            onAdd(new Date(customValue));
            setCustomValue('');
          }}
          className="rounded-full bg-sage px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
        >
          Добавить
        </button>
      </div>
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
