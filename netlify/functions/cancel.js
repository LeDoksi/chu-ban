import { ONESIGNAL_API, corsHeaders, json, checkSecret } from './_shared.js';

export default async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders() });
  if (!checkSecret(req)) return json({ error: 'unauthorized' }, 401);

  const { notificationId } = await req.json();
  if (!notificationId) return json({ error: 'notificationId is required' }, 400);

  const res = await fetch(
    `${ONESIGNAL_API}/${notificationId}?app_id=${process.env.ONESIGNAL_APP_ID}`,
    { method: 'DELETE', headers: { Authorization: `Key ${process.env.ONESIGNAL_REST_API_KEY}` } }
  );
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return json({ error: data }, res.status);
  }
  return json({ ok: true });
};

export const config = { path: '/api/reminders/cancel' };
