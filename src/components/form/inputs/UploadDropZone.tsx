'use client';

import { useRef, useState } from 'react';

interface UploadDropZoneProps {
  onFilesSelected: (files: FileList) => void;
  accept: string;
  multiple: boolean;
  disabled?: boolean;
  formatLabel: string;
  maxSizeLabel: string;
  className?: string;
}

export function UploadDropZone({
  onFilesSelected,
  accept,
  multiple,
  disabled,
  formatLabel,
  maxSizeLabel,
  className,
}: UploadDropZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (!disabled && e.dataTransfer.files?.length) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    if (!disabled) fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`cursor-pointer rounded-xl border border-dashed px-4 py-12 text-center transition-colors ${
          disabled
            ? 'cursor-not-allowed border-[color:var(--color-form-border)] bg-[color:var(--color-form-surface-muted)] opacity-60'
            : dragOver
              ? 'border-[color:var(--color-samvaya-red)] bg-[color:var(--color-samvaya-red)]/5'
              : 'border-[color:var(--color-form-border-strong)] hover:border-[color:var(--color-samvaya-red)] hover:bg-[color:var(--color-form-surface-muted)]'
        }`}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        aria-label="Upload file"
      >
        {/* Upload icon */}
        <svg
          className="mx-auto h-9 w-9 text-[color:var(--color-form-text-tertiary)]"
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

        <p className="form-helper mt-4">
          Drag files here or{' '}
          <span className="text-[color:var(--color-samvaya-red)] font-medium underline">tap to browse</span>
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => {
            if (e.target.files?.length) {
              onFilesSelected(e.target.files);
              e.target.value = '';
            }
          }}
          className="hidden"
          aria-hidden="true"
        />
      </div>

      {/* Metadata row: formats left, size right */}
      <div className="mt-2 flex justify-between px-1 form-caption">
        <span>{formatLabel}</span>
        <span>{maxSizeLabel}</span>
      </div>
    </div>
  );
}
