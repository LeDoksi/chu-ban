import { useState, useEffect } from 'react';
import { Sprout, Bell, Check } from 'lucide-react';
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
import {
  loadOneSignal,
  loginOneSignal,
  requestPushPermission,
  getPushPermission,
  type PushPermissionResult,
} from './onesignal/init';

type EditorState =
  | { mode: 'create'; parentEpicId: string | null; defaultDeadline: Date | null }
  | { mode: 'edit'; task: Task };

export function Shell({ uid }: { uid: string }) {
  const [tab, setTab] = useState<Tab>('tasks');
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [pushState, setPushState] = useState<PushPermissionResult | 'default' | 'loading'>('default');

  useEffect(() => {
    setPushState(getPushPermission());
  }, []);

  async function handleEnablePush() {
    setPushState('loading');
    setPushState(await requestPushPermission());
  }

  const { spheres, loaded } = useSpheres(uid);
  useEnsureDefaultSpheres(uid, spheres, loaded);
  const { tasks, setTaskStatus, setSubtaskStatus, closeEpic, deleteTask } = useTasks(uid);

  useEffect(() => {
    loadOneSignal();
    loginOneSignal(uid);
  }, [uid]);

  const openCreate = (parentEpicId: string | null = null) => {
    // ponytail: creating a subtask defaults its deadline to the epic's own —
    // matches the epic's timeline unless she deliberately changes it.
    const defaultDeadline = parentEpicId ? tasks.find((t) => t.id === parentEpicId)?.deadline ?? null : null;
    setEditor({ mode: 'create', parentEpicId, defaultDeadline });
  };
  const openEdit = (task: Task) => setEditor({ mode: 'edit', task });
  const closeEditor = () => setEditor(null);

  return (
    <div className="flex min-h-screen flex-col bg-cream pb-24">
      <header className="flex items-center gap-2 px-4 pb-2 pt-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sage/15">
          <Sprout size={16} strokeWidth={2} className="text-sage" />
        </div>
        <span className="text-[15px] font-semibold tracking-tight text-ink">Chu-ban</span>
      </header>
      <main className="flex-1 overflow-y-auto p-4 pt-0">
        {tab === 'tasks' && (
          <TasksPage
            tasks={tasks}
            spheres={spheres}
            onOpenCreate={openCreate}
            onOpenEdit={openEdit}
            onToggleDone={setTaskStatus}
            onToggleSubtask={setSubtaskStatus}
            onCloseEpic={closeEpic}
          />
        )}
        {tab === 'calendar' && <CalendarPage tasks={tasks} spheres={spheres} onOpenEdit={openEdit} />}
        {tab === 'stats' && <StatsPage tasks={tasks} spheres={spheres} />}
        {tab === 'settings' && (
          <div className="space-y-4">
            {pushState === 'granted' ? (
              <div className="flex w-full items-center justify-center gap-2 rounded-2xl bg-sage/15 px-4 py-3 text-sm font-medium text-sage">
                <Check size={18} strokeWidth={2} />
                Уведомления включены
              </div>
            ) : (
              <button
                onClick={handleEnablePush}
                disabled={pushState === 'loading'}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-dusty-blue/20 px-4 py-3 text-sm font-medium text-ink disabled:opacity-60"
              >
                <Bell size={18} strokeWidth={1.75} />
                {pushState === 'loading' ? 'Запрашиваем разрешение…' : 'Включить уведомления'}
              </button>
            )}
            {pushState === 'unsupported' && (
              <p className="text-xs text-ink/50">
                Этот браузер не поддерживает уведомления. На iPhone: добавь Chu-ban на экран «Домой» через
                кнопку «Поделиться» в Safari — и открой его оттуда.
              </p>
            )}
            {pushState === 'denied' && (
              <p className="text-xs text-ink/50">
                Доступ к уведомлениям запрещён. Разреши их для сайта в настройках браузера, чтобы включить.
              </p>
            )}
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
            defaultDeadline={editor.mode === 'create' ? editor.defaultDeadline : null}
            onDone={closeEditor}
            onDelete={editor.mode === 'edit' ? () => deleteTask(editor.task.id).then(closeEditor) : undefined}
          />
        </Modal>
      )}
    </div>
  );
}

export type { EditorState };
