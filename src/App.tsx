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
