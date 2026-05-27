import { LoginScreen } from '@/features/auth/LoginScreen';
import { StudioApp } from '@/components/studio/StudioApp';
import { getCurrentAuthContext } from '@/lib/auth/session';
import type { DashboardView } from '@/lib/domain/interaction-state';

export default async function HomePage({
  searchParams,
}: Readonly<{
  searchParams?: Promise<{
    auth_error?: string;
    view?: string;
  }>;
}>) {
  const params = await searchParams;
  const authContext = await getCurrentAuthContext();
  const initialView: DashboardView = params?.view === 'drive' ? 'drive' : 'dashboard';

  if (authContext.state === 'signed_out') {
    return <LoginScreen />;
  }

  return <StudioApp authContext={authContext} authError={params?.auth_error} initialView={initialView} />;
}
