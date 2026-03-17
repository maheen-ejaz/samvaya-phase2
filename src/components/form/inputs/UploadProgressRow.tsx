'use client';

import { useState, useEffect, useRef } from 'react';

export type UploadStage = 'compressing' | 'uploading' | 'processing' | 'complete' | 'error';

interface UploadProgressRowProps {
  fileName: string;
  fileSize: number;
  fileType: 'image' | 'pdf';
  stage: UploadStage;
  onDismiss: () => void;
  errorMessage?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Stage ceiling percentages
const STAGE_TARGETS: Record<UploadStage, number> = {
  compressing: 30,
  uploading: 75,
  processing: 95,
  complete: 100,
  error: 0,
};

const STAGE_LABELS: Record<UploadStage, string> = {
  compressing: 'Compressing...',
  uploading: 'Uploading...',
  processing: 'Processing...',
  complete: 'Complete',
  error: 'Failed',
};

export function UploadProgressRow({
  fileName,
  fileSize,
  fileType,
  stage,
  onDismiss,
  errorMessage,
}: UploadProgressRowProps) {
  const [percent, setPercent] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (stage === 'complete') {
      setPercent(100);
      return;
    }
    if (stage === 'error') return;

    const target = STAGE_TARGETS[stage];
    intervalRef.current = setInterval(() => {
      setPercent((prev) => {
        if (prev >= target) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return prev;
        }
        return Math.min(prev + 2, target);
      });
    }, 120);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [stage]);

  const isError = stage === 'error';
  const barColor = isError ? 'bg-red-500' : 'bg-blue-600';

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        {/* File type icon */}
        {fileType === 'image' ? (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
            <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
            </svg>
          </div>
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
            <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          </div>
        )}

        {/* File info */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-900">{fileName}</p>
          <p className="text-xs text-gray-500">{formatFileSize(fileSize)}</p>
        </div>

        {/* Dismiss button */}
        <button
          onClick={onDismiss}
          className="shrink-0 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          aria-label="Dismiss"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div className="mt-3 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
            style={{ width: `${isError ? 100 : percent}%` }}
          />
        </div>
        <span className={`shrink-0 text-xs tabular-nums ${isError ? 'text-red-600' : 'text-gray-500'}`}>
          {isError ? STAGE_LABELS.error : `${percent} %`}
        </span>
      </div>

      {/* Error detail */}
      {isError && errorMessage && (
        <p className="mt-1.5 text-xs text-red-600">{errorMessage}</p>
      )}
    </div>
  );
}
