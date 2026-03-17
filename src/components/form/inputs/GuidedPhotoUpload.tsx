'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import { createClient } from '@/lib/supabase/client';
import { useForm } from '../FormProvider';
import { UploadDropZone } from './UploadDropZone';
import { UploadProgressRow } from './UploadProgressRow';
import type { UploadStage } from './UploadProgressRow';
import type { QuestionConfig } from '@/lib/form/types';

// --- Types ---

type PhotoType = 'face_closeup' | 'full_length' | 'professional' | 'casual' | 'additional';

interface PhotoSlot {
  key: string;
  photoType: PhotoType;
  label: string;
  description: string;
  required: boolean;
  isPrimary: boolean;
}

interface UploadedPhoto {
  id: string;
  storagePath: string;
  blurredPath?: string;
  photoType: string;
  displayOrder: number;
  signedUrl?: string;
}

interface UploadingFileInfo {
  fileName: string;
  fileSize: number;
  stage: UploadStage;
  errorMessage?: string;
  localPreviewUrl?: string;
}

interface SlotState {
  photo: UploadedPhoto | null;
  uploading: boolean;
  compressionNote: string | null;
  uploadingFile: UploadingFileInfo | null;
}

interface GuidedPhotoUploadProps {
  question: QuestionConfig;
  value: unknown;
  onChange: (value: unknown) => void;
}

// --- Slot Definitions ---

const NAMED_SLOTS: PhotoSlot[] = [
  {
    key: 'face_closeup',
    photoType: 'face_closeup',
    label: 'Face close-up',
    description: 'A clear, well-lit photo of your face — this is your first impression',
    required: true,
    isPrimary: true,
  },
  {
    key: 'full_length',
    photoType: 'full_length',
    label: 'Full-length',
    description: 'A photo showing your full figure, standing naturally',
    required: true,
    isPrimary: false,
  },
  {
    key: 'professional',
    photoType: 'professional',
    label: 'Professional / formal',
    description: 'At work, in formal attire, or at a professional event',
    required: true,
    isPrimary: false,
  },
  {
    key: 'casual',
    photoType: 'casual',
    label: 'Casual / lifestyle',
    description: 'Travel, hobby, or with friends',
    required: false,
    isPrimary: false,
  },
];

const MAX_TOTAL = 10;
const MIN_TOTAL = 3;
const COMPRESSION_THRESHOLD_MB = 3;
const COMPRESSION_TARGET_MB = 3;
const MAX_DIMENSION = 2048;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// --- Component ---

export function GuidedPhotoUpload({ question, value, onChange }: GuidedPhotoUploadProps) {
  const { userId } = useForm();

  // State for named slots
  const [slotStates, setSlotStates] = useState<Record<string, SlotState>>(() => {
    const initial: Record<string, SlotState> = {};
    for (const slot of NAMED_SLOTS) {
      initial[slot.key] = { photo: null, uploading: false, compressionNote: null, uploadingFile: null };
    }
    return initial;
  });

  // State for additional photos
  const [additionalPhotos, setAdditionalPhotos] = useState<UploadedPhoto[]>([]);
  const [additionalUploadingFile, setAdditionalUploadingFile] = useState<UploadingFileInfo | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loadedExisting, setLoadedExisting] = useState(false);

  // File input refs
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const additionalInputRef = useRef<HTMLInputElement>(null);

  // Compute total count
  const namedCount = Object.values(slotStates).filter((s) => s.photo !== null).length;
  const totalCount = namedCount + additionalPhotos.length;

  // Sync onChange whenever photos change
  const syncOnChange = useCallback(
    (slots: Record<string, SlotState>, additional: UploadedPhoto[]) => {
      const allIds: string[] = [];
      for (const slot of NAMED_SLOTS) {
        const photo = slots[slot.key]?.photo;
        if (photo) allIds.push(photo.id);
      }
      for (const p of additional) {
        allIds.push(p.id);
      }
      onChange(allIds.length > 0 ? allIds : undefined);
    },
    [onChange]
  );

  // --- Load existing photos (save-and-resume) ---
  useEffect(() => {
    if (loadedExisting) return;
    setLoadedExisting(true);

    const loadExisting = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('photos')
          .select('*')
          .eq('user_id', userId)
          .order('display_order');

        if (!data || data.length === 0) return;

        const newSlotStates: Record<string, SlotState> = {};
        for (const slot of NAMED_SLOTS) {
          newSlotStates[slot.key] = { photo: null, uploading: false, compressionNote: null, uploadingFile: null };
        }
        const newAdditional: UploadedPhoto[] = [];

        for (const row of data) {
          const rowAny = row as typeof row & { photo_type?: string | null };
          // Show original image to the applicant (not blurred)
          const { data: urlData } = await supabase.storage
            .from('photos')
            .createSignedUrl(row.storage_path, 3600);

          const photo: UploadedPhoto = {
            id: row.id,
            storagePath: row.storage_path,
            blurredPath: row.blurred_path ?? undefined,
            photoType: rowAny.photo_type || 'additional',
            displayOrder: row.display_order,
            signedUrl: urlData?.signedUrl,
          };

          const photoType = rowAny.photo_type as string | null;
          const matchingSlot = NAMED_SLOTS.find((s) => s.photoType === photoType);
          if (matchingSlot && !newSlotStates[matchingSlot.key].photo) {
            newSlotStates[matchingSlot.key] = { photo, uploading: false, compressionNote: null, uploadingFile: null };
          } else {
            newAdditional.push(photo);
          }
        }

        setSlotStates(newSlotStates);
        setAdditionalPhotos(newAdditional);
        syncOnChange(newSlotStates, newAdditional);
      } catch (err) {
        console.error('Failed to load existing photos:', err);
        setError('Failed to load previously uploaded photos. You can still upload new ones.');
      }
    };

    loadExisting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Client-side compression ---
  const compressFile = useCallback(
    async (file: File): Promise<{ compressed: File; note: string | null }> => {
      const originalSizeMB = file.size / (1024 * 1024);

      if (originalSizeMB <= COMPRESSION_THRESHOLD_MB) {
        return { compressed: file, note: null };
      }

      try {
        const compressed = await imageCompression(file, {
          maxSizeMB: COMPRESSION_TARGET_MB,
          maxWidthOrHeight: MAX_DIMENSION,
          useWebWorker: true,
          fileType: file.type as 'image/jpeg' | 'image/png' | 'image/webp',
        });

        return { compressed: compressed as File, note: null };
      } catch {
        return { compressed: file, note: null };
      }
    },
    []
  );

  // --- Validate file type ---
  const validateFileType = useCallback((file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'File must be JPEG, PNG, or WebP';
    }
    const maxBytes = 25 * 1024 * 1024;
    if (file.size > maxBytes) {
      return 'File must be under 25 MB. Please compress your photo and try again.';
    }
    return null;
  }, []);

  // --- Helper to update slot uploading state ---
  const updateSlotUploadingFile = (slotKey: string, info: UploadingFileInfo | null) => {
    setSlotStates((prev) => ({
      ...prev,
      [slotKey]: { ...prev[slotKey], uploadingFile: info },
    }));
  };

  // --- Upload a photo for a named slot ---
  const uploadForSlot = useCallback(
    async (slotKey: string, file: File) => {
      const slot = NAMED_SLOTS.find((s) => s.key === slotKey);
      if (!slot) return;

      const typeError = validateFileType(file);
      if (typeError) {
        setError(typeError);
        return;
      }

      setError(null);

      // Start progress tracking — compressing stage with local preview
      const localPreviewUrl = URL.createObjectURL(file);
      const uploadInfo: UploadingFileInfo = {
        fileName: file.name,
        fileSize: file.size,
        stage: 'compressing',
        localPreviewUrl,
      };
      setSlotStates((prev) => ({
        ...prev,
        [slotKey]: { ...prev[slotKey], uploading: true, compressionNote: null, uploadingFile: uploadInfo },
      }));

      try {
        // Delete existing photo in this slot
        const existing = slotStates[slotKey]?.photo;
        if (existing) {
          await fetch('/api/upload/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'photo', id: existing.id }),
          });
        }

        // Client-side compression
        const { compressed } = await compressFile(file);

        // Move to uploading stage
        updateSlotUploadingFile(slotKey, { ...uploadInfo, stage: 'uploading' });

        // Upload to Supabase Storage
        const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_{2,}/g, '_');
        const filename = `${Date.now()}_${sanitized}`;
        const originalPath = `${userId}/original/${filename}`;
        const supabase = createClient();

        const { error: storageError } = await supabase.storage
          .from('photos')
          .upload(originalPath, compressed, { contentType: compressed.type, upsert: false });

        if (storageError) {
          updateSlotUploadingFile(slotKey, { ...uploadInfo, stage: 'error', errorMessage: storageError.message });
          setSlotStates((prev) => ({
            ...prev,
            [slotKey]: { ...prev[slotKey], uploading: false },
          }));
          return;
        }

        // Move to processing stage
        updateSlotUploadingFile(slotKey, { ...uploadInfo, stage: 'processing' });

        const displayOrder = NAMED_SLOTS.findIndex((s) => s.key === slotKey);
        const res = await fetch('/api/upload/process-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storagePath: originalPath,
            photoType: slot.photoType,
            displayOrder,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          updateSlotUploadingFile(slotKey, { ...uploadInfo, stage: 'error', errorMessage: errData.error || 'Failed to process photo' });
          await supabase.storage.from('photos').remove([originalPath]);
          setSlotStates((prev) => ({
            ...prev,
            [slotKey]: { ...prev[slotKey], uploading: false },
          }));
          return;
        }

        const { photo: photoRow } = await res.json();

        // Show original image to the applicant (not blurred)
        const { data: urlData } = await supabase.storage
          .from('photos')
          .createSignedUrl(photoRow.storage_path, 3600);

        const newPhoto: UploadedPhoto = {
          id: photoRow.id,
          storagePath: photoRow.storage_path,
          blurredPath: photoRow.blurred_path,
          photoType: photoRow.photo_type || slot.photoType,
          displayOrder: photoRow.display_order,
          signedUrl: urlData?.signedUrl,
        };

        // Complete — show success briefly, then show the photo
        updateSlotUploadingFile(slotKey, { ...uploadInfo, stage: 'complete' });
        setTimeout(() => {
          URL.revokeObjectURL(localPreviewUrl);
          setSlotStates((prev) => {
            const updated = {
              ...prev,
              [slotKey]: { photo: newPhoto, uploading: false, compressionNote: null, uploadingFile: null },
            };
            syncOnChange(updated, additionalPhotos);
            return updated;
          });
        }, 1200);
      } catch (err) {
        updateSlotUploadingFile(slotKey, {
          ...uploadInfo,
          stage: 'error',
          errorMessage: err instanceof Error ? err.message : 'Upload failed',
        });
        setSlotStates((prev) => ({
          ...prev,
          [slotKey]: { ...prev[slotKey], uploading: false },
        }));
      }
    },
    [userId, slotStates, additionalPhotos, compressFile, validateFileType, syncOnChange]
  );

  // --- Upload additional photos ---
  const uploadAdditional = useCallback(
    async (file: File) => {
      if (totalCount >= MAX_TOTAL) {
        setError(`Maximum ${MAX_TOTAL} photos reached`);
        return;
      }

      const typeError = validateFileType(file);
      if (typeError) {
        setError(typeError);
        return;
      }

      setError(null);

      const localPreviewUrl = URL.createObjectURL(file);
      const uploadInfo: UploadingFileInfo = {
        fileName: file.name,
        fileSize: file.size,
        stage: 'compressing',
        localPreviewUrl,
      };
      setAdditionalUploadingFile(uploadInfo);

      try {
        const { compressed } = await compressFile(file);

        setAdditionalUploadingFile({ ...uploadInfo, stage: 'uploading' });

        const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_{2,}/g, '_');
        const filename = `${Date.now()}_${sanitized}`;
        const originalPath = `${userId}/original/${filename}`;
        const supabase = createClient();

        const { error: storageError } = await supabase.storage
          .from('photos')
          .upload(originalPath, compressed, { contentType: compressed.type, upsert: false });

        if (storageError) {
          setAdditionalUploadingFile({ ...uploadInfo, stage: 'error', errorMessage: storageError.message });
          return;
        }

        setAdditionalUploadingFile({ ...uploadInfo, stage: 'processing' });

        const displayOrder = NAMED_SLOTS.length + additionalPhotos.length;
        const res = await fetch('/api/upload/process-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storagePath: originalPath,
            photoType: 'additional',
            displayOrder,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          setAdditionalUploadingFile({ ...uploadInfo, stage: 'error', errorMessage: errData.error || 'Failed to process photo' });
          await supabase.storage.from('photos').remove([originalPath]);
          return;
        }

        const { photo: photoRow } = await res.json();

        // Show original image to the applicant (not blurred)
        const { data: urlData } = await supabase.storage
          .from('photos')
          .createSignedUrl(photoRow.storage_path, 3600);

        const newPhoto: UploadedPhoto = {
          id: photoRow.id,
          storagePath: photoRow.storage_path,
          blurredPath: photoRow.blurred_path,
          photoType: 'additional',
          displayOrder: photoRow.display_order,
          signedUrl: urlData?.signedUrl,
        };

        setAdditionalUploadingFile({ ...uploadInfo, stage: 'complete' });
        setTimeout(() => {
          URL.revokeObjectURL(localPreviewUrl);
          setAdditionalPhotos((prev) => {
            const updated = [...prev, newPhoto];
            syncOnChange(slotStates, updated);
            return updated;
          });
          setAdditionalUploadingFile(null);
        }, 1200);
      } catch (err) {
        setAdditionalUploadingFile({
          ...uploadInfo,
          stage: 'error',
          errorMessage: err instanceof Error ? err.message : 'Upload failed',
        });
      }
    },
    [userId, totalCount, additionalPhotos, slotStates, compressFile, validateFileType, syncOnChange]
  );

  // --- Delete a named slot photo ---
  const deleteSlotPhoto = useCallback(
    async (slotKey: string) => {
      const photo = slotStates[slotKey]?.photo;
      if (!photo) return;

      setError(null);
      try {
        const res = await fetch('/api/upload/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'photo', id: photo.id }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          setError(errData.error || 'Failed to delete photo');
          return;
        }

        setSlotStates((prev) => {
          const updated = {
            ...prev,
            [slotKey]: { photo: null, uploading: false, compressionNote: null, uploadingFile: null },
          };
          syncOnChange(updated, additionalPhotos);
          return updated;
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Delete failed');
      }
    },
    [slotStates, additionalPhotos, syncOnChange]
  );

  // --- Delete an additional photo ---
  const deleteAdditionalPhoto = useCallback(
    async (photoId: string) => {
      setError(null);
      try {
        const res = await fetch('/api/upload/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'photo', id: photoId }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          setError(errData.error || 'Failed to delete photo');
          return;
        }

        setAdditionalPhotos((prev) => {
          const updated = prev.filter((p) => p.id !== photoId);
          syncOnChange(slotStates, updated);
          return updated;
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Delete failed');
      }
    },
    [slotStates, syncOnChange]
  );

  // --- Render ---
  return (
    <div className="space-y-6">
      {/* Guidance banner */}
      <div className="rounded-lg bg-rose-50 px-4 py-3">
        <p className="text-sm text-gray-700">
          Your photos are your first impression. Show different sides of yourself — a clear face photo,
          how you carry yourself, and what your world looks like. Upload at least {MIN_TOTAL} photos
          to continue.
        </p>
      </div>

      {/* Named slots */}
      {NAMED_SLOTS.map((slot) => {
        const state = slotStates[slot.key];
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

            {state.photo ? (
              // Uploaded state — image preview
              <div className="group relative overflow-hidden rounded-lg border border-gray-200">
                <img
                  src={state.photo.signedUrl}
                  alt={slot.label}
                  className="aspect-[3/4] w-full object-cover"
                />
                <div className="absolute right-2 top-2 flex gap-1.5">
                  <button
                    onClick={() => fileInputRefs.current[slot.key]?.click()}
                    className="rounded-full bg-black/50 p-1.5 text-white transition-opacity hover:bg-black/70"
                    aria-label={`Replace ${slot.label} photo`}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteSlotPhoto(slot.key)}
                    className="rounded-full bg-black/50 p-1.5 text-white transition-opacity hover:bg-black/70"
                    aria-label={`Remove ${slot.label} photo`}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : state.uploadingFile ? (
              // Upload in progress — preview + progress row
              <div className="space-y-3">
                {state.uploadingFile.localPreviewUrl && (
                  <div className="overflow-hidden rounded-lg border border-gray-200">
                    <img
                      src={state.uploadingFile.localPreviewUrl}
                      alt={`Uploading ${slot.label}`}
                      className="aspect-[3/4] w-full object-cover opacity-70"
                    />
                  </div>
                )}
                <UploadProgressRow
                  fileName={state.uploadingFile.fileName}
                  fileSize={state.uploadingFile.fileSize}
                  fileType="image"
                  stage={state.uploadingFile.stage}
                  onDismiss={() => {
                    if (state.uploadingFile?.localPreviewUrl) {
                      URL.revokeObjectURL(state.uploadingFile.localPreviewUrl);
                    }
                    setSlotStates((prev) => ({
                      ...prev,
                      [slot.key]: { ...prev[slot.key], uploadingFile: null, uploading: false },
                    }));
                  }}
                  errorMessage={state.uploadingFile.errorMessage}
                />
              </div>
            ) : (
              // Empty state — drop zone
              <UploadDropZone
                onFilesSelected={(files) => {
                  if (files[0]) uploadForSlot(slot.key, files[0]);
                }}
                accept="image/jpeg,image/png,image/webp"
                multiple={false}
                formatLabel="Supported formats: JPEG, PNG, WebP"
                maxSizeLabel="Maximum size: 25 MB"
              />
            )}

            {/* Hidden file input for replace */}
            <input
              ref={(el) => { fileInputRefs.current[slot.key] = el; }}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  uploadForSlot(slot.key, e.target.files[0]);
                  e.target.value = '';
                }
              }}
              className="hidden"
              aria-hidden="true"
            />
          </div>
        );
      })}

      {/* Additional photos section */}
      {totalCount < MAX_TOTAL && (
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <h3 className="text-sm font-medium text-gray-900">Additional photos</h3>
            <span className="text-xs text-gray-400">Optional — up to {MAX_TOTAL - namedCount - additionalPhotos.length} more</span>
          </div>
          <p className="text-xs text-gray-500">Any other photos that show your personality</p>
        </div>
      )}

      {/* Additional photos grid + add button */}
      {(additionalPhotos.length > 0 || totalCount < MAX_TOTAL) && (
        <div className="grid grid-cols-3 gap-3">
          {additionalPhotos.map((photo) => (
            <div key={photo.id} className="group relative overflow-hidden rounded-lg border border-gray-200">
              <img
                src={photo.signedUrl}
                alt="Additional photo"
                className="aspect-square w-full object-cover"
              />
              <button
                onClick={() => deleteAdditionalPhoto(photo.id)}
                className="absolute right-1 top-1 rounded-full bg-black/50 p-1.5 text-white opacity-100 transition-opacity hover:bg-black/70 sm:opacity-0 sm:group-hover:opacity-100"
                aria-label="Remove photo"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}

          {/* Add more button */}
          {totalCount < MAX_TOTAL && !additionalUploadingFile && (
            <div
              onClick={() => additionalInputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-gray-400 hover:bg-gray-100"
              style={{ aspectRatio: '1' }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  additionalInputRef.current?.click();
                }
              }}
              aria-label="Add another photo"
            >
              <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <p className="mt-1 text-xs text-gray-400">Add more</p>
            </div>
          )}
        </div>
      )}

      {/* Additional upload progress */}
      {additionalUploadingFile && (
        <div className="space-y-3">
          {additionalUploadingFile.localPreviewUrl && (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <img
                src={additionalUploadingFile.localPreviewUrl}
                alt="Uploading photo"
                className="aspect-square w-full max-w-[200px] object-cover opacity-70"
              />
            </div>
          )}
          <UploadProgressRow
            fileName={additionalUploadingFile.fileName}
            fileSize={additionalUploadingFile.fileSize}
            fileType="image"
            stage={additionalUploadingFile.stage}
            onDismiss={() => {
              if (additionalUploadingFile.localPreviewUrl) {
                URL.revokeObjectURL(additionalUploadingFile.localPreviewUrl);
              }
              setAdditionalUploadingFile(null);
            }}
            errorMessage={additionalUploadingFile.errorMessage}
          />
        </div>
      )}

      {/* Hidden file input for additional */}
      <input
        ref={additionalInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            uploadAdditional(e.target.files[0]);
            e.target.value = '';
          }
        }}
        className="hidden"
        aria-hidden="true"
      />

      {/* Photo count */}
      <p className="text-center text-sm text-gray-500">
        {totalCount} of {MAX_TOTAL} photos uploaded
        {totalCount < MIN_TOTAL && (
          <span className="ml-1 text-rose-500">
            (minimum {MIN_TOTAL} required)
          </span>
        )}
      </p>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2">
          <svg className="h-4 w-4 shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-700"
            aria-label="Dismiss error"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
