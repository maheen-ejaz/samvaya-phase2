export const NO_PREFERENCE_VALUE = 'no_preference';

/**
 * Returns the next selection list when `toggled` is clicked from a multi-select
 * that may contain a "No Preference" option. Picking "No Preference" clears all
 * other selections; picking any other option clears "No Preference".
 */
export function applyNoPreferenceToggle(current: string[], toggled: string): string[] {
  if (toggled === NO_PREFERENCE_VALUE) {
    if (current.includes(NO_PREFERENCE_VALUE)) return [];
    return [NO_PREFERENCE_VALUE];
  }
  const withoutNoPref = current.filter((v) => v !== NO_PREFERENCE_VALUE);
  if (withoutNoPref.includes(toggled)) {
    return withoutNoPref.filter((v) => v !== toggled);
  }
  return [...withoutNoPref, toggled];
}
