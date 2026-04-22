import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { MatchCardView } from '@/components/app/match-card/MatchCardView';

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ presentationId: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { presentationId } = await params;

  return <MatchCardView presentationId={presentationId} />;
}
