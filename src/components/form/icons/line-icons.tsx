import { ReactNode } from 'react';

/**
 * Minimal Line icon set for illustrated_mc questions (Q42–Q48).
 * Thin-stroke (1.5px) monochrome SVGs in slate-500.
 *
 * Lookup: ICON_REGISTRY[optionValue] → SVG ReactNode
 */

const C = '#64748b'; // slate-500

function Ico({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8" xmlns="http://www.w3.org/2000/svg">
      {children}
    </svg>
  );
}

// ── Q42 — Skin tone (color swatches) ──────────────────────────────────────────

function SkinSwatch({ fill, stroke }: { fill: string; stroke: string }) {
  return (
    <svg viewBox="0 0 32 32" className="h-10 w-10" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="13" fill={fill} stroke={stroke} strokeWidth="1.5" />
    </svg>
  );
}

const skinFair = <SkinSwatch fill="#FDCEB5" stroke="#E8B89A" />;
const skinWheatish = <SkinSwatch fill="#E8B88A" stroke="#D4A06A" />;
const skinDusky = <SkinSwatch fill="#C68B59" stroke="#A87043" />;
const skinDark = <SkinSwatch fill="#8D5E3C" stroke="#6F4A2E" />;

// ── Q43 — Diet ─────────────────────────────────────────────────────────────────

const dietVegetarian = (
  <Ico>
    <path d="M8 28C8 28 6 16 16 10C26 4 28 4 28 4C28 4 30 16 20 22C10 28 8 28 8 28Z" fill="none" stroke={C} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 28C12 20 18 14 28 4" fill="none" stroke={C} strokeWidth="1.5" strokeLinecap="round" />
  </Ico>
);

const dietNonVeg = (
  <Ico>
    <circle cx="20" cy="12" r="7" fill="none" stroke={C} strokeWidth="1.5" />
    <path d="M14.5 17.5L6 26" stroke={C} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M4 24L6 26L8 24" stroke={C} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Ico>
);

const dietEggetarian = (
  <Ico>
    <ellipse cx="16" cy="17" rx="9" ry="11" fill="none" stroke={C} strokeWidth="1.5" />
    <circle cx="16" cy="18" r="4" fill="none" stroke={C} strokeWidth="1.5" />
  </Ico>
);

const dietVegan = (
  <Ico>
    <path d="M16 28V18" stroke={C} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M16 18C16 12 10 8 4 8C4 14 10 18 16 18Z" fill="none" stroke={C} strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M16 14C16 8 22 4 28 4C28 10 22 14 16 14Z" fill="none" stroke={C} strokeWidth="1.5" strokeLinejoin="round" />
  </Ico>
);

const dietJain = (
  <Ico>
    <path d="M16 4L16 12" stroke={C} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M10 8C10 8 10 20 10 22C10 25.3 12.7 28 16 28C19.3 28 22 25.3 22 22C22 20 22 8 22 8" fill="none" stroke={C} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 16H22" stroke={C} strokeWidth="1.5" strokeLinecap="round" />
  </Ico>
);

const dietOther = (
  <Ico>
    <path d="M12 4V14M12 14V28M12 14C8 14 8 4 8 4" stroke={C} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M22 4V12C22 14.2 20.2 16 18 16H22V28" stroke={C} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Ico>
);

// ── Q44 — Everyday attire ──────────────────────────────────────────────────────

const attireWestern = (
  <Ico>
    <path d="M10 4L6 8L8 28H24L26 8L22 4" stroke={C} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
    <path d="M10 4L13 10L16 6L19 10L22 4" stroke={C} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
  </Ico>
);

const attireTraditional = (
  <Ico>
    <path d="M16 28V20" stroke={C} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M16 6C16 6 10 10 10 16C10 18 12 20 16 20C20 20 22 18 22 16C22 10 16 6 16 6Z" fill="none" stroke={C} strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M8 14C8 14 12 16 16 16" fill="none" stroke={C} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M24 14C24 14 20 16 16 16" fill="none" stroke={C} strokeWidth="1.5" strokeLinecap="round" />
  </Ico>
);

const attireMix = (
  <Ico>
    <rect x="6" y="8" width="12" height="16" rx="2" fill="none" stroke={C} strokeWidth="1.5" />
    <rect x="14" y="8" width="12" height="16" rx="6" fill="none" stroke={C} strokeWidth="1.5" />
  </Ico>
);

const attireNoPref = (
  <Ico>
    <circle cx="16" cy="10" r="4" fill="none" stroke={C} strokeWidth="1.5" />
    <path d="M8 28C8 22 12 18 16 18C20 18 24 22 24 28" fill="none" stroke={C} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M6 16L10 18" stroke={C} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M26 16L22 18" stroke={C} strokeWidth="1.5" strokeLinecap="round" />
  </Ico>
);

// ── Q45 — Fitness habits ───────────────────────────────────────────────────────

const fitnessRegular = (
  <Ico>
    <path d="M8 12V20M24 12V20M8 16H24" stroke={C} strokeWidth="1.5" strokeLinecap="round" />
    <rect x="4" y="13" width="4" height="6" rx="1" fill="none" stroke={C} strokeWidth="1.5" />
    <rect x="24" y="13" width="4" height="6" rx="1" fill="none" stroke={C} strokeWidth="1.5" />
  </Ico>
);

const fitnessModerate = (
  <Ico>
    <circle cx="20" cy="6" r="3" fill="none" stroke={C} strokeWidth="1.5" />
    <path d="M12 28L16 20L20 22L24 12L20 10L14 14L10 12" stroke={C} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Ico>
);

const fitnessOccasional = (
  <Ico>
    <circle cx="16" cy="6" r="3" fill="none" stroke={C} strokeWidth="1.5" />
    <path d="M16 9V20M16 14L22 18M16 14L10 18M16 20L12 28M16 20L20 28" stroke={C} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Ico>
);

const fitnessNotActive = (
  <Ico>
    <path d="M6 14V24H26V14" stroke={C} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 18H26" stroke={C} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M10 14V10H22V14" stroke={C} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 24V27M24 24V27" stroke={C} strokeWidth="1.5" strokeLinecap="round" />
  </Ico>
);

// ── Q46 — Smoking ──────────────────────────────────────────────────────────────

const smokingNever = (
  <Ico>
    <circle cx="16" cy="16" r="11" fill="none" stroke={C} strokeWidth="1.5" />
    <path d="M8.2 23.8L23.8 8.2" stroke={C} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M12 16H22" stroke={C} strokeWidth="1.5" strokeLinecap="round" />
  </Ico>
);

const smokingOccasionally = (
  <Ico>
    <rect x="8" y="20" width="16" height="4" rx="1" fill="none" stroke={C} strokeWidth="1.5" />
    <path d="M14 20V16M18 20V16" stroke={C} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M12 12C12 10 14 8 14 6" stroke={C} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <path d="M20 12C20 10 22 8 22 6" stroke={C} strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </Ico>
);

const smokingFrequently = (
  <Ico>
    <rect x="4" y="18" width="20" height="4" rx="1" fill="none" stroke={C} strokeWidth="1.5" />
    <rect x="24" y="18" width="4" height="4" rx="1" fill="none" stroke={C} strokeWidth="1.5" />
    <path d="M10 14C10 10 14 8 14 4" stroke={C} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <path d="M18 14C18 10 22 8 22 4" stroke={C} strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </Ico>
);

// ── Q47 — Drinking ─────────────────────────────────────────────────────────────

const drinkingNever = (
  <Ico>
    <path d="M16 4C16 4 6 14 6 20C6 25.5 10.5 28 16 28C21.5 28 26 25.5 26 20C26 14 16 4 16 4Z" fill="none" stroke={C} strokeWidth="1.5" strokeLinejoin="round" />
  </Ico>
);

const drinkingSocially = (
  <Ico>
    <path d="M10 4V10C10 12.2 11.8 14 14 14V14" stroke={C} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <path d="M14 14V20M11 20H17" stroke={C} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M22 4V10C22 12.2 20.2 14 18 14V14" stroke={C} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <path d="M18 14V20M15 20H21" stroke={C} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M6 4H14M18 4H26" stroke={C} strokeWidth="1.5" strokeLinecap="round" />
  </Ico>
);

const drinkingRegularly = (
  <Ico>
    <path d="M10 4C10 4 8 12 12 14C14 15 16 15 16 15" stroke={C} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M22 4C22 4 24 12 20 14C18 15 16 15 16 15" stroke={C} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 15V24M12 24H20" stroke={C} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M10 4H22" stroke={C} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M10 8H22" stroke={C} strokeWidth="1.3" strokeLinecap="round" opacity="0.4" />
  </Ico>
);

// ── Q48 — Tattoos / piercings ──────────────────────────────────────────────────

const tattooNone = (
  <Ico>
    <path d="M8 8L24 24M24 8L8 24" stroke={C} strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
    <circle cx="16" cy="16" r="10" fill="none" stroke={C} strokeWidth="1.5" />
  </Ico>
);

const tattooOnly = (
  <Ico>
    <path d="M10 6C10 6 8 10 10 14C12 18 14 16 16 20C18 24 16 28 16 28" stroke={C} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <path d="M22 6C22 6 20 10 22 14C24 18 22 22 22 22" stroke={C} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <circle cx="12" cy="24" r="2" fill="none" stroke={C} strokeWidth="1.5" />
  </Ico>
);

const piercingOnly = (
  <Ico>
    <circle cx="16" cy="8" r="2" fill="none" stroke={C} strokeWidth="1.5" />
    <path d="M16 10V14" stroke={C} strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="16" cy="16" r="2" fill={C} stroke="none" />
    <circle cx="10" cy="20" r="2" fill="none" stroke={C} strokeWidth="1.5" />
    <path d="M10 22V26" stroke={C} strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="10" cy="28" r="1" fill={C} stroke="none" />
    <circle cx="22" cy="20" r="2" fill="none" stroke={C} strokeWidth="1.5" />
    <path d="M22 22V26" stroke={C} strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="22" cy="28" r="1" fill={C} stroke="none" />
  </Ico>
);

const tattooBoth = (
  <Ico>
    <path d="M8 6C8 6 6 10 8 14C10 18 8 22 8 22" stroke={C} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <circle cx="12" cy="24" r="1.5" fill={C} stroke="none" />
    <circle cx="22" cy="8" r="2" fill="none" stroke={C} strokeWidth="1.5" />
    <path d="M22 10V14" stroke={C} strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="22" cy="16" r="1.5" fill={C} stroke="none" />
    <path d="M16 4C16 4 14 8 16 12C18 16 16 20 16 20" stroke={C} strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </Ico>
);

// ── Q53 — Hobbies & Interests (category headers) ──────────────────────────────

function IcoSm({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 32 32" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
      {children}
    </svg>
  );
}

const catArtsCreativity = (
  <IcoSm>
    <circle cx="16" cy="20" r="6" fill="none" stroke={C} strokeWidth="1.5" />
    <path d="M12 18C13 17 15 17 16 18C17 17 19 17 20 18" fill="none" stroke={C} strokeWidth="1.2" strokeLinecap="round" />
    <path d="M10 14L8 6" stroke={C} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M22 14L24 6" stroke={C} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M14 14L14 4" stroke={C} strokeWidth="1.5" strokeLinecap="round" />
  </IcoSm>
);

const catSportsFitness = (
  <IcoSm>
    <circle cx="16" cy="16" r="10" fill="none" stroke={C} strokeWidth="1.5" />
    <path d="M6 16H26" stroke={C} strokeWidth="1.2" strokeLinecap="round" />
    <path d="M16 6C12 10 12 22 16 26" fill="none" stroke={C} strokeWidth="1.2" />
    <path d="M16 6C20 10 20 22 16 26" fill="none" stroke={C} strokeWidth="1.2" />
  </IcoSm>
);

const catOutdoorsTravel = (
  <IcoSm>
    <path d="M4 26L16 6L28 26H4Z" fill="none" stroke={C} strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M10 26L16 16L22 26" fill="none" stroke={C} strokeWidth="1.2" strokeLinejoin="round" />
    <circle cx="24" cy="8" r="3" fill="none" stroke={C} strokeWidth="1.2" />
  </IcoSm>
);

const catFoodLifestyle = (
  <IcoSm>
    <circle cx="16" cy="18" r="8" fill="none" stroke={C} strokeWidth="1.5" />
    <path d="M12 18H20" stroke={C} strokeWidth="1.2" strokeLinecap="round" />
    <path d="M16 14V22" stroke={C} strokeWidth="1.2" strokeLinecap="round" />
    <path d="M8 10L24 10" stroke={C} strokeWidth="1.5" strokeLinecap="round" />
  </IcoSm>
);

const catTechGaming = (
  <IcoSm>
    <rect x="4" y="6" width="24" height="16" rx="2" fill="none" stroke={C} strokeWidth="1.5" />
    <path d="M4 18H28" stroke={C} strokeWidth="1.2" />
    <path d="M12 26H20" stroke={C} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M16 22V26" stroke={C} strokeWidth="1.5" strokeLinecap="round" />
  </IcoSm>
);

const catReadingLearning = (
  <IcoSm>
    <path d="M4 6V24L16 20L28 24V6L16 10L4 6Z" fill="none" stroke={C} strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M16 10V20" stroke={C} strokeWidth="1.2" />
  </IcoSm>
);

const catSocialCommunity = (
  <IcoSm>
    <circle cx="12" cy="12" r="4" fill="none" stroke={C} strokeWidth="1.5" />
    <circle cx="22" cy="12" r="4" fill="none" stroke={C} strokeWidth="1.5" />
    <path d="M6 26C6 22 8 20 12 20C14 20 15 20.5 16 21.5" fill="none" stroke={C} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M26 26C26 22 24 20 22 20C20 20 19 20.5 18 21.5" fill="none" stroke={C} strokeWidth="1.5" strokeLinecap="round" />
  </IcoSm>
);

const catEntertainment = (
  <IcoSm>
    <rect x="4" y="4" width="10" height="8" rx="1" fill="none" stroke={C} strokeWidth="1.5" />
    <rect x="4" y="4" width="10" height="8" rx="1" fill="none" stroke={C} strokeWidth="1.5" transform="translate(2 2)" />
    <path d="M14 20L20 16L14 12V20Z" fill="none" stroke={C} strokeWidth="1.5" strokeLinejoin="round" />
    <circle cx="18" cy="22" r="6" fill="none" stroke={C} strokeWidth="1.5" />
  </IcoSm>
);

const catCraftsCollecting = (
  <IcoSm>
    <path d="M14 4L4 20" stroke={C} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M18 4L28 20" stroke={C} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M16 10L10 28" stroke={C} strokeWidth="1.2" strokeLinecap="round" />
    <path d="M16 10L22 28" stroke={C} strokeWidth="1.2" strokeLinecap="round" />
  </IcoSm>
);

// ── Q93 — Partner qualities (category headers) ────────────────────────────────

const catCharacterValues = (
  <IcoSm>
    <path d="M16 28L6 18C2 14 2 8 8 6C11 5 14 6 16 9C18 6 21 5 24 6C30 8 30 14 26 18L16 28Z" fill="none" stroke={C} strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M16 14V22" stroke={C} strokeWidth="1.2" strokeLinecap="round" />
    <path d="M12 18H20" stroke={C} strokeWidth="1.2" strokeLinecap="round" />
  </IcoSm>
);

const catPersonality = (
  <IcoSm>
    <path d="M16 4L18.5 11.5H26L20 16L22.5 24L16 19.5L9.5 24L12 16L6 11.5H13.5L16 4Z" fill="none" stroke={C} strokeWidth="1.5" strokeLinejoin="round" />
  </IcoSm>
);

const catRelationshipStyle = (
  <IcoSm>
    <path d="M10 22L4 16C2 14 2 10 5 8C7 7 9 7.5 10 9C11 7.5 13 7 15 8C18 10 18 14 16 16L10 22Z" fill="none" stroke={C} strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M22 22L16 16C14 14 14 10 17 8C19 7 21 7.5 22 9C23 7.5 25 7 27 8C30 10 30 14 28 16L22 22Z" fill="none" stroke={C} strokeWidth="1.5" strokeLinejoin="round" />
  </IcoSm>
);

const catFamilyHome = (
  <IcoSm>
    <path d="M4 16L16 6L28 16" fill="none" stroke={C} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 14V26H25V14" fill="none" stroke={C} strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M13 26V20H19V26" stroke={C} strokeWidth="1.5" strokeLinejoin="round" />
  </IcoSm>
);

const catCareerAmbition = (
  <IcoSm>
    <path d="M4 26L10 16L18 20L28 6" fill="none" stroke={C} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M22 6H28V12" stroke={C} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </IcoSm>
);

const catSocialCultural = (
  <IcoSm>
    <circle cx="16" cy="16" r="10" fill="none" stroke={C} strokeWidth="1.5" />
    <path d="M6 12H26" stroke={C} strokeWidth="1.2" strokeLinecap="round" />
    <path d="M6 20H26" stroke={C} strokeWidth="1.2" strokeLinecap="round" />
    <path d="M16 6C12 10 12 22 16 26" fill="none" stroke={C} strokeWidth="1.2" />
    <path d="M16 6C20 10 20 22 16 26" fill="none" stroke={C} strokeWidth="1.2" />
  </IcoSm>
);

// ── "Other" / "Add" icon ───────────────────────────────────────────────────────

const iconPlus = (
  <IcoSm>
    <circle cx="16" cy="16" r="10" fill="none" stroke={C} strokeWidth="1.5" />
    <path d="M11 16H21M16 11V21" stroke={C} strokeWidth="1.5" strokeLinecap="round" />
  </IcoSm>
);

// ── Registry ───────────────────────────────────────────────────────────────────

/**
 * Maps `optionValue` → SVG ReactNode for all illustrated_mc questions.
 * Used by IllustratedMCInput to render line icons instead of emojis.
 */
export const LINE_ICONS: Record<string, ReactNode> = {
  // Q42 — Skin tone
  fair: skinFair,
  wheatish: skinWheatish,
  dusky: skinDusky,
  dark: skinDark,

  // Q43 — Diet
  vegetarian: dietVegetarian,
  non_vegetarian: dietNonVeg,
  eggetarian: dietEggetarian,
  vegan: dietVegan,
  jain: dietJain,
  // 'other' is shared across questions so we scope it below

  // Q44 — Everyday attire
  modern_western: attireWestern,
  traditional: attireTraditional,
  mix: attireMix,
  no_preference: attireNoPref,

  // Q45 — Fitness habits
  regularly_exercises: fitnessRegular,
  occasionally: smokingOccasionally, // placeholder — see scoped registry below
  rarely: fitnessOccasional,
  not_interested: fitnessNotActive,

  // Q48 — Tattoos or piercings
  none: tattooNone,
  tattoos_only: tattooOnly,
  piercings_only: piercingOnly,
  both: tattooBoth,
};

/**
 * Question-scoped icon lookup for values that repeat across questions
 * (e.g., "never", "occasionally", "frequently" appear in Q45, Q46, Q47).
 *
 * Lookup priority: SCOPED_ICONS[questionId][value] → LINE_ICONS[value]
 */
export const SCOPED_ICONS: Record<string, Record<string, ReactNode>> = {
  Q43: {
    other: dietOther,
  },
  Q45: {
    regularly_exercises: fitnessRegular,
    occasionally: fitnessModerate,
    rarely: fitnessOccasional,
    not_interested: fitnessNotActive,
  },
  Q46: {
    never: smokingNever,
    occasionally: smokingOccasionally,
    frequently: smokingFrequently,
  },
  Q47: {
    never: drinkingNever,
    occasionally: drinkingSocially,
    frequently: drinkingRegularly,
  },
};

/**
 * Maps category group `key` → SVG ReactNode for optionGroup headers.
 * Used by GroupedMultiSelectInput to render line icons instead of emojis.
 */
export const CATEGORY_ICONS: Record<string, ReactNode> = {
  // Q53 — Hobbies & Interests
  arts_creativity: catArtsCreativity,
  sports_fitness: catSportsFitness,
  outdoors_travel: catOutdoorsTravel,
  food_lifestyle: catFoodLifestyle,
  tech_gaming: catTechGaming,
  reading_learning: catReadingLearning,
  social_community: catSocialCommunity,
  entertainment: catEntertainment,
  crafts_collecting: catCraftsCollecting,

  // Q93 — Partner qualities
  character_values: catCharacterValues,
  personality: catPersonality,
  relationship_style: catRelationshipStyle,
  family_home: catFamilyHome,
  career_ambition: catCareerAmbition,
  social_cultural: catSocialCultural,
};

/** Line icon for the standalone "Other" / "Add" option */
export const ICON_PLUS = iconPlus;

/**
 * Get the line icon for a given question + option value.
 * Returns undefined if no icon exists (component should fall back to emoji).
 */
export function getLineIcon(questionId: string, optionValue: string): ReactNode | undefined {
  return SCOPED_ICONS[questionId]?.[optionValue] ?? LINE_ICONS[optionValue];
}

/**
 * Get the line icon for a category group header.
 * Returns undefined if no icon exists (component should fall back to emoji).
 */
export function getCategoryIcon(groupKey: string): ReactNode | undefined {
  return CATEGORY_ICONS[groupKey];
}
