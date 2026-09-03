import { ListChecks, CalendarDays, Sparkles, Settings, type LucideIcon } from 'lucide-react';
import type { Tab } from '../types';

const TABS: Array<{ id: Tab; label: string; Icon: LucideIcon }> = [
  { id: 'tasks', label: 'Задачи', Icon: ListChecks },
  { id: 'calendar', label: 'Календарь', Icon: CalendarDays },
  { id: 'stats', label: 'Статистика', Icon: Sparkles },
  { id: 'settings', label: 'Настройки', Icon: Settings },
];

export function BottomNav({ active, onChange }: { active: Tab; onChange: (tab: Tab) => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-ink/10 bg-cream/95 px-2 py-2 backdrop-blur">
      {TABS.map(({ id, label, Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex min-w-16 flex-col items-center gap-0.5 rounded-2xl px-3 py-1.5 text-xs font-medium transition-colors ${
              isActive ? 'bg-sage/15 text-sage' : 'text-ink/40'
            }`}
          >
            <Icon size={20} strokeWidth={isActive ? 2.25 : 1.75} />
            {label}
          </button>
        );
      })}
    </nav>
  );
}
