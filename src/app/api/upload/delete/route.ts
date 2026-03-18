import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';

interface DeleteUploadRequest {
  type: 'photo' | 'document';
  id: string;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit: 30 deletes per hour per user
  const { allowed } = checkRateLimit(`delete:${user.id}`, 30, 3600_000);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many delete attempts. Please try again later.' }, { status: 429 });
  }

  let body: DeleteUploadRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { type, id } = body;

  if (!type || !id) {
    return NextResponse.json({ error: 'Missing type or id' }, { status: 400 });
  }

  try {
    if (type === 'photo') {
      // Fetch the photo record
      const { data: photo, error: fetchError } = await supabase
        .from('photos')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (fetchError || !photo) {
        return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
      }

      // Delete storage files (original + blurred)
      const filesToRemove = [photo.storage_path];
      if (photo.blurred_path) {
        filesToRemove.push(photo.blurred_path);
      }
      await supabase.storage.from('photos').remove(filesToRemove);

      // Delete DB row
      const { error: deleteError } = await supabase
        .from('photos')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Failed to delete photo record:', deleteError);
        return NextResponse.json(
          { error: 'Failed to delete photo record' },
          { status: 500 }
        );
      }
    } else if (type === 'document') {
      // Fetch the document record
      const { data: doc, error: fetchError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (fetchError || !doc) {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 });
      }

      // Delete storage file
      await supabase.storage.from('documents').remove([doc.storage_path]);

      // Delete DB row
      const { error: deleteError } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Failed to delete document record:', deleteError);
        return NextResponse.json(
          { error: 'Failed to delete document record' },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete upload failed:', err);
    return NextResponse.json({ error: 'Failed to delete record' }, { status: 500 });
  }
}
