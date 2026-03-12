import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';
import sharp from 'sharp';

interface ProcessPhotoRequest {
  storagePath: string;
  isPrimary: boolean;
  displayOrder: number;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit: max 20 photo uploads per hour per user
  const { allowed } = checkRateLimit(`photo:${user.id}`, 20, 3600_000);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many uploads. Please try again later.' }, { status: 429 });
  }

  let body: ProcessPhotoRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { storagePath, isPrimary, displayOrder } = body;

  if (!storagePath) {
    return NextResponse.json({ error: 'Missing storagePath' }, { status: 400 });
  }

  // Verify the path belongs to this user
  if (!storagePath.startsWith(`${user.id}/`)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    // Download the original from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('photos')
      .download(storagePath);

    if (downloadError || !fileData) {
      return NextResponse.json(
        { error: `Failed to download original: ${downloadError?.message}` },
        { status: 500 }
      );
    }

    // Convert to buffer and apply Sharp blur (sigma 20)
    const originalBuffer = Buffer.from(await fileData.arrayBuffer());
    const blurredBuffer = await sharp(originalBuffer).blur(20).toBuffer();

    // Build the blurred path by replacing /original/ with /blurred/
    const blurredPath = storagePath.replace('/original/', '/blurred/');

    // Upload the blurred version
    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(blurredPath, blurredBuffer, {
        contentType: fileData.type || 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: `Failed to upload blurred photo: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Insert into photos table
    const { data: photoRow, error: insertError } = await supabase
      .from('photos')
      .insert({
        user_id: user.id,
        storage_path: storagePath,
        blurred_path: blurredPath,
        is_primary: isPrimary,
        display_order: displayOrder ?? 0,
      } as never)
      .select()
      .single();

    if (insertError) {
      // Clean up blurred file on DB failure
      await supabase.storage.from('photos').remove([blurredPath]);
      return NextResponse.json(
        { error: `Failed to save photo record: ${insertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, photo: photoRow });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
