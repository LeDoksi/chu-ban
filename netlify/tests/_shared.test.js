import { describe, it, expect, afterEach, vi } from 'vitest';
import { corsHeaders, json, checkSecret } from '../functions/_shared.js';

describe('corsHeaders', () => {
  it('allows the deployed origin and the worker-secret header', () => {
    const headers = corsHeaders();
    expect(headers['Access-Control-Allow-Origin']).toBe('https://ledoksi.github.io');
    expect(headers['Access-Control-Allow-Headers']).toContain('X-Worker-Secret');
  });
});

describe('json', () => {
  it('serializes the body and defaults to status 200', async () => {
    const res = json({ ok: true });
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('application/json');
    expect(await res.json()).toEqual({ ok: true });
  });

  it('honors an explicit status', () => {
    const res = json({ error: 'nope' }, 400);
    expect(res.status).toBe(400);
  });
});

describe('checkSecret', () => {
  const ORIGINAL = process.env.WORKER_SHARED_SECRET;
  afterEach(() => {
    process.env.WORKER_SHARED_SECRET = ORIGINAL;
  });

  it('accepts a request whose header matches the env secret', () => {
    process.env.WORKER_SHARED_SECRET = 'topsecret';
    const req = new Request('https://example.test', { headers: { 'X-Worker-Secret': 'topsecret' } });
    expect(checkSecret(req)).toBe(true);
  });

  it('rejects a mismatched or missing header', () => {
    process.env.WORKER_SHARED_SECRET = 'topsecret';
    expect(checkSecret(new Request('https://example.test', { headers: { 'X-Worker-Secret': 'wrong' } }))).toBe(false);
    expect(checkSecret(new Request('https://example.test'))).toBe(false);
  });
});
