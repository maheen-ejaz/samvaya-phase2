'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useForm } from '../FormProvider';
import { UploadDropZone } from './UploadDropZone';
import { UploadProgressRow } from './UploadProgressRow';
import type { UploadStage } from './UploadProgressRow';
import type { QuestionConfig } from '@/lib/form/types';

// Local placeholder for the blur demo — served from /public, no external dependency.
const DEMO_IMG = '/placeholder-stock-photo.jpg';

function PhotoBlurDemo() {
  return (
    <div className="rounded-xl border border-[color:var(--color-form-border)] bg-[color:var(--color-form-surface-muted)] p-3">
      <p className="form-helper mb-3 text-center text-[color:var(--color-form-text-secondary)]">
        See how photos appear to matches before and after mutual interest
      </p>
      <div className="flex gap-2">
        {/* Blurred — what matches see before mutual interest */}
        <div className="flex-1 text-center">
          <div className="relative overflow-hidden rounded-lg" style={{ aspectRatio: '3/4' }}>
            <img
              src={DEMO_IMG}
              alt="Example of a blurred photo as seen by matches"
              className="w-full h-full object-cover scale-110"
              style={{ filter: 'blur(10px)' }}
            />
          </div>
          <p className="form-caption mt-1.5 font-medium">Before mutual interest</p>
          <p className="form-caption text-[color:var(--color-form-text-tertiary)]">Matches see this</p>
        </div>

        {/* Divider */}
        <div className="flex flex-col items-center justify-center gap-1 px-1">
          <div className="h-12 w-px bg-[color:var(--color-form-border)]" />
          <span className="text-xs text-[color:var(--color-form-text-tertiary)]">→</span>
          <div className="h-12 w-px bg-[color:var(--color-form-border)]" />
        </div>

        {/* Original — visible after mutual interest */}
        <div className="flex-1 text-center">
          <div className="relative overflow-hidden rounded-lg" style={{ aspectRatio: '3/4' }}>
            <img
              src={DEMO_IMG}
              alt="Example of a photo as seen after mutual interest"
              className="w-full h-full object-cover"
            />
          </div>
          <p className="form-caption mt-1.5 font-medium">After mutual interest</p>
          <p className="form-caption text-[color:var(--color-form-text-tertiary)]">Both parties see this</p>
        </div>
      </div>
    </div>
  );
}

interface UploadedFile {
  id: string;
  storagePath: string;
  blurredPath?: string;
  isPrimary?: boolean;
  displayOrder?: number;
  documentType?: string;
  signedUrl?: string;
}

interface UploadingFile {
  clientId: string;
  fileName: string;
  fileSize: number;
  fileType: 'image' | 'pdf';
  stage: UploadStage;
  errorMessage?: string;
}

interface FileUploadInputProps {
  question: QuestionConfig;
  value: unknown;
  onChange: (value: unknown) => void;
}

export function FileUploadInput({ question, value, onChange }: FileUploadInputProps) {
  const { userId } = useForm();
  const config = question.fileUploadConfig;
  const [uploads, setUploads] = useState<UploadedFile[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadedExisting, setLoadedExisting] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const refreshingUrlsRef = useRef<Set<string>>(new Set());

  const isPhoto = question.targetTable === 'photos';
  const bucket = isPhoto ? 'photos' : 'documents';

  // --- Helpers for tracking upload progress ---
  const updateUploadingFile = (clientId: string, updates: Partial<UploadingFile>) => {
    setUploadingFiles((prev) =>
      prev.map((f) => (f.clientId === clientId ? { ...f, ...updates } : f))
    );
  };

  const removeUploadingFile = (clientId: string) => {
    setUploadingFiles((prev) => prev.filter((f) => f.clientId !== clientId));
  };

  const completeAndRemove = (clientId: string) => {
    updateUploadingFile(clientId, { stage: 'complete' });
    setTimeout(() => removeUploadingFile(clientId), 1500);
  };

  // --- Load existing uploads on mount (save-and-resume) ---
  useEffect(() => {
    if (loadedExisting) return;
    setLoadedExisting(true);

    const loadExisting = async () => {
      try {
        const supabase = createClient();

        if (isPhoto) {
          const query = config?.isPrimary
            ? supabase.from('photos').select('*').eq('user_id', userId).eq('is_primary', true).order('display_order')
            : supabase.from('photos').select('*').eq('user_id', userId).eq('is_primary', false).order('display_order');

          const { data } = await query;
          if (data && data.length > 0) {
            const loaded: UploadedFile[] = [];
            for (const row of data) {
              // Show original image to the applicant (not blurred)
              const { data: urlData } = await supabase.storage
                .from('photos')
                .createSignedUrl(row.storage_path, 3600);

              loaded.push({
                id: row.id,
                storagePath: row.storage_path,
                blurredPath: row.blurred_path ?? undefined,
                isPrimary: row.is_primary,
                displayOrder: row.display_order,
                signedUrl: urlData?.signedUrl,
              });
            }
            setUploads(loaded);
            onChange(loaded.map((u) => u.id));
          }
        } else {
          const docType = config?.documentType;
          if (!docType) return;

          const { data } = await supabase
            .from('documents')
            .select('*')
            .eq('user_id', userId)
            .eq('document_type', docType as 'identity_document' | 'kundali' | 'other');

          if (data && data.length > 0) {
            const loaded: UploadedFile[] = [];
            for (const row of data) {
              const { data: urlData } = await supabase.storage
                .from('documents')
                .createSignedUrl(row.storage_path, 3600);

              loaded.push({
                id: row.id,
                storagePath: row.storage_path,
                documentType: row.document_type,
                signedUrl: urlData?.signedUrl,
              });
            }
            setUploads(loaded);
            onChange(loaded.map((u) => u.id));
          }
        }
      } catch (err) {
        console.error('Failed to load existing uploads:', err);
        setError('Failed to load previously uploaded files. You can still upload new ones.');
      }
    };

    loadExisting();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!config) return 'Upload configuration missing';

      const acceptedTypes = config.accept.split(',').map((t) => t.trim());
      const typeMatch = acceptedTypes.some((accepted) => {
        if (accepted.endsWith('/*')) {
          return file.type.startsWith(accepted.replace('/*', '/'));
        }
        return file.type === accepted;
      });

      if (!typeMatch) {
        const friendlyTypes = acceptedTypes
          .map((t) => t.replace('image/', '').replace('application/', '').toUpperCase())
          .join(', ');
        return `File must be ${friendlyTypes}`;
      }

      const maxBytes = config.maxSizeMB * 1024 * 1024;
      if (file.size > maxBytes) {
        return `File must be under ${config.maxSizeMB} MB`;
      }

      return null;
    },
    [config]
  );

  const handleUpload = useCallback(
    async (files: FileList | File[]) => {
      if (!config) return;
      setError(null);

      const fileArray = Array.from(files);
      const maxAllowed = config.maxFiles - uploads.length;

      if (fileArray.length > maxAllowed) {
        setError(
          maxAllowed <= 0
            ? `Maximum ${config.maxFiles} file(s) already uploaded`
            : `You can upload ${maxAllowed} more file(s)`
        );
        return;
      }

      for (const file of fileArray) {
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          return;
        }
      }

      const supabase = createClient();
      const newUploads: UploadedFile[] = [];

      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        const clientId = `${Date.now()}-${i}`;
        const fileType: 'image' | 'pdf' = file.type === 'application/pdf' ? 'pdf' : 'image';

        // Add progress row
        setUploadingFiles((prev) => [
          ...prev,
          { clientId, fileName: file.name, fileSize: file.size, fileType, stage: 'uploading' },
        ]);

        const sanitized = file.name
          .replace(/[^a-zA-Z0-9._-]/g, '_')
          .replace(/_{2,}/g, '_');
        const timestamp = Date.now();
        const filename = `${timestamp}_${sanitized}`;

        try {
          if (isPhoto) {
            const originalPath = `${userId}/original/${filename}`;
            const { error: storageError } = await supabase.storage
              .from('photos')
              .upload(originalPath, file, { contentType: file.type, upsert: false });

            if (storageError) {
              updateUploadingFile(clientId, { stage: 'error', errorMessage: storageError.message });
              break;
            }

            // Server-side processing
            updateUploadingFile(clientId, { stage: 'processing' });

            const displayOrder = uploads.length + i;
            const res = await fetch('/api/upload/process-photo', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                storagePath: originalPath,
                isPrimary: config.isPrimary ?? false,
                displayOrder,
              }),
            });

            if (!res.ok) {
              const errData = await res.json().catch(() => ({}));
              updateUploadingFile(clientId, { stage: 'error', errorMessage: errData.error || 'Failed to process photo' });
              await supabase.storage.from('photos').remove([originalPath]);
              break;
            }

            const { photo } = await res.json();
            // Show original image to the applicant (not blurred)
            const { data: urlData } = await supabase.storage
              .from('photos')
              .createSignedUrl(photo.storage_path, 3600);

            newUploads.push({
              id: photo.id,
              storagePath: photo.storage_path,
              blurredPath: photo.blurred_path,
              isPrimary: photo.is_primary,
              displayOrder: photo.display_order,
              signedUrl: urlData?.signedUrl,
            });

            completeAndRemove(clientId);
          } else {
            const docType = config.documentType || 'other';
            const docPath = `${userId}/${docType}/${filename}`;

            const { error: storageError } = await supabase.storage
              .from('documents')
              .upload(docPath, file, { contentType: file.type, upsert: false });

            if (storageError) {
              updateUploadingFile(clientId, { stage: 'error', errorMessage: storageError.message });
              break;
            }

            updateUploadingFile(clientId, { stage: 'processing' });

            const res = await fetch('/api/upload/register-document', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                storagePath: docPath,
                documentType: docType,
              }),
            });

            if (!res.ok) {
              const errData = await res.json().catch(() => ({}));
              updateUploadingFile(clientId, { stage: 'error', errorMessage: errData.error || 'Failed to register document' });
              await supabase.storage.from('documents').remove([docPath]);
              break;
            }

            const { document: doc } = await res.json();
            const { data: urlData } = await supabase.storage
              .from('documents')
              .createSignedUrl(docPath, 3600);

            newUploads.push({
              id: doc.id,
              storagePath: doc.storage_path,
              documentType: doc.document_type,
              signedUrl: urlData?.signedUrl,
            });

            completeAndRemove(clientId);
          }
        } catch (err) {
          updateUploadingFile(clientId, {
            stage: 'error',
            errorMessage: err instanceof Error ? err.message : 'Upload failed',
          });
          break;
        }
      }

      if (newUploads.length > 0) {
        const updated = [...uploads, ...newUploads];
        setUploads(updated);
        onChange(updated.map((u) => u.id));
      }
    },
    [config, isPhoto, userId, uploads, validateFile, onChange]
  );

  const handleDelete = useCallback(
    async (uploadId: string) => {
      setError(null);

      try {
        const res = await fetch('/api/upload/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: isPhoto ? 'photo' : 'document',
            id: uploadId,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          setError(errData.error || 'Failed to delete');
          return;
        }

        const updated = uploads.filter((u) => u.id !== uploadId);
        setUploads(updated);
        onChange(updated.length > 0 ? updated.map((u) => u.id) : undefined);

        // Re-index remaining photos' display_order so there are no gaps.
        if (isPhoto && updated.length > 0) {
          try {
            await fetch('/api/upload/reorder-photos', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids: updated.map((u) => u.id) }),
            });
          } catch (err) {
            console.error('Failed to reorder photos after delete:', err);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Delete failed');
      }
    },
    [isPhoto, uploads, onChange]
  );

  // Refresh a stale signed URL on image load error. Debounced per-upload so
  // multiple 404s don't hammer the API.
  const refreshSignedUrl = useCallback(
    async (uploadId: string) => {
      if (refreshingUrlsRef.current.has(uploadId)) return;
      refreshingUrlsRef.current.add(uploadId);
      try {
        const upload = uploads.find((u) => u.id === uploadId);
        if (!upload) return;
        const supabase = createClient();
        const { data } = await supabase.storage
          .from(bucket)
          .createSignedUrl(upload.storagePath, 3600);
        if (data?.signedUrl) {
          setUploads((prev) =>
            prev.map((u) => (u.id === uploadId ? { ...u, signedUrl: data.signedUrl } : u)),
          );
        }
      } catch (err) {
        console.error('Failed to refresh signed URL:', err);
      } finally {
        // Allow retry after a short cooldown so we don't thrash on repeated errors.
        setTimeout(() => refreshingUrlsRef.current.delete(uploadId), 3000);
      }
    },
    [uploads, bucket],
  );

  if (!config) {
    return <p className="form-helper">Upload configuration missing.</p>;
  }

  const canUploadMore = uploads.length < config.maxFiles;
  const isMulti = config.maxFiles > 1;
  const isUploading = uploadingFiles.length > 0;

  return (
    <div className="space-y-4">
      {/* Blur demo — photos only */}
      {isPhoto && <PhotoBlurDemo />}

      {/* Identity document privacy callout */}
      {!isPhoto && config.documentType === 'identity_document' && (
        <div className="flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
          <svg className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
          </svg>
          <p className="text-sm leading-snug text-blue-900">
            <span className="font-semibold">Stored securely. Never shared.</span>{' '}
            Your identity document is used solely to verify your name and address. It is never shared with other applicants — not even with your matches — and will not be disclosed to any third party without your explicit consent.
          </p>
        </div>
      )}

      {/* Privacy callout — photos only */}
      {isPhoto && (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
          <p className="text-sm leading-snug text-amber-800">
            <span className="font-semibold">Your photos stay private.</span>{' '}
            Matches only see a blurred version until both of you confirm mutual interest — then your original photo is revealed.
          </p>
        </div>
      )}

      {/* Drop zone */}
      {canUploadMore && (
        <UploadDropZone
          onFilesSelected={(files) => handleUpload(files)}
          accept={config.accept}
          multiple={isMulti}
          disabled={isUploading}
          formatLabel={isPhoto ? 'Supported formats: JPEG, PNG, WebP' : 'Supported formats: JPEG, PNG, WebP, PDF'}
          maxSizeLabel={`Maximum size: ${config.maxSizeMB} MB`}
        />
      )}

      {/* Upload progress rows */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-3">
          {uploadingFiles.map((f) => (
            <UploadProgressRow
              key={f.clientId}
              fileName={f.fileName}
              fileSize={f.fileSize}
              fileType={f.fileType}
              stage={f.stage}
              onDismiss={() => removeUploadingFile(f.clientId)}
              errorMessage={f.errorMessage}
            />
          ))}
        </div>
      )}

      {/* File count indicator for multi-upload */}
      {isMulti && (
        <p className="form-caption text-center">
          {uploads.length} of {config.maxFiles} {isPhoto ? 'photos' : 'files'} uploaded
          {uploads.length < config.minFiles && (
            <span className="ml-1 text-[color:var(--color-form-error)]">
              (minimum {config.minFiles} required)
            </span>
          )}
        </p>
      )}

      {/* Preview grid */}
      {uploads.length > 0 && (
        <div className={`grid gap-3 ${isMulti ? 'grid-cols-3' : 'grid-cols-1'}`}>
          {uploads.map((upload) => (
            <div
              key={upload.id}
              className="group relative overflow-hidden rounded-xl border border-[color:var(--color-form-border)] bg-[color:var(--color-form-surface-muted)]"
            >
              {upload.signedUrl && isPhoto ? (
                <img
                  src={upload.signedUrl}
                  alt="Uploaded photo"
                  className="aspect-square w-full object-cover"
                  onError={() => refreshSignedUrl(upload.id)}
                />
              ) : upload.signedUrl && upload.storagePath.endsWith('.pdf') ? (
                <div className="flex aspect-square items-center justify-center">
                  <div className="text-center">
                    <svg
                      className="mx-auto h-10 w-10 text-[color:var(--color-form-text-tertiary)]"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                      />
                    </svg>
                    <p className="form-caption mt-1">PDF</p>
                  </div>
                </div>
              ) : upload.signedUrl ? (
                <img
                  src={upload.signedUrl}
                  alt="Uploaded document"
                  className="aspect-square w-full object-cover"
                  onError={() => refreshSignedUrl(upload.id)}
                />
              ) : (
                <div className="flex aspect-square items-center justify-center">
                  <p className="form-caption">Preview unavailable</p>
                </div>
              )}

              {/* Delete button — two-step confirmation */}
              {pendingDeleteId === upload.id ? (
                <div
                  className="absolute inset-x-1 top-1 flex items-center justify-between gap-1 rounded-full bg-black/70 px-2 py-1 text-[11px] font-medium text-white"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="pl-1">Delete?</span>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPendingDeleteId(null);
                      }}
                      className="rounded-full px-2 py-0.5 hover:bg-white/15"
                      aria-label="Cancel delete"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const idToDelete = upload.id;
                        setPendingDeleteId(null);
                        handleDelete(idToDelete);
                      }}
                      className="rounded-full bg-[color:var(--color-form-error)] px-2 py-0.5 hover:opacity-90"
                      aria-label="Confirm delete"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPendingDeleteId(upload.id);
                  }}
                  className="absolute right-1 top-1 rounded-full bg-black/50 p-1.5 text-white opacity-100 transition-opacity hover:bg-black/70 sm:opacity-0 sm:group-hover:opacity-100"
                  aria-label="Remove file"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Error message (keep at end) */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-[color:var(--color-form-error)]/20 bg-[color:var(--color-form-error)]/5 px-4 py-3">
          <svg
            className="h-4 w-4 shrink-0 text-[color:var(--color-form-error)]"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
            />
          </svg>
          <p className="form-error">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-[color:var(--color-form-error)] hover:opacity-70"
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
