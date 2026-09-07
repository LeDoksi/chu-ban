export const ONESIGNAL_API = 'https://api.onesignal.com/notifications';

export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': 'https://ledoksi.github.io',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Worker-Secret',
  };
}

export function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}

export function checkSecret(req) {
  return req.headers.get('X-Worker-Secret') === process.env.WORKER_SHARED_SECRET;
}
