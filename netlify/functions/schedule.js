import { ONESIGNAL_API, corsHeaders, json, checkSecret } from './_shared.js';

export default async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders() });
  if (!checkSecret(req)) return json({ error: 'unauthorized' }, 401);

  const { uid, fireAt, title } = await req.json();
  if (!uid || !fireAt || !title) {
    return json({ error: 'uid, fireAt and title are required' }, 400);
  }

  const res = await fetch(ONESIGNAL_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Key ${process.env.ONESIGNAL_REST_API_KEY}`,
    },
    body: JSON.stringify({
      app_id: process.env.ONESIGNAL_APP_ID,
      target_channel: 'push',
      include_aliases: { external_id: [uid] },
      headings: { en: 'Chu-ban', ru: 'Chu-ban' },
      contents: { en: title, ru: `Напоминание: «${title}»` },
      send_after: fireAt,
    }),
  });
  const data = await res.json();
  if (!res.ok) return json({ error: data }, res.status);
  return json({ notificationId: data.id });
};

export const config = { path: '/api/reminders/schedule' };
