'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

// --- Types ---

type PhotoType = 'face_closeup' | 'full_length' | 'professional' | 'casual' | 'additional';

interface PhotoSlotDef {
  key: string;
  photoType: PhotoType;
  label: string;
  description: string;
  required: boolean;
  isPrimary: boolean;
}

interface PhotoItem {
  id: string;
  storagePath: string;
  blurredPath?: string;
  photoType: string;
  displayOrder: number;
  signedUrl?: string;
}

// --- Constants ---

const NAMED_SLOTS: PhotoSlotDef[] = [
  { key: 'face_closeup', photoType: 'face_closeup', label: 'Face close-up', description: 'A clear, well-lit photo of your face', required: true, isPrimary: true },
  { key: 'full_length', photoType: 'full_length', label: 'Full-length', description: 'Full figure, standing naturally', required: false, isPrimary: false },
  { key: 'professional', photoType: 'professional', label: 'Professional / formal', description: 'At work or a formal event', required: false, isPrimary: false },
  { key: 'casual', photoType: 'casual', label: 'Casual / lifestyle', description: 'Travel, hobby, or with friends', required: false, isPrimary: false },
];

const MAX_TOTAL = 10;
const MIN_TOTAL = 1;
const COMPRESSION_THRESHOLD_MB = 3;
const COMPRESSION_TARGET_MB = 3;
const MAX_DIMENSION = 2048;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// --- Component ---

export function PhotoManager() {
  const [userId, setUserId] = useState<string | null>(null);
  const [slotPhotos, setSlotPhotos] = useState<Record<string, PhotoItem | null>>(() => {
    const initial: Record<string, PhotoItem | null> = {};
    for (const s of NAMED_SLOTS) initial[s.key] = null;
    return initial;
  });
  const [additionalPhotos, setAdditionalPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null); // slot key or 'additional'
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const additionalInputRef = useRef<HTMLInputElement>(null);

  const namedCount = Object.values(slotPhotos).filter(Boolean).length;
  const totalCount = namedCount + additionalPhotos.length;

  // --- Load existing photos ---
  useEffect(() => {
    const load = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);

        const { data } = await supabase
          .from('photos')
          .select('*')
          .eq('user_id', user.id)
          .order('display_order');

        if (!data) return;

        const newSlots: Record<string, PhotoItem | null> = {};
        for (const s of NAMED_SLOTS) newSlots[s.key] = null;
        const newAdditional: PhotoItem[] = [];

        for (const row of data) {
          const rowAny = row as typeof row & { photo_type?: string | null };
          const previewPath = (row.blurred_path || row.storage_path) as string;
          const { data: urlData } = await supabase.storage
            .from('photos')
            .createSignedUrl(previewPath, 3600);

          const item: PhotoItem = {
            id: row.id,
            storagePath: row.storage_path,
            blurredPath: row.blurred_path ?? undefined,
            photoType: rowAny.photo_type || 'additional',
            displayOrder: row.display_order,
            signedUrl: urlData?.signedUrl,
          };

          const matchingSlot = NAMED_SLOTS.find((s) => s.photoType === rowAny.photo_type);
          if (matchingSlot && !newSlots[matchingSlot.key]) {
            newSlots[matchingSlot.key] = item;
          } else {
            newAdditional.push(item);
          }
        }

        setSlotPhotos(newSlots);
        setAdditionalPhotos(newAdditional);
      } catch (err) {
        setError('Failed to load photos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // --- Compression ---
  const compressFile = useCallback(async (file: File): Promise<{ compressed: File; note: string | null }> => {
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB <= COMPRESSION_THRESHOLD_MB) return { compressed: file, note: null };
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: COMPRESSION_TARGET_MB,
        maxWidthOrHeight: MAX_DIMENSION,
        useWebWorker: true,
        fileType: file.type as 'image/jpeg' | 'image/png' | 'image/webp',
      });
      return {
        compressed: compressed as File,
        note: `Optimized from ${formatFileSize(file.size)} to ${formatFileSize(compressed.size)}`,
      };
    } catch {
      return { compressed: file, note: null };
    }
  }, []);

  // --- Upload helper ---
  const uploadPhoto = useCallback(
    async (file: File, photoType: PhotoType, displayOrder: number): Promise<PhotoItem | null> => {
      if (!userId) return null;
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError('File must be JPEG, PNG, or WebP');
        return null;
      }
      if (file.size > 25 * 1024 * 1024) {
        setError('File must be under 25 MB');
        return null;
      }

      const { compressed, note } = await compressFile(file);
      if (note) setSuccessMsg(note);

      const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_{2,}/g, '_');
      const filename = `${Date.now()}_${sanitized}`;
      const originalPath = `${userId}/original/${filename}`;
      const supabase = createClient();

      const { error: storageError } = await supabase.storage
        .from('photos')
        .upload(originalPath, compressed, { contentType: compressed.type, upsert: false });

      if (storageError) {
        setError(`Upload failed: ${storageError.message}`);
        return null;
      }

      const res = await fetch('/api/upload/process-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storagePath: originalPath, photoType, displayOrder }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || 'Failed to process photo');
        await supabase.storage.from('photos').remove([originalPath]);
        return null;
      }

      const { photo: photoRow } = await res.json();
      const previewPath = photoRow.blurred_path || photoRow.storage_path;
      const { data: urlData } = await supabase.storage
        .from('photos')
        .createSignedUrl(previewPath, 3600);

      return {
        id: photoRow.id,
        storagePath: photoRow.storage_path,
        blurredPath: photoRow.blurred_path,
        photoType: photoRow.photo_type || photoType,
        displayOrder: photoRow.display_order,
        signedUrl: urlData?.signedUrl,
      };
    },
    [userId, compressFile]
  );

  // --- Delete helper ---
  const deletePhoto = useCallback(async (photoId: string): Promise<boolean> => {
    if (totalCount <= MIN_TOTAL) {
      setError(`You must keep at least ${MIN_TOTAL} photos`);
      return false;
    }
    const res = await fetch('/api/upload/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'photo', id: photoId }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      setError(errData.error || 'Failed to delete');
      return false;
    }
    return true;
  }, [totalCount]);

  // --- Slot upload ---
  const handleSlotUpload = useCallback(
    async (slotKey: string, file: File) => {
      const slot = NAMED_SLOTS.find((s) => s.key === slotKey);
      if (!slot) return;

      setError(null);
      setSuccessMsg(null);
      setUploading(slotKey);

      // Delete existing if replacing
      const existing = slotPhotos[slotKey];
      if (existing) {
        // When replacing, don't enforce minimum — we're adding one back
        const res = await fetch('/api/upload/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'photo', id: existing.id }),
        });
        if (!res.ok) {
          setError('Failed to replace photo');
          setUploading(null);
          return;
        }
      }

      const displayOrder = NAMED_SLOTS.findIndex((s) => s.key === slotKey);
      const newPhoto = await uploadPhoto(file, slot.photoType, displayOrder);

      if (newPhoto) {
        setSlotPhotos((prev) => ({ ...prev, [slotKey]: newPhoto }));
      }
      setUploading(null);
    },
    [slotPhotos, uploadPhoto]
  );

  // --- Slot delete ---
  const handleSlotDelete = useCallback(
    async (slotKey: string) => {
      const photo = slotPhotos[slotKey];
      if (!photo) return;
      setError(null);
      const ok = await deletePhoto(photo.id);
      if (ok) {
        setSlotPhotos((prev) => ({ ...prev, [slotKey]: null }));
      }
    },
    [slotPhotos, deletePhoto]
  );

  // --- Additional upload ---
  const handleAdditionalUpload = useCallback(
    async (file: File) => {
      if (totalCount >= MAX_TOTAL) {
        setError(`Maximum ${MAX_TOTAL} photos reached`);
        return;
      }
      setError(null);
      setSuccessMsg(null);
      setUploading('additional');

      const displayOrder = NAMED_SLOTS.length + additionalPhotos.length;
      const newPhoto = await uploadPhoto(file, 'additional', displayOrder);

      if (newPhoto) {
        setAdditionalPhotos((prev) => [...prev, newPhoto]);
      }
      setUploading(null);
    },
    [totalCount, additionalPhotos, uploadPhoto]
  );

  // --- Additional delete ---
  const handleAdditionalDelete = useCallback(
    async (photoId: string) => {
      setError(null);
      const ok = await deletePhoto(photoId);
      if (ok) {
        setAdditionalPhotos((prev) => prev.filter((p) => p.id !== photoId));
      }
    },
    [deletePhoto]
  );

  // --- Render ---
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-samvaya-red" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="type-heading text-gray-900">Manage Photos</h2>
        <Link
          href="/app/profile"
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          Back to Profile
        </Link>
      </div>

      <p className="text-sm text-gray-500">
        Upload at least {MIN_TOTAL} photos from different angles. Your photos are blurred for other members
        until you both express mutual interest.
      </p>

      {/* Named slots */}
      {NAMED_SLOTS.map((slot) => {
        const photo = slotPhotos[slot.key];
        const isUploading = uploading === slot.key;

        return (
          <div key={slot.key} className="space-y-1.5">
            <div className="flex items-baseline gap-2">
              <h3 className="text-sm font-medium text-gray-900">{slot.label}</h3>
              {slot.required ? (
                <span className="text-xs text-rose-500">Required</span>
              ) : (
                <span className="text-xs text-gray-400">Optional</span>
              )}
            </div>
            <p className="text-xs text-gray-500">{slot.description}</p>

            {photo ? (
              <div className="group relative overflow-hidden rounded-lg border border-gray-200">
                <img src={photo.signedUrl} alt={slot.label} loading="lazy" className="aspect-[3/4] w-full object-cover" />
                <div className="absolute right-2 top-2 flex gap-1.5">
                  <button
                    onClick={() => fileInputRefs.current[slot.key]?.click()}
                    className="rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
                    aria-label={`Replace ${slot.label}`}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleSlotDelete(slot.key)}
                    className="rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
                    aria-label={`Remove ${slot.label}`}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRefs.current[slot.key]?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-10 hover:border-rose-400 hover:bg-rose-50/30"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRefs.current[slot.key]?.click();
                  }
                }}
              >
                {isUploading ? (
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-rose-500" />
                ) : (
                  <>
                    <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">Tap to upload</p>
                  </>
                )}
              </div>
            )}

            <input
              ref={(el) => { fileInputRefs.current[slot.key] = el; }}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleSlotUpload(slot.key, e.target.files[0]);
                  e.target.value = '';
                }
              }}
              className="hidden"
            />
          </div>
        );
      })}

      {/* Additional photos */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-900">Additional photos</h3>
        <p className="text-xs text-gray-500">
          {totalCount < MAX_TOTAL
            ? `Up to ${MAX_TOTAL - totalCount} more photos`
            : 'Maximum reached'}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {additionalPhotos.map((photo) => (
          <div key={photo.id} className="group relative overflow-hidden rounded-lg border border-gray-200">
            <img src={photo.signedUrl} alt="Additional photo" loading="lazy" className="aspect-square w-full object-cover" />
            <button
              onClick={() => handleAdditionalDelete(photo.id)}
              className="absolute right-1 top-1 rounded-full bg-black/50 p-1.5 text-white opacity-100 hover:bg-black/70 sm:opacity-0 sm:group-hover:opacity-100"
              aria-label="Remove"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}

        {totalCount < MAX_TOTAL && (
          <div
            onClick={() => additionalInputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:border-rose-400"
            style={{ aspectRatio: '1' }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                additionalInputRef.current?.click();
              }
            }}
          >
            {uploading === 'additional' ? (
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-rose-500" />
            ) : (
              <>
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <p className="mt-1 text-xs text-gray-400">Add more</p>
              </>
            )}
          </div>
        )}
      </div>

      <input
        ref={additionalInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handleAdditionalUpload(e.target.files[0]);
            e.target.value = '';
          }
        }}
        className="hidden"
      />

      {/* Count */}
      <p className="text-center text-sm text-gray-500">
        {totalCount} of {MAX_TOTAL} photos
      </p>

      {/* Success message */}
      {successMsg && (
        <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          {successMsg}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2">
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-700" aria-label="Dismiss">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
