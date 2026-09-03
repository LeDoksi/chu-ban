import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Sphere, Task } from '../types';

function daysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function CalendarPage({
  tasks,
  spheres,
  onOpenEdit,
}: {
  tasks: Task[];
  spheres: Sphere[];
  onOpenEdit: (task: Task) => void;
}) {
  const [cursor, setCursor] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const sphereById = new Map(spheres.map((s) => [s.id, s]));

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const days = daysInMonth(year, month);
  const leadingBlanks = (days[0].getDay() + 6) % 7; // Monday-first grid

  const tasksWithDeadline = tasks.filter((t): t is Task & { deadline: Date } => t.deadline !== null);

  function tasksOnDay(day: Date): Task[] {
    return tasksWithDeadline.filter((t) => isSameDay(t.deadline, day));
  }

  const today = new Date();

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-surface p-4 shadow-sm">
        <div className="flex items-center justify-between pb-3">
          <button
            onClick={() => {
              setCursor(new Date(year, month - 1, 1));
              setSelectedDay(null);
            }}
            className="rounded-full p-1.5 text-ink/50 transition hover:bg-ink/5 hover:text-ink"
            aria-label="Предыдущий месяц"
          >
            <ChevronLeft size={18} strokeWidth={2} />
          </button>
          <p className="font-semibold capitalize text-ink">
            {cursor.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
          </p>
          <button
            onClick={() => {
              setCursor(new Date(year, month + 1, 1));
              setSelectedDay(null);
            }}
            className="rounded-full p-1.5 text-ink/50 transition hover:bg-ink/5 hover:text-ink"
            aria-label="Следующий месяц"
          >
            <ChevronRight size={18} strokeWidth={2} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 pb-1 text-center text-xs font-medium text-ink/35">
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: leadingBlanks }).map((_, i) => (
            <div key={`blank-${i}`} />
          ))}
          {days.map((day) => {
            const dayTasks = tasksOnDay(day);
            const spheresOnDay = [...new Set(dayTasks.map((t) => t.sphereId))];
            const isToday = isSameDay(day, today);
            const isSelected = selectedDay && isSameDay(selectedDay, day);
            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDay(day)}
                className={`flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-sm transition-colors ${
                  isSelected ? 'bg-sage text-white' : isToday ? 'bg-sage/15 text-ink' : 'text-ink hover:bg-ink/5'
                }`}
              >
                <span className={isToday && !isSelected ? 'font-semibold text-sage' : ''}>{day.getDate()}</span>
                <span className="flex h-1.5 gap-0.5">
                  {spheresOnDay.slice(0, 3).map((sphereId) => (
                    <span
                      key={sphereId}
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: sphereById.get(sphereId)?.color ?? '#ccc' }}
                    />
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {tasksWithDeadline.length === 0 && (
        <p className="pt-4 text-center text-sm text-ink/40">
          Дедлайнов пока нет — самое спокойное состояние календаря 🌤️
        </p>
      )}

      {selectedDay && (
        <div className="space-y-2 pt-2">
          <p className="text-sm font-medium text-ink/70">
            {selectedDay.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
          </p>
          {tasksOnDay(selectedDay).length === 0 && (
            <p className="text-sm text-ink/40">На этот день ничего не запланировано.</p>
          )}
          {tasksOnDay(selectedDay).map((task) => (
            <button
              key={task.id}
              onClick={() => onOpenEdit(task)}
              className="flex w-full items-center gap-2 rounded-xl bg-surface p-3 text-left text-sm shadow-sm"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: sphereById.get(task.sphereId)?.color ?? '#ccc' }}
              />
              {task.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
