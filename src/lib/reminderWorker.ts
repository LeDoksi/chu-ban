// Talks to the Cloudflare Worker (worker/) that schedules and cancels
// exact-time push notifications via OneSignal's send_after. Keeps the
// OneSignal REST API key off the client — the worker holds it as a secret.

const WORKER_URL = import.meta.env.VITE_REMINDER_WORKER_URL;
const WORKER_SECRET = import.meta.env.VITE_REMINDER_WORKER_SECRET;

async function callWorker(path: string, body: unknown): Promise<Record<string, unknown>> {
  const res = await fetch(`${WORKER_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Worker-Secret': WORKER_SECRET,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Reminder worker request failed: ${res.status}`);
  }
  return data;
}

export async function scheduleReminderPush(uid: string, fireAt: Date, title: string): Promise<string> {
  const data = await callWorker('/schedule', { uid, fireAt: fireAt.toISOString(), title });
  return data.notificationId as string;
}

export async function cancelReminderPush(notificationId: string): Promise<void> {
  await callWorker('/cancel', { notificationId });
}
