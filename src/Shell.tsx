import { useState, useEffect } from 'react';
import type { Tab, Task } from './types';
import { useSpheres } from './hooks/useSpheres';
import { useEnsureDefaultSpheres } from './hooks/useEnsureDefaultSpheres';
import { useTasks } from './hooks/useTasks';
import { BottomNav } from './components/BottomNav';
import { Modal } from './components/Modal';
import { TaskForm } from './components/TaskForm';
import { TasksPage } from './pages/TasksPage';
import { CalendarPage } from './pages/CalendarPage';
import { StatsPage } from './pages/StatsPage';
import { SettingsPage } from './pages/SettingsPage';
import { loadOneSignal, loginOneSignal, requestPushPermission } from './onesignal/init';

type EditorState =
  | { mode: 'create'; parentEpicId: string | null }
  | { mode: 'edit'; task: Task };

export function Shell({ uid }: { uid: string }) {
  const [tab, setTab] = useState<Tab>('tasks');
  const [editor, setEditor] = useState<EditorState | null>(null);

  const { spheres, loaded } = useSpheres(uid);
  useEnsureDefaultSpheres(uid, spheres, loaded);
  const { tasks, setTaskStatus, closeEpic } = useTasks(uid);

  useEffect(() => {
    loadOneSignal();
    loginOneSignal(uid);
  }, [uid]);

  const openCreate = (parentEpicId: string | null = null) => setEditor({ mode: 'create', parentEpicId });
  const openEdit = (task: Task) => setEditor({ mode: 'edit', task });
  const closeEditor = () => setEditor(null);

  return (
    <div className="flex min-h-screen flex-col bg-cream pb-24">
      <main className="flex-1 overflow-y-auto p-4">
        {tab === 'tasks' && (
          <TasksPage
            tasks={tasks}
            spheres={spheres}
            onOpenCreate={openCreate}
            onOpenEdit={openEdit}
            onToggleDone={setTaskStatus}
            onCloseEpic={closeEpic}
          />
        )}
        {tab === 'calendar' && <CalendarPage tasks={tasks} spheres={spheres} onOpenEdit={openEdit} />}
        {tab === 'stats' && <StatsPage tasks={tasks} spheres={spheres} />}
        {tab === 'settings' && (
          <div className="space-y-4">
            <button
              onClick={() => requestPushPermission()}
              className="w-full rounded-2xl bg-dusty-blue/20 px-4 py-3 text-sm font-medium text-ink"
            >
              🔔 Включить уведомления
            </button>
            <SettingsPage uid={uid} spheres={spheres} />
          </div>
        )}
      </main>
      <BottomNav active={tab} onChange={setTab} />
      {editor && (
        <Modal onClose={closeEditor}>
          <TaskForm
            uid={uid}
            spheres={spheres}
            mode={editor.mode}
            initialTask={editor.mode === 'edit' ? editor.task : undefined}
            parentEpicId={editor.mode === 'create' ? editor.parentEpicId : editor.task.parentEpicId}
            onDone={closeEditor}
          />
        </Modal>
      )}
    </div>
  );
}

export type { EditorState };
