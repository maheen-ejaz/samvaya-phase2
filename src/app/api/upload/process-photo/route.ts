import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';
import sharp from 'sharp';

const VALID_PHOTO_TYPES = ['face_closeup', 'full_length', 'professional', 'casual', 'additional'] as const;

interface ProcessPhotoRequest {
  storagePath: string;
  isPrimary?: boolean;
  displayOrder?: number;
  photoType?: string;
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

  const { storagePath, isPrimary, displayOrder, photoType } = body;

  if (!storagePath) {
    return NextResponse.json({ error: 'Missing storagePath' }, { status: 400 });
  }

  // Verify the path belongs to this user and block path traversal
  if (!storagePath.startsWith(`${user.id}/`) || storagePath.includes('..')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Validate photoType against allowed enum
  if (photoType && !VALID_PHOTO_TYPES.includes(photoType as typeof VALID_PHOTO_TYPES[number])) {
    return NextResponse.json({ error: 'Invalid photo type' }, { status: 400 });
  }

  try {
    // Download the original from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('photos')
      .download(storagePath);

    if (downloadError || !fileData) {
      console.error('Failed to download photo:', downloadError);
      return NextResponse.json(
        { error: 'Failed to download photo' },
        { status: 500 }
      );
    }

    // Convert to buffer and validate size (max 25MB — client compresses before upload)
    const originalBuffer = Buffer.from(await fileData.arrayBuffer());
    const MAX_PHOTO_SIZE = 25 * 1024 * 1024; // 25MB
    if (originalBuffer.length > MAX_PHOTO_SIZE) {
      await supabase.storage.from('photos').remove([storagePath]);
      return NextResponse.json(
        { error: 'Photo exceeds maximum size of 25MB' },
        { status: 400 }
      );
    }

    // SEC-10: Server-side MIME validation — detect actual format via Sharp metadata
    // Prevents polyglot file attacks (e.g., HTML disguised as .png)
    const ALLOWED_FORMATS = ['jpeg', 'png', 'webp', 'heif', 'avif'];
    try {
      const metadata = await sharp(originalBuffer).metadata();
      if (!metadata.format || !ALLOWED_FORMATS.includes(metadata.format)) {
        return NextResponse.json(
          { error: `Invalid image format: ${metadata.format || 'unknown'}. Allowed: JPEG, PNG, WebP, HEIF.` },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: 'File is not a valid image.' },
        { status: 400 }
      );
    }

    // Safety resize to max 2048px on longest edge (client usually handles this, but just in case)
    const resizedBuffer = await sharp(originalBuffer)
      .resize({ width: 2048, height: 2048, fit: 'inside', withoutEnlargement: true })
      .toBuffer();

    // If resize reduced the file, overwrite the original in storage
    if (resizedBuffer.length < originalBuffer.length) {
      await supabase.storage
        .from('photos')
        .update(storagePath, resizedBuffer, {
          contentType: fileData.type || 'image/jpeg',
          upsert: true,
        });
    }

    // Apply Sharp blur (sigma 20) on the resized version
    const blurredBuffer = await sharp(resizedBuffer).blur(20).toBuffer();

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
      console.error('Failed to upload blurred photo:', uploadError);
      return NextResponse.json(
        { error: 'Failed to process photo' },
        { status: 500 }
      );
    }

    // Determine is_primary: face_closeup type is always primary
    const resolvedIsPrimary = photoType === 'face_closeup' ? true : (isPrimary ?? false);

    // Insert into photos table
    const { data: photoRow, error: insertError } = await supabase
      .from('photos')
      .insert({
        user_id: user.id,
        storage_path: storagePath,
        blurred_path: blurredPath,
        is_primary: resolvedIsPrimary,
        display_order: displayOrder ?? 0,
        photo_type: photoType || null,
      } as never)
      .select()
      .single();

    if (insertError) {
      // Clean up blurred file on DB failure
      await supabase.storage.from('photos').remove([blurredPath]);
      console.error('Failed to save photo record:', insertError.message, insertError.details, insertError.hint);
      return NextResponse.json(
        { error: 'Failed to save photo record. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, photo: photoRow });
  } catch (err) {
    console.error('Photo processing failed:', err);
    return NextResponse.json({ error: 'Failed to process photo' }, { status: 500 });
  }
}
