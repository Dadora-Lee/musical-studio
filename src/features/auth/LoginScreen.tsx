import { StudioApp } from '@/components/studio/StudioApp';
import { buildSignedOutAuthContext } from '@/lib/domain/access-control';

export function LoginScreen() {
  return <StudioApp authContext={buildSignedOutAuthContext()} />;
}
