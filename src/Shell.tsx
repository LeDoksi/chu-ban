import { useState } from 'react';
import type { Tab, Task } from './types';
import { useSpheres } from './hooks/useSpheres';
import { useEnsureDefaultSpheres } from './hooks/useEnsureDefaultSpheres';
import { useTasks } from './hooks/useTasks';
import { BottomNav } from './components/BottomNav';
import { Modal } from './components/Modal';
import { TaskForm } from './components/TaskForm';

type EditorState =
  | { mode: 'create'; parentEpicId: string | null }
  | { mode: 'edit'; task: Task };

export function Shell({ uid }: { uid: string }) {
  const [tab, setTab] = useState<Tab>('tasks');
  const [editor, setEditor] = useState<EditorState | null>(null);

  const { spheres, loaded } = useSpheres(uid);
  useEnsureDefaultSpheres(uid, spheres, loaded);
  const { tasks, setTaskStatus, closeEpic } = useTasks(uid);

  const openCreate = (parentEpicId: string | null = null) => setEditor({ mode: 'create', parentEpicId });
  const openEdit = (task: Task) => setEditor({ mode: 'edit', task });
  const closeEditor = () => setEditor(null);

  // ponytail: setTaskStatus/closeEpic/openEdit aren't consumed until TasksPage
  // (task 16) replaces the placeholder below. noUnusedLocals would otherwise
  // fail the build; drop these once real usage lands.
  void setTaskStatus;
  void closeEpic;
  void openEdit;

  return (
    <div className="flex min-h-screen flex-col bg-cream pb-24">
      <main className="flex-1 overflow-y-auto p-4">
        {tab === 'tasks' && (
          <div className="space-y-2 text-ink">
            <p>Задачи: {tasks.length}</p>
            <button
              onClick={() => openCreate(null)}
              className="rounded-full bg-sage px-4 py-2 text-sm font-medium text-white"
            >
              + Новая задача
            </button>
          </div>
        )}
        {tab === 'calendar' && <p className="text-ink">Календарь скоро здесь появится.</p>}
        {tab === 'stats' && <p className="text-ink">Статистика скоро здесь появится.</p>}
        {tab === 'settings' && <p className="text-ink">Настройки скоро здесь появятся.</p>}
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

// Re-exported so TasksPage/CalendarPage/StatsPage/SettingsPage tasks can wire
// into the same closeEpic/setTaskStatus/openEdit/openCreate without redefining them.
export type { EditorState };
