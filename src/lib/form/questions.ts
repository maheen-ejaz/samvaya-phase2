import type { QuestionConfig } from './types';
import { COUNTRIES } from '@/lib/data/countries';
import { INDIAN_STATES } from '@/lib/data/indian-states';
import { RELIGIONS } from '@/lib/data/religions';

// ============================================================
// Shared option sets
// ============================================================

const OCCUPATION_OPTIONS = [
  { value: 'doctor', label: 'Doctor / Medical Professional' },
  { value: 'engineer', label: 'Engineer' },
  { value: 'business_owner', label: 'Business Owner' },
  { value: 'government_employee', label: 'Government Employee' },
  { value: 'teacher_professor', label: 'Teacher / Professor' },
  { value: 'lawyer', label: 'Lawyer' },
  { value: 'chartered_accountant', label: 'Chartered Accountant' },
  { value: 'banker', label: 'Banker / Finance' },
  { value: 'farmer', label: 'Farmer / Agriculture' },
  { value: 'military_police', label: 'Military / Police' },
  { value: 'retired', label: 'Retired' },
  { value: 'homemaker', label: 'Homemaker' },
  { value: 'deceased', label: 'Deceased' },
  { value: 'other', label: 'Other' },
];

const MOTHER_TONGUE_OPTIONS = [
  { value: 'hindi', label: 'Hindi' },
  { value: 'bengali', label: 'Bengali' },
  { value: 'telugu', label: 'Telugu' },
  { value: 'marathi', label: 'Marathi' },
  { value: 'tamil', label: 'Tamil' },
  { value: 'urdu', label: 'Urdu' },
  { value: 'gujarati', label: 'Gujarati' },
  { value: 'kannada', label: 'Kannada' },
  { value: 'odia', label: 'Odia' },
  { value: 'malayalam', label: 'Malayalam' },
  { value: 'punjabi', label: 'Punjabi' },
  { value: 'assamese', label: 'Assamese' },
  { value: 'maithili', label: 'Maithili' },
  { value: 'sanskrit', label: 'Sanskrit' },
  { value: 'konkani', label: 'Konkani' },
  { value: 'nepali', label: 'Nepali' },
  { value: 'sindhi', label: 'Sindhi' },
  { value: 'dogri', label: 'Dogri' },
  { value: 'kashmiri', label: 'Kashmiri' },
  { value: 'manipuri', label: 'Manipuri' },
  { value: 'bodo', label: 'Bodo' },
  { value: 'santali', label: 'Santali' },
  { value: 'english', label: 'English' },
  { value: 'other', label: 'Other' },
];

const MEDICAL_SPECIALTY_OPTIONS = [
  { value: 'general_medicine', label: 'General Medicine' },
  { value: 'general_surgery', label: 'General Surgery' },
  { value: 'pediatrics', label: 'Pediatrics' },
  { value: 'obstetrics_gynecology', label: 'Obstetrics & Gynecology' },
  { value: 'orthopedics', label: 'Orthopedics' },
  { value: 'cardiology', label: 'Cardiology' },
  { value: 'dermatology', label: 'Dermatology' },
  { value: 'psychiatry', label: 'Psychiatry' },
  { value: 'ophthalmology', label: 'Ophthalmology' },
  { value: 'ent', label: 'ENT (Otorhinolaryngology)' },
  { value: 'radiology', label: 'Radiology' },
  { value: 'anesthesiology', label: 'Anesthesiology' },
  { value: 'pathology', label: 'Pathology' },
  { value: 'microbiology', label: 'Microbiology' },
  { value: 'biochemistry', label: 'Biochemistry' },
  { value: 'pharmacology', label: 'Pharmacology' },
  { value: 'forensic_medicine', label: 'Forensic Medicine' },
  { value: 'community_medicine', label: 'Community Medicine' },
  { value: 'pulmonology', label: 'Pulmonology' },
  { value: 'nephrology', label: 'Nephrology' },
  { value: 'gastroenterology', label: 'Gastroenterology' },
  { value: 'neurology', label: 'Neurology' },
  { value: 'neurosurgery', label: 'Neurosurgery' },
  { value: 'urology', label: 'Urology' },
  { value: 'plastic_surgery', label: 'Plastic Surgery' },
  { value: 'oncology', label: 'Oncology' },
  { value: 'endocrinology', label: 'Endocrinology' },
  { value: 'rheumatology', label: 'Rheumatology' },
  { value: 'emergency_medicine', label: 'Emergency Medicine' },
  { value: 'sports_medicine', label: 'Sports Medicine' },
  { value: 'physical_medicine_rehabilitation', label: 'Physical Medicine & Rehabilitation' },
  { value: 'other', label: 'Other' },
];

const ADDITIONAL_QUALIFICATION_OPTIONS = [
  { value: 'md', label: 'MD' },
  { value: 'ms', label: 'MS' },
  { value: 'mch', label: 'MCh' },
  { value: 'dm', label: 'DM' },
  { value: 'dnb', label: 'DNB' },
  { value: 'fellowship', label: 'Fellowship' },
  { value: 'phd', label: 'PhD' },
  { value: 'mba', label: 'MBA' },
  { value: 'mph', label: 'MPH' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'other', label: 'Other' },
];

const BODY_TYPE_OPTIONS = [
  { value: 'slim', label: 'Slim' },
  { value: 'athletic', label: 'Athletic' },
  { value: 'average', label: 'Average' },
  { value: 'heavy', label: 'Heavy' },
  { value: 'no_preference', label: 'No preference' },
];

const DIET_PREFERENCE_OPTIONS = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'non_vegetarian', label: 'Non-Vegetarian' },
  { value: 'eggetarian', label: 'Eggetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'jain', label: 'Jain' },
  { value: 'no_preference', label: 'No preference' },
];

const PARTNER_QUALITY_OPTIONS = [
  { value: 'ambitious', label: 'Ambitious' },
  { value: 'caring', label: 'Caring & Nurturing' },
  { value: 'intellectual', label: 'Intellectual' },
  { value: 'family_oriented', label: 'Family-Oriented' },
  { value: 'humorous', label: 'Good Sense of Humor' },
  { value: 'adventurous', label: 'Adventurous' },
  { value: 'empathetic', label: 'Empathetic' },
  { value: 'independent', label: 'Independent' },
  { value: 'spiritual', label: 'Spiritual' },
  { value: 'loyal', label: 'Loyal & Trustworthy' },
  { value: 'patient', label: 'Patient' },
  { value: 'confident', label: 'Confident' },
  { value: 'creative', label: 'Creative' },
  { value: 'supportive', label: 'Supportive of Career' },
  { value: 'good_communicator', label: 'Good Communicator' },
  { value: 'emotionally_mature', label: 'Emotionally Mature' },
];

// ============================================================
// SECTION A — Basic Identity (Q1–Q17) — Fully defined
// ============================================================

const sectionA: QuestionConfig[] = [
  {
    id: 'Q1',
    questionNumber: 1,
    section: 'A',
    text: 'What is your first name?',
    type: 'text',
    required: true,
    targetTable: 'profiles',
    targetColumn: 'first_name',
    placeholder: 'First name',
    groupWith: ['Q2'],
  },
  {
    id: 'Q2',
    questionNumber: 2,
    section: 'A',
    text: 'What is your last name?',
    type: 'text',
    required: true,
    targetTable: 'profiles',
    targetColumn: 'last_name',
    placeholder: 'Last name',
    groupWith: ['Q1'],
  },
  {
    id: 'Q3',
    questionNumber: 3,
    section: 'A',
    text: 'Your email address',
    type: 'email',
    required: true,
    targetTable: 'auth_users',
    targetColumn: 'email',
    helpText: 'This is the email you signed up with. It cannot be changed here.',
  },
  {
    id: 'Q4',
    questionNumber: 4,
    section: 'A',
    text: 'Your phone number',
    type: 'phone',
    required: true,
    targetTable: 'auth_users',
    targetColumn: 'phone',
    placeholder: '+91 98765 43210',
  },
  {
    id: 'Q5',
    questionNumber: 5,
    section: 'A',
    text: 'What is your gender?',
    type: 'select',
    required: true,
    targetTable: 'profiles',
    targetColumn: 'gender',
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
    ],
  },
  {
    id: 'Q6',
    questionNumber: 6,
    section: 'A',
    text: 'How did you hear about Samvaya?',
    type: 'select',
    required: true,
    targetTable: 'profiles',
    targetColumn: 'referral_source',
    options: [
      { value: 'instagram', label: 'Instagram' },
      { value: 'linkedin', label: 'LinkedIn' },
      { value: 'friend', label: 'Friend or Family' },
      { value: 'goocampus', label: 'GooCampus' },
      { value: 'google', label: 'Google' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    id: 'Q7',
    questionNumber: 7,
    section: 'A',
    text: 'Have you been married before?',
    type: 'select',
    required: true,
    targetTable: 'profiles',
    targetColumn: 'marital_status',
    options: [
      { value: 'first_marriage', label: 'No, this will be my first marriage' },
      { value: 'divorced', label: 'Yes, I am divorced' },
      { value: 'widowed', label: 'Yes, I am widowed' },
    ],
  },
  {
    id: 'Q8',
    questionNumber: 8,
    section: 'A',
    text: 'Do you have children from your previous marriage?',
    type: 'select',
    required: true,
    targetTable: 'profiles',
    targetColumn: 'has_children_from_previous',
    options: [
      { value: 'true', label: 'Yes' },
      { value: 'false', label: 'No' },
    ],
  },
  {
    id: 'Q9',
    questionNumber: 9,
    section: 'A',
    text: 'What is your date of birth?',
    type: 'date',
    required: true,
    targetTable: 'profiles',
    targetColumn: 'date_of_birth',
  },
  {
    id: 'Q10',
    questionNumber: 10,
    section: 'A',
    text: 'Do you know your time of birth?',
    type: 'select',
    required: true,
    targetTable: 'local',
    targetColumn: 'knows_time_of_birth',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
    helpText: 'This helps with kundali matching if applicable.',
  },
  {
    id: 'Q11',
    questionNumber: 11,
    section: 'A',
    text: 'What is your time of birth?',
    type: 'time',
    required: true,
    targetTable: 'profiles',
    targetColumn: 'time_of_birth',
  },
  {
    id: 'Q12',
    questionNumber: 12,
    section: 'A',
    text: 'Where were you born?',
    type: 'select',
    required: true,
    targetTable: 'profiles',
    targetColumn: 'place_of_birth',
    options: [
      { value: 'outside_india', label: 'Outside India' },
      ...INDIAN_STATES,
    ],
  },
  {
    id: 'Q13',
    questionNumber: 13,
    section: 'A',
    text: 'Which city and country were you born in?',
    type: 'text',
    required: true,
    targetTable: 'profiles',
    targetColumn: 'city_of_birth',
    placeholder: 'e.g. Dubai, UAE',
  },
  {
    id: 'Q14',
    questionNumber: 14,
    section: 'A',
    text: 'Which city were you born in?',
    type: 'text',
    required: true,
    targetTable: 'profiles',
    targetColumn: 'city_of_birth',
    placeholder: 'e.g. Bengaluru',
    helpText: 'Start typing to search for your city.',
    autocompleteSource: 'indian_cities',
  },
  {
    id: 'Q15',
    questionNumber: 15,
    section: 'A',
    text: 'What is your blood group?',
    type: 'select',
    required: false,
    targetTable: 'profiles',
    targetColumn: 'blood_group',
    options: [
      { value: 'A+', label: 'A+' },
      { value: 'A-', label: 'A-' },
      { value: 'B+', label: 'B+' },
      { value: 'B-', label: 'B-' },
      { value: 'AB+', label: 'AB+' },
      { value: 'AB-', label: 'AB-' },
      { value: 'O+', label: 'O+' },
      { value: 'O-', label: 'O-' },
      { value: 'unknown', label: "I don't know" },
    ],
    helpText: 'Optional',
  },
  {
    id: 'Q16',
    questionNumber: 16,
    section: 'A',
    text: 'What is your mother tongue?',
    type: 'select',
    required: true,
    targetTable: 'profiles',
    targetColumn: 'mother_tongue',
    options: MOTHER_TONGUE_OPTIONS,
  },
  {
    id: 'Q17',
    questionNumber: 17,
    section: 'A',
    text: 'Which languages do you speak fluently?',
    type: 'multi_select',
    required: true,
    targetTable: 'profiles',
    targetColumn: 'languages_spoken',
    options: [
      { value: 'hindi', label: 'Hindi' },
      { value: 'english', label: 'English' },
      { value: 'bengali', label: 'Bengali' },
      { value: 'telugu', label: 'Telugu' },
      { value: 'marathi', label: 'Marathi' },
      { value: 'tamil', label: 'Tamil' },
      { value: 'urdu', label: 'Urdu' },
      { value: 'gujarati', label: 'Gujarati' },
      { value: 'kannada', label: 'Kannada' },
      { value: 'odia', label: 'Odia' },
      { value: 'malayalam', label: 'Malayalam' },
      { value: 'punjabi', label: 'Punjabi' },
      { value: 'assamese', label: 'Assamese' },
      { value: 'french', label: 'French' },
      { value: 'german', label: 'German' },
      { value: 'spanish', label: 'Spanish' },
      { value: 'arabic', label: 'Arabic' },
      { value: 'other', label: 'Other' },
    ],
    helpText: 'Select all that apply.',
  },
];

// ============================================================
// SECTION B — Location & Citizenship (Q18–Q26) — Fully defined
// ============================================================

const sectionB: QuestionConfig[] = [
  { id: 'Q18', questionNumber: 18, section: 'B', text: 'Which country are you a citizen of?', type: 'select', required: true, targetTable: 'profiles', targetColumn: 'citizenship_country', options: COUNTRIES },
  { id: 'Q19', questionNumber: 19, section: 'B', text: 'Do you have an employment visa for any country other than India?', type: 'select', required: true, targetTable: 'local', targetColumn: 'has_employment_visa', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
  { id: 'Q20', questionNumber: 20, section: 'B', text: "Which country's employment visa do you hold?", type: 'select', required: true, targetTable: 'profiles', targetColumn: 'employment_visa_country', options: COUNTRIES },
  { id: 'Q21', questionNumber: 21, section: 'B', text: 'Which country are you currently residing in?', type: 'select', required: true, targetTable: 'profiles', targetColumn: 'current_country', options: COUNTRIES },
  { id: 'Q22', questionNumber: 22, section: 'B', text: 'Which state are you in?', type: 'select', required: true, targetTable: 'profiles', targetColumn: 'current_state', options: INDIAN_STATES },
  { id: 'Q23', questionNumber: 23, section: 'B', text: 'Which city do you currently live in?', type: 'text', required: true, targetTable: 'profiles', targetColumn: 'current_city', placeholder: 'Start typing your city name', autocompleteSource: 'indian_cities' },
  { id: 'Q24', questionNumber: 24, section: 'B', text: 'Is your permanent address the same as your present address?', type: 'select', required: true, targetTable: 'local', targetColumn: 'permanent_same_as_current', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
  { id: 'Q25', questionNumber: 25, section: 'B', text: 'What is your permanent city and state/country?', type: 'text', required: true, targetTable: 'profiles', targetColumn: 'permanent_city', placeholder: 'e.g. Pune, Maharashtra' },
  { id: 'Q26', questionNumber: 26, section: 'B', text: 'Is your permanent home owned or rented?', type: 'select', required: true, targetTable: 'profiles', targetColumn: 'permanent_ownership', options: [{ value: 'owned', label: 'Owned' }, { value: 'rented', label: 'Rental' }, { value: 'family_home', label: 'Family home' }] },
];

// ============================================================
// SECTION C — Religion & Community (Q27–Q31) — Fully defined
// ============================================================

const sectionC: QuestionConfig[] = [
  { id: 'Q27', questionNumber: 27, section: 'C', text: 'What is your religion?', type: 'select', required: true, targetTable: 'profiles', targetColumn: 'religion', options: RELIGIONS },
  { id: 'Q28', questionNumber: 28, section: 'C', text: 'How would you describe your level of religious observance?', type: 'select', required: true, targetTable: 'profiles', targetColumn: 'religious_observance', options: [{ value: 'actively_practicing', label: 'Actively practicing' }, { value: 'culturally_observant', label: 'Culturally observant' }, { value: 'spiritual', label: 'Spiritual but not religious' }, { value: 'not_religious', label: 'Not religious' }] },
  { id: 'Q29', questionNumber: 29, section: 'C', text: 'Do you believe in Kundali/horoscope matching?', type: 'select', required: true, targetTable: 'profiles', targetColumn: 'believes_in_kundali', options: [{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }] },
  { id: 'Q30', questionNumber: 30, section: 'C', text: 'Are you comfortable sharing your sect, caste, or community?', type: 'select', required: true, targetTable: 'profiles', targetColumn: 'caste_comfort', options: [{ value: 'true', label: 'Yes' }, { value: 'false', label: "No, I'd rather not say" }] },
  { id: 'Q31', questionNumber: 31, section: 'C', text: 'What is your sect, caste, or community?', type: 'text', required: true, targetTable: 'profiles', targetColumn: 'caste', placeholder: 'e.g. Sunni, Brahmin, Catholic, Jat Sikh', helpText: 'This helps us find compatible matches within your community preferences.' },
];

// ============================================================
// SECTION D — Family Background (Q32–Q39) — Skeleton
// ============================================================

const sectionD: QuestionConfig[] = [
  { id: 'Q32', questionNumber: 32, section: 'D', text: "What is your father's name?", type: 'text', required: true, targetTable: 'profiles', targetColumn: 'father_name', placeholder: 'Full name' },
  { id: 'Q33', questionNumber: 33, section: 'D', text: "What is your father's occupation?", type: 'select', required: true, targetTable: 'profiles', targetColumn: 'father_occupation', options: OCCUPATION_OPTIONS },
  { id: 'Q34', questionNumber: 34, section: 'D', text: "Please describe your father's occupation", type: 'text', required: true, targetTable: 'profiles', targetColumn: 'father_occupation_other', helpText: 'Since you selected "Other"' },
  { id: 'Q35', questionNumber: 35, section: 'D', text: "What is your mother's name?", type: 'text', required: true, targetTable: 'profiles', targetColumn: 'mother_name', placeholder: 'Full name' },
  { id: 'Q36', questionNumber: 36, section: 'D', text: "What is your mother's occupation?", type: 'select', required: true, targetTable: 'profiles', targetColumn: 'mother_occupation', options: OCCUPATION_OPTIONS },
  { id: 'Q37', questionNumber: 37, section: 'D', text: "Please describe your mother's occupation", type: 'text', required: true, targetTable: 'profiles', targetColumn: 'mother_occupation_other', helpText: 'Since you selected "Other"' },
  { id: 'Q38', questionNumber: 38, section: 'D', text: 'Claude Chat: Family Background', type: 'claude_chat', required: true, targetTable: 'compatibility_profiles', targetColumn: 'raw_conversation_transcript' },
  { id: 'Q39', questionNumber: 39, section: 'D', text: 'How many siblings do you have?', type: 'number', required: true, targetTable: 'profiles', targetColumn: 'siblings_count', placeholder: '0' },
];

// ============================================================
// SECTION E — Physical Details (Q40–Q42) — Skeleton
// ============================================================

const sectionE: QuestionConfig[] = [
  { id: 'Q40', questionNumber: 40, section: 'E', text: 'What is your height (in cm)?', type: 'number', required: true, targetTable: 'profiles', targetColumn: 'height_cm', placeholder: 'e.g. 170' },
  { id: 'Q41', questionNumber: 41, section: 'E', text: 'What is your weight (in kg)?', type: 'number', required: true, targetTable: 'profiles', targetColumn: 'weight_kg', placeholder: 'e.g. 65' },
  { id: 'Q42', questionNumber: 42, section: 'E', text: 'How would you describe your skin tone?', type: 'select', required: false, targetTable: 'profiles', targetColumn: 'skin_tone', options: [{ value: 'fair', label: 'Fair' }, { value: 'wheatish', label: 'Wheatish' }, { value: 'dusky', label: 'Dusky' }, { value: 'dark', label: 'Dark' }] },
];

// ============================================================
// SECTION F — Lifestyle (Q43–Q52) — Skeleton
// ============================================================

const sectionF: QuestionConfig[] = [
  { id: 'Q43', questionNumber: 43, section: 'F', text: 'What are your dietary preferences?', type: 'select', required: true, targetTable: 'profiles', targetColumn: 'diet', options: [{ value: 'vegetarian', label: 'Vegetarian' }, { value: 'non_vegetarian', label: 'Non-Vegetarian' }, { value: 'eggetarian', label: 'Eggetarian' }, { value: 'vegan', label: 'Vegan' }, { value: 'jain', label: 'Jain' }, { value: 'other', label: 'Flexible / Other' }] },
  { id: 'Q44', questionNumber: 44, section: 'F', text: 'What is your everyday attire preference?', type: 'select', required: true, targetTable: 'profiles', targetColumn: 'attire_preference', options: [{ value: 'modern_western', label: 'Western' }, { value: 'traditional', label: 'Traditional' }, { value: 'mix', label: 'Mix of both' }, { value: 'no_preference', label: 'No preference' }] },
  { id: 'Q45', questionNumber: 45, section: 'F', text: 'What are your fitness habits?', type: 'select', required: true, targetTable: 'profiles', targetColumn: 'fitness_habits', options: [{ value: 'regularly_exercises', label: 'Regular (4+ times/week)' }, { value: 'occasionally', label: 'Moderate (1-3 times/week)' }, { value: 'rarely', label: 'Occasional' }, { value: 'not_interested', label: 'Not active currently' }] },
  { id: 'Q46', questionNumber: 46, section: 'F', text: 'Do you smoke?', type: 'select', required: true, targetTable: 'profiles', targetColumn: 'smoking', options: [{ value: 'never', label: 'No' }, { value: 'occasionally', label: 'Occasionally' }, { value: 'frequently', label: 'Yes, regularly' }] },
  { id: 'Q47', questionNumber: 47, section: 'F', text: 'Do you drink alcohol?', type: 'select', required: true, targetTable: 'profiles', targetColumn: 'drinking', options: [{ value: 'never', label: 'No' }, { value: 'occasionally', label: 'Socially' }, { value: 'frequently', label: 'Regularly' }] },
  { id: 'Q48', questionNumber: 48, section: 'F', text: 'Do you have tattoos or piercings?', type: 'select', required: true, targetTable: 'profiles', targetColumn: 'tattoos_piercings', options: [{ value: 'none', label: 'None' }, { value: 'tattoos_only', label: 'Tattoos' }, { value: 'piercings_only', label: 'Piercings' }, { value: 'both', label: 'Both' }] },
  { id: 'Q49', questionNumber: 49, section: 'F', text: 'Do you have any disabilities or health conditions you would like to share?', type: 'select', required: true, targetTable: 'profiles', targetColumn: 'has_disability', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }, { value: 'prefer_not_to_disclose', label: 'Prefer not to disclose' }] },
  { id: 'Q50', questionNumber: 50, section: 'F', text: 'Please describe your disability or health condition', type: 'text', required: true, targetTable: 'profiles', targetColumn: 'disability_description', placeholder: 'Share what you are comfortable with' },
  { id: 'Q51', questionNumber: 51, section: 'F', text: 'Do you have any allergies?', type: 'select', required: true, targetTable: 'profiles', targetColumn: 'has_allergies', options: [{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }] },
  { id: 'Q52', questionNumber: 52, section: 'F', text: 'Please describe your allergies', type: 'text', required: true, targetTable: 'profiles', targetColumn: 'allergy_description', placeholder: 'e.g. peanuts, dust, pollen' },
];

// ============================================================
// SECTION G — Personality & Interests (Q53–Q55) — Skeleton
// ============================================================

const sectionG: QuestionConfig[] = [
  {
    id: 'Q53',
    questionNumber: 53,
    section: 'G',
    text: 'What are your hobbies and interests?',
    type: 'multi_select',
    required: true,
    targetTable: 'profiles',
    targetColumn: 'hobbies_interests',
    helpText: 'Select all that apply.',
    options: [
      // Arts & Creativity
      { value: 'drawing_painting', label: 'Drawing / Painting' },
      { value: 'photography', label: 'Photography' },
      { value: 'writing', label: 'Writing' },
      { value: 'music_listening', label: 'Music (Listening)' },
      { value: 'music_playing', label: 'Music (Playing)' },
      { value: 'dance', label: 'Dance' },
      { value: 'theatre', label: 'Theatre' },
      { value: 'poetry', label: 'Poetry' },
      // Sports & Fitness
      { value: 'cricket', label: 'Cricket' },
      { value: 'football', label: 'Football' },
      { value: 'tennis', label: 'Tennis' },
      { value: 'badminton', label: 'Badminton' },
      { value: 'swimming', label: 'Swimming' },
      { value: 'gym_weightlifting', label: 'Gym / Weightlifting' },
      { value: 'yoga', label: 'Yoga' },
      { value: 'cycling', label: 'Cycling' },
      { value: 'trekking', label: 'Trekking' },
      { value: 'running', label: 'Running' },
      { value: 'martial_arts', label: 'Martial Arts' },
      { value: 'chess', label: 'Chess' },
      // Outdoors & Travel
      { value: 'hiking', label: 'Hiking' },
      { value: 'camping', label: 'Camping' },
      { value: 'road_trips', label: 'Road Trips' },
      { value: 'wildlife_nature', label: 'Wildlife & Nature' },
      { value: 'backpacking', label: 'Backpacking' },
      { value: 'adventure_sports', label: 'Adventure Sports' },
      // Food & Lifestyle
      { value: 'cooking', label: 'Cooking' },
      { value: 'baking', label: 'Baking' },
      { value: 'coffee_culture', label: 'Coffee Culture' },
      { value: 'wine_cocktails', label: 'Wine & Cocktails' },
      { value: 'gardening', label: 'Gardening' },
      { value: 'interior_design', label: 'Interior Design' },
      { value: 'fashion_style', label: 'Fashion & Style' },
      // Tech & Gaming
      { value: 'video_games', label: 'Video Games' },
      { value: 'board_games', label: 'Board Games' },
      { value: 'coding', label: 'Coding' },
      { value: 'robotics', label: 'Robotics' },
      { value: 'gadgets', label: 'Gadgets' },
      // Reading & Learning
      { value: 'fiction', label: 'Fiction' },
      { value: 'non_fiction', label: 'Non-Fiction' },
      { value: 'philosophy', label: 'Philosophy' },
      { value: 'history', label: 'History' },
      { value: 'science', label: 'Science' },
      { value: 'podcasts', label: 'Podcasts' },
      { value: 'documentaries', label: 'Documentaries' },
      { value: 'online_courses', label: 'Online Courses' },
      // Social & Community
      { value: 'volunteering', label: 'Volunteering' },
      { value: 'social_work', label: 'Social Work' },
      { value: 'activism', label: 'Activism' },
      { value: 'spirituality_meditation', label: 'Spirituality & Meditation' },
      { value: 'environmentalism', label: 'Environmentalism' },
      // Entertainment
      { value: 'movies', label: 'Movies' },
      { value: 'web_series', label: 'Web Series' },
      { value: 'theatre_shows', label: 'Theatre Shows' },
      { value: 'standup_comedy', label: 'Stand-Up Comedy' },
      { value: 'concerts_live_music', label: 'Concerts & Live Music' },
      // Crafts & Collecting
      { value: 'diy_projects', label: 'DIY Projects' },
      { value: 'knitting_crocheting', label: 'Knitting / Crocheting' },
      { value: 'pottery', label: 'Pottery' },
      { value: 'stamp_coin_collecting', label: 'Stamp / Coin Collecting' },
      { value: 'origami', label: 'Origami' },
      // Other
      { value: 'other', label: 'Other' },
    ],
  },
  { id: 'Q54', questionNumber: 54, section: 'G', text: 'Which 2-3 hobbies do you actually spend time on regularly?', type: 'text', required: true, targetTable: 'profiles', targetColumn: 'hobbies_regular', placeholder: 'e.g. Reading, Cooking, Running' },
  { id: 'Q55', questionNumber: 55, section: 'G', text: 'Any other hobbies not listed above?', type: 'text', required: false, targetTable: 'profiles', targetColumn: 'hobbies_other', helpText: 'Since you selected "Other"' },
];

// ============================================================
// SECTION H — Education (Q56–Q60) — Skeleton
// ============================================================

const sectionH: QuestionConfig[] = [
  { id: 'Q56', questionNumber: 56, section: 'H', text: 'What is your current medical status?', type: 'select', required: true, targetTable: 'medical_credentials', targetColumn: 'current_status', options: [{ value: 'mbbs_student', label: 'MBBS Student' }, { value: 'intern', label: 'Intern' }, { value: 'mbbs_passed', label: 'MBBS Passed (not pursuing PG yet)' }, { value: 'pursuing_pg', label: 'Pursuing PG' }, { value: 'completed_pg', label: 'Completed PG / Practicing' }] },
  { id: 'Q57', questionNumber: 57, section: 'H', text: 'Are you planning to pursue postgraduate studies?', type: 'select', required: true, targetTable: 'medical_credentials', targetColumn: 'pg_plans', options: [{ value: 'yes_within_1_year', label: 'Yes, within 1 year' }, { value: 'yes_2_to_3_years', label: 'Yes, in 2-3 years' }, { value: 'no_plan_to_practice', label: 'No' }, { value: 'undecided', label: 'Undecided' }] },
  { id: 'Q58', questionNumber: 58, section: 'H', text: 'Do you have any additional qualifications?', type: 'multi_select', required: false, targetTable: 'medical_credentials', targetColumn: 'additional_qualifications', options: ADDITIONAL_QUALIFICATION_OPTIONS },
  { id: 'Q59', questionNumber: 59, section: 'H', text: 'What other qualifications do you have?', type: 'text', required: true, targetTable: 'medical_credentials', targetColumn: 'additional_qualifications_other', placeholder: 'Please specify' },
  { id: 'Q60', questionNumber: 60, section: 'H', text: 'What specialty are you pursuing or planning to pursue?', type: 'multi_select', required: false, targetTable: 'medical_credentials', targetColumn: 'specialty', options: MEDICAL_SPECIALTY_OPTIONS },
];

// ============================================================
// SECTION I — Career (Q61–Q62) — Skeleton
// ============================================================

const sectionI: QuestionConfig[] = [
  { id: 'Q61', questionNumber: 61, section: 'I', text: 'Have you worked or are you currently working?', type: 'select', required: true, targetTable: 'medical_credentials', targetColumn: 'has_work_experience', options: [{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }] },
  { id: 'Q62', questionNumber: 62, section: 'I', text: 'Add your work experience', type: 'timeline', required: true, targetTable: 'medical_credentials', targetColumn: 'work_experience', helpText: 'Add your work experience entries, starting with the most recent.' },
];

// ============================================================
// SECTION J — Goals & Values (Q63–Q75) — Skeleton
// ============================================================

const sectionJ: QuestionConfig[] = [
  { id: 'Q63', questionNumber: 63, section: 'J', text: 'When are you looking to get married?', type: 'select', required: true, targetTable: 'profiles', targetColumn: 'marriage_timeline', options: [{ value: 'within_6_months', label: 'Within 6 months' }, { value: '6_to_12_months', label: '6-12 months' }, { value: '1_to_2_years', label: '1-2 years' }, { value: 'no_fixed_timeline', label: 'No fixed timeline' }] },
  { id: 'Q64', questionNumber: 64, section: 'J', text: 'Are you open to a long-distance relationship before relocation?', type: 'select', required: true, targetTable: 'profiles', targetColumn: 'long_distance_comfort', options: [{ value: 'yes_absolutely', label: 'Yes' }, { value: 'open_to_it', label: 'Open to it' }, { value: 'prefer_same_location', label: 'Prefer same city' }] },
  { id: 'Q65', questionNumber: 65, section: 'J', text: 'What would your preferred post-marriage family arrangement be?', type: 'select', required: true, targetTable: 'profiles', targetColumn: 'post_marriage_family_arrangement', options: [{ value: 'nuclear', label: 'Nuclear family' }, { value: 'joint', label: 'Joint family' }, { value: 'flexible', label: 'Flexible' }, { value: 'no_preference', label: 'No preference' }] },
  { id: 'Q66', questionNumber: 66, section: 'J', text: 'Should both partners work after marriage?', type: 'select', required: true, targetTable: 'profiles', targetColumn: 'both_partners_working_expectation', options: [{ value: 'both_continue', label: 'Yes, both should work' }, { value: 'comfortable_either_way', label: 'Either way is fine' }, { value: 'i_prefer_home', label: 'I prefer to be home' }, { value: 'prefer_partner_home', label: 'I prefer partner to be home' }, { value: 'open', label: 'Open to discussion' }] },
  { id: 'Q67', questionNumber: 67, section: 'J', text: 'Do you want children?', type: 'select', required: true, targetTable: 'profiles', targetColumn: 'wants_children', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }, { value: 'open', label: 'Open to it' }] },
  { id: 'Q68', questionNumber: 68, section: 'J', text: 'How many children would you ideally like?', type: 'select', required: true, targetTable: 'profiles', targetColumn: 'children_count_preference', options: [{ value: '1', label: '1' }, { value: '2', label: '2' }, { value: '3_or_more', label: '3+' }, { value: 'no_preference', label: 'No preference' }] },
  { id: 'Q69', questionNumber: 69, section: 'J', text: 'When would you like to have children?', type: 'select', required: true, targetTable: 'profiles', targetColumn: 'children_timing_preference', options: [{ value: 'within_1_2_years', label: '1-2 years after marriage' }, { value: 'after_3_5_years', label: '3-5 years' }, { value: 'after_milestones', label: 'After career milestones' }, { value: 'no_preference', label: 'No preference' }] },
  { id: 'Q70', questionNumber: 70, section: 'J', text: 'Would you be open to a partner who has children from a previous marriage?', type: 'select', required: true, targetTable: 'profiles', targetColumn: 'open_to_partner_with_children', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }, { value: 'open', label: 'Open to it' }] },
  { id: 'Q71', questionNumber: 71, section: 'J', text: 'Where would you like to settle eventually?', type: 'multi_select', required: true, targetTable: 'profiles', targetColumn: 'preferred_settlement_countries', options: COUNTRIES },
  { id: 'Q72', questionNumber: 72, section: 'J', text: 'Are you open to immediate relocation for your partner?', type: 'select', required: true, targetTable: 'profiles', targetColumn: 'open_to_immediate_relocation', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }, { value: 'open', label: 'Open to it' }] },
  { id: 'Q73', questionNumber: 73, section: 'J', text: 'Do you have plans to study or work outside India in the next 3 years?', type: 'select', required: true, targetTable: 'profiles', targetColumn: 'plans_to_go_abroad', options: [{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }] },
  { id: 'Q74', questionNumber: 74, section: 'J', text: 'Which countries are you exploring?', type: 'multi_select', required: true, targetTable: 'profiles', targetColumn: 'abroad_countries', options: COUNTRIES },
  { id: 'Q75', questionNumber: 75, section: 'J', text: 'Claude Chat: Goals & Values', type: 'claude_chat', required: true, targetTable: 'compatibility_profiles', targetColumn: 'raw_conversation_transcript' },
];

// ============================================================
// SECTION K — Partner Preferences (Q76–Q94) — Skeleton
// ============================================================

const sectionK: QuestionConfig[] = [
  { id: 'Q76', questionNumber: 76, section: 'K', text: 'What is your preferred age range for a partner?', type: 'range', required: true, targetTable: 'partner_preferences', targetColumn: 'preferred_age_min', targetColumn2: 'preferred_age_max' },
  { id: 'Q77', questionNumber: 77, section: 'K', text: 'What is your preferred height range (in cm)?', type: 'range', required: true, targetTable: 'partner_preferences', targetColumn: 'preferred_height_min_cm', targetColumn2: 'preferred_height_max_cm' },
  { id: 'Q78', questionNumber: 78, section: 'K', text: 'Do you want your partner in a specific medical specialty?', type: 'select', required: true, targetTable: 'partner_preferences', targetColumn: 'prefers_specific_specialty', options: [{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No, open to all' }] },
  { id: 'Q79', questionNumber: 79, section: 'K', text: 'Which specialties do you prefer?', type: 'multi_select', required: true, targetTable: 'partner_preferences', targetColumn: 'preferred_specialties', options: MEDICAL_SPECIALTY_OPTIONS },
  { id: 'Q80', questionNumber: 80, section: 'K', text: 'Where would you prefer your partner to be based?', type: 'multi_select', required: true, targetTable: 'partner_preferences', targetColumn: 'preferred_indian_states', options: INDIAN_STATES },
  { id: 'Q81', questionNumber: 81, section: 'K', text: 'Do you have a mother tongue preference for your partner?', type: 'multi_select', required: false, targetTable: 'partner_preferences', targetColumn: 'preferred_mother_tongue', options: MOTHER_TONGUE_OPTIONS },
  { id: 'Q82', questionNumber: 82, section: 'K', text: 'Do you have a body type preference?', type: 'multi_select', required: false, targetTable: 'partner_preferences', targetColumn: 'body_type_preference', options: BODY_TYPE_OPTIONS },
  { id: 'Q83', questionNumber: 83, section: 'K', text: "What is your preference for your partner's everyday attire?", type: 'select', required: false, targetTable: 'partner_preferences', targetColumn: 'attire_preference', options: [{ value: 'modern_western', label: 'Western' }, { value: 'traditional', label: 'Traditional' }, { value: 'mix', label: 'Mix of both' }, { value: 'no_preference', label: 'No preference' }] },
  { id: 'Q84', questionNumber: 84, section: 'K', text: "What is your preference for your partner's diet?", type: 'multi_select', required: false, targetTable: 'partner_preferences', targetColumn: 'diet_preference', options: DIET_PREFERENCE_OPTIONS },
  { id: 'Q85', questionNumber: 85, section: 'K', text: "What is your preference for your partner's fitness habits?", type: 'select', required: false, targetTable: 'partner_preferences', targetColumn: 'fitness_preference', options: [{ value: 'regularly_exercises', label: 'Regular' }, { value: 'occasionally', label: 'Moderate' }, { value: 'rarely', label: 'Any level' }, { value: 'no_preference', label: 'No preference' }] },
  { id: 'Q86', questionNumber: 86, section: 'K', text: "What is your preference regarding your partner's smoking?", type: 'select', required: false, targetTable: 'partner_preferences', targetColumn: 'smoking_preference', options: [{ value: 'never', label: 'Non-smoker only' }, { value: 'occasionally', label: 'Occasional is fine' }, { value: 'no_preference', label: 'No preference' }] },
  { id: 'Q87', questionNumber: 87, section: 'K', text: "What is your preference regarding your partner's drinking?", type: 'select', required: false, targetTable: 'partner_preferences', targetColumn: 'drinking_preference', options: [{ value: 'never', label: 'Non-drinker only' }, { value: 'occasionally', label: 'Social drinking is fine' }, { value: 'no_preference', label: 'No preference' }] },
  { id: 'Q88', questionNumber: 88, section: 'K', text: "What is your preference regarding your partner's tattoos or piercings?", type: 'select', required: false, targetTable: 'partner_preferences', targetColumn: 'tattoo_preference', options: [{ value: 'none', label: 'None preferred' }, { value: 'tattoos_only', label: 'Tattoos are fine' }, { value: 'piercings_only', label: 'Piercings are fine' }, { value: 'both', label: 'Both are fine' }, { value: 'no_preference', label: 'No preference' }] },
  { id: 'Q89', questionNumber: 89, section: 'K', text: 'What is your preference for family type?', type: 'select', required: false, targetTable: 'partner_preferences', targetColumn: 'family_type_preference', options: [{ value: 'nuclear', label: 'Nuclear' }, { value: 'joint', label: 'Joint' }, { value: 'flexible', label: 'Flexible' }, { value: 'no_preference', label: 'No preference' }] },
  { id: 'Q90', questionNumber: 90, section: 'K', text: "What is your preference for your partner's religious observance?", type: 'select', required: false, targetTable: 'partner_preferences', targetColumn: 'religious_observance_preference', options: [{ value: 'actively_practicing', label: 'Actively practicing' }, { value: 'culturally_observant', label: 'Culturally observant' }, { value: 'spiritual', label: 'Spiritual but not religious' }, { value: 'not_religious', label: 'Not religious' }, { value: 'no_preference', label: 'No preference' }] },
  { id: 'Q91', questionNumber: 91, section: 'K', text: "What are your expectations for your partner's career after marriage?", type: 'select', required: true, targetTable: 'partner_preferences', targetColumn: 'partner_career_expectation_after_marriage', options: [{ value: 'both_continue', label: 'Both should work' }, { value: 'comfortable_either_way', label: 'Either way' }, { value: 'prefer_partner_home', label: 'Prefer homemaker' }, { value: 'open', label: 'Open to discussion' }] },
  { id: 'Q92', questionNumber: 92, section: 'K', text: 'Which career stages are acceptable for your partner?', type: 'multi_select', required: false, targetTable: 'partner_preferences', targetColumn: 'preferred_career_stage', options: [{ value: 'student', label: 'MBBS Student' }, { value: 'intern', label: 'Intern' }, { value: 'pg_resident', label: 'PG Resident' }, { value: 'completed_pg', label: 'Completed PG' }, { value: 'established', label: 'Established Practitioner' }, { value: 'no_preference', label: 'No preference' }] },
  { id: 'Q93', questionNumber: 93, section: 'K', text: 'What qualities are you looking for in a partner?', type: 'multi_select', required: true, targetTable: 'partner_preferences', targetColumn: 'partner_qualities', maxSelections: 7, helpText: 'Select up to 7 qualities.', options: PARTNER_QUALITY_OPTIONS },
  { id: 'Q94', questionNumber: 94, section: 'K', text: 'Any other qualities you are looking for?', type: 'text', required: false, targetTable: 'partner_preferences', targetColumn: 'partner_qualities_other', placeholder: 'Describe any qualities not listed above' },
];

// ============================================================
// SECTION L — Documents & Verification (Q95–Q99) — Skeleton
// ============================================================

const sectionL: QuestionConfig[] = [
  { id: 'Q95', questionNumber: 95, section: 'L', text: 'Upload a passport-size photo', type: 'file_upload', required: true, targetTable: 'photos', targetColumn: 'storage_path' },
  { id: 'Q96', questionNumber: 96, section: 'L', text: 'Upload profile photos (2-6 photos)', type: 'file_upload', required: true, targetTable: 'photos', targetColumn: 'storage_path', helpText: 'Upload 2 to 6 photos of yourself.' },
  { id: 'Q97', questionNumber: 97, section: 'L', text: 'Upload an identity document (Aadhaar or Passport)', type: 'file_upload', required: true, targetTable: 'documents', targetColumn: 'storage_path' },
  { id: 'Q98', questionNumber: 98, section: 'L', text: 'Upload your Kundali', type: 'file_upload', required: false, targetTable: 'documents', targetColumn: 'storage_path' },
  { id: 'Q99', questionNumber: 99, section: 'L', text: 'Background Verification Consent', type: 'select', required: true, targetTable: 'users', targetColumn: 'bgv_consent', options: [{ value: 'consented', label: 'I consent. Samvaya may proceed once my verification fee is paid.' }, { value: 'consented_wants_call', label: "I consent, but I'd like to speak with the team first." }, { value: 'refused', label: 'I do not consent.' }] },
];

// ============================================================
// SECTION M — Closing (Q100) — Skeleton
// ============================================================

const sectionM: QuestionConfig[] = [
  { id: 'Q100', questionNumber: 100, section: 'M', text: 'Claude Chat: Anything else you would like to share?', type: 'claude_chat', required: true, targetTable: 'compatibility_profiles', targetColumn: 'closing_freeform_note' },
];

// ============================================================
// Full question registry
// ============================================================

export const QUESTIONS: QuestionConfig[] = [
  ...sectionA,
  ...sectionB,
  ...sectionC,
  ...sectionD,
  ...sectionE,
  ...sectionF,
  ...sectionG,
  ...sectionH,
  ...sectionI,
  ...sectionJ,
  ...sectionK,
  ...sectionL,
  ...sectionM,
];

export function getQuestion(id: string): QuestionConfig | undefined {
  return QUESTIONS.find((q) => q.id === id);
}

export function getQuestionsBySection(sectionId: string): QuestionConfig[] {
  return QUESTIONS.filter((q) => q.section === sectionId);
}
