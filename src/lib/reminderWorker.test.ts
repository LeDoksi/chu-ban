import { describe, it, expect, afterEach, vi } from 'vitest';
import { scheduleReminderPush, cancelReminderPush } from './reminderWorker';

describe('scheduleReminderPush', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('posts uid, fireAt and title to the schedule endpoint and returns the notification id', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ notificationId: 'notif-1' }) });
    vi.stubGlobal('fetch', fetchSpy);

    const fireAt = new Date('2026-09-10T12:00:00Z');
    const result = await scheduleReminderPush('u1', fireAt, 'Полить цветы');

    expect(result).toBe('notif-1');
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, options] = fetchSpy.mock.calls[0];
    expect(url).toMatch(/\/api\/reminders\/schedule$/);
    expect(options.method).toBe('POST');
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(options.headers).toHaveProperty('X-Worker-Secret');
    expect(JSON.parse(options.body)).toEqual({ uid: 'u1', fireAt: fireAt.toISOString(), title: 'Полить цветы' });
  });

  it('throws when the worker responds with a non-2xx status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({ error: 'boom' }) }));

    await expect(scheduleReminderPush('u1', new Date(), 't')).rejects.toThrow('Reminder function request failed: 500');
  });
});

describe('cancelReminderPush', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('posts the notification id to the cancel endpoint', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    vi.stubGlobal('fetch', fetchSpy);

    await cancelReminderPush('notif-1');

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, options] = fetchSpy.mock.calls[0];
    expect(url).toMatch(/\/api\/reminders\/cancel$/);
    expect(JSON.parse(options.body)).toEqual({ notificationId: 'notif-1' });
  });

  it('throws when the worker responds with a non-2xx status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({ error: 'unauthorized' }) }));

    await expect(cancelReminderPush('notif-1')).rejects.toThrow('Reminder function request failed: 401');
  });
});
