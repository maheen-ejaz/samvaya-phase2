import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
        return NextResponse.json(
          { error: `Failed to delete photo record: ${deleteError.message}` },
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
        return NextResponse.json(
          { error: `Failed to delete document record: ${deleteError.message}` },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
