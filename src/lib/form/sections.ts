import type { SectionConfig } from './types';

export const SECTIONS: SectionConfig[] = [
  {
    id: 'A',
    label: 'Basic Identity',
    description: 'Your name, contact details, and basic information',
    estimatedMinutes: 5,
    questionRange: [1, 17],
    showConfidentialityCallout: false,
  },
  {
    id: 'B',
    label: 'Location & Citizenship',
    description: 'Where you live and your nationality',
    estimatedMinutes: 3,
    questionRange: [18, 26],
    showConfidentialityCallout: false,
  },
  {
    id: 'C',
    label: 'Religion & Community',
    description: 'Your faith, community, and cultural background',
    estimatedMinutes: 2,
    questionRange: [27, 31],
    showConfidentialityCallout: true,
    confidentialityText:
      'Your answers here are private and confidential. Be honest — this is how we find the right match for you.',
  },
  {
    id: 'D',
    label: 'Family Background',
    description: 'Your family and an AI conversation about what matters to you',
    estimatedMinutes: 8,
    questionRange: [32, 39],
    showConfidentialityCallout: false,
  },
  {
    id: 'E',
    label: 'Physical Details',
    description: 'Height, build, and appearance',
    estimatedMinutes: 1,
    questionRange: [40, 42],
    showConfidentialityCallout: true,
    confidentialityText:
      'Your answers here are private and confidential. Be honest — this is how we find the right match for you.',
  },
  {
    id: 'F',
    label: 'Lifestyle',
    description: 'Your daily habits, diet, and personal preferences',
    estimatedMinutes: 4,
    questionRange: [43, 52],
    showConfidentialityCallout: true,
    confidentialityText:
      'Your answers here are private and confidential. Be honest — this is how we find the right match for you.',
  },
  {
    id: 'G',
    label: 'Personality & Interests',
    description: 'Hobbies, interests, and what you enjoy',
    estimatedMinutes: 3,
    questionRange: [53, 56],
    showConfidentialityCallout: false,
  },
  {
    id: 'H',
    label: 'Education',
    description: 'Your medical education and qualifications',
    estimatedMinutes: 3,
    questionRange: [57, 63],
    showConfidentialityCallout: false,
  },
  {
    id: 'I',
    label: 'Career',
    description: 'Your work experience and professional journey',
    estimatedMinutes: 3,
    questionRange: [64, 65],
    showConfidentialityCallout: false,
  },
  {
    id: 'J',
    label: 'Financial Background',
    description: 'Your financial context helps us find truly compatible matches',
    estimatedMinutes: 3,
    questionRange: [66, 71],
    showConfidentialityCallout: true,
    confidentialityText:
      'Your answers here are private and confidential. Be honest — this is how we find the right match for you.',
  },
  {
    id: 'K',
    label: 'Goals & Values',
    description: 'Your vision for the future and an in-depth AI conversation',
    estimatedMinutes: 12,
    questionRange: [72, 83],
    showConfidentialityCallout: false,
  },
  {
    id: 'L',
    label: 'Partner Preferences',
    description: 'What you are looking for in a life partner',
    estimatedMinutes: 8,
    questionRange: [85, 104],
    showConfidentialityCallout: true,
    confidentialityText:
      'Your answers here are private and confidential. Be honest — this is how we find the right match for you.',
  },
  {
    id: 'M',
    label: 'Documents & Verification',
    description: 'Photos, identity documents, and background check consent',
    estimatedMinutes: 5,
    questionRange: [105, 109],
    showConfidentialityCallout: false,
  },
  {
    id: 'N',
    label: 'Conversations',
    description: 'A brief closing thought before you submit',
    estimatedMinutes: 2,
    questionRange: [110, 112],
    showConfidentialityCallout: false,
  },
];

export function getSectionForQuestion(questionNumber: number): SectionConfig | undefined {
  return SECTIONS.find(
    (s) => questionNumber >= s.questionRange[0] && questionNumber <= s.questionRange[1]
  );
}

export function getSectionIndex(sectionId: string): number {
  return SECTIONS.findIndex((s) => s.id === sectionId);
}
