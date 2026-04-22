import 'server-only';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Check if a string is a valid UUID.
 */
export function isValidUUID(value: string): boolean {
  return UUID_REGEX.test(value);
}

/**
 * Validate a string field. Returns error message or null if valid.
 */
export function validateString(
  value: unknown,
  field: string,
  opts: { minLength?: number; maxLength?: number; required?: boolean } = {}
): string | null {
  const { minLength, maxLength, required } = opts;

  if (value === undefined || value === null || value === '') {
    return required ? `${field} is required` : null;
  }

  if (typeof value !== 'string') {
    return `${field} must be a string`;
  }

  if (minLength !== undefined && value.length < minLength) {
    return `${field} must be at least ${minLength} characters`;
  }

  if (maxLength !== undefined && value.length > maxLength) {
    return `${field} must be at most ${maxLength} characters`;
  }

  return null;
}

/**
 * Validate that a value is one of the allowed enum values. Returns error message or null.
 */
export function validateEnum(
  value: unknown,
  field: string,
  allowed: readonly string[]
): string | null {
  if (typeof value !== 'string' || !allowed.includes(value)) {
    return `${field} must be one of: ${allowed.join(', ')}`;
  }
  return null;
}

/**
 * Validate an ISO 8601 date string. Returns true if valid.
 */
export function validateDateString(value: string): boolean {
  const date = new Date(value);
  return !isNaN(date.getTime());
}

/**
 * Trim and collapse whitespace in a string.
 */
export function sanitizeString(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}
