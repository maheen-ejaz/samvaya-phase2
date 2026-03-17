import type { SectionConfig } from './types';

export const SECTIONS: SectionConfig[] = [
  {
    id: 'A',
    label: 'Basic Identity',
    questionRange: [1, 17],
    showConfidentialityCallout: false,
  },
  {
    id: 'B',
    label: 'Location & Citizenship',
    questionRange: [18, 26],
    showConfidentialityCallout: false,
  },
  {
    id: 'C',
    label: 'Religion & Community',
    questionRange: [27, 31],
    showConfidentialityCallout: true,
    confidentialityText:
      'Your answers here are private and confidential. Be honest — this is how we find the right match for you.',
  },
  {
    id: 'D',
    label: 'Family Background',
    questionRange: [32, 39],
    showConfidentialityCallout: false,
  },
  {
    id: 'E',
    label: 'Physical Details',
    questionRange: [40, 42],
    showConfidentialityCallout: true,
    confidentialityText:
      'Your answers here are private and confidential. Be honest — this is how we find the right match for you.',
  },
  {
    id: 'F',
    label: 'Lifestyle',
    questionRange: [43, 52],
    showConfidentialityCallout: true,
    confidentialityText:
      'Your answers here are private and confidential. Be honest — this is how we find the right match for you.',
  },
  {
    id: 'G',
    label: 'Personality & Interests',
    questionRange: [53, 55],
    showConfidentialityCallout: false,
  },
  {
    id: 'H',
    label: 'Education',
    questionRange: [56, 60],
    showConfidentialityCallout: false,
  },
  {
    id: 'I',
    label: 'Career',
    questionRange: [61, 62],
    showConfidentialityCallout: false,
  },
  {
    id: 'J',
    label: 'Goals & Values',
    questionRange: [63, 74],
    showConfidentialityCallout: false,
  },
  {
    id: 'K',
    label: 'Partner Preferences',
    questionRange: [76, 94],
    showConfidentialityCallout: true,
    confidentialityText:
      'Your answers here are private and confidential. Be honest — this is how we find the right match for you.',
  },
  {
    id: 'L',
    label: 'Documents & Verification',
    questionRange: [95, 99],
    showConfidentialityCallout: false,
  },
  {
    id: 'M',
    label: 'Conversations',
    questionRange: [101, 103],
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
