/**
 * Centralized pricing constants.
 * These values are locked and must never change without explicit founder instruction.
 * See CLAUDE.md "Rules That Must Never Be Broken" for context.
 */
export const PRICING = {
  VERIFICATION_FEE_DISPLAY: '₹4,130',
  VERIFICATION_FEE_PAISE: 413000,
  VERIFICATION_BASE: '₹3,500',
  MEMBERSHIP_FEE_DISPLAY: '₹41,300',
  MEMBERSHIP_FEE_PAISE: 4130000,
  MEMBERSHIP_BASE: '₹35,000',
  GST_RATE: '18%',
} as const;
