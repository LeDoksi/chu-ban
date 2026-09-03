import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
const oneSignalAppId = process.env.ONESIGNAL_APP_ID;
const oneSignalApiKey = process.env.ONESIGNAL_REST_API_KEY;

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function sendPush(uid, body) {
  const response = await fetch('https://api.onesignal.com/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Key ${oneSignalApiKey}`,
    },
    body: JSON.stringify({
      app_id: oneSignalAppId,
      target_channel: 'push',
      include_aliases: { external_id: [uid] },
      headings: { en: 'Chu-ban', ru: 'Chu-ban' },
      contents: { en: body, ru: body },
    }),
  });
  if (!response.ok) {
    throw new Error(`OneSignal request failed: ${response.status} ${await response.text()}`);
  }
}

async function run() {
  const now = Timestamp.now();
  const dueSnap = await db
    .collection('reminders')
    .where('sent', '==', false)
    .where('fireAt', '<=', now)
    .get();

  console.log(`Found ${dueSnap.size} due reminder(s).`);

  for (const reminderDoc of dueSnap.docs) {
    const reminder = reminderDoc.data();
    try {
      const taskSnap = await db.doc(`users/${reminder.uid}/tasks/${reminder.taskId}`).get();
      if (!taskSnap.exists) {
        await reminderDoc.ref.update({ sent: true });
        continue;
      }
      const task = taskSnap.data();
      await sendPush(reminder.uid, `Напоминание: «${task.title}»`);
      await reminderDoc.ref.update({ sent: true });
      console.log(`Sent reminder ${reminderDoc.id} for task ${reminder.taskId}`);
    } catch (error) {
      console.error(`Failed to send reminder ${reminderDoc.id}:`, error);
    }
  }
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
