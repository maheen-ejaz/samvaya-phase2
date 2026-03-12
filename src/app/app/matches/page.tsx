import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { MatchList } from '@/components/app/MatchList';

export default async function MatchesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Your Matches</h2>
      <MatchList />
    </div>
  );
}
