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
