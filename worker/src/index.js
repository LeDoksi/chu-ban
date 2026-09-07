const ALLOWED_ORIGIN = 'https://ledoksi.github.io';
const ONESIGNAL_API = 'https://api.onesignal.com/notifications';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Worker-Secret',
  };
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    if (request.headers.get('X-Worker-Secret') !== env.WORKER_SHARED_SECRET) {
      return json({ error: 'unauthorized' }, 401);
    }

    const url = new URL(request.url);

    if (request.method === 'POST' && url.pathname === '/schedule') {
      const { uid, fireAt, title } = await request.json();
      if (!uid || !fireAt || !title) {
        return json({ error: 'uid, fireAt and title are required' }, 400);
      }

      const res = await fetch(ONESIGNAL_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Key ${env.ONESIGNAL_REST_API_KEY}`,
        },
        body: JSON.stringify({
          app_id: env.ONESIGNAL_APP_ID,
          target_channel: 'push',
          include_aliases: { external_id: [uid] },
          headings: { en: 'Chu-ban', ru: 'Chu-ban' },
          contents: { en: title, ru: `Напоминание: «${title}»` },
          send_after: fireAt,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        return json({ error: data }, res.status);
      }
      return json({ notificationId: data.id });
    }

    if (request.method === 'POST' && url.pathname === '/cancel') {
      const { notificationId } = await request.json();
      if (!notificationId) {
        return json({ error: 'notificationId is required' }, 400);
      }
      const res = await fetch(
        `${ONESIGNAL_API}/${notificationId}?app_id=${env.ONESIGNAL_APP_ID}`,
        { method: 'DELETE', headers: { Authorization: `Key ${env.ONESIGNAL_REST_API_KEY}` } }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return json({ error: data }, res.status);
      }
      return json({ ok: true });
    }

    return json({ error: 'not found' }, 404);
  },
};
