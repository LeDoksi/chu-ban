import { LockKeyhole } from 'lucide-react';
import { signOutUser } from '../firebase/auth';

export function AccessDeniedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-cream px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-terracotta/15">
        <LockKeyhole size={28} strokeWidth={1.75} className="text-terracotta" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Доступ закрыт</h1>
        <p className="max-w-[28ch] text-[15px] leading-relaxed text-ink/60">
          Chu-ban — приватный трекер только для двоих. Этот аккаунт в список не входит.
        </p>
      </div>
      <button
        onClick={() => signOutUser()}
        className="rounded-full border border-ink/15 px-6 py-3 font-medium text-ink transition hover:bg-ink/5 active:scale-[0.98]"
      >
        Выйти
      </button>
    </div>
  );
}
