// Form engine type definitions

export type SectionId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N';

export type QuestionType =
  | 'text'
  | 'email'
  | 'phone'
  | 'select'
  | 'stage_selector'
  | 'multi_select'
  | 'illustrated_mc'
  | 'date'
  | 'time'
  | 'number'
  | 'range'
  | 'file_upload'
  | 'guided_photo_upload'
  | 'claude_chat'
  | 'timeline'
  | 'dual_location'
  | 'international_location'
  | 'bgv_consent';

export type TargetTable =
  | 'profiles'
  | 'medical_credentials'
  | 'partner_preferences'
  | 'compatibility_profiles'
  | 'users'
  | 'auth_users'
  | 'photos'
  | 'documents'
  | 'local'; // Gate questions stored only in React state

export interface QuestionOption {
  value: string;
  label: string;
  icon?: string;
  /** When true, selecting this option clears all others; selecting any other option clears this one. */
  exclusive?: boolean;
}

/**
 * Bento grid span — desktop tile placement.
 * Mobile always renders single column regardless of these values.
 * `col` and `row` are 1–3 (3-column grid on desktop).
 */
export interface BentoSpan {
  col: 1 | 2 | 3;
  row: 1 | 2 | 3;
}

export interface OptionGroup {
  key: string;            // e.g. 'arts_creativity'
  label: string;          // e.g. 'Arts & Creativity'
  icon: string;           // e.g. '🎨'
  optionValues: string[]; // references into question.options[].value
}

export interface QuestionConfig {
  id: string;                    // "Q1" through "Q100"
  questionNumber: number;
  section: SectionId;
  text: string;
  type: QuestionType;
  options?: QuestionOption[];
  required: boolean;
  targetTable: TargetTable;
  targetColumn: string;
  targetColumn2?: string;        // For range inputs (min/max pair) or dual_location (preferred_countries)
  targetColumn3?: string;        // For dual_location (no_location_preference boolean)
  placeholder?: string;
  helpText?: string;
  maxSelections?: number;
  groupWith?: string[];          // Question IDs shown together on one screen
  autocompleteSource?: 'indian_cities' | 'countries' | 'international_cities' | 'communities'; // Enables autocomplete on text inputs
  searchable?: boolean;          // Renders combobox (select) or tag input (multi_select) instead of default
  optionsSource?: 'countries';   // Lazy-loads options from JSON instead of using inline options array
  dynamicOptionsFrom?: string;  // Derive options at runtime from another question's selected answers
  optionGroups?: OptionGroup[]; // Groups options into collapsible categories (for multi_select)
  fileUploadConfig?: {
    accept: string;            // MIME types: 'image/jpeg,image/png,image/webp' or include 'application/pdf'
    maxFiles: number;          // 1 for single upload, 6 for Q96
    minFiles: number;          // 1 for most, 2 for Q96
    maxSizeMB: number;         // Per-file size limit
    requiresBlur: boolean;     // true for photos (Q95, Q96), false for docs (Q97, Q98)
    documentType?: string;     // 'identity_document' | 'kundali' — for documents table
    isPrimary?: boolean;       // true for Q95 passport photo
  };
  bentoSpan?: BentoSpan;       // Optional per-question override of the type→span default
}

export interface SectionConfig {
  id: SectionId;
  label: string;
  description?: string;
  estimatedMinutes?: number;
  questionRange: [number, number];
  showConfidentialityCallout: boolean;
  confidentialityText?: string;
}

export interface ConditionalRule {
  questionId: string;
  condition: (answers: FormAnswers) => boolean;
}

export type FormAnswers = Record<string, unknown>;

export interface FormState {
  answers: FormAnswers;
  currentQuestionIndex: number;  // Index into visibleQuestions (used for auto-save position tracking)
  visibleQuestions: string[];    // Ordered Q IDs after conditional filtering
  currentSectionId: SectionId;  // Active section for section-level navigation
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  saveError?: string;
  lastSavedAt: number | null;   // ms epoch — last successful save, used by SaveStatusBadge
  isLoaded: boolean;
}

export type FormAction =
  | { type: 'SET_ANSWER'; questionId: string; value: unknown }
  | { type: 'NAVIGATE_NEXT' }
  | { type: 'NAVIGATE_PREV' }
  | { type: 'NAVIGATE_TO'; questionIndex: number }
  | { type: 'NAVIGATE_TO_SECTION'; sectionId: SectionId }
  | { type: 'SET_SAVE_STATUS'; status: FormState['saveStatus']; error?: string }
  | { type: 'RECALCULATE_VISIBLE' };

export interface AutoSaveConfig {
  userId: string;
  debounceMs?: number;
  onStatusChange: (status: FormState['saveStatus'], error?: string) => void;
}

export interface WorkExperienceEntry {
  id: string;
  org_name: string;
  designation: string;
  start_month: number;
  start_year: number;
  end_month: number | null;
  end_year: number | null;
  is_current: boolean;
}

export interface HydratedFormData {
  answers: FormAnswers;
  resumeQuestionNumber: number;
}
