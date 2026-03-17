import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { reorder?: Array<{ id: string; displayOrder: number }>; setPrimary?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  try {
    // Reorder photos
    if (body.reorder && Array.isArray(body.reorder)) {
      for (const item of body.reorder) {
        // Verify ownership before updating
        const { data: photo } = await supabase
          .from('photos')
          .select('id')
          .eq('id', item.id)
          .eq('user_id', user.id)
          .single();

        if (!photo) {
          return NextResponse.json({ error: `Photo ${item.id} not found` }, { status: 404 });
        }

        await supabase
          .from('photos')
          .update({ display_order: item.displayOrder } as never)
          .eq('id', item.id);
      }

      return NextResponse.json({ success: true });
    }

    // Set primary photo
    if (body.setPrimary) {
      // Verify ownership
      const { data: photo } = await supabase
        .from('photos')
        .select('id')
        .eq('id', body.setPrimary)
        .eq('user_id', user.id)
        .single();

      if (!photo) {
        return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
      }

      // Unset all other photos as non-primary
      await supabase
        .from('photos')
        .update({ is_primary: false } as never)
        .eq('user_id', user.id);

      // Set the selected photo as primary
      await supabase
        .from('photos')
        .update({ is_primary: true } as never)
        .eq('id', body.setPrimary);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'No valid action provided' }, { status: 400 });
  } catch (err) {
    console.error('Photo update failed:', err);
    return NextResponse.json({ error: 'Failed to update photos' }, { status: 500 });
  }
}
