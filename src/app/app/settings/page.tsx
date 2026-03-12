import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SettingsPage } from '@/components/app/SettingsPage';

export default async function Settings() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return <SettingsPage email={user.email ?? ''} />;
}
