export type SphereId = string;

export interface Sphere {
  id: string;
  name: string;
  color: string;
  order: number;
}

export type TaskType = 'task' | 'epic';
export type TaskStatus = 'open' | 'done';

export interface Task {
  id: string;
  type: TaskType;
  sphereId: string;
  title: string;
  description: string | null;
  deadline: Date | null;
  status: TaskStatus;
  parentEpicId: string | null;
  createdAt: Date;
  completedAt: Date | null;
}

export type ReminderPreset = 'onDeadline' | 'hourBefore' | 'dayBefore' | 'weekBefore';

export interface Reminder {
  id: string;
  uid: string;
  taskId: string;
  fireAt: Date;
  sent: boolean;
  createdAt: Date;
}

export type Tab = 'tasks' | 'calendar' | 'stats' | 'settings';

export const ALLOWED_EMAILS = ['dashach98@gmail.com', 'shakov.georgy@gmail.com'] as const;

export const DEFAULT_SPHERES: Array<{ name: string; color: string }> = [
  { name: 'Работа', color: '#7C9885' },
  { name: 'Отношения', color: '#E8927C' },
  { name: 'Дом', color: '#D4A373' },
  { name: 'Путешествия', color: '#6C9BCF' },
  { name: 'Здоровье', color: '#A8DADC' },
  { name: 'Личное', color: '#C8A2C8' },
];

export const REMINDER_PRESET_LABELS: Record<ReminderPreset, string> = {
  onDeadline: 'В день дедлайна',
  hourBefore: 'За час',
  dayBefore: 'За день',
  weekBefore: 'За неделю',
};
