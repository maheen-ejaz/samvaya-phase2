import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { BgvTracker } from '@/components/admin/verification/BgvTracker';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

async function loadUserData(userId: string): Promise<{ name: string }> {
  const adminSupabase = createAdminClient();

  const { data: targetUser } = await adminSupabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .single();

  if (!targetUser) notFound();

  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('user_id', userId)
    .single();

  const name = profile
    ? `${profile.first_name} ${profile.last_name}`.trim()
    : 'Unknown';

  return { name };
}

export default async function BgvTrackerPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: roleData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!roleData || (roleData.role !== 'admin' && roleData.role !== 'super_admin')) {
    redirect('/app');
  }

  const { name } = await loadUserData(userId);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="link" size="sm" asChild className="px-0 text-gray-500 hover:text-gray-700">
          <Link href="/admin/verification">
            &larr; Verification Queue
          </Link>
        </Button>
        <Separator orientation="vertical" className="h-4" />
        <Button variant="link" size="sm" asChild className="px-0 text-gray-500 hover:text-gray-700">
          <Link href={`/admin/applicants/${userId}`}>
            View Profile
          </Link>
        </Button>
      </div>

      <h1 className="text-2xl font-semibold tracking-tight text-gray-900">BGV Tracker — {name}</h1>
      <p className="mb-6 mt-1 text-sm text-gray-500">13-point background verification</p>

      <BgvTracker userId={userId} />
    </div>
  );
}
