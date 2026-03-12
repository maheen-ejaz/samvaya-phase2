/**
 * Calculate age from date of birth string.
 * Returns null if dob is missing or invalid.
 */
export function calculateAge(dob: string | null | undefined): number | null {
  if (!dob) return null;
  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

/**
 * Format height from cm to feet/inches string.
 * Returns null if cm is missing, zero, or invalid.
 */
export function formatHeight(cm: number | null | undefined): string | null {
  if (!cm || cm <= 0) return null;
  const feet = Math.floor(cm / 30.48);
  const inches = Math.round((cm % 30.48) / 2.54);
  return `${feet}'${inches}" (${cm} cm)`;
}

/**
 * Format height short form (no cm) for compact displays.
 */
export function formatHeightShort(cm: number | null | undefined): string | null {
  if (!cm || cm <= 0) return null;
  const feet = Math.floor(cm / 30.48);
  const inches = Math.round((cm % 30.48) / 2.54);
  return `${feet}'${inches}"`;
}

/**
 * Format enum-style values for display (replace underscores, title case).
 */
export function formatEnumValue(v: unknown): string | null {
  if (v == null) return null;
  return String(v).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
