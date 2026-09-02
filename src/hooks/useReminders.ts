import { useEffect, useState } from 'react';
import type { Reminder } from '../types';
import {
  subscribeRemindersForTask,
  addReminder as addReminderFn,
  deleteReminder as deleteReminderFn,
} from '../firebase/reminders';

export function useReminders(uid: string, taskId: string | null) {
  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    if (!taskId) {
      setReminders([]);
      return;
    }
    return subscribeRemindersForTask(uid, taskId, setReminders);
  }, [uid, taskId]);

  return {
    reminders,
    addReminder: (fireAt: Date) => addReminderFn(uid, { taskId: taskId!, fireAt }),
    deleteReminder: (reminderId: string) => deleteReminderFn(uid, reminderId),
  };
}
