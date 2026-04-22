import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { FeedbackForm } from '@/components/app/FeedbackForm';

export default async function FeedbackPage({
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

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Match Feedback</h2>
      <p className="text-sm text-gray-500">
        Your feedback helps us find better matches for you.
      </p>
      <FeedbackForm presentationId={presentationId} />
    </div>
  );
}
