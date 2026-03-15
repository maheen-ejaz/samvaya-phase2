'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useForm } from '../FormProvider';
import type { QuestionConfig } from '@/lib/form/types';

interface UploadedFile {
  id: string;
  storagePath: string;
  blurredPath?: string;
  isPrimary?: boolean;
  displayOrder?: number;
  documentType?: string;
  signedUrl?: string;
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
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadedExisting, setLoadedExisting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const isPhoto = question.targetTable === 'photos';
  const bucket = isPhoto ? 'photos' : 'documents';

  // Load existing uploads on mount (for save-and-resume)
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
            // Get signed URL for preview
            const previewPath = row.blurred_path || row.storage_path;
            const { data: urlData } = await supabase.storage
              .from('photos')
              .createSignedUrl(previewPath, 3600);

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

      // Check file type
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

      // Check file size
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

      // Validate all files first
      for (const file of fileArray) {
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          return;
        }
      }

      setUploading(true);
      const supabase = createClient();
      const newUploads: UploadedFile[] = [];

      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        // Sanitize filename: strip special chars, add timestamp prefix
        const sanitized = file.name
          .replace(/[^a-zA-Z0-9._-]/g, '_')
          .replace(/_{2,}/g, '_');
        const timestamp = Date.now();
        const filename = `${timestamp}_${sanitized}`;

        try {
          if (isPhoto) {
            // Upload original to Supabase Storage
            const originalPath = `${userId}/original/${filename}`;
            const { error: storageError } = await supabase.storage
              .from('photos')
              .upload(originalPath, file, { contentType: file.type, upsert: false });

            if (storageError) {
              setError(`Upload failed: ${storageError.message}`);
              break;
            }

            // Call server to process (blur) and register in DB
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
              setError(errData.error || 'Failed to process photo');
              // Clean up the uploaded original
              await supabase.storage.from('photos').remove([originalPath]);
              break;
            }

            const { photo } = await res.json();

            // Get signed URL for preview (use blurred version)
            const previewPath = photo.blurred_path || photo.storage_path;
            const { data: urlData } = await supabase.storage
              .from('photos')
              .createSignedUrl(previewPath, 3600);

            newUploads.push({
              id: photo.id,
              storagePath: photo.storage_path,
              blurredPath: photo.blurred_path,
              isPrimary: photo.is_primary,
              displayOrder: photo.display_order,
              signedUrl: urlData?.signedUrl,
            });
          } else {
            // Document upload
            const docType = config.documentType || 'other';
            const docPath = `${userId}/${docType}/${filename}`;

            const { error: storageError } = await supabase.storage
              .from('documents')
              .upload(docPath, file, { contentType: file.type, upsert: false });

            if (storageError) {
              setError(`Upload failed: ${storageError.message}`);
              break;
            }

            // Register in DB
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
              setError(errData.error || 'Failed to register document');
              await supabase.storage.from('documents').remove([docPath]);
              break;
            }

            const { document: doc } = await res.json();

            // Get signed URL for preview
            const { data: urlData } = await supabase.storage
              .from('documents')
              .createSignedUrl(docPath, 3600);

            newUploads.push({
              id: doc.id,
              storagePath: doc.storage_path,
              documentType: doc.document_type,
              signedUrl: urlData?.signedUrl,
            });
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Upload failed');
          break;
        }
      }

      if (newUploads.length > 0) {
        const updated = [...uploads, ...newUploads];
        setUploads(updated);
        onChange(updated.map((u) => u.id));
      }

      setUploading(false);
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
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Delete failed');
      }
    },
    [isPhoto, uploads, onChange]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUpload(e.target.files);
      // Reset input so the same file can be re-selected
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files);
    }
  };

  if (!config) {
    return <p className="text-gray-500">Upload configuration missing.</p>;
  }

  const canUploadMore = uploads.length < config.maxFiles;
  const isMulti = config.maxFiles > 1;
  const acceptAttr = config.accept;

  return (
    <div className="space-y-4">
      {/* Upload zone */}
      {canUploadMore && (
        <div
          ref={dropRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 ${
            dragOver
              ? 'border-samvaya-red bg-samvaya-red/10'
              : 'border-gray-300 hover:border-samvaya-red/40 hover:bg-gray-50'
          }`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          aria-label={`Upload ${isPhoto ? 'photo' : 'document'}`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-rose-500" />
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          ) : (
            <>
              <svg
                className="mx-auto h-10 w-10 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-600">
                Drag {isMulti ? 'files' : 'a file'} here or{' '}
                <span className="font-medium text-samvaya-red">tap to browse</span>
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {isPhoto ? 'JPEG, PNG, or WebP' : 'JPEG, PNG, WebP, or PDF'} &middot; Max{' '}
                {config.maxSizeMB} MB
              </p>
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept={acceptAttr}
            multiple={isMulti}
            onChange={handleFileSelect}
            className="hidden"
            aria-hidden="true"
          />
        </div>
      )}

      {/* File count indicator for multi-upload */}
      {isMulti && (
        <p className="text-center text-sm text-gray-500">
          {uploads.length} of {config.maxFiles} {isPhoto ? 'photos' : 'files'} uploaded
          {uploads.length < config.minFiles && (
            <span className="ml-1 text-rose-500">
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
              className="group relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
            >
              {upload.signedUrl && isPhoto ? (
                <img
                  src={upload.signedUrl}
                  alt="Uploaded photo"
                  className="aspect-square w-full object-cover"
                />
              ) : upload.signedUrl && upload.storagePath.endsWith('.pdf') ? (
                <div className="flex aspect-square items-center justify-center">
                  <div className="text-center">
                    <svg
                      className="mx-auto h-10 w-10 text-gray-400"
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
                    <p className="mt-1 text-xs text-gray-500">PDF</p>
                  </div>
                </div>
              ) : upload.signedUrl ? (
                <img
                  src={upload.signedUrl}
                  alt="Uploaded document"
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <div className="flex aspect-square items-center justify-center">
                  <p className="text-xs text-gray-400">Preview unavailable</p>
                </div>
              )}

              {/* Delete button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(upload.id);
                }}
                className="absolute right-1 top-1 rounded-full bg-black/50 p-1.5 text-white opacity-100 sm:opacity-0 transition-opacity hover:bg-black/70 sm:group-hover:opacity-100"
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
            </div>
          ))}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2">
          <svg
            className="h-4 w-4 shrink-0 text-red-600"
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
