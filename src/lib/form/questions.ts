import type { QuestionConfig, OptionGroup } from './types';
import { INDIAN_STATES } from '@/lib/data/indian-states';
import { RELIGIONS } from '@/lib/data/religions';
// Required flags follow PRD. Conditional questions are marked required: false because
// they're only rendered when their predecessor triggers visibility (see conditional-rules.ts).
// Q58 (additional qualifications/certifications) is intentionally optional — applicants
// may have none. Q15 (blood group) is optional per product decision.

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
  { value: 'bhojpuri', label: 'Bhojpuri' },
  { value: 'rajasthani', label: 'Rajasthani' },
  { value: 'chhattisgarhi', label: 'Chhattisgarhi' },
  { value: 'marwari', label: 'Marwari' },
  { value: 'haryanvi', label: 'Haryanvi' },
  { value: 'tulu', label: 'Tulu' },
  { value: 'konkani', label: 'Konkani' },
  { value: 'nepali', label: 'Nepali' },
  { value: 'sindhi', label: 'Sindhi' },
  { value: 'dogri', label: 'Dogri' },
  { value: 'kashmiri', label: 'Kashmiri' },
  { value: 'manipuri', label: 'Manipuri' },
  { value: 'bodo', label: 'Bodo' },
  { value: 'santali', label: 'Santali' },
  { value: 'khasi', label: 'Khasi' },
  { value: 'mizo', label: 'Mizo' },
  { value: 'kodava', label: 'Kodava' },
  { value: 'sanskrit', label: 'Sanskrit' },
  { value: 'english', label: 'English' },
  { value: 'other', label: 'Other' },
];

const MEDICAL_SPECIALTY_OPTIONS = [
  // Clinical / broad specialties
  { value: 'general_medicine', label: 'General Medicine' },
  { value: 'general_surgery', label: 'General Surgery' },
  { value: 'family_medicine', label: 'Family Medicine' },
  { value: 'emergency_medicine', label: 'Emergency Medicine' },
  { value: 'critical_care', label: 'Critical Care Medicine' },
  { value: 'internal_medicine', label: 'Internal Medicine' },

  // Medical specialties
  { value: 'cardiology', label: 'Cardiology' },
  { value: 'pulmonology', label: 'Pulmonology' },
  { value: 'gastroenterology', label: 'Gastroenterology' },
  { value: 'hepatology', label: 'Hepatology' },
  { value: 'nephrology', label: 'Nephrology' },
  { value: 'neurology', label: 'Neurology' },
  { value: 'endocrinology', label: 'Endocrinology' },
  { value: 'rheumatology', label: 'Rheumatology' },
  { value: 'hematology', label: 'Clinical Hematology' },
  { value: 'clinical_immunology', label: 'Clinical Immunology' },
  { value: 'infectious_diseases', label: 'Infectious Diseases' },
  { value: 'geriatric_medicine', label: 'Geriatric Medicine' },
  { value: 'palliative_medicine', label: 'Palliative Medicine' },

  // Oncology
  { value: 'medical_oncology', label: 'Medical Oncology' },
  { value: 'surgical_oncology', label: 'Surgical Oncology' },
  { value: 'radiation_oncology', label: 'Radiation Oncology' },

  // Surgical specialties
  { value: 'orthopedics', label: 'Orthopedics' },
  { value: 'neurosurgery', label: 'Neurosurgery' },
  { value: 'cardiothoracic_surgery', label: 'Cardiothoracic Surgery' },
  { value: 'vascular_surgery', label: 'Vascular Surgery' },
  { value: 'urology', label: 'Urology' },
  { value: 'plastic_surgery', label: 'Plastic & Reconstructive Surgery' },
  { value: 'pediatric_surgery', label: 'Pediatric Surgery' },
  { value: 'surgical_gastroenterology', label: 'Surgical Gastroenterology' },
  { value: 'hepatobiliary_surgery', label: 'Hepatobiliary Surgery' },
  { value: 'trauma_surgery', label: 'Trauma Surgery' },

  // Women & children
  { value: 'obstetrics_gynecology', label: 'Obstetrics & Gynecology' },
  { value: 'reproductive_medicine', label: 'Reproductive Medicine & IVF' },
  { value: 'pediatrics', label: 'Pediatrics' },
  { value: 'neonatology', label: 'Neonatology' },

  // Sensory & skin
  { value: 'dermatology', label: 'Dermatology, Venereology & Leprosy' },
  { value: 'ophthalmology', label: 'Ophthalmology' },
  { value: 'ent', label: 'ENT (Otorhinolaryngology)' },

  // Mental health
  { value: 'psychiatry', label: 'Psychiatry' },

  // Anesthesia & pain
  { value: 'anesthesiology', label: 'Anesthesiology' },
  { value: 'cardiac_anesthesiology', label: 'Cardiac Anesthesiology' },
  { value: 'pain_medicine', label: 'Pain Medicine' },

  // Diagnostics & imaging
  { value: 'radiology', label: 'Radiology' },
  { value: 'interventional_radiology', label: 'Interventional Radiology' },
  { value: 'nuclear_medicine', label: 'Nuclear Medicine' },
  { value: 'pathology', label: 'Pathology' },

  // Laboratory / pre-clinical
  { value: 'microbiology', label: 'Microbiology' },
  { value: 'biochemistry', label: 'Biochemistry' },
  { value: 'pharmacology', label: 'Pharmacology' },
  { value: 'physiology', label: 'Physiology' },
  { value: 'anatomy', label: 'Anatomy' },
  { value: 'virology', label: 'Virology' },
  { value: 'medical_genetics', label: 'Medical Genetics' },

  // Public health & community
  { value: 'community_medicine', label: 'Community Medicine' },
  { value: 'public_health', label: 'Public Health' },
  { value: 'forensic_medicine', label: 'Forensic Medicine & Toxicology' },
  { value: 'transfusion_medicine', label: 'Transfusion Medicine & Blood Banking' },

  // Rehabilitation & sports
  { value: 'physical_medicine_rehabilitation', label: 'Physical Medicine & Rehabilitation' },
  { value: 'sports_medicine', label: 'Sports Medicine' },

  // Specialised / niche
  { value: 'aerospace_medicine', label: 'Aerospace Medicine' },
  { value: 'hospital_administration', label: 'Hospital Administration' },

  // Dental
  { value: 'dental_surgery', label: 'Dental Surgery' },

  // AYUSH (MBBS doctors who cross-practice)
  { value: 'ayush', label: 'AYUSH (Ayurveda / Homeopathy / Unani)' },

  { value: 'other', label: 'Other' },
];

const PG_DEGREE_OPTIONS = [
  { value: 'md', label: 'MD' },
  { value: 'ms', label: 'MS' },
  { value: 'mch', label: 'MCh' },
  { value: 'dm', label: 'DM' },
  { value: 'dnb', label: 'DNB' },
  { value: 'other', label: 'Other (please specify)' },
];

const ADDITIONAL_QUALIFICATION_OPTIONS = [
  { value: 'fellowship', label: 'Fellowship' },
  { value: 'phd', label: 'PhD' },
  { value: 'mba', label: 'MBA' },
  { value: 'mph', label: 'MPH (Master of Public Health)' },
  { value: 'pgdm', label: 'PGDM' },
  { value: 'diploma', label: 'Diploma (post-MBBS)' },
  { value: 'mrcp', label: 'MRCP' },
  { value: 'frcs', label: 'FRCS' },
  { value: 'fcps', label: 'FCPS' },
  { value: 'dgo', label: 'DGO' },
  { value: 'dch', label: 'DCH' },
  { value: 'da', label: 'DA' },
  { value: 'usmle', label: 'USMLE (USA)' },
  { value: 'plab', label: 'PLAB (UK)' },
  { value: 'amc', label: 'AMC (Australia)' },
  { value: 'mccqe', label: 'MCCQE (Canada)' },
  { value: 'fmge', label: 'FMGE (returning to India)' },
  { value: 'other', label: 'Other' },
];

const ADDITIONAL_QUALIFICATION_GROUPS: OptionGroup[] = [
  {
    key: 'postgraduate_degrees',
    label: 'Postgraduate qualifications & degrees',
    icon: '🎓',
    optionValues: ['fellowship', 'phd', 'mba', 'mph', 'pgdm', 'diploma'],
  },
  {
    key: 'specialty_certifications',
    label: 'Specialty certifications',
    icon: '📜',
    optionValues: ['mrcp', 'frcs', 'fcps', 'dgo', 'dch', 'da'],
  },
  {
    key: 'licensing_exams',
    label: 'Licensing exams (cleared or planning)',
    icon: '🌍',
    optionValues: ['usmle', 'plab', 'amc', 'mccqe', 'fmge'],
  },
  {
    key: 'other',
    label: 'Other',
    icon: '➕',
    optionValues: ['other'],
  },
];

const BODY_TYPE_OPTIONS = [
  { value: 'slim', label: 'Slim' },
  { value: 'athletic', label: 'Athletic' },
  { value: 'average', label: 'Average' },
  { value: 'full_figured', label: 'Full-Figured' },
  { value: 'no_preference', label: 'No preference' },
];

const DIET_PREFERENCE_OPTIONS = [
  { value: 'vegetarian', label: 'Vegetarian', icon: '🥬' },
  { value: 'non_vegetarian', label: 'Non-Vegetarian', icon: '🍗' },
  { value: 'eggetarian', label: 'Eggetarian', icon: '🥚' },
  { value: 'vegan', label: 'Vegan', icon: '🌱' },
  { value: 'jain', label: 'Jain', icon: '🙏' },
  { value: 'no_preference', label: 'No preference', icon: '🤷' },
];

const PARTNER_QUALITY_OPTIONS = [
  // Character & Values
  { value: 'honest', label: 'Honest' },
  { value: 'loyal', label: 'Loyal' },
  { value: 'kind', label: 'Kind' },
  { value: 'humble', label: 'Humble' },
  { value: 'patient', label: 'Patient' },
  { value: 'responsible', label: 'Responsible' },
  { value: 'trustworthy', label: 'Trustworthy' },
  { value: 'emotionally_mature', label: 'Emotionally Mature' },
  { value: 'respectful', label: 'Respectful' },
  // Personality
  { value: 'grounded', label: 'Grounded' },
  { value: 'calm', label: 'Calm' },
  { value: 'humorous', label: 'Humorous' },
  { value: 'intellectual', label: 'Intellectual' },
  { value: 'creative', label: 'Creative' },
  { value: 'spontaneous', label: 'Spontaneous' },
  { value: 'adventurous', label: 'Adventurous' },
  { value: 'disciplined', label: 'Disciplined' },
  { value: 'energetic', label: 'Energetic' },
  { value: 'confident', label: 'Confident' },
  // Relationship Style
  { value: 'affectionate', label: 'Affectionate' },
  { value: 'supportive', label: 'Supportive' },
  { value: 'good_listener', label: 'Good Listener' },
  { value: 'direct_communicator', label: 'Direct Communicator' },
  { value: 'thoughtful', label: 'Thoughtful' },
  { value: 'emotionally_expressive', label: 'Emotionally Expressive' },
  { value: 'independent', label: 'Independent' },
  // Family & Home
  { value: 'family_oriented', label: 'Family-Oriented' },
  { value: 'nurturing', label: 'Nurturing' },
  { value: 'protective', label: 'Protective' },
  { value: 'involved_parent', label: 'Involved Parent' },
  { value: 'respectful_of_in_laws', label: 'Respectful of In-Laws' },
  { value: 'values_traditions', label: 'Values Traditions' },
  // Career & Ambition
  { value: 'ambitious', label: 'Ambitious' },
  { value: 'hard_working', label: 'Hard-Working' },
  { value: 'financially_responsible', label: 'Financially Responsible' },
  { value: 'entrepreneurial', label: 'Entrepreneurial' },
  { value: 'values_work_life_balance', label: 'Values Work-Life Balance' },
  { value: 'career_driven', label: 'Career-Driven' },
  // Social & Cultural
  { value: 'socially_active', label: 'Socially Active' },
  { value: 'community_minded', label: 'Community-Minded' },
  { value: 'culturally_aware', label: 'Culturally Aware' },
  { value: 'spiritually_inclined', label: 'Spiritually Inclined' },
  { value: 'charitable', label: 'Charitable' },
  { value: 'open_to_other_cultures', label: 'Open to Other Cultures' },
  // Other
  { value: 'other', label: 'Other' },
];

const PARTNER_QUALITY_GROUPS: OptionGroup[] = [
  { key: 'character_values', label: 'Character & Values', icon: '💎', optionValues: ['honest', 'loyal', 'kind', 'humble', 'patient', 'responsible', 'trustworthy', 'emotionally_mature', 'respectful'] },
  { key: 'personality', label: 'Personality', icon: '🌟', optionValues: ['grounded', 'calm', 'humorous', 'intellectual', 'creative', 'spontaneous', 'adventurous', 'disciplined', 'energetic', 'confident'] },
  { key: 'relationship_style', label: 'Relationship Style', icon: '💕', optionValues: ['affectionate', 'supportive', 'good_listener', 'direct_communicator', 'thoughtful', 'emotionally_expressive', 'independent'] },
  { key: 'family_home', label: 'Family & Home', icon: '🏡', optionValues: ['family_oriented', 'nurturing', 'protective', 'involved_parent', 'respectful_of_in_laws', 'values_traditions'] },
  { key: 'career_ambition', label: 'Career & Ambition', icon: '🚀', optionValues: ['ambitious', 'hard_working', 'financially_responsible', 'entrepreneurial', 'values_work_life_balance', 'career_driven'] },
  { key: 'social_cultural', label: 'Social & Cultural', icon: '🌍', optionValues: ['socially_active', 'community_minded', 'culturally_aware', 'spiritually_inclined', 'charitable', 'open_to_other_cultures'] },
];

// ============================================================
// SECTION A — Basic Identity (Q1–Q17) — Fully defined
// ============================================================

const sectionA: QuestionConfig[] = [
  {
    id: 'Q1',
    questionNumber: 1,
    section: 'A',
    text: 'First name',
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
    text: 'Last name',
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
    groupWith: ['Q4'],
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
    placeholder: '98765 43210',
    groupWith: ['Q3'],
  },
  {
    id: 'Q5',
    questionNumber: 5,
    section: 'A',
    text: 'Gender',
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
    text: 'How did you hear about us?',
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
    text: 'Children from previous marriage?',
    type: 'select',
    required: false,
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
    text: 'Date of birth',
    type: 'date',
    required: true,
    targetTable: 'profiles',
    targetColumn: 'date_of_birth',
  },
  {
    id: 'Q10',
    questionNumber: 10,
    section: 'A',
    text: 'Know your time of birth?',
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
    text: 'Time of birth',
    type: 'time',
    required: false,
    targetTable: 'profiles',
    targetColumn: 'time_of_birth',
  },
  {
    id: 'Q12',
    questionNumber: 12,
    section: 'A',
    text: 'State of birth',
    type: 'select',
    required: true,
    targetTable: 'profiles',
    targetColumn: 'place_of_birth',
    options: [
      { value: 'outside_india', label: 'Outside India' },
      ...INDIAN_STATES,
    ],
    searchable: true,
  },
  {
    id: 'Q13',
    questionNumber: 13,
    section: 'A',
    text: 'City and country of birth',
    type: 'international_location',
    required: false,
    targetTable: 'profiles',
    targetColumn: 'city_of_birth',
    targetColumn2: 'place_of_birth',
    placeholder: 'e.g. Dubai',
  },
  {
    id: 'Q14',
    questionNumber: 14,
    section: 'A',
    text: 'City of birth',
    type: 'text',
    required: false,
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
    text: 'Blood group',
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
    searchable: true,
  },
  {
    id: 'Q16',
    questionNumber: 16,
    section: 'A',
    text: 'Mother tongue',
    type: 'select',
    required: true,
    targetTable: 'profiles',
    targetColumn: 'mother_tongue',
    options: MOTHER_TONGUE_OPTIONS,
    searchable: true,
  },
  {
    id: 'Q17',
    questionNumber: 17,
    section: 'A',
    text: 'Languages spoken fluently',
    type: 'multi_select',
    required: true,
    targetTable: 'profiles',
    targetColumn: 'languages_spoken',
    options: [
      ...MOTHER_TONGUE_OPTIONS.filter(o => o.value !== 'other'),
      { value: 'french', label: 'French' },
      { value: 'german', label: 'German' },
      { value: 'spanish', label: 'Spanish' },
      { value: 'arabic', label: 'Arabic' },
      { value: 'other', label: 'Other' },
    ],
    helpText: 'Select all that apply.',
    searchable: true,
  },
];

// ============================================================
// SECTION B — Location & Citizenship (Q18–Q26) — Fully defined
// ============================================================

const sectionB: QuestionConfig[] = [
  { id: 'Q18', questionNumber: 18, section: 'B', text: 'Citizenship', type: 'select', required: true, targetTable: 'profiles', targetColumn: 'citizenship_country', optionsSource: 'countries', searchable: true },
  { id: 'Q19', questionNumber: 19, section: 'B', text: 'Do you possess an employment visa outside India?', type: 'select', required: true, targetTable: 'local', targetColumn: 'has_employment_visa', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
  { id: 'Q20', questionNumber: 20, section: 'B', text: 'Visa country', type: 'select', required: false, targetTable: 'profiles', targetColumn: 'employment_visa_country', optionsSource: 'countries', searchable: true },
  { id: 'Q21', questionNumber: 21, section: 'B', text: 'Country of residence', type: 'select', required: true, targetTable: 'profiles', targetColumn: 'current_country', optionsSource: 'countries', searchable: true },
  { id: 'Q22', questionNumber: 22, section: 'B', text: 'Current state', type: 'select', required: true, targetTable: 'profiles', targetColumn: 'current_state', options: INDIAN_STATES, searchable: true },
  { id: 'Q23', questionNumber: 23, section: 'B', text: 'Current city', type: 'text', required: true, targetTable: 'profiles', targetColumn: 'current_city', placeholder: 'Start typing your city name', autocompleteSource: 'indian_cities' },
  { id: 'Q24', questionNumber: 24, section: 'B', text: 'Permanent address same as current?', type: 'select', required: true, targetTable: 'local', targetColumn: 'permanent_same_as_current', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
  { id: 'Q25', questionNumber: 25, section: 'B', text: 'Permanent city and state', type: 'text', required: false, targetTable: 'profiles', targetColumn: 'permanent_city', placeholder: 'e.g. Pune, Maharashtra' },
  { id: 'Q26', questionNumber: 26, section: 'B', text: 'Home ownership', type: 'select', required: true, targetTable: 'profiles', targetColumn: 'permanent_ownership', options: [{ value: 'owned', label: 'Owned' }, { value: 'rented', label: 'Rental' }, { value: 'family_home', label: 'Family home' }] },
];

// ============================================================
// SECTION C — Religion & Community (Q27–Q31) — Fully defined
// ============================================================

const sectionC: QuestionConfig[] = [
  { id: 'Q27', questionNumber: 27, section: 'C', text: 'Religion', type: 'select', required: true, targetTable: 'profiles', targetColumn: 'religion', options: RELIGIONS, searchable: true },
  { id: 'Q28', questionNumber: 28, section: 'C', text: 'Level of religious observance', type: 'select', required: true, targetTable: 'profiles', targetColumn: 'religious_observance', options: [{ value: 'actively_practicing', label: 'Actively practicing' }, { value: 'culturally_observant', label: 'Culturally observant' }, { value: 'spiritual', label: 'Spiritual but not religious' }, { value: 'not_religious', label: 'Not religious' }] },
  { id: 'Q29', questionNumber: 29, section: 'C', text: 'Do you believe in Kundali/horoscope matching?', type: 'select', required: false, targetTable: 'profiles', targetColumn: 'believes_in_kundali', options: [{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }] },
  { id: 'Q30', questionNumber: 30, section: 'C', text: 'Are you comfortable sharing your sect, caste, or community?', type: 'select', required: true, targetTable: 'profiles', targetColumn: 'caste_comfort', options: [{ value: 'true', label: 'Yes' }, { value: 'false', label: "No, I'd rather not say" }] },
  { id: 'Q31', questionNumber: 31, section: 'C', text: 'Sect, caste, or community', type: 'text', required: false, targetTable: 'profiles', targetColumn: 'caste', placeholder: 'e.g. Sunni, Brahmin, Catholic, Jat Sikh', helpText: 'This helps us find compatible matches within your community preferences.', autocompleteSource: 'communities' },
];

// ============================================================
// SECTION D — Family Background (Q32–Q39) — Skeleton
// ============================================================

const sectionD: QuestionConfig[] = [
  { id: 'Q32', questionNumber: 32, section: 'D', text: "Father's name", type: 'text', required: true, targetTable: 'profiles', targetColumn: 'father_name', placeholder: 'Full name', groupWith: ['Q33'] },
  { id: 'Q33', questionNumber: 33, section: 'D', text: "Father's occupation", type: 'select', required: true, targetTable: 'profiles', targetColumn: 'father_occupation', options: OCCUPATION_OPTIONS, groupWith: ['Q32'], searchable: true },
  { id: 'Q34', questionNumber: 34, section: 'D', text: "Father's occupation (other)", type: 'text', required: false, targetTable: 'profiles', targetColumn: 'father_occupation_other', helpText: 'Since you selected "Other"' },
  { id: 'Q35', questionNumber: 35, section: 'D', text: "Mother's name", type: 'text', required: true, targetTable: 'profiles', targetColumn: 'mother_name', placeholder: 'Full name', groupWith: ['Q36'] },
  { id: 'Q36', questionNumber: 36, section: 'D', text: "Mother's occupation", type: 'select', required: true, targetTable: 'profiles', targetColumn: 'mother_occupation', options: OCCUPATION_OPTIONS, groupWith: ['Q35'], searchable: true },
  { id: 'Q37', questionNumber: 37, section: 'D', text: "Mother's occupation (other)", type: 'text', required: false, targetTable: 'profiles', targetColumn: 'mother_occupation_other', helpText: 'Since you selected "Other"' },
  { id: 'Q39', questionNumber: 39, section: 'D', text: 'Number of siblings', type: 'number', required: true, targetTable: 'profiles', targetColumn: 'siblings_count', placeholder: '0' },
];

// ============================================================
// SECTION E — Physical Details (Q40–Q42) — Skeleton
// ============================================================

const sectionE: QuestionConfig[] = [
  { id: 'Q40', questionNumber: 40, section: 'E', text: 'Height', type: 'number', required: true, targetTable: 'profiles', targetColumn: 'height_cm', placeholder: 'e.g. 170', helpText: 'In centimetres', groupWith: ['Q41'] },
  { id: 'Q41', questionNumber: 41, section: 'E', text: 'Weight', type: 'number', required: true, targetTable: 'profiles', targetColumn: 'weight_kg', placeholder: 'e.g. 65', helpText: 'In kilograms', groupWith: ['Q40'] },
  { id: 'Q42', questionNumber: 42, section: 'E', text: 'Skin tone', type: 'illustrated_mc', required: true, targetTable: 'profiles', targetColumn: 'skin_tone', options: [
    { value: 'fair', label: 'Fair', icon: '🤍' },
    { value: 'wheatish', label: 'Wheatish', icon: '🌾' },
    { value: 'dusky', label: 'Dusky', icon: '🌰' },
    { value: 'dark', label: 'Dark', icon: '🖤' },
  ] },
];

// ============================================================
// SECTION F — Lifestyle (Q43–Q52) — Skeleton
// ============================================================

const sectionF: QuestionConfig[] = [
  { id: 'Q43', questionNumber: 43, section: 'F', text: 'Diet', type: 'illustrated_mc', required: true, targetTable: 'profiles', targetColumn: 'diet', options: [
    { value: 'vegetarian', label: 'Vegetarian', icon: '🥬' },
    { value: 'non_vegetarian', label: 'Non-Vegetarian', icon: '🍗' },
    { value: 'eggetarian', label: 'Eggetarian', icon: '🥚' },
    { value: 'vegan', label: 'Vegan', icon: '🌱' },
    { value: 'jain', label: 'Jain', icon: '🙏' },
    { value: 'other', label: 'Flexible / Other', icon: '🍽️' },
  ] },
  { id: 'Q44', questionNumber: 44, section: 'F', text: 'Everyday attire', type: 'illustrated_mc', required: true, targetTable: 'profiles', targetColumn: 'attire_preference', options: [
    { value: 'modern_western', label: 'Western', icon: '👔' },
    { value: 'traditional', label: 'Traditional', icon: '🪷' },
    { value: 'mix', label: 'Mix of both', icon: '✨' },
    { value: 'no_preference', label: 'No preference', icon: '🤷' },
  ] },
  { id: 'Q45', questionNumber: 45, section: 'F', text: 'Fitness habits', type: 'illustrated_mc', required: true, targetTable: 'profiles', targetColumn: 'fitness_habits', options: [
    { value: 'regularly_exercises', label: 'Regular (4+ times/week)', icon: '💪' },
    { value: 'occasionally', label: 'Moderate (1-3 times/week)', icon: '🏃' },
    { value: 'rarely', label: 'Occasional', icon: '🚶' },
    { value: 'not_interested', label: 'Not active currently', icon: '🛋️' },
  ] },
  { id: 'Q46', questionNumber: 46, section: 'F', text: 'Do you smoke?', type: 'illustrated_mc', required: true, targetTable: 'profiles', targetColumn: 'smoking', options: [
    { value: 'never', label: 'No', icon: '🚭' },
    { value: 'occasionally', label: 'Occasionally', icon: '🌫️' },
    { value: 'frequently', label: 'Yes, regularly', icon: '🚬' },
  ] },
  { id: 'Q47', questionNumber: 47, section: 'F', text: 'Do you drink?', type: 'illustrated_mc', required: true, targetTable: 'profiles', targetColumn: 'drinking', options: [
    { value: 'never', label: 'No', icon: '💧' },
    { value: 'occasionally', label: 'Socially', icon: '🥂' },
    { value: 'frequently', label: 'Regularly', icon: '🍷' },
  ] },
  { id: 'Q48', questionNumber: 48, section: 'F', text: 'Tattoos or piercings?', type: 'illustrated_mc', required: true, targetTable: 'profiles', targetColumn: 'tattoos_piercings', options: [
    { value: 'none', label: 'None', icon: '✋' },
    { value: 'tattoos_only', label: 'Tattoos', icon: '🎨' },
    { value: 'piercings_only', label: 'Piercings', icon: '💎' },
    { value: 'both', label: 'Both', icon: '✨' },
  ] },
  { id: 'Q49', questionNumber: 49, section: 'F', text: 'Any disabilities or health conditions?', type: 'select', required: true, targetTable: 'profiles', targetColumn: 'has_disability', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }, { value: 'prefer_not_to_disclose', label: 'Prefer not to disclose' }] },
  { id: 'Q50', questionNumber: 50, section: 'F', text: 'Please describe your disability or health condition', type: 'text', required: false, targetTable: 'profiles', targetColumn: 'disability_description', placeholder: 'Share what you are comfortable with' },
  { id: 'Q51', questionNumber: 51, section: 'F', text: 'Any allergies?', type: 'select', required: true, targetTable: 'profiles', targetColumn: 'has_allergies', options: [{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }] },
  { id: 'Q52', questionNumber: 52, section: 'F', text: 'Describe your allergies', type: 'text', required: false, targetTable: 'profiles', targetColumn: 'allergy_description', placeholder: 'e.g. peanuts, dust, pollen' },
];

// ============================================================
// SECTION G — Personality & Interests (Q53–Q55) — Skeleton
// ============================================================

const sectionG: QuestionConfig[] = [
  {
    id: 'Q53',
    questionNumber: 53,
    section: 'G',
    text: 'Hobbies and interests',
    type: 'multi_select',
    required: true,
    targetTable: 'profiles',
    targetColumn: 'hobbies_interests',
    helpText: 'Select all that apply. Tap a category to expand it.',
    optionGroups: [
      { key: 'arts_creativity', label: 'Arts & Creativity', icon: '🎨', optionValues: ['drawing_painting', 'photography', 'writing', 'music_listening', 'music_playing', 'dance', 'theatre', 'poetry'] },
      { key: 'sports_fitness', label: 'Sports & Fitness', icon: '⚽', optionValues: ['cricket', 'football', 'tennis', 'badminton', 'swimming', 'gym_weightlifting', 'yoga', 'cycling', 'trekking', 'running', 'martial_arts', 'chess'] },
      { key: 'outdoors_travel', label: 'Outdoors & Travel', icon: '🌿', optionValues: ['hiking', 'camping', 'road_trips', 'wildlife_nature', 'backpacking', 'adventure_sports'] },
      { key: 'food_lifestyle', label: 'Food & Lifestyle', icon: '🍳', optionValues: ['cooking', 'baking', 'coffee_culture', 'wine_cocktails', 'gardening', 'interior_design', 'fashion_style'] },
      { key: 'tech_gaming', label: 'Tech & Gaming', icon: '💻', optionValues: ['video_games', 'board_games', 'coding', 'robotics', 'gadgets'] },
      { key: 'reading_learning', label: 'Reading & Learning', icon: '📚', optionValues: ['fiction', 'non_fiction', 'philosophy', 'history', 'science', 'podcasts', 'documentaries', 'online_courses'] },
      { key: 'social_community', label: 'Social & Community', icon: '🤝', optionValues: ['volunteering', 'social_work', 'activism', 'spirituality_meditation', 'environmentalism'] },
      { key: 'entertainment', label: 'Entertainment', icon: '🎬', optionValues: ['movies', 'web_series', 'theatre_shows', 'standup_comedy', 'concerts_live_music'] },
      { key: 'crafts_collecting', label: 'Crafts & Collecting', icon: '✂️', optionValues: ['diy_projects', 'knitting_crocheting', 'pottery', 'stamp_coin_collecting', 'origami'] },
    ],
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
  { id: 'Q54', questionNumber: 54, section: 'G', text: 'Pick your top 4 interests — the ones you are most active in', type: 'multi_select', required: true, targetTable: 'profiles', targetColumn: 'hobbies_regular', maxSelections: 4, dynamicOptionsFrom: 'Q53', helpText: 'Select exactly 4 from what you chose above.' },
  { id: 'Q55', questionNumber: 55, section: 'G', text: 'Any other hobbies not listed above?', type: 'text', required: false, targetTable: 'profiles', targetColumn: 'hobbies_other', helpText: 'Since you selected "Other"' },
  { id: 'QWKND', questionNumber: 56, section: 'G', text: 'How do you prefer to spend your free time?', type: 'multi_select', required: true, searchable: true, targetTable: 'profiles', targetColumn: 'free_time_preferences', helpText: 'Choose all that apply — there\'s no right answer here.', options: [
    { value: 'family_friends', label: 'Time with family and close friends' },
    { value: 'hobby_creative', label: 'Creative hobbies (art, music, writing, photography)' },
    { value: 'outdoors_travel', label: 'Outdoors — travel, trekking, sport' },
    { value: 'relaxing_alone', label: 'Relaxing and recharging alone' },
    { value: 'learning', label: 'Learning something new (courses, reading)' },
    { value: 'fitness', label: 'Fitness and physical activity' },
    { value: 'social_events', label: 'Social events and gatherings' },
    { value: 'community_volunteering', label: 'Community or volunteering work' },
    { value: 'rest_sleep', label: 'Catching up on sleep and rest' },
    { value: 'cooking_food', label: 'Cooking, baking, exploring food' },
    { value: 'gaming', label: 'Gaming or e-sports' },
    { value: 'movies_streaming', label: 'Movies, shows, streaming' },
    { value: 'spiritual', label: 'Spiritual practice (meditation, yoga, prayer)' },
    { value: 'pets', label: 'Spending time with pets' },
    { value: 'side_projects', label: 'Side projects, entrepreneurship' },
    { value: 'music_concerts', label: 'Live music, concerts, theatre' },
    { value: 'other', label: 'Other' },
  ] },
];

// ============================================================
// SECTION H — Education (Q56–Q60) — Skeleton
// ============================================================

const sectionH: QuestionConfig[] = [
  { id: 'Q56', questionNumber: 57, section: 'H', text: 'What best describes your current status?', type: 'select', required: true, targetTable: 'medical_credentials', targetColumn: 'current_status', options: [{ value: 'mbbs_student', label: 'In Medical School (MBBS)' }, { value: 'intern', label: 'Internship' }, { value: 'mbbs_passed', label: 'MBBS Passed' }, { value: 'pursuing_pg', label: 'Pursuing PG' }, { value: 'completed_pg', label: 'Completed PG' }] },
  { id: 'Q56b', questionNumber: 58, section: 'H', text: 'What is your PG degree?', type: 'select', required: false, targetTable: 'medical_credentials', targetColumn: 'pg_degree', options: PG_DEGREE_OPTIONS },
  { id: 'Q56c', questionNumber: 59, section: 'H', text: 'Please specify your PG degree', type: 'text', required: false, targetTable: 'profiles', targetColumn: 'pg_degree_other', placeholder: 'e.g. MRCS, MMed, MPhil...' },
  { id: 'Q57', questionNumber: 60, section: 'H', text: 'Planning to pursue PG?', type: 'select', required: false, targetTable: 'medical_credentials', targetColumn: 'pg_plans', options: [{ value: 'yes_within_1_year', label: 'Yes, within the next year' }, { value: 'yes_2_to_3_years', label: 'Yes, in 2-3 years' }, { value: 'no_plan_to_practice', label: 'No, I plan to practice as MBBS' }, { value: 'undecided', label: 'Undecided' }] },
  { id: 'Q58', questionNumber: 61, section: 'H', text: 'Any postgraduate qualifications, certifications, or licensing exams?', type: 'multi_select', required: false, targetTable: 'medical_credentials', targetColumn: 'additional_qualifications', options: ADDITIONAL_QUALIFICATION_OPTIONS, optionGroups: ADDITIONAL_QUALIFICATION_GROUPS, helpText: 'Beyond your primary medical degree — includes degrees, board certifications, and licensing exams (cleared or planning).' },
  { id: 'Q59', questionNumber: 62, section: 'H', text: 'What other qualifications do you have?', type: 'text', required: false, targetTable: 'medical_credentials', targetColumn: 'additional_qualifications_other', placeholder: 'Please specify' },
  { id: 'Q60', questionNumber: 63, section: 'H', text: 'Specialty (current or planned)', type: 'multi_select', required: true, targetTable: 'medical_credentials', targetColumn: 'specialty', helpText: 'Select all that apply', options: MEDICAL_SPECIALTY_OPTIONS, searchable: true },
];

// ============================================================
// SECTION I — Career (Q61–Q62) — Skeleton
// ============================================================

const sectionI: QuestionConfig[] = [
  { id: 'Q61', questionNumber: 64, section: 'I', text: 'Do you have any full-time work experience?', type: 'select', required: true, targetTable: 'medical_credentials', targetColumn: 'has_work_experience', options: [{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }] },
  { id: 'Q62', questionNumber: 65, section: 'I', text: 'Add your work experience', type: 'timeline', required: false, targetTable: 'medical_credentials', targetColumn: 'work_experience', helpText: 'Add your work experience entries, starting with the most recent.' },
];

// ============================================================
// SECTION J — Financial Background (QFIN1–QFIN6)
// ============================================================

const sectionJ: QuestionConfig[] = [
  { id: 'QFIN1', questionNumber: 66, section: 'J', text: 'What is your annual CTC?', type: 'select', required: false, targetTable: 'profiles', targetColumn: 'annual_ctc_range', helpText: 'If you are currently working full-time, share your present CTC. If you have worked full-time previously but are not currently employed, share your most recent CTC.', options: [
    { value: 'under_12l', label: 'Under ₹12L' },
    { value: '12l_20l', label: '₹12L – ₹20L' },
    { value: '20l_35l', label: '₹20L – ₹35L' },
    { value: '35l_60l', label: '₹35L – ₹60L' },
    { value: '60l_1cr', label: '₹60L – ₹1 Cr' },
    { value: 'above_1cr', label: 'Above ₹1 Cr' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say' },
  ] },
  { id: 'QFIN2', questionNumber: 67, section: 'J', text: 'How would you describe your current financial stage?', type: 'stage_selector', required: true, targetTable: 'profiles', targetColumn: 'financial_stage', options: [
    { value: 'building_savings', label: 'Building savings after training' },
    { value: 'stable_growing', label: 'Financially stable with growing investments' },
    { value: 'well_established', label: 'Well-established with significant assets' },
    { value: 'family_wealth', label: 'Family wealth supplementing personal income' },
  ] },
  { id: 'QFIN3', questionNumber: 68, section: 'J', text: 'Do you or your family own any property?', type: 'multi_select', required: true, targetTable: 'profiles', targetColumn: 'property_ownership', options: [
    { value: 'residential', label: 'Residential property' },
    { value: 'commercial', label: 'Commercial property' },
    { value: 'agricultural', label: 'Agricultural land' },
    { value: 'none', label: 'None currently' },
  ] },
  { id: 'QFIN4', questionNumber: 69, section: 'J', text: 'How do you approach investments?', type: 'select', required: true, targetTable: 'profiles', targetColumn: 'investment_approach', options: [
    { value: 'actively_invest', label: 'I actively invest in markets (stocks, mutual funds)' },
    { value: 'safe_instruments', label: 'I prefer fixed deposits and safe instruments' },
    { value: 'family_manages', label: 'My family manages investments' },
    { value: 'not_started', label: "I haven't started investing yet" },
  ] },
  { id: 'QFIN5', questionNumber: 70, section: 'J', text: 'Do you have an outstanding education loan?', type: 'select', required: true, targetTable: 'profiles', targetColumn: 'has_education_loan', options: [
    { value: 'true', label: 'Yes' },
    { value: 'false', label: 'No' },
  ] },
  { id: 'QFIN6', questionNumber: 71, section: 'J', text: 'What is your approximate CIBIL score?', type: 'select', required: true, targetTable: 'profiles', targetColumn: 'cibil_score_range', helpText: 'A high score signals financial responsibility. If you don\'t know, select "I don\'t know".', options: [
    { value: '750_above', label: '750 or above' },
    { value: '700_749', label: '700 – 749' },
    { value: '650_699', label: '650 – 699' },
    { value: 'below_650', label: 'Below 650' },
    { value: 'dont_know', label: "I don't know" },
    { value: 'prefer_not_to_say', label: 'Prefer not to say' },
  ] },
];

// ============================================================
// SECTION K — Goals & Values (Q63–Q74) — Skeleton
// ============================================================

const sectionK_goalsValues: QuestionConfig[] = [
  { id: 'Q63', questionNumber: 72, section: 'K', text: 'What is your preferred marriage timeline?', type: 'stage_selector', required: true, targetTable: 'profiles', targetColumn: 'marriage_timeline', options: [{ value: 'within_6_months', label: 'Within 6 months' }, { value: '6_to_12_months', label: '6-12 months' }, { value: '1_to_2_years', label: '1-2 years' }, { value: 'no_fixed_timeline', label: 'No fixed timeline' }] },
  { id: 'Q64', questionNumber: 73, section: 'K', text: 'Are you open to a long-distance relationship?', type: 'select', required: true, targetTable: 'profiles', targetColumn: 'long_distance_comfort', helpText: 'This means being in different cities or countries during the initial phase of the relationship.', options: [{ value: 'yes_absolutely', label: 'Yes' }, { value: 'open_to_it', label: 'Open to it' }, { value: 'prefer_same_location', label: 'Prefer same city' }] },
  { id: 'Q65', questionNumber: 74, section: 'K', text: 'Preferred family arrangement after marriage', type: 'illustrated_mc', required: true, targetTable: 'profiles', targetColumn: 'post_marriage_family_arrangement', options: [
    { value: 'nuclear', label: 'Nuclear family', icon: '🏠' },
    { value: 'joint', label: 'Joint family', icon: '👨‍👩‍👧‍👦' },
    { value: 'flexible', label: 'Flexible', icon: '🔄' },
    { value: 'no_preference', label: 'No preference', icon: '🤷' },
  ] },
  { id: 'Q66', questionNumber: 75, section: 'K', text: 'Should both partners work after marriage?', type: 'illustrated_mc', required: true, targetTable: 'profiles', targetColumn: 'both_partners_working_expectation', options: [
    { value: 'both_continue', label: 'Yes, both should work', icon: '💼' },
    { value: 'comfortable_either_way', label: 'Either way is fine', icon: '⚖️' },
    { value: 'i_prefer_home', label: 'I prefer to be home', icon: '🏡' },
    { value: 'prefer_partner_home', label: 'I prefer partner to be home', icon: '👤' },
    { value: 'open', label: 'Open to discussion', icon: '💬' },
  ] },
  { id: 'Q67', questionNumber: 76, section: 'K', text: 'Do you want children?', type: 'illustrated_mc', required: true, targetTable: 'profiles', targetColumn: 'wants_children', options: [
    { value: 'yes', label: 'Yes', icon: '👶' },
    { value: 'no', label: 'No', icon: '✋' },
    { value: 'open', label: 'Open to it', icon: '🤔' },
  ] },
  { id: 'Q70', questionNumber: 79, section: 'K', text: 'Open to a partner with children?', type: 'select', required: false, targetTable: 'profiles', targetColumn: 'open_to_partner_with_children', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }, { value: 'open', label: 'Open to it' }] },
  { id: 'Q71', questionNumber: 80, section: 'K', text: 'Preferred countries to settle', type: 'multi_select', required: true, targetTable: 'profiles', targetColumn: 'preferred_settlement_countries', optionsSource: 'countries', searchable: true },
  { id: 'Q72', questionNumber: 81, section: 'K', text: 'Open to relocating for partner?', type: 'select', required: true, targetTable: 'profiles', targetColumn: 'open_to_immediate_relocation', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }, { value: 'open', label: 'Open to it' }] },
  { id: 'Q73', questionNumber: 82, section: 'K', text: 'Do you have plans to study or work outside India in the next 3 years?', type: 'select', required: true, targetTable: 'profiles', targetColumn: 'plans_to_go_abroad', options: [{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }] },
  { id: 'Q74', questionNumber: 83, section: 'K', text: 'Which countries are you exploring?', type: 'multi_select', required: false, targetTable: 'profiles', targetColumn: 'abroad_countries', optionsSource: 'countries', searchable: true },
];

// ============================================================
// SECTION L — Partner Preferences (Q76–Q94)
// ============================================================

const sectionL: QuestionConfig[] = [
  { id: 'Q76', questionNumber: 85, section: 'L', text: 'Preferred partner age range', type: 'range', required: true, targetTable: 'partner_preferences', targetColumn: 'preferred_age_min', targetColumn2: 'preferred_age_max' },
  { id: 'Q77', questionNumber: 86, section: 'L', text: 'Preferred partner height range', type: 'range', required: true, targetTable: 'partner_preferences', targetColumn: 'preferred_height_min_cm', targetColumn2: 'preferred_height_max_cm' },
  { id: 'Q77b', questionNumber: 87, section: 'L', text: 'Preferred partner weight range', type: 'range', required: true, targetTable: 'partner_preferences', targetColumn: 'preferred_weight_min_kg', targetColumn2: 'preferred_weight_max_kg', helpText: 'In kilograms (kg)' },
  { id: 'Q78', questionNumber: 88, section: 'L', text: 'Prefer a specific specialty?', type: 'select', required: true, targetTable: 'partner_preferences', targetColumn: 'prefers_specific_specialty', options: [{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No, open to all' }] },
  { id: 'Q79', questionNumber: 89, section: 'L', text: 'Which specialties do you prefer?', type: 'multi_select', required: false, targetTable: 'partner_preferences', targetColumn: 'preferred_specialties', options: MEDICAL_SPECIALTY_OPTIONS, searchable: true },
  { id: 'Q80', questionNumber: 90, section: 'L', text: 'Preferred partner location', type: 'dual_location', required: true, targetTable: 'partner_preferences', targetColumn: 'preferred_indian_states', targetColumn2: 'preferred_countries', targetColumn3: 'no_location_preference' },
  { id: 'Q81', questionNumber: 91, section: 'L', text: "Partner's mother tongue preference", type: 'multi_select', required: true, targetTable: 'partner_preferences', targetColumn: 'preferred_mother_tongue', options: MOTHER_TONGUE_OPTIONS, searchable: true },
  { id: 'Q82', questionNumber: 92, section: 'L', text: 'Body type preference', type: 'multi_select', required: true, targetTable: 'partner_preferences', targetColumn: 'body_type_preference', options: BODY_TYPE_OPTIONS },
  { id: 'Q83', questionNumber: 93, section: 'L', text: "Partner's attire preference", type: 'illustrated_mc', required: true, targetTable: 'partner_preferences', targetColumn: 'attire_preference', options: [
    { value: 'modern_western', label: 'Western', icon: '👔' },
    { value: 'traditional', label: 'Traditional', icon: '🪷' },
    { value: 'mix', label: 'Mix of both', icon: '✨' },
    { value: 'no_preference', label: 'No preference', icon: '🤷' },
  ] },
  { id: 'Q84', questionNumber: 94, section: 'L', text: "Partner's diet preference", type: 'multi_select', required: true, targetTable: 'partner_preferences', targetColumn: 'diet_preference', options: DIET_PREFERENCE_OPTIONS },
  { id: 'Q85', questionNumber: 95, section: 'L', text: "Partner's fitness preference", type: 'illustrated_mc', required: true, targetTable: 'partner_preferences', targetColumn: 'fitness_preference', options: [
    { value: 'regularly_exercises', label: 'Regular', icon: '💪' },
    { value: 'occasionally', label: 'Moderate', icon: '🏃' },
    { value: 'rarely', label: 'Any level', icon: '🚶' },
    { value: 'no_preference', label: 'No preference', icon: '🤷' },
  ] },
  { id: 'Q86', questionNumber: 96, section: 'L', text: "Partner's smoking preference", type: 'illustrated_mc', required: true, targetTable: 'partner_preferences', targetColumn: 'smoking_preference', options: [
    { value: 'never', label: 'Non-smoker only', icon: '🚭' },
    { value: 'occasionally', label: 'Occasional is fine', icon: '🌫️' },
    { value: 'frequently', label: 'Frequent is fine', icon: '🚬' },
    { value: 'no_preference', label: 'No preference', icon: '🤷' },
  ] },
  { id: 'Q87', questionNumber: 97, section: 'L', text: "Partner's drinking preference", type: 'illustrated_mc', required: true, targetTable: 'partner_preferences', targetColumn: 'drinking_preference', options: [
    { value: 'never', label: 'Non-drinker only', icon: '💧' },
    { value: 'occasionally', label: 'Social drinking is fine', icon: '🥂' },
    { value: 'frequently', label: 'Frequent is fine', icon: '🍷' },
    { value: 'no_preference', label: 'No preference', icon: '🤷' },
  ] },
  { id: 'Q88', questionNumber: 98, section: 'L', text: "Partner's tattoo/piercing preference", type: 'illustrated_mc', required: true, targetTable: 'partner_preferences', targetColumn: 'tattoo_preference', options: [
    { value: 'none', label: 'None preferred', icon: '✋' },
    { value: 'tattoos_only', label: 'Tattoos are fine', icon: '🎨' },
    { value: 'piercings_only', label: 'Piercings are fine', icon: '💎' },
    { value: 'both', label: 'Both are fine', icon: '✨' },
    { value: 'no_preference', label: 'No preference', icon: '🤷' },
  ] },
  { id: 'Q89', questionNumber: 99, section: 'L', text: 'What is your preference for family type?', type: 'illustrated_mc', required: true, targetTable: 'partner_preferences', targetColumn: 'family_type_preference', options: [
    { value: 'nuclear', label: 'Nuclear', icon: '🏠' },
    { value: 'joint', label: 'Joint', icon: '👨‍👩‍👧‍👦' },
    { value: 'flexible', label: 'Flexible', icon: '🔄' },
    { value: 'no_preference', label: 'No preference', icon: '🤷' },
  ] },
  { id: 'Q90', questionNumber: 100, section: 'L', text: "What is your preference for your partner's religious observance?", type: 'illustrated_mc', required: true, targetTable: 'partner_preferences', targetColumn: 'religious_observance_preference', options: [
    { value: 'actively_practicing', label: 'Actively practicing', icon: '🙏' },
    { value: 'culturally_observant', label: 'Culturally observant', icon: '🪔' },
    { value: 'spiritual', label: 'Spiritual', icon: '🧘' },
    { value: 'not_religious', label: 'Not religious', icon: '🌐' },
    { value: 'no_preference', label: 'No preference', icon: '🤷' },
  ] },
  { id: 'Q91', questionNumber: 101, section: 'L', text: "How do you see your partner balancing work and family after marriage?", type: 'illustrated_mc', required: true, targetTable: 'partner_preferences', targetColumn: 'partner_career_expectation_after_marriage', helpText: 'About life after the wedding — not their current stage.', options: [
    { value: 'both_continue', label: 'Both should work', icon: '💼' },
    { value: 'comfortable_either_way', label: 'Either way', icon: '⚖️' },
    { value: 'prefer_partner_home', label: 'Prefer homemaker', icon: '🏡' },
    { value: 'open', label: 'Open to discussion', icon: '💬' },
  ] },
  { id: 'Q92', questionNumber: 102, section: 'L', text: 'Which career stages are you open to in a partner today?', type: 'multi_select', required: true, targetTable: 'partner_preferences', targetColumn: 'preferred_career_stage', helpText: 'Their current point in medical training or practice.', options: [{ value: 'mbbs_student', label: 'MBBS Student' }, { value: 'intern', label: 'Intern' }, { value: 'mbbs_passed', label: 'MBBS Passed' }, { value: 'pursuing_pg', label: 'PG Resident' }, { value: 'completed_pg', label: 'Completed PG' }, { value: 'established', label: 'Established Practitioner' }, { value: 'no_preference', label: 'No preference' }], searchable: true },
  { id: 'Q93', questionNumber: 103, section: 'L', text: 'What qualities are you looking for in a partner?', type: 'multi_select', required: true, targetTable: 'partner_preferences', targetColumn: 'partner_qualities', maxSelections: 15, helpText: 'Choose up to 15 qualities — pick the ones that matter most.', options: PARTNER_QUALITY_OPTIONS, optionGroups: PARTNER_QUALITY_GROUPS },
  { id: 'Q94', questionNumber: 104, section: 'L', text: 'Any other qualities you are looking for?', type: 'text', required: false, targetTable: 'partner_preferences', targetColumn: 'partner_qualities_other', placeholder: 'Describe any qualities not listed above' },
];

// ============================================================
// SECTION M — Documents & Verification (Q95–Q99)
// ============================================================

const sectionM: QuestionConfig[] = [
  { id: 'Q95', questionNumber: 105, section: 'M', text: 'Upload your photos', type: 'guided_photo_upload', required: true, targetTable: 'photos', targetColumn: 'storage_path', helpText: 'Your photos are shown to potential matches (blurred until mutual interest). Upload at least 3 photos from different angles to give yourself the best chance.', fileUploadConfig: { accept: 'image/jpeg,image/png,image/webp', maxFiles: 10, minFiles: 3, maxSizeMB: 25, requiresBlur: true } },
  { id: 'Q96', questionNumber: 106, section: 'M', text: 'Upload profile photos', type: 'file_upload', required: false, targetTable: 'photos', targetColumn: 'storage_path', helpText: 'Grouped into Q95 — this question does not render separately.', fileUploadConfig: { accept: 'image/jpeg,image/png,image/webp', maxFiles: 6, minFiles: 0, maxSizeMB: 25, requiresBlur: true } },
  { id: 'Q97', questionNumber: 107, section: 'M', text: 'Upload an identity document (Aadhaar or Passport)', type: 'file_upload', required: true, targetTable: 'documents', targetColumn: 'storage_path', helpText: 'A clear scan or photo of your Aadhaar card or passport. This is used for background verification only and is never shared. JPEG, PNG, WebP, or PDF, max 15 MB.', fileUploadConfig: { accept: 'image/jpeg,image/png,image/webp,application/pdf', maxFiles: 1, minFiles: 1, maxSizeMB: 15, requiresBlur: false, documentType: 'identity_document' } },
  { id: 'Q98', questionNumber: 108, section: 'M', text: 'Upload your Kundali', type: 'file_upload', required: false, targetTable: 'documents', targetColumn: 'storage_path', helpText: 'Upload a scan or photo of your Kundali. JPEG, PNG, WebP, or PDF, max 15 MB.', fileUploadConfig: { accept: 'image/jpeg,image/png,image/webp,application/pdf', maxFiles: 1, minFiles: 0, maxSizeMB: 15, requiresBlur: false, documentType: 'kundali' } },
  { id: 'Q99', questionNumber: 109, section: 'M', text: 'Background Verification Consent', type: 'bgv_consent', required: true, targetTable: 'users', targetColumn: 'bgv_consent' },
];

// ============================================================
// SECTION N — Conversations (AI Chats moved to end of form)
// ============================================================

const sectionN: QuestionConfig[] = [
  { id: 'Q38', questionNumber: 110, section: 'N', text: 'Claude Chat: Family Background', type: 'claude_chat', required: true, targetTable: 'compatibility_profiles', targetColumn: 'raw_conversation_transcript' },
  { id: 'Q75', questionNumber: 111, section: 'N', text: 'Claude Chat: Goals & Values', type: 'claude_chat', required: true, targetTable: 'compatibility_profiles', targetColumn: 'raw_conversation_transcript' },
  { id: 'Q100', questionNumber: 112, section: 'N', text: 'Claude Chat: Anything else you would like to share?', type: 'claude_chat', required: true, targetTable: 'compatibility_profiles', targetColumn: 'closing_freeform_note' },
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
  ...sectionJ,        // Financial Background
  ...sectionK_goalsValues, // Goals & Values
  ...sectionL,        // Partner Preferences
  ...sectionM,        // Documents & Verification
  ...sectionN,        // Conversations
];

export function getQuestion(id: string): QuestionConfig | undefined {
  return QUESTIONS.find((q) => q.id === id);
}

export function getQuestionsBySection(sectionId: string): QuestionConfig[] {
  return QUESTIONS.filter((q) => q.section === sectionId);
}
