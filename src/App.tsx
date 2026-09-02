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
