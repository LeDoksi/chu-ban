import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import type { Reminder } from '../types';
import { scheduleReminderPush, cancelReminderPush } from '../lib/reminderWorker';

const remindersCol = collection(db, 'reminders');

export interface NewReminderInput {
  taskId: string;
  fireAt: Date;
  title: string;
}

function toReminder(id: string, data: Record<string, unknown>): Reminder {
  return {
    id,
    uid: data.uid as string,
    taskId: data.taskId as string,
    fireAt: (data.fireAt as Timestamp).toDate(),
    notificationId: data.notificationId as string,
    createdAt: (data.createdAt as Timestamp).toDate(),
  };
}

export function subscribeRemindersForTask(
  uid: string,
  taskId: string,
  callback: (reminders: Reminder[]) => void
): () => void {
  const q = query(
    remindersCol,
    where('uid', '==', uid),
    where('taskId', '==', taskId),
    orderBy('fireAt')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => toReminder(d.id, d.data())));
  });
}

export async function addReminder(uid: string, input: NewReminderInput): Promise<void> {
  const notificationId = await scheduleReminderPush(uid, input.fireAt, input.title);
  await addDoc(remindersCol, {
    uid,
    taskId: input.taskId,
    fireAt: Timestamp.fromDate(input.fireAt),
    notificationId,
    createdAt: Timestamp.now(),
  });
}

export async function deleteReminder(reminderId: string, notificationId: string): Promise<void> {
  await cancelReminderPush(notificationId).catch(() => {});
  await deleteDoc(doc(db, 'reminders', reminderId));
}

// Best-effort cleanup so a completed or deleted task doesn't still ping her
// with a reminder later — one network failure here shouldn't block the task
// mutation itself, so failures are swallowed.
export async function cancelRemindersForTask(uid: string, taskId: string): Promise<void> {
  const snap = await getDocs(query(remindersCol, where('uid', '==', uid), where('taskId', '==', taskId)));
  await Promise.all(
    snap.docs.map(async (d) => {
      const notificationId = d.data().notificationId as string | undefined;
      if (notificationId) await cancelReminderPush(notificationId).catch(() => {});
      await deleteDoc(d.ref).catch(() => {});
    })
  );
}
