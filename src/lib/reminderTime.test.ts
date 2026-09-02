import { describe, it, expect } from 'vitest';
import { presetToFireAt, isFireAtInFuture } from './reminderTime';

describe('presetToFireAt', () => {
  it('returns the deadline itself for onDeadline preset', () => {
    const deadline = new Date('2026-09-10T12:00:00Z');
    expect(presetToFireAt(deadline, 'onDeadline').getTime()).toBe(deadline.getTime());
  });

  it('subtracts one hour for hourBefore preset', () => {
    const deadline = new Date('2026-09-10T12:00:00Z');
    const result = presetToFireAt(deadline, 'hourBefore');
    expect(result.getTime()).toBe(deadline.getTime() - 60 * 60 * 1000);
  });

  it('subtracts one day for dayBefore preset', () => {
    const deadline = new Date('2026-09-10T12:00:00Z');
    const result = presetToFireAt(deadline, 'dayBefore');
    expect(result.getTime()).toBe(deadline.getTime() - 24 * 60 * 60 * 1000);
  });

  it('subtracts one week for weekBefore preset', () => {
    const deadline = new Date('2026-09-10T12:00:00Z');
    const result = presetToFireAt(deadline, 'weekBefore');
    expect(result.getTime()).toBe(deadline.getTime() - 7 * 24 * 60 * 60 * 1000);
  });
});

describe('isFireAtInFuture', () => {
  it('returns true when fireAt is after now', () => {
    const now = new Date('2026-09-01T00:00:00Z');
    const fireAt = new Date('2026-09-02T00:00:00Z');
    expect(isFireAtInFuture(fireAt, now)).toBe(true);
  });

  it('returns false when fireAt is before now', () => {
    const now = new Date('2026-09-02T00:00:00Z');
    const fireAt = new Date('2026-09-01T00:00:00Z');
    expect(isFireAtInFuture(fireAt, now)).toBe(false);
  });
});
