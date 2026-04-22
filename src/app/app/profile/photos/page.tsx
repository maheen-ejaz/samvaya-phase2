import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PhotoManager } from '@/components/app/PhotoManager';

export default async function PhotosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <PhotoManager />
    </div>
  );
}
