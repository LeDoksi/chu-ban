import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import type { Reminder } from '../types';

const remindersCol = collection(db, 'reminders');

export interface NewReminderInput {
  taskId: string;
  fireAt: Date;
}

function toReminder(id: string, data: Record<string, unknown>): Reminder {
  return {
    id,
    uid: data.uid as string,
    taskId: data.taskId as string,
    fireAt: (data.fireAt as Timestamp).toDate(),
    sent: data.sent as boolean,
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
  await addDoc(remindersCol, {
    uid,
    taskId: input.taskId,
    fireAt: Timestamp.fromDate(input.fireAt),
    sent: false,
    createdAt: Timestamp.now(),
  });
}

export async function deleteReminder(_uid: string, reminderId: string): Promise<void> {
  await deleteDoc(doc(db, 'reminders', reminderId));
}
