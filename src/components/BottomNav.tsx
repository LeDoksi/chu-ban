import type { Tab } from '../types';

const TABS: Array<{ id: Tab; label: string; icon: string }> = [
  { id: 'tasks', label: 'Задачи', icon: '✓' },
  { id: 'calendar', label: 'Календарь', icon: '📅' },
  { id: 'stats', label: 'Статистика', icon: '✨' },
  { id: 'settings', label: 'Настройки', icon: '⚙️' },
];

export function BottomNav({ active, onChange }: { active: Tab; onChange: (tab: Tab) => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-ink/10 bg-cream/95 py-2 backdrop-blur">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs ${
            active === tab.id ? 'text-sage' : 'text-ink/40'
          }`}
        >
          <span className="text-lg">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
