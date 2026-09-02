# Chu-ban Task Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy Chu-ban, a mobile-first, anxiety-safe household task tracker for two people, with life-sphere categorization, epics/subtasks, a calendar view, supportive stats, and scheduled push reminders — hosted for free on GitHub Pages.

**Architecture:** React + Vite + TypeScript PWA talking directly to Firebase (Firestore + Google Auth) from the client. A GitHub Actions cron job (not a paid backend) reads due reminders from Firestore every 10 minutes and delivers them via the OneSignal REST API, keeping all secrets out of the public client bundle.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS v4, Firebase (Auth + Firestore, Spark/free plan), OneSignal Web Push (free plan), vite-plugin-pwa, Vitest, GitHub Actions, GitHub Pages, firebase-admin (CI script only).

**Spec:** [docs/superpowers/specs/2026-09-02-chuban-task-tracker-design.md](../specs/2026-09-02-chuban-task-tracker-design.md)

## Global Constraints

- Allowed sign-in emails, hardcoded (no admin UI): `dashach98@gmail.com`, `shakov.georgy@gmail.com`.
- Every paid service is off the table — user only has a Russian card. Only use tiers that need no card on file: Firebase Spark plan, OneSignal free plan, GitHub Actions/Pages on a **public** repo.
- Overdue-task copy must stay soft and actionable, never shaming. Canonical copy: "Дедлайн подошёл. Возьмись за задачу — или просто передвинь срок, ничего страшного 🌿" with "Выполнить" / "Перенести срок" actions inline.
- Stats never show streaks or negative/miss-tracking numbers — only positive counts, sphere breakdowns, and milestones.
- Repo name: `chu-ban`, public. Vite `base` and the PWA manifest `start_url`/`scope` must all be `/chu-ban/`.
- UI language: Russian throughout.

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `.gitignore`
- Create: `src/main.tsx`
- Create: `src/index.css`
- Create: `src/App.tsx`

**Interfaces:**
- Produces: `App` default export from `src/App.tsx` (placeholder, replaced fully in Task 7).

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "chu-ban",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "firebase": "^11.0.0",
    "firebase-admin": "^12.6.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.0",
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.2",
    "sharp": "^0.33.5",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.6.3",
    "vite": "^5.4.10",
    "vite-plugin-pwa": "^0.20.5",
    "vitest": "^2.1.4",
    "workbox-build": "^7.1.1",
    "workbox-precaching": "^7.1.1"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable", "WebWorker"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["vite/client", "vite-plugin-pwa/client"]
  },
  "include": ["src", "vite.config.ts"]
}
```

- [ ] **Step 3: Create `vite.config.ts`**

```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: '/chu-ban/',
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'node',
  },
});
```

- [ ] **Step 4: Create `index.html`**

```html
<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#7C9885" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet" />
    <title>Chu-ban</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Create `.gitignore`**

```
node_modules
dist
dev-dist
.env
.env.local
*.local
```

- [ ] **Step 6: Create `src/index.css`**

```css
@import "tailwindcss";

@theme {
  --color-cream: #faf6f0;
  --color-ink: #2e2a26;
  --color-sage: #7c9885;
  --color-terracotta: #e8927c;
  --color-gold: #d4a373;
  --color-dusty-blue: #6c9bcf;
  --color-pale-teal: #a8dadc;
  --color-lavender: #c8a2c8;
  --font-sans: "Nunito", ui-sans-serif, system-ui, sans-serif;
}

body {
  font-family: var(--font-sans);
}
```

- [ ] **Step 7: Create `src/main.tsx`**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 8: Create `src/App.tsx` (placeholder, replaced in Task 7)**

```tsx
export default function App() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream text-ink">
      Chu-ban
    </div>
  );
}
```

- [ ] **Step 9: Install and verify**

Run:
```bash
npm install
npm run typecheck
npm run dev
```
Expected: `typecheck` passes with no errors; the dev server starts and opening the printed local URL shows "Chu-ban" centered on a cream background.

- [ ] **Step 10: Commit**

```bash
git add package.json tsconfig.json vite.config.ts index.html .gitignore src
git commit -m "chore: scaffold Vite + React + TS + Tailwind project"
```

---

## Task 2: Domain Types and Constants

**Files:**
- Create: `src/types.ts`

**Interfaces:**
- Produces: `Sphere`, `Task`, `TaskType`, `TaskStatus`, `Reminder`, `ReminderPreset`, `Tab` types; `ALLOWED_EMAILS`, `DEFAULT_SPHERES`, `REMINDER_PRESET_LABELS` constants — imported by every later module.

- [ ] **Step 1: Create `src/types.ts`**

```ts
export type SphereId = string;

export interface Sphere {
  id: string;
  name: string;
  color: string;
  order: number;
}

export type TaskType = 'task' | 'epic';
export type TaskStatus = 'open' | 'done';

export interface Task {
  id: string;
  type: TaskType;
  sphereId: string;
  title: string;
  description: string | null;
  deadline: Date | null;
  status: TaskStatus;
  parentEpicId: string | null;
  createdAt: Date;
  completedAt: Date | null;
}

export type ReminderPreset = 'onDeadline' | 'hourBefore' | 'dayBefore' | 'weekBefore';

export interface Reminder {
  id: string;
  uid: string;
  taskId: string;
  fireAt: Date;
  sent: boolean;
  createdAt: Date;
}

export type Tab = 'tasks' | 'calendar' | 'stats' | 'settings';

export const ALLOWED_EMAILS = ['dashach98@gmail.com', 'shakov.georgy@gmail.com'] as const;

export const DEFAULT_SPHERES: Array<{ name: string; color: string }> = [
  { name: 'Работа', color: '#7C9885' },
  { name: 'Отношения', color: '#E8927C' },
  { name: 'Дом', color: '#D4A373' },
  { name: 'Путешествия', color: '#6C9BCF' },
  { name: 'Здоровье', color: '#A8DADC' },
  { name: 'Личное', color: '#C8A2C8' },
];

export const REMINDER_PRESET_LABELS: Record<ReminderPreset, string> = {
  onDeadline: 'В день дедлайна',
  hourBefore: 'За час',
  dayBefore: 'За день',
  weekBefore: 'За неделю',
};
```

- [ ] **Step 2: Verify**

Run: `npm run typecheck`
Expected: PASS (no consumers yet, so this only checks the file parses).

- [ ] **Step 3: Commit**

```bash
git add src/types.ts
git commit -m "feat: add domain types and constants"
```

---

## Task 3: Reminder Time Calculation (pure logic + test)

**Files:**
- Create: `src/lib/reminderTime.ts`
- Test: `src/lib/reminderTime.test.ts`

**Interfaces:**
- Consumes: `ReminderPreset` from `src/types.ts`.
- Produces: `presetToFireAt(deadline: Date, preset: ReminderPreset): Date`, `isFireAtInFuture(fireAt: Date, now?: Date): boolean` — used by `ReminderPicker` (Task 13).

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/reminderTime.test.ts
import { describe, it, expect } from 'vitest';
import { presetToFireAt, isFireAtInFuture } from './reminderTime';

describe('presetToFireAt', () => {
  it('returns the deadline itself for onDeadline preset', () => {
    const deadline = new Date('2026-09-10T12:00:00Z');
    expect(presetToFireAt(deadline, 'onDeadline').getTime()).toBe(deadline.getTime());
  });

  it('subtracts one hour for hourBefore preset', () => {
    const deadline = new Date('2026-09-10T12:00:00Z');
    const result = presetToFireAt(deadline, 'hourBefore');
    expect(result.getTime()).toBe(deadline.getTime() - 60 * 60 * 1000);
  });

  it('subtracts one day for dayBefore preset', () => {
    const deadline = new Date('2026-09-10T12:00:00Z');
    const result = presetToFireAt(deadline, 'dayBefore');
    expect(result.getTime()).toBe(deadline.getTime() - 24 * 60 * 60 * 1000);
  });

  it('subtracts one week for weekBefore preset', () => {
    const deadline = new Date('2026-09-10T12:00:00Z');
    const result = presetToFireAt(deadline, 'weekBefore');
    expect(result.getTime()).toBe(deadline.getTime() - 7 * 24 * 60 * 60 * 1000);
  });
});

describe('isFireAtInFuture', () => {
  it('returns true when fireAt is after now', () => {
    const now = new Date('2026-09-01T00:00:00Z');
    const fireAt = new Date('2026-09-02T00:00:00Z');
    expect(isFireAtInFuture(fireAt, now)).toBe(true);
  });

  it('returns false when fireAt is before now', () => {
    const now = new Date('2026-09-02T00:00:00Z');
    const fireAt = new Date('2026-09-01T00:00:00Z');
    expect(isFireAtInFuture(fireAt, now)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/reminderTime.test.ts`
Expected: FAIL — `Cannot find module './reminderTime'`.

- [ ] **Step 3: Write the implementation**

```ts
// src/lib/reminderTime.ts
import type { ReminderPreset } from '../types';

const PRESET_OFFSET_MS: Record<ReminderPreset, number> = {
  onDeadline: 0,
  hourBefore: 60 * 60 * 1000,
  dayBefore: 24 * 60 * 60 * 1000,
  weekBefore: 7 * 24 * 60 * 60 * 1000,
};

export function presetToFireAt(deadline: Date, preset: ReminderPreset): Date {
  return new Date(deadline.getTime() - PRESET_OFFSET_MS[preset]);
}

export function isFireAtInFuture(fireAt: Date, now: Date = new Date()): boolean {
  return fireAt.getTime() > now.getTime();
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/reminderTime.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/reminderTime.ts src/lib/reminderTime.test.ts
git commit -m "feat: add reminder time calculation with tests"
```

---

## Task 4: Epic Cascade-Close Logic (pure logic + test)

**Files:**
- Create: `src/lib/epicCascade.ts`
- Test: `src/lib/epicCascade.test.ts`

**Interfaces:**
- Consumes: `Task` from `src/types.ts`.
- Produces: `subtaskIdsToClose(tasks: Task[], epicId: string): string[]` — used by `closeEpicWithSubtasks` in `src/firebase/tasks.ts` (Task 9).

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/epicCascade.test.ts
import { describe, it, expect } from 'vitest';
import { subtaskIdsToClose } from './epicCascade';
import type { Task } from '../types';

function makeTask(overrides: Partial<Task>): Task {
  return {
    id: 'id',
    type: 'task',
    sphereId: 'sphere-1',
    title: 'title',
    description: null,
    deadline: null,
    status: 'open',
    parentEpicId: null,
    createdAt: new Date(),
    completedAt: null,
    ...overrides,
  };
}

describe('subtaskIdsToClose', () => {
  it('returns ids of open subtasks belonging to the given epic', () => {
    const tasks = [
      makeTask({ id: 'a', parentEpicId: 'epic-1', status: 'open' }),
      makeTask({ id: 'b', parentEpicId: 'epic-1', status: 'done' }),
      makeTask({ id: 'c', parentEpicId: 'epic-2', status: 'open' }),
      makeTask({ id: 'd', parentEpicId: null, status: 'open' }),
    ];
    expect(subtaskIdsToClose(tasks, 'epic-1')).toEqual(['a']);
  });

  it('returns an empty array when the epic has no open subtasks', () => {
    const tasks = [makeTask({ id: 'a', parentEpicId: 'epic-1', status: 'done' })];
    expect(subtaskIdsToClose(tasks, 'epic-1')).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/epicCascade.test.ts`
Expected: FAIL — `Cannot find module './epicCascade'`.

- [ ] **Step 3: Write the implementation**

```ts
// src/lib/epicCascade.ts
import type { Task } from '../types';

export function subtaskIdsToClose(tasks: Task[], epicId: string): string[] {
  return tasks
    .filter((t) => t.parentEpicId === epicId && t.status === 'open')
    .map((t) => t.id);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/epicCascade.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/epicCascade.ts src/lib/epicCascade.test.ts
git commit -m "feat: add epic cascade-close logic with tests"
```

---

## Task 5: Stats and Milestones (pure logic + test)

**Files:**
- Create: `src/lib/stats.ts`
- Test: `src/lib/stats.test.ts`

**Interfaces:**
- Consumes: `Task`, `SphereId` from `src/types.ts`.
- Produces: `computeStats(tasks: Task[], now?: Date): StatsResult`, `computeMilestones(tasks: Task[]): Milestones`, `MILESTONE_THRESHOLDS` — used by `StatsPage` (Task 17).

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/stats.test.ts
import { describe, it, expect } from 'vitest';
import { computeStats, computeMilestones, MILESTONE_THRESHOLDS } from './stats';
import type { Task } from '../types';

function makeTask(overrides: Partial<Task>): Task {
  return {
    id: 'id',
    type: 'task',
    sphereId: 'sphere-1',
    title: 'title',
    description: null,
    deadline: null,
    status: 'open',
    parentEpicId: null,
    createdAt: new Date('2026-08-01T00:00:00Z'),
    completedAt: null,
    ...overrides,
  };
}

describe('computeStats', () => {
  it('counts tasks completed within the current week and month', () => {
    const now = new Date('2026-09-10T12:00:00Z'); // Thursday
    const tasks = [
      makeTask({ id: 'a', sphereId: 's1', completedAt: new Date('2026-09-09T00:00:00Z') }), // this week
      makeTask({ id: 'b', sphereId: 's2', completedAt: new Date('2026-09-02T00:00:00Z') }), // this month, not this week
      makeTask({ id: 'c', sphereId: 's1', completedAt: new Date('2026-08-01T00:00:00Z') }), // neither
      makeTask({ id: 'd', sphereId: 's1', completedAt: null }), // not completed
    ];
    const result = computeStats(tasks, now);
    expect(result.completedThisWeek).toBe(1);
    expect(result.completedThisMonth).toBe(2);
    expect(result.bySphere).toEqual({ s1: 1, s2: 1 });
  });
});

describe('computeMilestones', () => {
  it('reports reached thresholds and whether an epic was closed', () => {
    const tasks = [
      ...Array.from({ length: 10 }, (_, i) => makeTask({ id: `t${i}`, status: 'done' })),
      makeTask({ id: 'epic-1', type: 'epic', status: 'done' }),
      makeTask({ id: 'open-1', status: 'open' }),
    ];
    const result = computeMilestones(tasks);
    expect(result.totalCompleted).toBe(11);
    expect(result.reachedThresholds).toEqual([10]);
    expect(result.hasClosedEpic).toBe(true);
  });

  it('reports no reached thresholds when nothing is completed', () => {
    const result = computeMilestones([]);
    expect(result.totalCompleted).toBe(0);
    expect(result.reachedThresholds).toEqual([]);
    expect(result.hasClosedEpic).toBe(false);
  });

  it('exposes the threshold list used by the UI', () => {
    expect(MILESTONE_THRESHOLDS).toEqual([10, 50, 100, 250]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/stats.test.ts`
Expected: FAIL — `Cannot find module './stats'`.

- [ ] **Step 3: Write the implementation**

```ts
// src/lib/stats.ts
import type { Task, SphereId } from '../types';

export interface StatsResult {
  completedThisWeek: number;
  completedThisMonth: number;
  bySphere: Record<SphereId, number>;
}

function startOfWeek(now: Date): Date {
  const d = new Date(now);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // Monday as start of week
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + diff);
  return d;
}

function startOfMonth(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export function computeStats(tasks: Task[], now: Date = new Date()): StatsResult {
  const weekStart = startOfWeek(now);
  const monthStart = startOfMonth(now);
  const bySphere: Record<SphereId, number> = {};
  let completedThisWeek = 0;
  let completedThisMonth = 0;

  for (const task of tasks) {
    if (!task.completedAt) continue;
    if (task.completedAt >= monthStart) {
      completedThisMonth += 1;
      bySphere[task.sphereId] = (bySphere[task.sphereId] ?? 0) + 1;
    }
    if (task.completedAt >= weekStart) {
      completedThisWeek += 1;
    }
  }

  return { completedThisWeek, completedThisMonth, bySphere };
}

export const MILESTONE_THRESHOLDS = [10, 50, 100, 250] as const;

export interface Milestones {
  totalCompleted: number;
  reachedThresholds: number[];
  hasClosedEpic: boolean;
}

export function computeMilestones(tasks: Task[]): Milestones {
  const completed = tasks.filter((t) => t.status === 'done');
  const totalCompleted = completed.length;
  const reachedThresholds = MILESTONE_THRESHOLDS.filter((t) => totalCompleted >= t);
  const hasClosedEpic = completed.some((t) => t.type === 'epic');
  return { totalCompleted, reachedThresholds, hasClosedEpic };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/stats.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/stats.ts src/lib/stats.test.ts
git commit -m "feat: add stats and milestones calculation with tests"
```

---

## Task 6: Firebase Project, Security Rules, Indexes

**Files:**
- Create: `.env.example`
- Create: `src/firebase/config.ts`
- Create: `firebase.json`
- Create: `.firebaserc`
- Create: `firestore.rules`
- Create: `firestore.indexes.json`

**Interfaces:**
- Produces: `app`, `auth`, `db` exports from `src/firebase/config.ts` — imported by every module in `src/firebase/`.

- [ ] **Step 1: Create the Firebase project (console, one-time manual setup)**

1. Go to https://console.firebase.google.com and create a new project (e.g. "chu-ban").
2. In **Build → Authentication → Sign-in method**, enable the **Google** provider.
3. In **Build → Firestore Database**, click **Create database**, choose a region close to you, start in **production mode** (rules are authored below).
4. In **Project settings → General → Your apps**, click the web icon (`</>`) to register a web app named "chu-ban", and copy the shown `firebaseConfig` values — you'll need them in Step 2.
5. In **Project settings → Service accounts**, click **Generate new private key** and save the downloaded JSON somewhere safe (needed for Task 22, do not commit it).

- [ ] **Step 2: Create `.env.example`**

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_ONESIGNAL_APP_ID=
```

Copy this file to `.env` (git-ignored) and fill in the Firebase values from Step 1.4. Leave `VITE_ONESIGNAL_APP_ID` blank until Task 20.

- [ ] **Step 3: Create `src/firebase/config.ts`**

```ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

- [ ] **Step 4: Create `firestore.rules`**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAllowed() {
      return request.auth != null &&
        request.auth.token.email in ['dashach98@gmail.com', 'shakov.georgy@gmail.com'];
    }
    function isOwner(uid) {
      return isAllowed() && request.auth.uid == uid;
    }

    match /users/{uid} {
      allow read, write: if isOwner(uid);

      match /spheres/{sphereId} {
        allow read, write: if isOwner(uid);
      }
      match /tasks/{taskId} {
        allow read, write: if isOwner(uid);
      }
    }

    match /reminders/{reminderId} {
      allow read, delete: if isAllowed() && request.auth.uid == resource.data.uid;
      allow create: if isAllowed() && request.auth.uid == request.resource.data.uid;
    }
  }
}
```

- [ ] **Step 5: Create `firestore.indexes.json`**

```json
{
  "indexes": [
    {
      "collectionGroup": "reminders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "sent", "order": "ASCENDING" },
        { "fieldPath": "fireAt", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "reminders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "uid", "order": "ASCENDING" },
        { "fieldPath": "taskId", "order": "ASCENDING" },
        { "fieldPath": "fireAt", "order": "ASCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

- [ ] **Step 6: Create `firebase.json`**

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

- [ ] **Step 7: Create `.firebaserc`**

```json
{
  "projects": {
    "default": "<your-firebase-project-id>"
  }
}
```

Replace `<your-firebase-project-id>` with the project ID shown in Firebase console → Project settings → General.

- [ ] **Step 8: Deploy rules and indexes**

Run:
```bash
npx firebase login
npx firebase deploy --only firestore:rules,firestore:indexes
```
Expected: both commands report a successful deploy in the terminal, and the rules/indexes appear in the Firebase console under Firestore → Rules / Indexes.

- [ ] **Step 9: Commit**

```bash
git add .env.example src/firebase/config.ts firebase.json .firebaserc firestore.rules firestore.indexes.json
git commit -m "feat: wire up Firebase project, security rules, and indexes"
```

---

## Task 7: Auth (Google sign-in, email allowlist gate)

**Files:**
- Create: `src/firebase/auth.ts`
- Create: `src/hooks/useAuth.ts`
- Create: `src/pages/LoginPage.tsx`
- Create: `src/pages/AccessDeniedPage.tsx`
- Modify: `src/App.tsx` (replace placeholder with the auth gate)

**Interfaces:**
- Consumes: `auth` from `src/firebase/config.ts`; `ALLOWED_EMAILS` from `src/types.ts`.
- Produces: `signIn()`, `signOutUser()`, `isEmailAllowed(email)`, `useAuth()` returning `{ status: 'loading'|'signedOut'|'denied'|'signedIn'; user: User | null }` — consumed by `src/App.tsx` and later `Shell` (Task 15).

- [ ] **Step 1: Create `src/firebase/auth.ts`**

```ts
import {
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth } from './config';
import { ALLOWED_EMAILS } from '../types';

const provider = new GoogleAuthProvider();

export function signIn(): Promise<void> {
  return signInWithRedirect(auth, provider);
}

export function signOutUser(): Promise<void> {
  return signOut(auth);
}

export function consumeRedirectResult() {
  return getRedirectResult(auth);
}

export function isEmailAllowed(email: string | null): boolean {
  return email !== null && (ALLOWED_EMAILS as readonly string[]).includes(email);
}

export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}
```

- [ ] **Step 2: Create `src/hooks/useAuth.ts`**

```ts
import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { subscribeToAuth, consumeRedirectResult, isEmailAllowed } from '../firebase/auth';

export type AuthStatus = 'loading' | 'signedOut' | 'denied' | 'signedIn';

export interface AuthState {
  status: AuthStatus;
  user: User | null;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({ status: 'loading', user: null });

  useEffect(() => {
    consumeRedirectResult().catch(() => {
      // ignore: onAuthStateChanged still fires with the correct final state
    });
    const unsubscribe = subscribeToAuth((user) => {
      if (!user) {
        setState({ status: 'signedOut', user: null });
      } else if (!isEmailAllowed(user.email)) {
        setState({ status: 'denied', user });
      } else {
        setState({ status: 'signedIn', user });
      }
    });
    return unsubscribe;
  }, []);

  return state;
}
```

- [ ] **Step 3: Create `src/pages/LoginPage.tsx`**

```tsx
import { signIn } from '../firebase/auth';

export function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-cream px-6 text-center">
      <h1 className="text-3xl font-semibold text-ink">Chu-ban</h1>
      <p className="max-w-xs text-ink/70">
        Тёплое место для повседневных дел. Войди, чтобы увидеть свои задачи.
      </p>
      <button
        onClick={() => signIn()}
        className="rounded-full bg-sage px-6 py-3 font-medium text-white shadow-sm transition hover:brightness-105"
      >
        Войти через Google
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Create `src/pages/AccessDeniedPage.tsx`**

```tsx
import { signOutUser } from '../firebase/auth';

export function AccessDeniedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-cream px-6 text-center">
      <h1 className="text-2xl font-semibold text-ink">Доступ закрыт</h1>
      <p className="max-w-xs text-ink/70">
        Chu-ban — приватный трекер только для двоих. Этот аккаунт в список не входит.
      </p>
      <button
        onClick={() => signOutUser()}
        className="rounded-full border border-ink/20 px-6 py-3 font-medium text-ink transition hover:bg-ink/5"
      >
        Выйти
      </button>
    </div>
  );
}
```

- [ ] **Step 5: Modify `src/App.tsx`**

Replace the entire file:

```tsx
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
import { AccessDeniedPage } from './pages/AccessDeniedPage';

export default function App() {
  const { status } = useAuth();

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream text-ink/50">
        Загрузка…
      </div>
    );
  }
  if (status === 'signedOut') {
    return <LoginPage />;
  }
  if (status === 'denied') {
    return <AccessDeniedPage />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream text-ink">
      Скоро здесь будут задачи ✨
    </div>
  );
}
```

- [ ] **Step 6: Verify**

Run: `npm run dev`
Expected: opening the app shows "Войти через Google"; clicking it redirects to Google sign-in. Signing in with one of the two allowed emails lands on "Скоро здесь будут задачи ✨"; signing in with any other Google account shows "Доступ закрыт".

- [ ] **Step 7: Commit**

```bash
git add src/firebase/auth.ts src/hooks/useAuth.ts src/pages/LoginPage.tsx src/pages/AccessDeniedPage.tsx src/App.tsx
git commit -m "feat: add Google sign-in with email allowlist gate"
```

---

## Task 8: Spheres Data Layer + Default Seeding

**Files:**
- Create: `src/firebase/spheres.ts`
- Create: `src/hooks/useSpheres.ts`
- Create: `src/hooks/useEnsureDefaultSpheres.ts`
- Modify: `src/App.tsx` (call the seeding hook once signed in)

**Interfaces:**
- Consumes: `db` from `src/firebase/config.ts`; `Sphere`, `DEFAULT_SPHERES` from `src/types.ts`.
- Produces: `useSpheres(uid)` returning `{ spheres: Sphere[]; loaded: boolean; addSphere(name, color); updateSphere(id, changes); deleteSphere(id) }` — consumed by `Shell` (Task 15), `TaskForm` (Task 14), `SettingsPage` (Task 18).

- [ ] **Step 1: Create `src/firebase/spheres.ts`**

```ts
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  orderBy,
  query,
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';
import type { Sphere } from '../types';
import { DEFAULT_SPHERES } from '../types';

function spheresCol(uid: string) {
  return collection(db, 'users', uid, 'spheres');
}

export function subscribeSpheres(uid: string, callback: (spheres: Sphere[]) => void): () => void {
  const q = query(spheresCol(uid), orderBy('order'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Sphere, 'id'>) })));
  });
}

export async function addSphere(uid: string, name: string, color: string, order: number): Promise<void> {
  await addDoc(spheresCol(uid), { name, color, order });
}

export async function updateSphere(
  uid: string,
  sphereId: string,
  changes: Partial<Pick<Sphere, 'name' | 'color' | 'order'>>
): Promise<void> {
  await updateDoc(doc(db, 'users', uid, 'spheres', sphereId), changes);
}

export async function deleteSphere(uid: string, sphereId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'spheres', sphereId));
}

export async function seedDefaultSpheresIfEmpty(uid: string, existing: Sphere[]): Promise<void> {
  if (existing.length > 0) return;
  const batch = writeBatch(db);
  DEFAULT_SPHERES.forEach((sphere, index) => {
    const ref = doc(spheresCol(uid));
    batch.set(ref, { name: sphere.name, color: sphere.color, order: index });
  });
  await batch.commit();
}
```

- [ ] **Step 2: Create `src/hooks/useSpheres.ts`**

```ts
import { useEffect, useState } from 'react';
import type { Sphere } from '../types';
import {
  subscribeSpheres,
  addSphere as addSphereFn,
  updateSphere as updateSphereFn,
  deleteSphere as deleteSphereFn,
} from '../firebase/spheres';

export function useSpheres(uid: string) {
  const [spheres, setSpheres] = useState<Sphere[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeSpheres(uid, (data) => {
      setSpheres(data);
      setLoaded(true);
    });
    return unsubscribe;
  }, [uid]);

  return {
    spheres,
    loaded,
    addSphere: (name: string, color: string) => addSphereFn(uid, name, color, spheres.length),
    updateSphere: (sphereId: string, changes: Partial<Pick<Sphere, 'name' | 'color' | 'order'>>) =>
      updateSphereFn(uid, sphereId, changes),
    deleteSphere: (sphereId: string) => deleteSphereFn(uid, sphereId),
  };
}
```

- [ ] **Step 3: Create `src/hooks/useEnsureDefaultSpheres.ts`**

```ts
import { useEffect, useRef } from 'react';
import type { Sphere } from '../types';
import { seedDefaultSpheresIfEmpty } from '../firebase/spheres';

export function useEnsureDefaultSpheres(uid: string, spheres: Sphere[], loaded: boolean): void {
  const seeded = useRef(false);
  useEffect(() => {
    if (!loaded || seeded.current) return;
    seeded.current = true;
    if (spheres.length === 0) {
      seedDefaultSpheresIfEmpty(uid, spheres);
    }
  }, [uid, spheres, loaded]);
}
```

- [ ] **Step 4: Modify `src/App.tsx`**

Replace the `signedIn` branch to seed default spheres. Full file:

```tsx
import { useAuth } from './hooks/useAuth';
import { useSpheres } from './hooks/useSpheres';
import { useEnsureDefaultSpheres } from './hooks/useEnsureDefaultSpheres';
import { LoginPage } from './pages/LoginPage';
import { AccessDeniedPage } from './pages/AccessDeniedPage';

function SignedInPlaceholder({ uid }: { uid: string }) {
  const { spheres, loaded } = useSpheres(uid);
  useEnsureDefaultSpheres(uid, spheres, loaded);

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream text-ink">
      {loaded ? `Сфер: ${spheres.length}` : 'Загрузка…'}
    </div>
  );
}

export default function App() {
  const { status, user } = useAuth();

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream text-ink/50">
        Загрузка…
      </div>
    );
  }
  if (status === 'signedOut') {
    return <LoginPage />;
  }
  if (status === 'denied') {
    return <AccessDeniedPage />;
  }

  return <SignedInPlaceholder uid={user!.uid} />;
}
```

- [ ] **Step 5: Verify**

Run: `npm run dev`, sign in with an allowed account.
Expected: on first sign-in the page shows "Сфер: 6" after a brief "Загрузка…"; check the Firestore console under `users/<uid>/spheres` — six documents (Работа, Отношения, Дом, Путешествия, Здоровье, Личное) should exist. Reload the page — it should still show "Сфер: 6" (no duplicate seeding).

- [ ] **Step 6: Commit**

```bash
git add src/firebase/spheres.ts src/hooks/useSpheres.ts src/hooks/useEnsureDefaultSpheres.ts src/App.tsx
git commit -m "feat: add spheres data layer with default seeding"
```

---

## Task 9: Tasks and Epics Data Layer

**Files:**
- Create: `src/firebase/tasks.ts`
- Create: `src/hooks/useTasks.ts`

**Interfaces:**
- Consumes: `db` from `src/firebase/config.ts`; `Task`, `TaskStatus`, `TaskType` from `src/types.ts`; `subtaskIdsToClose` from `src/lib/epicCascade.ts`.
- Produces: `NewTaskInput` type; `useTasks(uid)` returning `{ tasks: Task[]; addTask(input): Promise<string>; updateTask(id, changes); deleteTask(id); setTaskStatus(id, status); closeEpic(epicId) }` — consumed by `Shell` (Task 15), `TaskForm` (Task 14).

- [ ] **Step 1: Create `src/firebase/tasks.ts`**

```ts
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
import { subtaskIdsToClose } from '../lib/epicCascade';

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

export async function deleteTask(uid: string, taskId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'tasks', taskId));
}

export async function setTaskStatus(uid: string, taskId: string, status: TaskStatus): Promise<void> {
  await updateDoc(doc(db, 'users', uid, 'tasks', taskId), {
    status,
    completedAt: status === 'done' ? Timestamp.now() : null,
  });
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
```

- [ ] **Step 2: Create `src/hooks/useTasks.ts`**

```ts
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
```

- [ ] **Step 3: Verify**

Run: `npm run typecheck`
Expected: PASS. (No UI consumes this yet — full behavioral verification happens in Task 15/16.)

- [ ] **Step 4: Commit**

```bash
git add src/firebase/tasks.ts src/hooks/useTasks.ts
git commit -m "feat: add tasks and epics data layer"
```

---

## Task 10: Reminders Data Layer

**Files:**
- Create: `src/firebase/reminders.ts`
- Create: `src/hooks/useReminders.ts`

**Interfaces:**
- Consumes: `db` from `src/firebase/config.ts`; `Reminder` from `src/types.ts`.
- Produces: `NewReminderInput` type; `useReminders(uid, taskId)` returning `{ reminders: Reminder[]; addReminder(fireAt: Date); deleteReminder(id) }` — consumed by `TaskForm` (Task 14).

- [ ] **Step 1: Create `src/firebase/reminders.ts`**

```ts
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

export async function deleteReminder(uid: string, reminderId: string): Promise<void> {
  await deleteDoc(doc(db, 'reminders', reminderId));
}
```

- [ ] **Step 2: Create `src/hooks/useReminders.ts`**

```ts
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
```

- [ ] **Step 3: Verify**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/firebase/reminders.ts src/hooks/useReminders.ts
git commit -m "feat: add reminders data layer"
```

---

## Task 11: Shared UI Leaves (Modal, SphereBadge, OverdueBanner)

**Files:**
- Create: `src/components/Modal.tsx`
- Create: `src/components/SphereBadge.tsx`
- Create: `src/components/OverdueBanner.tsx`

**Interfaces:**
- Produces: `Modal({ onClose, children })`, `SphereBadge({ sphere })`, `OverdueBanner({ onComplete, onReschedule })` — consumed by `TaskCard` (Task 12) and `Shell` (Task 15).

- [ ] **Step 1: Create `src/components/Modal.tsx`**

```tsx
import type { ReactNode } from 'react';

export function Modal({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 sm:items-center"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-cream p-6 shadow-xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/SphereBadge.tsx`**

```tsx
import type { Sphere } from '../types';

export function SphereBadge({ sphere }: { sphere: Sphere | undefined }) {
  if (!sphere) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/60 px-2.5 py-1 text-xs font-medium text-ink/70">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: sphere.color }} />
      {sphere.name}
    </span>
  );
}
```

- [ ] **Step 3: Create `src/components/OverdueBanner.tsx`**

```tsx
export function OverdueBanner({
  onComplete,
  onReschedule,
}: {
  onComplete: () => void;
  onReschedule: () => void;
}) {
  return (
    <div className="mt-2 rounded-2xl bg-terracotta/15 p-3 text-sm text-ink">
      <p>Дедлайн подошёл. Возьмись за задачу — или просто передвинь срок, ничего страшного 🌿</p>
      <div className="mt-2 flex gap-2">
        <button
          onClick={onComplete}
          className="rounded-full bg-sage px-3 py-1.5 text-xs font-medium text-white"
        >
          Выполнить
        </button>
        <button
          onClick={onReschedule}
          className="rounded-full border border-ink/20 px-3 py-1.5 text-xs font-medium text-ink"
        >
          Перенести срок
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/Modal.tsx src/components/SphereBadge.tsx src/components/OverdueBanner.tsx
git commit -m "feat: add shared Modal, SphereBadge, OverdueBanner components"
```

---

## Task 12: TaskCard

**Files:**
- Create: `src/components/TaskCard.tsx`

**Interfaces:**
- Consumes: `Sphere`, `Task` from `src/types.ts`; `SphereBadge` from `src/components/SphereBadge.tsx`; `OverdueBanner` from `src/components/OverdueBanner.tsx`.
- Produces: `TaskCard({ task, sphere, subtaskProgress?, onToggleDone, onOpen })` — consumed by `TasksPage` (Task 16).

- [ ] **Step 1: Create `src/components/TaskCard.tsx`**

```tsx
import type { Sphere, Task } from '../types';
import { SphereBadge } from './SphereBadge';
import { OverdueBanner } from './OverdueBanner';

function formatDeadline(deadline: Date): string {
  return deadline.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

export function TaskCard({
  task,
  sphere,
  subtaskProgress,
  onToggleDone,
  onOpen,
}: {
  task: Task;
  sphere: Sphere | undefined;
  subtaskProgress?: { done: number; total: number };
  onToggleDone: () => void;
  onOpen: () => void;
}) {
  const isOverdue = !!task.deadline && task.deadline.getTime() < Date.now() && task.status === 'open';

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <button
          onClick={onToggleDone}
          aria-label={task.status === 'done' ? 'Снять отметку выполнено' : 'Отметить выполненным'}
          className={`mt-0.5 h-6 w-6 shrink-0 rounded-full border-2 transition ${
            task.status === 'done' ? 'border-sage bg-sage' : 'border-ink/30'
          }`}
        />
        <div className="flex-1 cursor-pointer" onClick={onOpen}>
          <p className={`font-medium text-ink ${task.status === 'done' ? 'line-through opacity-50' : ''}`}>
            {task.title}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <SphereBadge sphere={sphere} />
            {task.deadline && (
              <span className="text-xs text-ink/50">до {formatDeadline(task.deadline)}</span>
            )}
            {subtaskProgress && (
              <span className="text-xs text-ink/50">
                {subtaskProgress.done} из {subtaskProgress.total}
              </span>
            )}
          </div>
        </div>
      </div>
      {isOverdue && <OverdueBanner onComplete={onToggleDone} onReschedule={onOpen} />}
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/TaskCard.tsx
git commit -m "feat: add TaskCard component"
```

---

## Task 13: ReminderPicker

**Files:**
- Create: `src/components/ReminderPicker.tsx`

**Interfaces:**
- Consumes: `Reminder`, `ReminderPreset`, `REMINDER_PRESET_LABELS` from `src/types.ts`; `presetToFireAt` from `src/lib/reminderTime.ts`.
- Produces: `ReminderPicker({ deadline, reminders, onAdd, onRemove })` — consumed by `TaskForm` (Task 14).

- [ ] **Step 1: Create `src/components/ReminderPicker.tsx`**

```tsx
import { useState } from 'react';
import type { Reminder, ReminderPreset } from '../types';
import { REMINDER_PRESET_LABELS } from '../types';
import { presetToFireAt } from '../lib/reminderTime';

const PRESETS: ReminderPreset[] = ['weekBefore', 'dayBefore', 'hourBefore', 'onDeadline'];

export function ReminderPicker({
  deadline,
  reminders,
  onAdd,
  onRemove,
}: {
  deadline: Date | null;
  reminders: Reminder[];
  onAdd: (fireAt: Date) => void;
  onRemove: (id: string) => void;
}) {
  const [customValue, setCustomValue] = useState('');

  if (!deadline) {
    return <p className="text-sm text-ink/50">Укажи срок, чтобы добавить напоминания.</p>;
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onAdd(presetToFireAt(deadline, preset))}
            className="rounded-full border border-ink/20 px-3 py-1.5 text-xs text-ink"
          >
            + {REMINDER_PRESET_LABELS[preset]}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="datetime-local"
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          className="flex-1 rounded-xl border border-ink/20 px-3 py-1.5 text-sm"
        />
        <button
          type="button"
          disabled={!customValue}
          onClick={() => {
            onAdd(new Date(customValue));
            setCustomValue('');
          }}
          className="rounded-full bg-sage px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
        >
          Добавить
        </button>
      </div>
      {reminders.length > 0 && (
        <ul className="space-y-1">
          {reminders.map((reminder) => (
            <li key={reminder.id} className="flex items-center justify-between text-sm text-ink/70">
              <span>
                {reminder.fireAt.toLocaleString('ru-RU', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <button onClick={() => onRemove(reminder.id)} className="text-xs text-terracotta">
                Убрать
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/ReminderPicker.tsx
git commit -m "feat: add ReminderPicker component"
```

---

## Task 14: TaskForm

**Files:**
- Create: `src/components/TaskForm.tsx`

**Interfaces:**
- Consumes: `Sphere`, `Task`, `TaskType` from `src/types.ts`; `addTask`, `updateTask` from `src/firebase/tasks.ts`; `useReminders` from `src/hooks/useReminders.ts`; `ReminderPicker` from `src/components/ReminderPicker.tsx`.
- Produces: `TaskForm({ uid, mode, initialTask?, spheres, parentEpicId, onDone })` — consumed by `Shell` (Task 15).

- [ ] **Step 1: Create `src/components/TaskForm.tsx`**

```tsx
import { useState, type FormEvent } from 'react';
import type { Sphere, Task, TaskType } from '../types';
import { addTask, updateTask } from '../firebase/tasks';
import { useReminders } from '../hooks/useReminders';
import { ReminderPicker } from './ReminderPicker';

function toDatetimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function TaskForm({
  uid,
  mode,
  initialTask,
  spheres,
  parentEpicId,
  onDone,
}: {
  uid: string;
  mode: 'create' | 'edit';
  initialTask?: Task;
  spheres: Sphere[];
  parentEpicId: string | null;
  onDone: () => void;
}) {
  const [type, setType] = useState<TaskType>(initialTask?.type ?? 'task');
  const [sphereId, setSphereId] = useState(initialTask?.sphereId ?? spheres[0]?.id ?? '');
  const [title, setTitle] = useState(initialTask?.title ?? '');
  const [description, setDescription] = useState(initialTask?.description ?? '');
  const [deadlineValue, setDeadlineValue] = useState(
    initialTask?.deadline ? toDatetimeLocalValue(initialTask.deadline) : ''
  );
  const [saving, setSaving] = useState(false);

  // ponytail: reminders need a task id, so on create the picker only appears
  // after reopening the saved task in edit mode. Add an inline "save then keep
  // editing" flow if that extra tap turns out to bother her.
  const taskId = initialTask?.id ?? null;
  const { reminders, addReminder, deleteReminder } = useReminders(uid, taskId);
  const deadline = deadlineValue ? new Date(deadlineValue) : null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !sphereId) return;
    setSaving(true);
    const input = {
      type,
      sphereId,
      title: title.trim(),
      description: description.trim() || null,
      deadline,
      parentEpicId: initialTask ? initialTask.parentEpicId : parentEpicId,
    };
    if (mode === 'create') {
      await addTask(uid, input);
    } else if (initialTask) {
      await updateTask(uid, initialTask.id, input);
    }
    setSaving(false);
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold text-ink">
        {mode === 'create' ? 'Новая задача' : 'Редактировать задачу'}
      </h2>

      {!parentEpicId && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setType('task')}
            className={`flex-1 rounded-xl border px-3 py-2 text-sm ${type === 'task' ? 'border-sage bg-sage/10' : 'border-ink/20'}`}
          >
            Задача
          </button>
          <button
            type="button"
            onClick={() => setType('epic')}
            className={`flex-1 rounded-xl border px-3 py-2 text-sm ${type === 'epic' ? 'border-sage bg-sage/10' : 'border-ink/20'}`}
          >
            Эпик
          </button>
        </div>
      )}

      <select
        value={sphereId}
        onChange={(e) => setSphereId(e.target.value)}
        className="w-full rounded-xl border border-ink/20 px-3 py-2 text-sm"
      >
        {spheres.map((sphere) => (
          <option key={sphere.id} value={sphere.id}>
            {sphere.name}
          </option>
        ))}
      </select>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Название"
        className="w-full rounded-xl border border-ink/20 px-3 py-2 text-sm"
        required
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Описание (необязательно)"
        className="w-full rounded-xl border border-ink/20 px-3 py-2 text-sm"
        rows={3}
      />

      <input
        type="datetime-local"
        value={deadlineValue}
        onChange={(e) => setDeadlineValue(e.target.value)}
        className="w-full rounded-xl border border-ink/20 px-3 py-2 text-sm"
      />

      {mode === 'edit' && (
        <ReminderPicker deadline={deadline} reminders={reminders} onAdd={addReminder} onRemove={deleteReminder} />
      )}

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onDone}
          className="flex-1 rounded-full border border-ink/20 px-4 py-2 text-sm font-medium text-ink"
        >
          Отмена
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-full bg-sage px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Сохранить
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/TaskForm.tsx
git commit -m "feat: add TaskForm for creating and editing tasks and epics"
```

---

## Task 15: BottomNav + Shell (tab switching, modal wiring)

**Files:**
- Create: `src/components/BottomNav.tsx`
- Create: `src/Shell.tsx`
- Modify: `src/App.tsx` (delegate the signed-in view to `Shell`)

**Interfaces:**
- Consumes: `Tab` from `src/types.ts`; `useSpheres`, `useEnsureDefaultSpheres`, `useTasks` hooks; `Modal`, `TaskForm` components.
- Produces: `Shell({ uid })` rendering tab content with an editor modal — placeholders for `TasksPage`/`CalendarPage`/`StatsPage`/`SettingsPage` are replaced in Tasks 16–18 (SettingsPage is Task 18, see below for exact numbering) by modifying `src/Shell.tsx`.

- [ ] **Step 1: Create `src/components/BottomNav.tsx`**

```tsx
import type { Tab } from '../types';

const TABS: Array<{ id: Tab; label: string; icon: string }> = [
  { id: 'tasks', label: 'Задачи', icon: '✓' },
  { id: 'calendar', label: 'Календарь', icon: '📅' },
  { id: 'stats', label: 'Статистика', icon: '✨' },
  { id: 'settings', label: 'Настройки', icon: '⚙️' },
];

export function BottomNav({ active, onChange }: { active: Tab; onChange: (tab: Tab) => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-ink/10 bg-cream/95 py-2 backdrop-blur">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs ${
            active === tab.id ? 'text-sage' : 'text-ink/40'
          }`}
        >
          <span className="text-lg">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
```

- [ ] **Step 2: Create `src/Shell.tsx`**

```tsx
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
```

- [ ] **Step 3: Modify `src/App.tsx`**

Replace the entire file to delegate to `Shell`:

```tsx
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
import { AccessDeniedPage } from './pages/AccessDeniedPage';
import { Shell } from './Shell';

export default function App() {
  const { status, user } = useAuth();

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream text-ink/50">
        Загрузка…
      </div>
    );
  }
  if (status === 'signedOut') {
    return <LoginPage />;
  }
  if (status === 'denied') {
    return <AccessDeniedPage />;
  }

  return <Shell uid={user!.uid} />;
}
```

- [ ] **Step 4: Verify**

Run: `npm run dev`, sign in.
Expected: bottom nav with 4 tabs is visible and switches content; tapping "+ Новая задача" opens a modal with the task form; saving a task closes the modal and the "Задачи: N" counter increments; check Firestore console to confirm the task document was created under `users/<uid>/tasks`.

- [ ] **Step 5: Commit**

```bash
git add src/components/BottomNav.tsx src/Shell.tsx src/App.tsx
git commit -m "feat: add tab shell with bottom nav and task editor modal"
```

---

## Task 16: TasksPage

**Files:**
- Create: `src/pages/TasksPage.tsx`
- Modify: `src/Shell.tsx` (render `TasksPage` in the `tasks` tab)

**Interfaces:**
- Consumes: `Sphere`, `Task`, `TaskStatus` from `src/types.ts`; `TaskCard` from `src/components/TaskCard.tsx`.
- Produces: `TasksPage({ tasks, spheres, onOpenCreate, onOpenEdit, onToggleDone, onCloseEpic })`.

- [ ] **Step 1: Create `src/pages/TasksPage.tsx`**

```tsx
import type { Sphere, Task, TaskStatus } from '../types';
import { TaskCard } from '../components/TaskCard';

export function TasksPage({
  tasks,
  spheres,
  onOpenCreate,
  onOpenEdit,
  onToggleDone,
  onCloseEpic,
}: {
  tasks: Task[];
  spheres: Sphere[];
  onOpenCreate: (parentEpicId: string | null) => void;
  onOpenEdit: (task: Task) => void;
  onToggleDone: (taskId: string, status: TaskStatus) => void;
  onCloseEpic: (epicId: string) => void;
}) {
  const sphereById = new Map(spheres.map((s) => [s.id, s]));
  const topLevel = tasks.filter((t) => !t.parentEpicId && t.status === 'open');
  const done = tasks.filter((t) => t.status === 'done');

  function subtasksOf(epicId: string) {
    return tasks.filter((t) => t.parentEpicId === epicId);
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => onOpenCreate(null)}
        className="w-full rounded-2xl border-2 border-dashed border-sage/40 py-3 text-sm font-medium text-sage"
      >
        + Новая задача
      </button>

      {topLevel.length === 0 && done.length === 0 && (
        <p className="pt-6 text-center text-sm text-ink/50">
          Пока пусто. Добавь первую задачу, когда будешь готова 🌱
        </p>
      )}

      <div className="space-y-3">
        {topLevel.map((task) => {
          const subtasks = task.type === 'epic' ? subtasksOf(task.id) : [];
          return (
            <div key={task.id}>
              <TaskCard
                task={task}
                sphere={sphereById.get(task.sphereId)}
                subtaskProgress={
                  task.type === 'epic'
                    ? { done: subtasks.filter((s) => s.status === 'done').length, total: subtasks.length }
                    : undefined
                }
                onToggleDone={() =>
                  task.type === 'epic' ? onCloseEpic(task.id) : onToggleDone(task.id, 'done')
                }
                onOpen={() => onOpenEdit(task)}
              />
              {task.type === 'epic' && (
                <div className="ml-6 mt-2 space-y-2">
                  {subtasks.map((subtask) => (
                    <TaskCard
                      key={subtask.id}
                      task={subtask}
                      sphere={sphereById.get(subtask.sphereId)}
                      onToggleDone={() => onToggleDone(subtask.id, subtask.status === 'done' ? 'open' : 'done')}
                      onOpen={() => onOpenEdit(subtask)}
                    />
                  ))}
                  <button onClick={() => onOpenCreate(task.id)} className="text-xs font-medium text-sage">
                    + Подзадача
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {done.length > 0 && (
        <details className="pt-2">
          <summary className="cursor-pointer text-sm text-ink/50">Выполнено ({done.length})</summary>
          <div className="mt-2 space-y-2">
            {done.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                sphere={sphereById.get(task.sphereId)}
                onToggleDone={() => onToggleDone(task.id, 'open')}
                onOpen={() => onOpenEdit(task)}
              />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Modify `src/Shell.tsx`**

Replace the `import` list and the `tasks` tab branch:

```tsx
import { useState } from 'react';
import type { Tab, Task } from './types';
import { useSpheres } from './hooks/useSpheres';
import { useEnsureDefaultSpheres } from './hooks/useEnsureDefaultSpheres';
import { useTasks } from './hooks/useTasks';
import { BottomNav } from './components/BottomNav';
import { Modal } from './components/Modal';
import { TaskForm } from './components/TaskForm';
import { TasksPage } from './pages/TasksPage';

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

export type { EditorState };
```

- [ ] **Step 3: Verify**

Run: `npm run dev`, sign in.
Expected: creating a task shows it in the list with its sphere badge; tapping the circle marks it done and moves it under "Выполнено"; creating an epic, then adding a subtask via "+ Подзадача", shows "0 из 1" progress on the epic; tapping the epic's circle closes it and its subtask together; the empty-state message shows only when there are truly no tasks.

- [ ] **Step 4: Commit**

```bash
git add src/pages/TasksPage.tsx src/Shell.tsx
git commit -m "feat: add TasksPage with epic/subtask support"
```

---

## Task 17: CalendarPage

**Files:**
- Create: `src/pages/CalendarPage.tsx`
- Modify: `src/Shell.tsx` (render `CalendarPage` in the `calendar` tab)

**Interfaces:**
- Consumes: `Sphere`, `Task` from `src/types.ts`.
- Produces: `CalendarPage({ tasks, spheres, onOpenEdit })`.

- [ ] **Step 1: Create `src/pages/CalendarPage.tsx`**

```tsx
import { useState } from 'react';
import type { Sphere, Task } from '../types';

function daysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function CalendarPage({
  tasks,
  spheres,
  onOpenEdit,
}: {
  tasks: Task[];
  spheres: Sphere[];
  onOpenEdit: (task: Task) => void;
}) {
  const [cursor, setCursor] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const sphereById = new Map(spheres.map((s) => [s.id, s]));

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const days = daysInMonth(year, month);
  const leadingBlanks = (days[0].getDay() + 6) % 7; // Monday-first grid

  const tasksWithDeadline = tasks.filter((t): t is Task & { deadline: Date } => t.deadline !== null);

  function tasksOnDay(day: Date): Task[] {
    return tasksWithDeadline.filter((t) => isSameDay(t.deadline, day));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => setCursor(new Date(year, month - 1, 1))} className="px-2 text-ink/60">
          ←
        </button>
        <p className="font-medium text-ink">
          {cursor.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
        </p>
        <button onClick={() => setCursor(new Date(year, month + 1, 1))} className="px-2 text-ink/60">
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-ink/40">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {days.map((day) => {
          const dayTasks = tasksOnDay(day);
          const spheresOnDay = [...new Set(dayTasks.map((t) => t.sphereId))];
          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDay(day)}
              className={`flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-sm ${
                selectedDay && isSameDay(selectedDay, day) ? 'bg-sage/20' : ''
              }`}
            >
              <span className="text-ink">{day.getDate()}</span>
              <span className="flex gap-0.5">
                {spheresOnDay.slice(0, 3).map((sphereId) => (
                  <span
                    key={sphereId}
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: sphereById.get(sphereId)?.color ?? '#ccc' }}
                  />
                ))}
              </span>
            </button>
          );
        })}
      </div>

      {selectedDay && (
        <div className="space-y-2 pt-2">
          <p className="text-sm font-medium text-ink/70">
            {selectedDay.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
          </p>
          {tasksOnDay(selectedDay).length === 0 && (
            <p className="text-sm text-ink/40">На этот день ничего не запланировано.</p>
          )}
          {tasksOnDay(selectedDay).map((task) => (
            <button
              key={task.id}
              onClick={() => onOpenEdit(task)}
              className="flex w-full items-center gap-2 rounded-xl bg-white p-3 text-left text-sm shadow-sm"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: sphereById.get(task.sphereId)?.color ?? '#ccc' }}
              />
              {task.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Modify `src/Shell.tsx`**

Add the import and replace the `calendar` tab branch:

```tsx
import { CalendarPage } from './pages/CalendarPage';
```

```tsx
{tab === 'calendar' && <CalendarPage tasks={tasks} spheres={spheres} onOpenEdit={openEdit} />}
```

- [ ] **Step 3: Verify**

Run: `npm run dev`, sign in, create a task with a deadline in the current month.
Expected: the Calendar tab shows the current month grid with a colored dot on the deadline day; tapping that day lists the task below; tapping the task opens the edit modal.

- [ ] **Step 4: Commit**

```bash
git add src/pages/CalendarPage.tsx src/Shell.tsx
git commit -m "feat: add CalendarPage with month grid and day drill-down"
```

---

## Task 18: StatsPage

**Files:**
- Create: `src/pages/StatsPage.tsx`
- Modify: `src/Shell.tsx` (render `StatsPage` in the `stats` tab)

**Interfaces:**
- Consumes: `Sphere`, `Task` from `src/types.ts`; `computeStats`, `computeMilestones`, `MILESTONE_THRESHOLDS` from `src/lib/stats.ts`.
- Produces: `StatsPage({ tasks, spheres })`.

- [ ] **Step 1: Create `src/pages/StatsPage.tsx`**

```tsx
import type { Sphere, Task } from '../types';
import { computeStats, computeMilestones, MILESTONE_THRESHOLDS } from '../lib/stats';

export function StatsPage({ tasks, spheres }: { tasks: Task[]; spheres: Sphere[] }) {
  const stats = computeStats(tasks);
  const milestones = computeMilestones(tasks);
  const sphereById = new Map(spheres.map((s) => [s.id, s]));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
          <p className="text-3xl font-semibold text-sage">{stats.completedThisWeek}</p>
          <p className="text-xs text-ink/50">выполнено за неделю</p>
        </div>
        <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
          <p className="text-3xl font-semibold text-sage">{stats.completedThisMonth}</p>
          <p className="text-xs text-ink/50">выполнено за месяц</p>
        </div>
      </div>

      {Object.keys(stats.bySphere).length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-ink/70">По сферам в этом месяце</p>
          {Object.entries(stats.bySphere).map(([sphereId, count]) => (
            <div key={sphereId} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm shadow-sm">
              <span className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: sphereById.get(sphereId)?.color ?? '#ccc' }}
                />
                {sphereById.get(sphereId)?.name ?? 'Сфера'}
              </span>
              <span className="text-ink/60">{count}</span>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <p className="text-sm font-medium text-ink/70">Достижения</p>
        <div className="flex flex-wrap gap-2">
          {MILESTONE_THRESHOLDS.map((threshold) => (
            <span
              key={threshold}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                milestones.reachedThresholds.includes(threshold) ? 'bg-gold/30 text-ink' : 'bg-ink/5 text-ink/30'
              }`}
            >
              {threshold} задач
            </span>
          ))}
          <span
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              milestones.hasClosedEpic ? 'bg-gold/30 text-ink' : 'bg-ink/5 text-ink/30'
            }`}
          >
            Первый эпик
          </span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Modify `src/Shell.tsx`**

Add the import and replace the `stats` tab branch:

```tsx
import { StatsPage } from './pages/StatsPage';
```

```tsx
{tab === 'stats' && <StatsPage tasks={tasks} spheres={spheres} />}
```

- [ ] **Step 3: Verify**

Run: `npm run dev`, sign in, mark a couple of tasks done.
Expected: the Stats tab shows non-zero week/month counters, a sphere breakdown row per sphere with completions, and the "10 задач" milestone chip stays greyed out until 10 tasks are completed.

- [ ] **Step 4: Commit**

```bash
git add src/pages/StatsPage.tsx src/Shell.tsx
git commit -m "feat: add StatsPage with counts, sphere breakdown, and milestones"
```

---

## Task 19: SettingsPage

**Files:**
- Create: `src/pages/SettingsPage.tsx`
- Modify: `src/Shell.tsx` (render `SettingsPage` in the `settings` tab)

**Interfaces:**
- Consumes: `Sphere` from `src/types.ts`; `addSphere`, `updateSphere`, `deleteSphere` from `src/firebase/spheres.ts`.
- Produces: `SettingsPage({ uid, spheres })`.

- [ ] **Step 1: Create `src/pages/SettingsPage.tsx`**

```tsx
import { useState, type FormEvent } from 'react';
import type { Sphere } from '../types';
import { addSphere, updateSphere, deleteSphere } from '../firebase/spheres';

const PALETTE = ['#7C9885', '#E8927C', '#D4A373', '#6C9BCF', '#A8DADC', '#C8A2C8'];

export function SettingsPage({ uid, spheres }: { uid: string; spheres: Sphere[] }) {
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PALETTE[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    await addSphere(uid, newName.trim(), newColor, spheres.length);
    setNewName('');
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-ink/70">Сферы жизни</p>
        {spheres.map((sphere) => (
          <div key={sphere.id} className="flex items-center gap-2 rounded-xl bg-white p-3 shadow-sm">
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: sphere.color }} />
            {editingId === sphere.id ? (
              <input
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={async () => {
                  if (editingName.trim()) await updateSphere(uid, sphere.id, { name: editingName.trim() });
                  setEditingId(null);
                }}
                autoFocus
                className="flex-1 rounded-lg border border-ink/20 px-2 py-1 text-sm"
              />
            ) : (
              <button
                className="flex-1 text-left text-sm text-ink"
                onClick={() => {
                  setEditingId(sphere.id);
                  setEditingName(sphere.name);
                }}
              >
                {sphere.name}
              </button>
            )}
            <button onClick={() => deleteSphere(uid, sphere.id)} className="text-xs text-terracotta">
              Удалить
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} className="space-y-2">
        <p className="text-sm font-medium text-ink/70">Добавить сферу</p>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Название"
          className="w-full rounded-xl border border-ink/20 px-3 py-2 text-sm"
        />
        <div className="flex gap-2">
          {PALETTE.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setNewColor(color)}
              className={`h-7 w-7 rounded-full ${newColor === color ? 'ring-2 ring-ink/40 ring-offset-2' : ''}`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <button type="submit" className="w-full rounded-full bg-sage px-4 py-2 text-sm font-medium text-white">
          Добавить
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Modify `src/Shell.tsx`**

Add the import and replace the `settings` tab branch:

```tsx
import { SettingsPage } from './pages/SettingsPage';
```

```tsx
{tab === 'settings' && <SettingsPage uid={uid} spheres={spheres} />}
```

- [ ] **Step 3: Verify**

Run: `npm run dev`, sign in, open the Settings tab.
Expected: the 6 default spheres are listed with their colors; adding a new sphere with a chosen color appears in the list and immediately becomes selectable in the task form's sphere dropdown; renaming and deleting work in place.

- [ ] **Step 4: Commit**

```bash
git add src/pages/SettingsPage.tsx src/Shell.tsx
git commit -m "feat: add SettingsPage for managing life spheres"
```

---

## Task 20: PWA Manifest, Icons, Combined Service Worker

**Files:**
- Create: `source-icon.svg`
- Create: `scripts/generate-icons.mjs`
- Create: `src/sw.ts`
- Modify: `vite.config.ts` (add `vite-plugin-pwa` with the `injectManifest` strategy)

**Interfaces:**
- Produces: `public/icon-192.png`, `public/icon-512.png` (generated files); a registered service worker at `/chu-ban/sw.js` that later hosts the OneSignal `importScripts` line consumed conceptually by Task 21 (no code interface — this is infrastructure).

- [ ] **Step 1: Create `source-icon.svg`**

```svg
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="120" fill="#7C9885"/>
  <path d="M256 140c-64 0-116 52-116 116 0 82 116 176 116 176s116-94 116-176c0-64-52-116-116-116z" fill="#FAF6F0"/>
  <circle cx="256" cy="256" r="40" fill="#7C9885"/>
</svg>
```

- [ ] **Step 2: Create `scripts/generate-icons.mjs`**

```js
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { mkdirSync } from 'node:fs';

mkdirSync('public', { recursive: true });
const svg = readFileSync('source-icon.svg');
const sizes = [192, 512];

for (const size of sizes) {
  await sharp(svg).resize(size, size).png().toFile(`public/icon-${size}.png`);
}
console.log('Icons generated.');
```

- [ ] **Step 3: Generate the icons**

Run: `node scripts/generate-icons.mjs`
Expected: `public/icon-192.png` and `public/icon-512.png` are created.

- [ ] **Step 4: Create `src/sw.ts`**

```ts
importScripts('https://cdn.onesignal.com/sdks/OneSignalSDKWorker.js');

import { precacheAndRoute } from 'workbox-precaching';

declare let self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);
```

- [ ] **Step 5: Modify `vite.config.ts`**

```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/chu-ban/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      injectManifest: {
        swSrc: 'src/sw.ts',
        swDest: 'dist/sw.js',
      },
      manifest: {
        name: 'Chu-ban',
        short_name: 'Chu-ban',
        description: 'Тёплый трекер повседневных задач',
        theme_color: '#7C9885',
        background_color: '#FAF6F0',
        display: 'standalone',
        start_url: '/chu-ban/',
        scope: '/chu-ban/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  test: {
    environment: 'node',
  },
});
```

- [ ] **Step 6: Verify**

Run:
```bash
npm run build
npm run preview
```
Expected: build succeeds and prints that `dist/sw.js` was generated; opening the preview URL in a browser, the DevTools Application tab shows a registered service worker and a valid Web App Manifest with the "Chu-ban" name and both icon sizes.

- [ ] **Step 7: Commit**

```bash
git add source-icon.svg scripts/generate-icons.mjs src/sw.ts vite.config.ts public/icon-192.png public/icon-512.png
git commit -m "feat: add PWA manifest, generated icons, and combined service worker"
```

---

## Task 21: OneSignal Client Integration

**Files:**
- Create: `src/onesignal/init.ts`
- Modify: `src/Shell.tsx` (load OneSignal, log in the external user id, prompt for permission once)

**Interfaces:**
- Produces: `loadOneSignal()`, `loginOneSignal(uid: string)`, `requestPushPermission()` — called from `Shell`.

- [ ] **Step 1: Create the OneSignal app (dashboard, one-time manual setup)**

1. Go to https://onesignal.com, create a free account and a new app named "Chu-ban".
2. Choose **Web Push** as the platform, select **Custom Code** integration (not the auto-injected script), and set the site URL to `https://<your-github-username>.github.io/chu-ban/`.
3. Copy the **OneSignal App ID** shown in Settings → Keys & IDs, and add it to your local `.env` as `VITE_ONESIGNAL_APP_ID`.
4. In the same Keys & IDs page, copy the **REST API Key** — save it somewhere safe, it's needed in Task 22 (do not commit it).

- [ ] **Step 2: Create `src/onesignal/init.ts`**

```ts
export interface OneSignalSdk {
  init(options: { appId: string; serviceWorkerPath?: string }): Promise<void>;
  login(externalId: string): Promise<void>;
  logout(): Promise<void>;
  Notifications: {
    requestPermission(): Promise<void>;
  };
}

declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: OneSignalSdk) => void>;
  }
}

function pushDeferred(callback: (OneSignal: OneSignalSdk) => void): void {
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(callback);
}

export function loadOneSignal(): void {
  if (document.getElementById('onesignal-sdk')) return;
  const script = document.createElement('script');
  script.id = 'onesignal-sdk';
  script.src = 'https://cdn.onesignal.com/sdks/OneSignalSDK.page.js';
  script.defer = true;
  document.head.appendChild(script);

  pushDeferred(async (OneSignal) => {
    await OneSignal.init({
      appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
      serviceWorkerPath: 'sw.js',
    });
  });
}

export function loginOneSignal(uid: string): void {
  pushDeferred(async (OneSignal) => {
    await OneSignal.login(uid);
  });
}

export function requestPushPermission(): void {
  pushDeferred(async (OneSignal) => {
    await OneSignal.Notifications.requestPermission();
  });
}
```

- [ ] **Step 3: Modify `src/Shell.tsx`**

Add the import and an effect that loads OneSignal and logs in once `uid` is known:

```tsx
import { useEffect } from 'react';
import { loadOneSignal, loginOneSignal, requestPushPermission } from './onesignal/init';
```

Inside `Shell`, right after the `useTasks(uid)` line, add:

```tsx
  useEffect(() => {
    loadOneSignal();
    loginOneSignal(uid);
  }, [uid]);
```

And in the `settings` tab branch, add a permission-request button above `<SettingsPage ... />`:

```tsx
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
```

- [ ] **Step 4: Verify**

Run: `npm run build && npm run preview`, open the preview URL, sign in, go to Settings, tap "Включить уведомления".
Expected: the browser's native push permission prompt appears; after allowing, the OneSignal dashboard (Audience → Subscriptions) shows a new subscribed user with the external ID matching the signed-in `uid` (visible in Firebase Auth console → Users).

- [ ] **Step 5: Commit**

```bash
git add src/onesignal/init.ts src/Shell.tsx
git commit -m "feat: integrate OneSignal web push with external user id login"
```

---

## Task 22: Reminder Delivery Script

**Files:**
- Create: `scripts/send-reminders.mjs`

**Interfaces:**
- Consumes: Firestore `reminders` collection (top-level, `sent`/`fireAt` fields) and `users/{uid}/tasks/{taskId}` documents, both from Task 9/10's schema.
- Produces: a standalone Node script invoked by Task 23's GitHub Actions workflow via `FIREBASE_SERVICE_ACCOUNT_JSON`, `ONESIGNAL_APP_ID`, `ONESIGNAL_REST_API_KEY` env vars.

- [ ] **Step 1: Create `scripts/send-reminders.mjs`**

```js
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
const oneSignalAppId = process.env.ONESIGNAL_APP_ID;
const oneSignalApiKey = process.env.ONESIGNAL_REST_API_KEY;

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function sendPush(uid, body) {
  const response = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${oneSignalApiKey}`,
    },
    body: JSON.stringify({
      app_id: oneSignalAppId,
      include_external_user_ids: [uid],
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
```

- [ ] **Step 2: Local dry run**

1. In the Chu-ban app, create a task with a deadline and add a reminder with a custom time a few minutes in the past (so it's already due).
2. Run locally, using the service account JSON downloaded in Task 6 Step 1.5:

```bash
FIREBASE_SERVICE_ACCOUNT_JSON="$(cat /path/to/service-account.json)" \
ONESIGNAL_APP_ID="<your-onesignal-app-id>" \
ONESIGNAL_REST_API_KEY="<your-onesignal-rest-api-key>" \
node scripts/send-reminders.mjs
```

Expected: console logs "Found 1 due reminder(s)." then "Sent reminder ... for task ...", a push notification arrives on the signed-in test device, and the reminder's `sent` field flips to `true` in the Firestore console. Running the command again logs "Found 0 due reminder(s)." (idempotent).

- [ ] **Step 3: Commit**

```bash
git add scripts/send-reminders.mjs
git commit -m "feat: add reminder delivery script for the CI cron job"
```

---

## Task 23: GitHub Actions — Scheduled Reminder Delivery

**Files:**
- Create: `.github/workflows/reminders.yml`

**Interfaces:**
- Consumes: `scripts/send-reminders.mjs` from Task 22.

- [ ] **Step 1: Create `.github/workflows/reminders.yml`**

```yaml
name: Send reminders

on:
  schedule:
    - cron: '*/10 * * * *'
  workflow_dispatch: {}

jobs:
  send:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: node scripts/send-reminders.mjs
        env:
          FIREBASE_SERVICE_ACCOUNT_JSON: ${{ secrets.FIREBASE_SERVICE_ACCOUNT_JSON }}
          ONESIGNAL_APP_ID: ${{ secrets.ONESIGNAL_APP_ID }}
          ONESIGNAL_REST_API_KEY: ${{ secrets.ONESIGNAL_REST_API_KEY }}
```

- [ ] **Step 2: Set the GitHub Actions secrets**

Requires the repository to already exist (created in Task 24 Step 1) — if doing Task 24 first, come back to this step afterward. Run, from the repo root:

```bash
gh secret set FIREBASE_SERVICE_ACCOUNT_JSON < /path/to/service-account.json
gh secret set ONESIGNAL_APP_ID --body "<your-onesignal-app-id>"
gh secret set ONESIGNAL_REST_API_KEY --body "<your-onesignal-rest-api-key>"
```

- [ ] **Step 3: Verify**

Run: `gh workflow run reminders.yml` (after pushing this file, and after Task 24's repo push), then `gh run watch`.
Expected: the run succeeds; its log shows "Found N due reminder(s)." — create a past-due reminder first if you want to see an actual send.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/reminders.yml
git commit -m "ci: add scheduled reminder delivery workflow"
```

---

## Task 24: GitHub Repo, Pages Deploy Workflow, First Deploy

**Files:**
- Create: `.github/workflows/deploy.yml`

**Interfaces:** none (deployment infrastructure only).

- [ ] **Step 1: Create the public GitHub repository**

```bash
gh repo create chu-ban --public --source=. --remote=origin --push
```

Expected: the repo is created under your account and the current `main` branch is pushed.

- [ ] **Step 2: Enable GitHub Pages with the Actions source**

In the repo's web UI: **Settings → Pages → Build and deployment → Source**, select **GitHub Actions**.

- [ ] **Step 3: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch: {}

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
          VITE_ONESIGNAL_APP_ID: ${{ secrets.VITE_ONESIGNAL_APP_ID }}
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 4: Set the build-time secrets**

```bash
gh secret set VITE_FIREBASE_API_KEY --body "<value from .env>"
gh secret set VITE_FIREBASE_AUTH_DOMAIN --body "<value from .env>"
gh secret set VITE_FIREBASE_PROJECT_ID --body "<value from .env>"
gh secret set VITE_FIREBASE_STORAGE_BUCKET --body "<value from .env>"
gh secret set VITE_FIREBASE_MESSAGING_SENDER_ID --body "<value from .env>"
gh secret set VITE_FIREBASE_APP_ID --body "<value from .env>"
gh secret set VITE_ONESIGNAL_APP_ID --body "<value from .env>"
```

Also complete Task 23 Step 2 now if you skipped it earlier — both workflows' secrets are set the same way.

- [ ] **Step 5: Add the deployed origin to Firebase's authorized domains**

In Firebase console → Authentication → Settings → Authorized domains, add `<your-github-username>.github.io` (Google sign-in will fail on the deployed site otherwise).

- [ ] **Step 6: Push and verify**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Pages deploy workflow"
git push
gh run watch
```

Expected: the `Deploy to GitHub Pages` run succeeds; visiting `https://<your-github-username>.github.io/chu-ban/` on a phone shows the Chu-ban login screen, and signing in with the allowed Google account works end-to-end (create a task, see it in Firestore console).

---

## Task 25: Visual Polish Pass

**Files:**
- Modify: `src/pages/TasksPage.tsx` (already has an empty state from Task 16 — verify copy and spacing)
- Modify: `src/pages/CalendarPage.tsx`, `src/pages/StatsPage.tsx` (add matching empty states)

**Interfaces:** none (visual refinement only, no new data contracts).

- [ ] **Step 1: Add an empty state to `src/pages/CalendarPage.tsx`**

Add, right after the `selectedDay &&` block's closing `)}`, a hint shown when nothing has a deadline at all:

```tsx
{tasksWithDeadline.length === 0 && (
  <p className="pt-4 text-center text-sm text-ink/40">
    Дедлайнов пока нет — самое спокойное состояние календаря 🌤️
  </p>
)}
```

- [ ] **Step 2: Add an empty state to `src/pages/StatsPage.tsx`**

Add, as the first line inside the returned `<div>`, before the counters grid:

```tsx
{stats.completedThisMonth === 0 && milestones.totalCompleted === 0 && (
  <p className="text-center text-sm text-ink/40">
    Здесь появятся твои победы, как только закроешь первую задачу 🌿
  </p>
)}
```

- [ ] **Step 3: Live design review**

Run `npm run dev`, open the app in a mobile-width browser viewport (375×812), and walk through every tab and the task/epic create-edit flow. Using the frontend-design/impeccable design principles (calm, non-clinical, generous whitespace, legible contrast), check and fix in place:

- Text contrast: `text-ink/40` and `text-ink/50` on `bg-cream`/`bg-white` should stay comfortably readable — bump to `/60` anywhere it looks too faint at a glance.
- Tap targets: every button should be at least 44×44px effective hit area — the palette swatches in `SettingsPage` (`h-7 w-7` = 28px) are the one exception worth widening; change them to `h-9 w-9`.
- Consistent corner radii: cards use `rounded-2xl`, pills/buttons use `rounded-full` — verify no stray `rounded-lg`/`rounded-md` slipped in.
- Consistent spacing rhythm: sections use `space-y-4`/`space-y-6` — verify no cramped `space-y-1` between unrelated blocks.

Fix anything found directly in the relevant component file.

- [ ] **Step 4: Commit**

```bash
git add src/pages/CalendarPage.tsx src/pages/StatsPage.tsx
git commit -m "polish: add empty states and tighten visual consistency"
```

---

## Plan Self-Review Notes

- **Spec coverage:** auth+allowlist (7), spheres CRUD+seeding (8), tasks/epics CRUD+cascade close (9, 16), reminders CRUD+presets+custom (10, 13, 14), overdue soft-copy banner (11, 12), calendar with drill-down (17), supportive stats+milestones no streaks (5, 18), settings/sphere management (19), PWA (20), OneSignal (21), scheduled push delivery without a paid backend (22, 23), GitHub Pages deploy + repo creation (24), visual polish (25). Every spec section maps to a task.
- **Type consistency verified:** `NewTaskInput` (Task 9) is the single shape used by `addTask`/`updateTask`/`TaskForm`; `Reminder`/`NewReminderInput` (Task 10) match `ReminderPicker`'s `(fireAt: Date) => void` callback shape; `closeEpicWithSubtasks(uid, epicId, allTasks)` (Task 9) matches `useTasks().closeEpic(epicId)` and `TasksPage`'s `onCloseEpic` prop; `Tab` (Task 2) is used identically by `BottomNav` and `Shell`.
- **No placeholders:** every step contains complete, runnable code or a concrete command/console instruction — no "TBD" or "add appropriate X" remains.
