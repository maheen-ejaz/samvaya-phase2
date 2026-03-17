import { ReactNode } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────────

export type IconPack = {
  name: string;
  description: string;
  badgeColor: string;
  icons: Record<string, Record<string, ReactNode>>;
};

// ── SVG wrapper ────────────────────────────────────────────────────────────────

function Ico({ children, ...props }: { children: ReactNode } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8" xmlns="http://www.w3.org/2000/svg" {...props}>
      {children}
    </svg>
  );
}

// ── Test question data ─────────────────────────────────────────────────────────

export const TEST_QUESTIONS = [
  {
    id: 'Q43',
    text: 'What is your diet?',
    options: [
      { value: 'vegetarian', label: 'Vegetarian' },
      { value: 'non_vegetarian', label: 'Non-Vegetarian' },
      { value: 'eggetarian', label: 'Eggetarian' },
      { value: 'vegan', label: 'Vegan' },
      { value: 'jain', label: 'Jain' },
      { value: 'other', label: 'Flexible / Other' },
    ],
  },
  {
    id: 'Q44',
    text: 'Your everyday attire style?',
    options: [
      { value: 'modern_western', label: 'Western' },
      { value: 'traditional', label: 'Traditional' },
      { value: 'mix', label: 'Mix of both' },
      { value: 'no_preference', label: 'No preference' },
    ],
  },
  {
    id: 'Q45',
    text: 'Your fitness habits?',
    options: [
      { value: 'regularly_exercises', label: 'Regular (4+ times/week)' },
      { value: 'occasionally', label: 'Moderate (1-3 times/week)' },
      { value: 'rarely', label: 'Occasional' },
      { value: 'not_interested', label: 'Not active currently' },
    ],
  },
  {
    id: 'Q46',
    text: 'Do you smoke?',
    options: [
      { value: 'never', label: 'No' },
      { value: 'occasionally', label: 'Occasionally' },
      { value: 'frequently', label: 'Yes, regularly' },
    ],
  },
  {
    id: 'Q47',
    text: 'Do you drink?',
    options: [
      { value: 'never', label: 'No' },
      { value: 'occasionally', label: 'Socially' },
      { value: 'frequently', label: 'Regularly' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// PACK A — Current Emojis (Baseline)
// ═══════════════════════════════════════════════════════════════════════════════

const packA: IconPack = {
  name: 'Pack A — Emoji',
  description: 'Current Unicode emojis. Platform-dependent rendering.',
  badgeColor: 'bg-gray-400',
  icons: {
    Q43: {
      vegetarian: <span className="text-3xl">🥬</span>,
      non_vegetarian: <span className="text-3xl">🍗</span>,
      eggetarian: <span className="text-3xl">🥚</span>,
      vegan: <span className="text-3xl">🌱</span>,
      jain: <span className="text-3xl">🙏</span>,
      other: <span className="text-3xl">🍽️</span>,
    },
    Q44: {
      modern_western: <span className="text-3xl">👔</span>,
      traditional: <span className="text-3xl">🪷</span>,
      mix: <span className="text-3xl">✨</span>,
      no_preference: <span className="text-3xl">🤷</span>,
    },
    Q45: {
      regularly_exercises: <span className="text-3xl">💪</span>,
      occasionally: <span className="text-3xl">🏃</span>,
      rarely: <span className="text-3xl">🚶</span>,
      not_interested: <span className="text-3xl">🛋️</span>,
    },
    Q46: {
      never: <span className="text-3xl">🚭</span>,
      occasionally: <span className="text-3xl">🌫️</span>,
      frequently: <span className="text-3xl">🚬</span>,
    },
    Q47: {
      never: <span className="text-3xl">💧</span>,
      occasionally: <span className="text-3xl">🥂</span>,
      frequently: <span className="text-3xl">🍷</span>,
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// PACK B — Minimal Line Icons
// Thin stroke (1.5px), monochrome slate-500, clean and professional
// ═══════════════════════════════════════════════════════════════════════════════

const lineColor = '#64748b'; // slate-500

const packB: IconPack = {
  name: 'Pack B — Minimal Line',
  description: 'Thin-stroke monochrome SVGs. Clean, modern, professional.',
  badgeColor: 'bg-slate-500',
  icons: {
    Q43: {
      // Leaf
      vegetarian: (
        <Ico>
          <path d="M8 28C8 28 6 16 16 10C26 4 28 4 28 4C28 4 30 16 20 22C10 28 8 28 8 28Z" fill="none" stroke={lineColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 28C12 20 18 14 28 4" fill="none" stroke={lineColor} strokeWidth="1.5" strokeLinecap="round" />
        </Ico>
      ),
      // Drumstick
      non_vegetarian: (
        <Ico>
          <circle cx="20" cy="12" r="7" fill="none" stroke={lineColor} strokeWidth="1.5" />
          <path d="M14.5 17.5L6 26" stroke={lineColor} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M4 24L6 26L8 24" stroke={lineColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </Ico>
      ),
      // Egg
      eggetarian: (
        <Ico>
          <ellipse cx="16" cy="17" rx="9" ry="11" fill="none" stroke={lineColor} strokeWidth="1.5" />
          <circle cx="16" cy="18" r="4" fill="none" stroke={lineColor} strokeWidth="1.5" />
        </Ico>
      ),
      // Sprout
      vegan: (
        <Ico>
          <path d="M16 28V18" stroke={lineColor} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M16 18C16 12 10 8 4 8C4 14 10 18 16 18Z" fill="none" stroke={lineColor} strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M16 14C16 8 22 4 28 4C28 10 22 14 16 14Z" fill="none" stroke={lineColor} strokeWidth="1.5" strokeLinejoin="round" />
        </Ico>
      ),
      // Hands together
      jain: (
        <Ico>
          <path d="M16 4L16 12" stroke={lineColor} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M10 8C10 8 10 20 10 22C10 25.3 12.7 28 16 28C19.3 28 22 25.3 22 22C22 20 22 8 22 8" fill="none" stroke={lineColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 16H22" stroke={lineColor} strokeWidth="1.5" strokeLinecap="round" />
        </Ico>
      ),
      // Fork and knife
      other: (
        <Ico>
          <path d="M12 4V14M12 14V28M12 14C8 14 8 4 8 4" stroke={lineColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M22 4V12C22 14.2 20.2 16 18 16H22V28" stroke={lineColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </Ico>
      ),
    },
    Q44: {
      // Shirt / blazer
      modern_western: (
        <Ico>
          <path d="M10 4L6 8L8 28H24L26 8L22 4" stroke={lineColor} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
          <path d="M10 4L13 10L16 6L19 10L22 4" stroke={lineColor} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
        </Ico>
      ),
      // Lotus / traditional
      traditional: (
        <Ico>
          <path d="M16 28V20" stroke={lineColor} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M16 6C16 6 10 10 10 16C10 18 12 20 16 20C20 20 22 18 22 16C22 10 16 6 16 6Z" fill="none" stroke={lineColor} strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M8 14C8 14 12 16 16 16" fill="none" stroke={lineColor} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M24 14C24 14 20 16 16 16" fill="none" stroke={lineColor} strokeWidth="1.5" strokeLinecap="round" />
        </Ico>
      ),
      // Two overlapping shapes
      mix: (
        <Ico>
          <rect x="6" y="8" width="12" height="16" rx="2" fill="none" stroke={lineColor} strokeWidth="1.5" />
          <rect x="14" y="8" width="12" height="16" rx="6" fill="none" stroke={lineColor} strokeWidth="1.5" />
        </Ico>
      ),
      // Shrug / open hands
      no_preference: (
        <Ico>
          <circle cx="16" cy="10" r="4" fill="none" stroke={lineColor} strokeWidth="1.5" />
          <path d="M8 28C8 22 12 18 16 18C20 18 24 22 24 28" fill="none" stroke={lineColor} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M6 16L10 18" stroke={lineColor} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M26 16L22 18" stroke={lineColor} strokeWidth="1.5" strokeLinecap="round" />
        </Ico>
      ),
    },
    Q45: {
      // Dumbbell
      regularly_exercises: (
        <Ico>
          <path d="M8 12V20M24 12V20M8 16H24" stroke={lineColor} strokeWidth="1.5" strokeLinecap="round" />
          <rect x="4" y="13" width="4" height="6" rx="1" fill="none" stroke={lineColor} strokeWidth="1.5" />
          <rect x="24" y="13" width="4" height="6" rx="1" fill="none" stroke={lineColor} strokeWidth="1.5" />
        </Ico>
      ),
      // Running figure
      occasionally: (
        <Ico>
          <circle cx="20" cy="6" r="3" fill="none" stroke={lineColor} strokeWidth="1.5" />
          <path d="M12 28L16 20L20 22L24 12L20 10L14 14L10 12" stroke={lineColor} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </Ico>
      ),
      // Walking figure
      rarely: (
        <Ico>
          <circle cx="16" cy="6" r="3" fill="none" stroke={lineColor} strokeWidth="1.5" />
          <path d="M16 9V20M16 14L22 18M16 14L10 18M16 20L12 28M16 20L20 28" stroke={lineColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </Ico>
      ),
      // Couch
      not_interested: (
        <Ico>
          <path d="M6 14V24H26V14" stroke={lineColor} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 18H26" stroke={lineColor} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M10 14V10H22V14" stroke={lineColor} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 24V27M24 24V27" stroke={lineColor} strokeWidth="1.5" strokeLinecap="round" />
        </Ico>
      ),
    },
    Q46: {
      // Circle with line (no smoking)
      never: (
        <Ico>
          <circle cx="16" cy="16" r="11" fill="none" stroke={lineColor} strokeWidth="1.5" />
          <path d="M8.2 23.8L23.8 8.2" stroke={lineColor} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M12 16H22" stroke={lineColor} strokeWidth="1.5" strokeLinecap="round" />
        </Ico>
      ),
      // Wispy smoke
      occasionally: (
        <Ico>
          <rect x="8" y="20" width="16" height="4" rx="1" fill="none" stroke={lineColor} strokeWidth="1.5" />
          <path d="M14 20V16M18 20V16" stroke={lineColor} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M12 12C12 10 14 8 14 6" stroke={lineColor} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M20 12C20 10 22 8 22 6" stroke={lineColor} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </Ico>
      ),
      // Cigarette with smoke
      frequently: (
        <Ico>
          <rect x="4" y="18" width="20" height="4" rx="1" fill="none" stroke={lineColor} strokeWidth="1.5" />
          <rect x="24" y="18" width="4" height="4" rx="1" fill="none" stroke={lineColor} strokeWidth="1.5" />
          <path d="M10 14C10 10 14 8 14 4" stroke={lineColor} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M18 14C18 10 22 8 22 4" stroke={lineColor} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </Ico>
      ),
    },
    Q47: {
      // Water drop
      never: (
        <Ico>
          <path d="M16 4C16 4 6 14 6 20C6 25.5 10.5 28 16 28C21.5 28 26 25.5 26 20C26 14 16 4 16 4Z" fill="none" stroke={lineColor} strokeWidth="1.5" strokeLinejoin="round" />
        </Ico>
      ),
      // Wine glasses clinking
      occasionally: (
        <Ico>
          <path d="M10 4V10C10 12.2 11.8 14 14 14V14" stroke={lineColor} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M14 14V20M11 20H17" stroke={lineColor} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M22 4V10C22 12.2 20.2 14 18 14V14" stroke={lineColor} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M18 14V20M15 20H21" stroke={lineColor} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M6 4H14M18 4H26" stroke={lineColor} strokeWidth="1.5" strokeLinecap="round" />
        </Ico>
      ),
      // Wine glass
      frequently: (
        <Ico>
          <path d="M10 4C10 4 8 12 12 14C14 15 16 15 16 15" stroke={lineColor} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M22 4C22 4 24 12 20 14C18 15 16 15 16 15" stroke={lineColor} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 15V24M12 24H20" stroke={lineColor} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M10 4H22" stroke={lineColor} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M10 8H22" stroke={lineColor} strokeWidth="1.3" strokeLinecap="round" opacity="0.4" />
        </Ico>
      ),
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// PACK C — Soft Duotone
// Two-tone: rose-100 fill + rose-600 stroke. Premium and warm.
// ═══════════════════════════════════════════════════════════════════════════════

const dFill = '#ffe4e6';   // rose-100
const dStroke = '#e11d48';  // rose-600

const packC: IconPack = {
  name: 'Pack C — Soft Duotone',
  description: 'Two-tone rose fill + stroke. On-brand, premium, warm.',
  badgeColor: 'bg-rose-500',
  icons: {
    Q43: {
      vegetarian: (
        <Ico>
          <path d="M8 28C8 28 6 16 16 10C26 4 28 4 28 4C28 4 30 16 20 22C10 28 8 28 8 28Z" fill={dFill} stroke={dStroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 28C12 20 18 14 28 4" fill="none" stroke={dStroke} strokeWidth="1.5" strokeLinecap="round" />
        </Ico>
      ),
      non_vegetarian: (
        <Ico>
          <circle cx="20" cy="12" r="7" fill={dFill} stroke={dStroke} strokeWidth="1.8" />
          <path d="M14.5 17.5L6 26" stroke={dStroke} strokeWidth="1.8" strokeLinecap="round" />
          <path d="M4 24L6 26L8 24" stroke={dStroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </Ico>
      ),
      eggetarian: (
        <Ico>
          <ellipse cx="16" cy="17" rx="9" ry="11" fill={dFill} stroke={dStroke} strokeWidth="1.8" />
          <circle cx="16" cy="18" r="4" fill="#fecdd3" stroke={dStroke} strokeWidth="1.5" />
        </Ico>
      ),
      vegan: (
        <Ico>
          <path d="M16 28V18" stroke={dStroke} strokeWidth="1.8" strokeLinecap="round" />
          <path d="M16 18C16 12 10 8 4 8C4 14 10 18 16 18Z" fill={dFill} stroke={dStroke} strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M16 14C16 8 22 4 28 4C28 10 22 14 16 14Z" fill={dFill} stroke={dStroke} strokeWidth="1.8" strokeLinejoin="round" />
        </Ico>
      ),
      jain: (
        <Ico>
          <path d="M16 4L16 12" stroke={dStroke} strokeWidth="1.8" strokeLinecap="round" />
          <path d="M10 8C10 8 10 20 10 22C10 25.3 12.7 28 16 28C19.3 28 22 25.3 22 22C22 20 22 8 22 8" fill={dFill} stroke={dStroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 16H22" stroke={dStroke} strokeWidth="1.5" strokeLinecap="round" />
        </Ico>
      ),
      other: (
        <Ico>
          <path d="M12 4V14M12 14V28M12 14C8 14 8 4 8 4" stroke={dStroke} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M22 4V12C22 14.2 20.2 16 18 16H22V28" stroke={dStroke} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="8" r="2" fill={dFill} stroke="none" />
          <circle cx="22" cy="8" r="2" fill={dFill} stroke="none" />
        </Ico>
      ),
    },
    Q44: {
      modern_western: (
        <Ico>
          <path d="M10 4L6 8L8 28H24L26 8L22 4" fill={dFill} stroke={dStroke} strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M10 4L13 10L16 6L19 10L22 4" fill="none" stroke={dStroke} strokeWidth="1.8" strokeLinejoin="round" />
        </Ico>
      ),
      traditional: (
        <Ico>
          <path d="M16 28V20" stroke={dStroke} strokeWidth="1.8" strokeLinecap="round" />
          <path d="M16 6C16 6 10 10 10 16C10 18 12 20 16 20C20 20 22 18 22 16C22 10 16 6 16 6Z" fill={dFill} stroke={dStroke} strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M8 14C8 14 12 16 16 16" fill="none" stroke={dStroke} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M24 14C24 14 20 16 16 16" fill="none" stroke={dStroke} strokeWidth="1.5" strokeLinecap="round" />
        </Ico>
      ),
      mix: (
        <Ico>
          <rect x="6" y="8" width="12" height="16" rx="2" fill={dFill} stroke={dStroke} strokeWidth="1.8" />
          <rect x="14" y="8" width="12" height="16" rx="6" fill="#fecdd3" stroke={dStroke} strokeWidth="1.8" />
        </Ico>
      ),
      no_preference: (
        <Ico>
          <circle cx="16" cy="10" r="4" fill={dFill} stroke={dStroke} strokeWidth="1.8" />
          <path d="M8 28C8 22 12 18 16 18C20 18 24 22 24 28" fill={dFill} stroke={dStroke} strokeWidth="1.8" strokeLinecap="round" />
          <path d="M6 16L10 18" stroke={dStroke} strokeWidth="1.8" strokeLinecap="round" />
          <path d="M26 16L22 18" stroke={dStroke} strokeWidth="1.8" strokeLinecap="round" />
        </Ico>
      ),
    },
    Q45: {
      regularly_exercises: (
        <Ico>
          <path d="M8 12V20M24 12V20M8 16H24" stroke={dStroke} strokeWidth="1.8" strokeLinecap="round" />
          <rect x="4" y="13" width="4" height="6" rx="1" fill={dFill} stroke={dStroke} strokeWidth="1.8" />
          <rect x="24" y="13" width="4" height="6" rx="1" fill={dFill} stroke={dStroke} strokeWidth="1.8" />
        </Ico>
      ),
      occasionally: (
        <Ico>
          <circle cx="20" cy="6" r="3" fill={dFill} stroke={dStroke} strokeWidth="1.8" />
          <path d="M12 28L16 20L20 22L24 12L20 10L14 14L10 12" stroke={dStroke} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </Ico>
      ),
      rarely: (
        <Ico>
          <circle cx="16" cy="6" r="3" fill={dFill} stroke={dStroke} strokeWidth="1.8" />
          <path d="M16 9V20M16 14L22 18M16 14L10 18M16 20L12 28M16 20L20 28" stroke={dStroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </Ico>
      ),
      not_interested: (
        <Ico>
          <path d="M6 14V24H26V14" fill={dFill} stroke={dStroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 18H26" stroke={dStroke} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M10 14V10H22V14" fill="none" stroke={dStroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 24V27M24 24V27" stroke={dStroke} strokeWidth="1.8" strokeLinecap="round" />
        </Ico>
      ),
    },
    Q46: {
      never: (
        <Ico>
          <circle cx="16" cy="16" r="11" fill={dFill} stroke={dStroke} strokeWidth="1.8" />
          <path d="M8.2 23.8L23.8 8.2" stroke={dStroke} strokeWidth="1.8" strokeLinecap="round" />
          <path d="M12 16H22" stroke={dStroke} strokeWidth="1.5" strokeLinecap="round" />
        </Ico>
      ),
      occasionally: (
        <Ico>
          <rect x="8" y="20" width="16" height="4" rx="1" fill={dFill} stroke={dStroke} strokeWidth="1.8" />
          <path d="M14 20V16M18 20V16" stroke={dStroke} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M12 12C12 10 14 8 14 6" stroke={dStroke} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M20 12C20 10 22 8 22 6" stroke={dStroke} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </Ico>
      ),
      frequently: (
        <Ico>
          <rect x="4" y="18" width="20" height="4" rx="1" fill={dFill} stroke={dStroke} strokeWidth="1.8" />
          <rect x="24" y="18" width="4" height="4" rx="1" fill="#fecdd3" stroke={dStroke} strokeWidth="1.8" />
          <path d="M10 14C10 10 14 8 14 4" stroke={dStroke} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M18 14C18 10 22 8 22 4" stroke={dStroke} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </Ico>
      ),
    },
    Q47: {
      never: (
        <Ico>
          <path d="M16 4C16 4 6 14 6 20C6 25.5 10.5 28 16 28C21.5 28 26 25.5 26 20C26 14 16 4 16 4Z" fill={dFill} stroke={dStroke} strokeWidth="1.8" strokeLinejoin="round" />
        </Ico>
      ),
      occasionally: (
        <Ico>
          <path d="M10 4V10C10 12.2 11.8 14 14 14V14" stroke={dStroke} strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M14 14V20M11 20H17" stroke={dStroke} strokeWidth="1.8" strokeLinecap="round" />
          <path d="M22 4V10C22 12.2 20.2 14 18 14V14" stroke={dStroke} strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M18 14V20M15 20H21" stroke={dStroke} strokeWidth="1.8" strokeLinecap="round" />
          <path d="M6 4H14M18 4H26" stroke={dStroke} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M10 6H14M18 6H22" stroke="none" fill={dFill} />
        </Ico>
      ),
      frequently: (
        <Ico>
          <path d="M10 4C10 4 8 12 12 14C14 15 16 15 16 15C16 15 18 15 20 14C24 12 22 4 22 4Z" fill={dFill} stroke={dStroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 15V24M12 24H20" stroke={dStroke} strokeWidth="1.8" strokeLinecap="round" />
          <path d="M10 4H22" stroke={dStroke} strokeWidth="1.8" strokeLinecap="round" />
          <path d="M10 8H22" stroke={dStroke} strokeWidth="1" strokeLinecap="round" opacity="0.3" />
        </Ico>
      ),
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// PACK D — Rounded Filled
// Solid fills with warm color palette. Friendly, playful, personality-driven.
// ═══════════════════════════════════════════════════════════════════════════════

const packD: IconPack = {
  name: 'Pack D — Rounded Filled',
  description: 'Warm-colored solid shapes. Friendly, playful, personality-driven.',
  badgeColor: 'bg-amber-500',
  icons: {
    Q43: {
      vegetarian: (
        <Ico>
          <path d="M8 28C8 28 6 16 16 10C26 4 28 4 28 4C28 4 30 16 20 22C10 28 8 28 8 28Z" fill="#86efac" stroke="#16a34a" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M8 28C12 20 18 14 28 4" fill="none" stroke="#16a34a" strokeWidth="1.2" strokeLinecap="round" />
        </Ico>
      ),
      non_vegetarian: (
        <Ico>
          <circle cx="20" cy="12" r="7" fill="#fecaca" stroke="#dc2626" strokeWidth="1.5" />
          <path d="M14.5 17.5L6 26" stroke="#92400e" strokeWidth="2" strokeLinecap="round" />
          <path d="M4 24L6 26L8 24" stroke="#92400e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </Ico>
      ),
      eggetarian: (
        <Ico>
          <ellipse cx="16" cy="17" rx="9" ry="11" fill="#fef3c7" stroke="#d97706" strokeWidth="1.5" />
          <circle cx="16" cy="18" r="4" fill="#fbbf24" stroke="#d97706" strokeWidth="1.2" />
        </Ico>
      ),
      vegan: (
        <Ico>
          <path d="M16 28V18" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M16 18C16 12 10 8 4 8C4 14 10 18 16 18Z" fill="#bbf7d0" stroke="#16a34a" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M16 14C16 8 22 4 28 4C28 10 22 14 16 14Z" fill="#86efac" stroke="#16a34a" strokeWidth="1.5" strokeLinejoin="round" />
        </Ico>
      ),
      jain: (
        <Ico>
          <path d="M10 8C10 8 10 20 10 22C10 25.3 12.7 28 16 28C19.3 28 22 25.3 22 22C22 20 22 8 22 8" fill="#fef9c3" stroke="#ca8a04" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 4L16 12" stroke="#ca8a04" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M10 16H22" stroke="#ca8a04" strokeWidth="1.5" strokeLinecap="round" />
        </Ico>
      ),
      other: (
        <Ico>
          <rect x="7" y="4" width="18" height="24" rx="4" fill="#e0e7ff" stroke="none" />
          <path d="M12 4V14M12 14V28M12 14C8 14 8 4 8 4" stroke="#6366f1" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M22 4V12C22 14.2 20.2 16 18 16H22V28" stroke="#6366f1" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </Ico>
      ),
    },
    Q44: {
      modern_western: (
        <Ico>
          <path d="M10 4L6 8L8 28H24L26 8L22 4" fill="#bfdbfe" stroke="#2563eb" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M10 4L13 10L16 6L19 10L22 4" fill="#eff6ff" stroke="#2563eb" strokeWidth="1.5" strokeLinejoin="round" />
        </Ico>
      ),
      traditional: (
        <Ico>
          <path d="M16 28V20" stroke="#be185d" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M16 6C16 6 10 10 10 16C10 18 12 20 16 20C20 20 22 18 22 16C22 10 16 6 16 6Z" fill="#fbcfe8" stroke="#be185d" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M8 14C8 14 12 16 16 16" fill="none" stroke="#be185d" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M24 14C24 14 20 16 16 16" fill="none" stroke="#be185d" strokeWidth="1.2" strokeLinecap="round" />
        </Ico>
      ),
      mix: (
        <Ico>
          <rect x="6" y="8" width="12" height="16" rx="2" fill="#bfdbfe" stroke="#2563eb" strokeWidth="1.5" />
          <rect x="14" y="8" width="12" height="16" rx="6" fill="#fbcfe8" stroke="#be185d" strokeWidth="1.5" />
        </Ico>
      ),
      no_preference: (
        <Ico>
          <circle cx="16" cy="10" r="4" fill="#e5e7eb" stroke="#6b7280" strokeWidth="1.5" />
          <path d="M8 28C8 22 12 18 16 18C20 18 24 22 24 28" fill="#f3f4f6" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M6 16L10 18" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M26 16L22 18" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" />
        </Ico>
      ),
    },
    Q45: {
      regularly_exercises: (
        <Ico>
          <path d="M8 12V20M24 12V20M8 16H24" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
          <rect x="4" y="13" width="4" height="6" rx="1" fill="#fecaca" stroke="#dc2626" strokeWidth="1.5" />
          <rect x="24" y="13" width="4" height="6" rx="1" fill="#fecaca" stroke="#dc2626" strokeWidth="1.5" />
        </Ico>
      ),
      occasionally: (
        <Ico>
          <circle cx="20" cy="6" r="3" fill="#fed7aa" stroke="#ea580c" strokeWidth="1.5" />
          <path d="M12 28L16 20L20 22L24 12L20 10L14 14L10 12" stroke="#ea580c" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </Ico>
      ),
      rarely: (
        <Ico>
          <circle cx="16" cy="6" r="3" fill="#fef9c3" stroke="#ca8a04" strokeWidth="1.5" />
          <path d="M16 9V20M16 14L22 18M16 14L10 18M16 20L12 28M16 20L20 28" stroke="#ca8a04" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </Ico>
      ),
      not_interested: (
        <Ico>
          <path d="M6 14V24H26V14" fill="#e5e7eb" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 18H26" stroke="#6b7280" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M10 14V10H22V14" fill="#d1d5db" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 24V27M24 24V27" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" />
        </Ico>
      ),
    },
    Q46: {
      never: (
        <Ico>
          <circle cx="16" cy="16" r="11" fill="#dcfce7" stroke="#16a34a" strokeWidth="1.8" />
          <path d="M8.2 23.8L23.8 8.2" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M12 16H22" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" />
        </Ico>
      ),
      occasionally: (
        <Ico>
          <rect x="8" y="20" width="16" height="4" rx="1" fill="#fed7aa" stroke="#ea580c" strokeWidth="1.5" />
          <path d="M14 20V16M18 20V16" stroke="#ea580c" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M12 12C12 10 14 8 14 6" stroke="#9ca3af" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M20 12C20 10 22 8 22 6" stroke="#9ca3af" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </Ico>
      ),
      frequently: (
        <Ico>
          <rect x="4" y="18" width="20" height="4" rx="1" fill="#fecaca" stroke="#dc2626" strokeWidth="1.5" />
          <rect x="24" y="18" width="4" height="4" rx="1" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
          <path d="M10 14C10 10 14 8 14 4" stroke="#9ca3af" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M18 14C18 10 22 8 22 4" stroke="#9ca3af" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </Ico>
      ),
    },
    Q47: {
      never: (
        <Ico>
          <path d="M16 4C16 4 6 14 6 20C6 25.5 10.5 28 16 28C21.5 28 26 25.5 26 20C26 14 16 4 16 4Z" fill="#bfdbfe" stroke="#2563eb" strokeWidth="1.5" strokeLinejoin="round" />
        </Ico>
      ),
      occasionally: (
        <Ico>
          <path d="M10 4V10C10 12.2 11.8 14 14 14" stroke="#d97706" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M14 14V20M11 20H17" stroke="#d97706" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M22 4V10C22 12.2 20.2 14 18 14" stroke="#d97706" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M18 14V20M15 20H21" stroke="#d97706" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M6 4H14M18 4H26" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M10 5C10 5 10 8 14 8" fill="#fef3c7" stroke="none" />
          <path d="M22 5C22 5 22 8 18 8" fill="#fef3c7" stroke="none" />
        </Ico>
      ),
      frequently: (
        <Ico>
          <path d="M10 4C10 4 8 12 12 14C14 15 16 15 16 15C16 15 18 15 20 14C24 12 22 4 22 4Z" fill="#fde68a" stroke="#d97706" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M16 15V24M12 24H20" stroke="#92400e" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M10 4H22" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M11 8H21" stroke="#d97706" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
        </Ico>
      ),
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// PACK E — Abstract Minimal
// Geometric simplified shapes, muted tones, design-forward.
// ═══════════════════════════════════════════════════════════════════════════════

const packE: IconPack = {
  name: 'Pack E — Abstract Minimal',
  description: 'Geometric shapes, muted palette. Design-forward, artistic.',
  badgeColor: 'bg-indigo-500',
  icons: {
    Q43: {
      // Diamond = leaf abstraction
      vegetarian: (
        <Ico>
          <path d="M16 4L26 16L16 28L6 16Z" fill="#d1fae5" stroke="#6ee7b7" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M16 10V22" stroke="#6ee7b7" strokeWidth="1" strokeLinecap="round" />
        </Ico>
      ),
      // Circle + triangle
      non_vegetarian: (
        <Ico>
          <circle cx="16" cy="12" r="6" fill="#fecdd3" stroke="none" />
          <polygon points="16,18 10,28 22,28" fill="#fb7185" stroke="none" />
        </Ico>
      ),
      // Oval + circle
      eggetarian: (
        <Ico>
          <ellipse cx="16" cy="16" rx="8" ry="11" fill="#fef3c7" stroke="none" />
          <circle cx="16" cy="18" r="4" fill="#fbbf24" stroke="none" />
        </Ico>
      ),
      // Two small diamonds (leaves)
      vegan: (
        <Ico>
          <path d="M12 6L20 14L12 22L4 14Z" fill="#bbf7d0" stroke="none" />
          <path d="M20 4L28 12L20 20L12 12Z" fill="#86efac" stroke="none" opacity="0.7" />
        </Ico>
      ),
      // Circle with line
      jain: (
        <Ico>
          <circle cx="16" cy="16" r="10" fill="#fef9c3" stroke="none" />
          <path d="M16 8V24" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M10 16H22" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
        </Ico>
      ),
      // Grid of dots
      other: (
        <Ico>
          <circle cx="10" cy="10" r="3" fill="#c7d2fe" stroke="none" />
          <circle cx="22" cy="10" r="3" fill="#ddd6fe" stroke="none" />
          <circle cx="10" cy="22" r="3" fill="#ddd6fe" stroke="none" />
          <circle cx="22" cy="22" r="3" fill="#c7d2fe" stroke="none" />
          <circle cx="16" cy="16" r="3" fill="#a5b4fc" stroke="none" />
        </Ico>
      ),
    },
    Q44: {
      // Sharp rectangle
      modern_western: (
        <Ico>
          <rect x="8" y="6" width="16" height="20" rx="1" fill="#bfdbfe" stroke="none" />
          <path d="M14 6V16L16 12L18 16V6" fill="#93c5fd" stroke="none" />
        </Ico>
      ),
      // Arch shape
      traditional: (
        <Ico>
          <path d="M6 28V12C6 6 10 4 16 4C22 4 26 6 26 12V28" fill="#fbcfe8" stroke="none" />
          <path d="M12 28V18C12 16 14 14 16 14C18 14 20 16 20 18V28" fill="#f9a8d4" stroke="none" />
        </Ico>
      ),
      // Half and half
      mix: (
        <Ico>
          <rect x="6" y="6" width="10" height="20" fill="#bfdbfe" stroke="none" />
          <rect x="16" y="6" width="10" height="20" rx="10" fill="#fbcfe8" stroke="none" />
        </Ico>
      ),
      // Neutral circle
      no_preference: (
        <Ico>
          <circle cx="16" cy="16" r="10" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1.5" />
          <path d="M12 14L14 16L12 18" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20 14L18 16L20 18" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </Ico>
      ),
    },
    Q45: {
      // Stacked bars (energy level)
      regularly_exercises: (
        <Ico>
          <rect x="5" y="20" width="5" height="8" rx="1" fill="#86efac" stroke="none" />
          <rect x="13" y="14" width="5" height="14" rx="1" fill="#4ade80" stroke="none" />
          <rect x="21" y="6" width="5" height="22" rx="1" fill="#22c55e" stroke="none" />
        </Ico>
      ),
      occasionally: (
        <Ico>
          <rect x="5" y="20" width="5" height="8" rx="1" fill="#93c5fd" stroke="none" />
          <rect x="13" y="14" width="5" height="14" rx="1" fill="#60a5fa" stroke="none" />
          <rect x="21" y="14" width="5" height="14" rx="1" fill="#e5e7eb" stroke="none" />
        </Ico>
      ),
      rarely: (
        <Ico>
          <rect x="5" y="20" width="5" height="8" rx="1" fill="#fbbf24" stroke="none" />
          <rect x="13" y="20" width="5" height="8" rx="1" fill="#e5e7eb" stroke="none" />
          <rect x="21" y="20" width="5" height="8" rx="1" fill="#e5e7eb" stroke="none" />
        </Ico>
      ),
      not_interested: (
        <Ico>
          <rect x="5" y="20" width="5" height="8" rx="1" fill="#e5e7eb" stroke="none" />
          <rect x="13" y="20" width="5" height="8" rx="1" fill="#e5e7eb" stroke="none" />
          <rect x="21" y="20" width="5" height="8" rx="1" fill="#e5e7eb" stroke="none" />
          <path d="M10 12L22 12" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" />
        </Ico>
      ),
    },
    Q46: {
      // Green circle
      never: (
        <Ico>
          <circle cx="16" cy="16" r="11" fill="#dcfce7" stroke="none" />
          <path d="M11 16L14.5 19.5L21.5 12.5" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </Ico>
      ),
      // Yellow semicircle
      occasionally: (
        <Ico>
          <circle cx="16" cy="16" r="11" fill="#fef9c3" stroke="none" />
          <path d="M11 16H21" stroke="#eab308" strokeWidth="2" strokeLinecap="round" />
        </Ico>
      ),
      // Red circle
      frequently: (
        <Ico>
          <circle cx="16" cy="16" r="11" fill="#fecdd3" stroke="none" />
          <path d="M12 12L20 20M20 12L12 20" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
        </Ico>
      ),
    },
    Q47: {
      // Green circle
      never: (
        <Ico>
          <circle cx="16" cy="16" r="11" fill="#dbeafe" stroke="none" />
          <path d="M11 16L14.5 19.5L21.5 12.5" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </Ico>
      ),
      // Amber circle
      occasionally: (
        <Ico>
          <circle cx="16" cy="16" r="11" fill="#fef3c7" stroke="none" />
          <circle cx="16" cy="16" r="4" fill="#fbbf24" stroke="none" />
        </Ico>
      ),
      // Warm circle
      frequently: (
        <Ico>
          <circle cx="16" cy="16" r="11" fill="#fce7f3" stroke="none" />
          <circle cx="16" cy="16" r="6" fill="#f9a8d4" stroke="none" />
          <circle cx="16" cy="16" r="2" fill="#ec4899" stroke="none" />
        </Ico>
      ),
    },
  },
};

// ── Export ──────────────────────────────────────────────────────────────────────

export const ICON_PACKS: IconPack[] = [packA, packB, packC, packD, packE];
