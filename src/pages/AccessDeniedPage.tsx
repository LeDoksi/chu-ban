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
