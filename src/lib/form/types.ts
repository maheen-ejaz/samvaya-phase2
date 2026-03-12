// Form engine type definitions

export type SectionId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M';

export type QuestionType =
  | 'text'
  | 'email'
  | 'phone'
  | 'select'
  | 'multi_select'
  | 'illustrated_mc'
  | 'date'
  | 'time'
  | 'number'
  | 'range'
  | 'file_upload'
  | 'claude_chat'
  | 'timeline';

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
  targetColumn2?: string;        // For range inputs (min/max pair)
  placeholder?: string;
  helpText?: string;
  maxSelections?: number;
  groupWith?: string[];          // Question IDs shown together on one screen
  autocompleteSource?: 'indian_cities' | 'countries'; // Enables autocomplete on text inputs
  optionGroups?: OptionGroup[]; // Groups options into collapsible categories (for multi_select)
}

export interface SectionConfig {
  id: SectionId;
  label: string;
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
  currentQuestionIndex: number;  // Index into visibleQuestions
  visibleQuestions: string[];    // Ordered Q IDs after conditional filtering
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  saveError?: string;
  isLoaded: boolean;
}

export type FormAction =
  | { type: 'SET_ANSWER'; questionId: string; value: unknown }
  | { type: 'NAVIGATE_NEXT' }
  | { type: 'NAVIGATE_PREV' }
  | { type: 'NAVIGATE_TO'; questionIndex: number }
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
