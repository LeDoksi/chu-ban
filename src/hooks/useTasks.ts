import { useEffect, useState } from 'react';
import type { Task, TaskStatus } from '../types';
import {
  subscribeTasks,
  addTask as addTaskFn,
  updateTask as updateTaskFn,
  deleteTask as deleteTaskFn,
  setTaskStatus as setTaskStatusFn,
  setSubtaskStatus as setSubtaskStatusFn,
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
    deleteTask: (taskId: string) => deleteTaskFn(uid, taskId, tasks),
    setTaskStatus: (taskId: string, status: TaskStatus) => setTaskStatusFn(uid, taskId, status),
    setSubtaskStatus: (subtaskId: string, status: TaskStatus) => setSubtaskStatusFn(uid, tasks, subtaskId, status),
    closeEpic: (epicId: string) => closeEpicWithSubtasks(uid, epicId, tasks),
  };
}
