import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';
import { daysInMonth, isSameDay } from '../lib/calendarGrid';

function formatValue(d: Date): string {
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) +
    ', ' +
    d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function toTimeValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function DateTimePicker({
  value,
  onChange,
  label,
}: {
  value: Date | null;
  onChange: (date: Date | null) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [viewCursor, setViewCursor] = useState(() => value ?? new Date());
  const [time, setTime] = useState(() => (value ? toTimeValue(value) : '09:00'));

  const year = viewCursor.getFullYear();
  const month = viewCursor.getMonth();
  const days = daysInMonth(year, month);
  const leadingBlanks = (days[0].getDay() + 6) % 7;
  const today = new Date();

  function commit(day: Date) {
    const [h, m] = time.split(':').map(Number);
    onChange(new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m));
  }

  function handleTimeChange(next: string) {
    setTime(next);
    if (value) {
      const [h, m] = next.split(':').map(Number);
      onChange(new Date(value.getFullYear(), value.getMonth(), value.getDate(), h, m));
    }
  }

  return (
    <div className="space-y-1">
      {label && <label className="text-xs font-medium text-ink/50">{label}</label>}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-xl border border-ink/20 px-3 py-2 text-left text-base text-ink"
      >
        <span className={value ? '' : 'text-ink/40'}>{value ? formatValue(value) : 'Не указан'}</span>
        <Calendar size={16} strokeWidth={1.75} className="text-ink/40" />
      </button>

      {open && (
        <div className="space-y-3 rounded-2xl border border-ink/10 bg-surface p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewCursor(new Date(year, month - 1, 1))}
              className="rounded-full p-1.5 text-ink/50 transition hover:bg-ink/5 hover:text-ink"
              aria-label="Предыдущий месяц"
            >
              <ChevronLeft size={16} strokeWidth={2} />
            </button>
            <p className="text-sm font-semibold capitalize text-ink">
              {viewCursor.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
            </p>
            <button
              type="button"
              onClick={() => setViewCursor(new Date(year, month + 1, 1))}
              className="rounded-full p-1.5 text-ink/50 transition hover:bg-ink/5 hover:text-ink"
              aria-label="Следующий месяц"
            >
              <ChevronRight size={16} strokeWidth={2} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-ink/35">
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: leadingBlanks }).map((_, i) => (
              <div key={`blank-${i}`} />
            ))}
            {days.map((day) => {
              const isSelected = value && isSameDay(value, day);
              const isToday = isSameDay(day, today);
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => commit(day)}
                  className={`rounded-lg py-1.5 text-sm transition-colors ${
                    isSelected ? 'bg-sage text-white' : isToday ? 'bg-sage/15 text-ink' : 'text-ink hover:bg-ink/5'
                  }`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 border-t border-ink/10 pt-3">
            <span className="text-xs font-medium text-ink/50">Время</span>
            <input
              type="time"
              value={time}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="flex-1 rounded-lg border border-ink/20 px-2 py-1 text-sm"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            {value ? (
              <button
                type="button"
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                }}
                className="flex items-center gap-1 text-xs font-medium text-terracotta"
              >
                <X size={13} strokeWidth={2} />
                Убрать срок
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full bg-sage px-3 py-1.5 text-xs font-medium text-white"
            >
              Готово
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
