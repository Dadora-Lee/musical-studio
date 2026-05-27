import { redirect } from 'next/navigation';
import { LoginScreen } from '@/features/auth/LoginScreen';
import { createClient } from '@/lib/supabase/server';

async function hasSession() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return Boolean(data.user);
}

export default async function LoginPage() {
  if (await hasSession()) {
    redirect('/work');
  }

  return <LoginScreen />;
}
