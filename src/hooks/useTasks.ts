import { useEffect, useState } from 'react';
import type { Task, TaskStatus } from '../types';
import {
  subscribeTasks,
  addTask as addTaskFn,
  updateTask as updateTaskFn,
  deleteTask as deleteTaskFn,
  setTaskStatus as setTaskStatusFn,
  closeEpicWithSubtasks,
  type NewTaskInput,
} from '../firebase/tasks';

export function useTasks(uid: string) {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    return subscribeTasks(uid, setTasks);
  }, [uid]);

  return {
    tasks,
    addTask: (input: NewTaskInput) => addTaskFn(uid, input),
    updateTask: (taskId: string, changes: Partial<NewTaskInput>) => updateTaskFn(uid, taskId, changes),
    deleteTask: (taskId: string) => deleteTaskFn(uid, taskId),
    setTaskStatus: (taskId: string, status: TaskStatus) => setTaskStatusFn(uid, taskId, status),
    closeEpic: (epicId: string) => closeEpicWithSubtasks(uid, epicId, tasks),
  };
}
