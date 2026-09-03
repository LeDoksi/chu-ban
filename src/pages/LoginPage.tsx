import { Sprout } from 'lucide-react';
import { signIn } from '../firebase/auth';

function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.61z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path fill="#FBBC05" d="M3.97 10.71a5.4 5.4 0 0 1 0-3.42V4.96H.96a9 9 0 0 0 0 8.08l3.01-2.33z" />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  );
}

export function LoginPage({ error }: { error?: string | null }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-cream px-6 text-center">
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-sage/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />

      <div className="relative flex flex-col items-center gap-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-sage/15">
          <Sprout size={30} strokeWidth={1.75} className="text-sage" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-ink">Chu-ban</h1>
          <p className="max-w-[26ch] text-[15px] leading-relaxed text-ink/60">
            Тёплое место для повседневных дел. Войди, чтобы увидеть свои задачи.
          </p>
        </div>

        <button
          onClick={() => signIn()}
          className="flex items-center gap-2.5 rounded-full bg-white px-6 py-3 font-medium text-ink shadow-[0_1px_2px_rgba(46,42,38,0.06),0_8px_20px_rgba(46,42,38,0.08)] transition hover:shadow-[0_1px_2px_rgba(46,42,38,0.08),0_10px_24px_rgba(46,42,38,0.12)] active:scale-[0.98]"
        >
          <GoogleGlyph />
          Войти через Google
        </button>

        {error && (
          <p className="max-w-[30ch] rounded-2xl bg-terracotta/15 px-4 py-2.5 text-sm text-ink">
            Не получилось войти: {error}. Попробуй ещё раз.
          </p>
        )}
      </div>
    </div>
  );
}
