'use client';

import { FileUploadInput } from './FileUploadInput';
import type { QuestionConfig } from '@/lib/form/types';

interface GuidedPhotoUploadProps {
  question: QuestionConfig;
  value: unknown;
  onChange: (value: unknown) => void;
}

/**
 * Photo upload — simple drag-drop multi-upload, replacing the old guided
 * slot-by-slot flow as part of the Phase 2F redesign.
 *
 * The upload pipeline (Sharp blur server-side, both originals and blurred
 * copies stored, photos table populated) is handled by FileUploadInput via
 * /api/upload/process-photo. This component delegates entirely to it.
 */
export function GuidedPhotoUpload(props: GuidedPhotoUploadProps) {
  return <FileUploadInput {...props} />;
}
