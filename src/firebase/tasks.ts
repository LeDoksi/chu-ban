import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import type { Task, TaskStatus, TaskType } from '../types';
import { subtaskIdsToClose, subtaskIdsOf } from '../lib/epicCascade';

export interface NewTaskInput {
  type: TaskType;
  sphereId: string;
  title: string;
  description: string | null;
  deadline: Date | null;
  parentEpicId: string | null;
}

function tasksCol(uid: string) {
  return collection(db, 'users', uid, 'tasks');
}

function toTask(id: string, data: Record<string, unknown>): Task {
  return {
    id,
    type: data.type as TaskType,
    sphereId: data.sphereId as string,
    title: data.title as string,
    description: (data.description as string | null) ?? null,
    deadline: data.deadline ? (data.deadline as Timestamp).toDate() : null,
    status: data.status as TaskStatus,
    parentEpicId: (data.parentEpicId as string | null) ?? null,
    createdAt: (data.createdAt as Timestamp).toDate(),
    completedAt: data.completedAt ? (data.completedAt as Timestamp).toDate() : null,
  };
}

export function subscribeTasks(uid: string, callback: (tasks: Task[]) => void): () => void {
  const q = query(tasksCol(uid), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => toTask(d.id, d.data())));
  });
}

export async function addTask(uid: string, input: NewTaskInput): Promise<string> {
  const ref = await addDoc(tasksCol(uid), {
    type: input.type,
    sphereId: input.sphereId,
    title: input.title,
    description: input.description,
    deadline: input.deadline ? Timestamp.fromDate(input.deadline) : null,
    status: 'open',
    parentEpicId: input.parentEpicId,
    createdAt: Timestamp.now(),
    completedAt: null,
  });
  return ref.id;
}

export async function updateTask(uid: string, taskId: string, changes: Partial<NewTaskInput>): Promise<void> {
  const data: Record<string, unknown> = { ...changes };
  if ('deadline' in changes) {
    data.deadline = changes.deadline ? Timestamp.fromDate(changes.deadline) : null;
  }
  await updateDoc(doc(db, 'users', uid, 'tasks', taskId), data);
}

export async function deleteTask(uid: string, taskId: string, allTasks: Task[]): Promise<void> {
  const subtaskIds = subtaskIdsOf(allTasks, taskId);
  if (subtaskIds.length === 0) {
    await deleteDoc(doc(db, 'users', uid, 'tasks', taskId));
    return;
  }
  const batch = writeBatch(db);
  batch.delete(doc(db, 'users', uid, 'tasks', taskId));
  for (const subtaskId of subtaskIds) {
    batch.delete(doc(db, 'users', uid, 'tasks', subtaskId));
  }
  await batch.commit();
}

export async function setTaskStatus(uid: string, taskId: string, status: TaskStatus): Promise<void> {
  await updateDoc(doc(db, 'users', uid, 'tasks', taskId), {
    status,
    completedAt: status === 'done' ? Timestamp.now() : null,
  });
}

export async function setSubtaskStatus(
  uid: string,
  allTasks: Task[],
  subtaskId: string,
  status: TaskStatus
): Promise<void> {
  const subtask = allTasks.find((t) => t.id === subtaskId);
  const batch = writeBatch(db);
  const now = Timestamp.now();
  batch.update(doc(db, 'users', uid, 'tasks', subtaskId), {
    status,
    completedAt: status === 'done' ? now : null,
  });
  // Reopening a subtask whose epic was already closed must bring the epic
  // back to active — otherwise the subtask has nowhere to render (its epic
  // is filtered out of the open list) and appears to just vanish.
  if (status === 'open' && subtask?.parentEpicId) {
    const epic = allTasks.find((t) => t.id === subtask.parentEpicId);
    if (epic?.status === 'done') {
      batch.update(doc(db, 'users', uid, 'tasks', epic.id), { status: 'open', completedAt: null });
    }
  }
  await batch.commit();
}

export async function closeEpicWithSubtasks(uid: string, epicId: string, allTasks: Task[]): Promise<void> {
  const batch = writeBatch(db);
  const now = Timestamp.now();
  batch.update(doc(db, 'users', uid, 'tasks', epicId), { status: 'done', completedAt: now });
  for (const subtaskId of subtaskIdsToClose(allTasks, epicId)) {
    batch.update(doc(db, 'users', uid, 'tasks', subtaskId), { status: 'done', completedAt: now });
  }
  await batch.commit();
}
