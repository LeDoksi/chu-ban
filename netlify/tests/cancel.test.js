import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import cancel from './cancel.js';

const SECRET = 'shh';

function req(body, { method = 'POST', secret = SECRET } = {}) {
  return new Request('https://example.test/api/reminders/cancel', {
    method,
    headers: { 'Content-Type': 'application/json', 'X-Worker-Secret': secret },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

describe('cancel function', () => {
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
    const res = await cancel(req(undefined, { method: 'OPTIONS' }));
    expect(res.status).toBe(200);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('rejects requests with a wrong worker secret', async () => {
    const res = await cancel(req({ notificationId: 'n1' }, { secret: 'wrong' }));
    expect(res.status).toBe(401);
  });

  it('rejects a body missing notificationId', async () => {
    const res = await cancel(req({}));
    expect(res.status).toBe(400);
  });

  it('deletes the OneSignal notification by id', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchSpy);

    const res = await cancel(req({ notificationId: 'notif-1' }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, options] = fetchSpy.mock.calls[0];
    expect(url).toBe('https://api.onesignal.com/notifications/notif-1?app_id=app-123');
    expect(options.method).toBe('DELETE');
    expect(options.headers.Authorization).toBe('Key rest-key');
  });

  it('bubbles up a OneSignal error as the same status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404, json: async () => ({ error: 'not found' }) }));

    const res = await cancel(req({ notificationId: 'missing' }));

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: { error: 'not found' } });
  });

  it('falls back to an empty error body when OneSignal response has no JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => { throw new Error('no body'); } }));

    const res = await cancel(req({ notificationId: 'missing' }));

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: {} });
  });
});
