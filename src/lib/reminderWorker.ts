// Talks to the Netlify Functions (netlify/functions/) that schedule and
// cancel exact-time push notifications via OneSignal's send_after. Keeps
// the OneSignal REST API key off the client — the functions hold it as a
// server-side secret.

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
    throw new Error(`Reminder function request failed: ${res.status}`);
  }
  return data;
}

export async function scheduleReminderPush(uid: string, fireAt: Date, title: string): Promise<string> {
  const data = await callWorker('/api/reminders/schedule', { uid, fireAt: fireAt.toISOString(), title });
  return data.notificationId as string;
}

export async function cancelReminderPush(notificationId: string): Promise<void> {
  await callWorker('/api/reminders/cancel', { notificationId });
}
