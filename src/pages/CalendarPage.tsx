import { useState } from 'react';
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => setCursor(new Date(year, month - 1, 1))} className="px-2 text-ink/60">
          ←
        </button>
        <p className="font-medium text-ink">
          {cursor.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
        </p>
        <button onClick={() => setCursor(new Date(year, month + 1, 1))} className="px-2 text-ink/60">
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-ink/40">
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
          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDay(day)}
              className={`flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-sm ${
                selectedDay && isSameDay(selectedDay, day) ? 'bg-sage/20' : ''
              }`}
            >
              <span className="text-ink">{day.getDate()}</span>
              <span className="flex gap-0.5">
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
              className="flex w-full items-center gap-2 rounded-xl bg-white p-3 text-left text-sm shadow-sm"
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
