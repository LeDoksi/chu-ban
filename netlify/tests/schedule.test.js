import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import schedule from '../functions/schedule.js';

const SECRET = 'shh';

function req(body, { method = 'POST', secret = SECRET } = {}) {
  return new Request('https://example.test/api/reminders/schedule', {
    method,
    headers: { 'Content-Type': 'application/json', 'X-Worker-Secret': secret },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

describe('schedule function', () => {
  const ORIGINAL_ENV = { ...process.env };

  beforeEach(() => {
    process.env.WORKER_SHARED_SECRET = SECRET;
    process.env.ONESIGNAL_APP_ID = 'app-123';
    process.env.ONESIGNAL_REST_API_KEY = 'rest-key';
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.unstubAllGlobals();
  });

  it('answers CORS preflight without touching OneSignal', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const res = await schedule(req(undefined, { method: 'OPTIONS' }));
    expect(res.status).toBe(200);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('rejects requests with a wrong or missing worker secret', async () => {
    const res = await schedule(req({ uid: 'u1', fireAt: '2026-09-10T12:00:00Z', title: 't' }, { secret: 'wrong' }));
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'unauthorized' });
  });

  it('rejects a body missing required fields', async () => {
    const res = await schedule(req({ uid: 'u1' }));
    expect(res.status).toBe(400);
  });

  it('schedules a OneSignal push with send_after and returns its id', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 'notif-1' }) });
    vi.stubGlobal('fetch', fetchSpy);

    const res = await schedule(req({ uid: 'u1', fireAt: '2026-09-10T12:00:00Z', title: 'Полить цветы' }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ notificationId: 'notif-1' });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, options] = fetchSpy.mock.calls[0];
    expect(url).toBe('https://api.onesignal.com/notifications');
    expect(options.headers.Authorization).toBe('Key rest-key');
    const sentBody = JSON.parse(options.body);
    expect(sentBody.app_id).toBe('app-123');
    expect(sentBody.include_aliases).toEqual({ external_id: ['u1'] });
    expect(sentBody.send_after).toBe('2026-09-10T12:00:00Z');
    expect(sentBody.contents.ru).toContain('Полить цветы');
  });

  it('bubbles up a OneSignal error as the same status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 429, json: async () => ({ errors: ['rate limited'] }) }));

    const res = await schedule(req({ uid: 'u1', fireAt: '2026-09-10T12:00:00Z', title: 't' }));

    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ error: { errors: ['rate limited'] } });
  });
});
