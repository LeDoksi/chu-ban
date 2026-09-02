import type { ReminderPreset } from '../types';

const PRESET_OFFSET_MS: Record<ReminderPreset, number> = {
  onDeadline: 0,
  hourBefore: 60 * 60 * 1000,
  dayBefore: 24 * 60 * 60 * 1000,
  weekBefore: 7 * 24 * 60 * 60 * 1000,
};

export function presetToFireAt(deadline: Date, preset: ReminderPreset): Date {
  return new Date(deadline.getTime() - PRESET_OFFSET_MS[preset]);
}

export function isFireAtInFuture(fireAt: Date, now: Date = new Date()): boolean {
  return fireAt.getTime() > now.getTime();
}
