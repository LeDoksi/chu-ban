# Chu-ban

Мобильный PWA-трекер бытовых задач для двоих. React + Vite + Firebase (Firestore/Auth), пуш-напоминания через OneSignal, деплой — GitHub Pages (фронтенд) + Netlify Functions (сервер для планирования напоминаний).

Живой инстанс: https://ledoksi.github.io/chu-ban/

## Стек

- **Фронтенд**: React 18, Vite 5, TypeScript, Tailwind CSS 4, `vite-plugin-pwa` (service worker собирается из `src/sw.ts`)
- **Данные и авторизация**: Firebase (Firestore + Google Auth), доступ ограничен списком email в `firestore.rules`
- **Пуш-уведомления**: OneSignal Web SDK на клиенте + Netlify Functions как сервер, который держит секретный OneSignal REST-ключ и планирует/отменяет пуши через `send_after` (`netlify/functions/schedule.js`, `cancel.js`)
- **Тесты**: Vitest (`npm test`)

## Локальный запуск

```bash
npm install
cp .env.example .env   # и заполнить значения, см. ниже
npm run dev
```

Другие команды: `npm run build` (typecheck + сборка), `npm run typecheck`, `npm test`, `npm run preview`.

## Переменные окружения

### Клиент (`.env`, префикс `VITE_*`, собираются в бандл на этапе сборки)

| Переменная | Где взять |
|---|---|
| `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID` | Firebase Console → Project settings → General → Your apps |
| `VITE_ONESIGNAL_APP_ID` | OneSignal Dashboard → Settings → Keys & IDs |
| `VITE_REMINDER_WORKER_URL` | URL задеплоенных Netlify Functions (например `https://<site>.netlify.app`), без слэша на конце |
| `VITE_REMINDER_WORKER_SECRET` | Общий секрет между клиентом и Netlify Functions — придумывается вручную и должен совпадать с `WORKER_SHARED_SECRET` на стороне Netlify |

### Netlify Functions (задаются в Netlify Dashboard → Site settings → Environment variables, **не** в `.env`)

| Переменная | Назначение |
|---|---|
| `WORKER_SHARED_SECRET` | Тот же секрет, что и `VITE_REMINDER_WORKER_SECRET` — им функции проверяют, что запрос пришёл от нашего клиента |
| `ONESIGNAL_APP_ID` | ID приложения OneSignal |
| `ONESIGNAL_REST_API_KEY` | Секретный REST-ключ OneSignal (`Key <...>`), не должен попадать в клиентский бандл |

⚠️ Netlify запекает переменные окружения функций в момент деплоя — после изменения значений в дашборде нужен новый деплой (см. `netlify.toml`), иначе изменения не применятся.

### GitHub Actions (Repository settings → Secrets and variables → Actions)

Те же `VITE_*` переменные, что и в `.env` — используются в `.github/workflows/deploy.yml` при сборке для GitHub Pages.

## Деплой

- **Фронтенд**: пуш в `main` запускает `.github/workflows/deploy.yml` → сборка → GitHub Pages
- **Netlify Functions**: сайт на Netlify собирается из `netlify/functions/`, задаётся `netlify.toml` (`publish = "public"`, `functions = "netlify/functions"`)
- **Firestore**: правила и индексы (`firestore.rules`, `firestore.indexes.json`) деплоятся вручную через `npx firebase-tools deploy --only firestore --project chu-ban` (обычный npm-пакет `firebase` — это клиентский SDK, CLI-команды даёт только `firebase-tools`)

## Структура

```
src/
  components/   переиспользуемые UI-компоненты
  firebase/     инициализация Firebase, обёртки над Firestore/Auth
  hooks/        React-хуки (задачи, напоминания, сферы жизни)
  lib/          чистая логика без побочных эффектов (даты, каскад эпиков, статистика, клиент воркера напоминаний)
  onesignal/    инициализация OneSignal Web SDK
  pages/        экраны приложения
netlify/functions/  сервер планирования/отмены пуш-напоминаний (держит секреты OneSignal)
```
