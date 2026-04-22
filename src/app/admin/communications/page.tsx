import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CommunicationsHub } from '@/components/admin/communications/CommunicationsHub';

export default async function CommunicationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!userData || (userData.role !== 'admin' && userData.role !== 'super_admin')) {
    redirect('/auth/login');
  }

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Communications</h1>
      <p className="mt-1 text-sm text-gray-500">Send emails, manage templates, and view send history.</p>

      <div className="mt-6">
        <CommunicationsHub />
      </div>
    </div>
  );
}
