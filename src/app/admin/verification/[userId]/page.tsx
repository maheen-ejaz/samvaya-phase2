import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { BgvTracker } from '@/components/admin/verification/BgvTracker';

export default async function BgvTrackerPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  // Auth check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const adminSupabase = createAdminClient();

  // Fetch user info for header
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

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/admin/verification"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          &larr; Verification Queue
        </Link>
        <span className="text-gray-300">|</span>
        <Link
          href={`/admin/applicants/${userId}`}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          View Profile
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900">BGV Tracker — {name}</h1>
      <p className="mb-6 mt-1 text-sm text-gray-500">13 OnGrid checks</p>

      <BgvTracker userId={userId} />
    </div>
  );
}
