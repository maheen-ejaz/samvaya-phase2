/**
 * ApplicantStatusIcons — small inline icon badges rendered next to applicant names.
 *
 * ⭐ Violet star  = GooCampus member (verification fee waived)
 * 🛡 Green shield = Verified & in pool (fee paid + BGV cleared, or any status beyond)
 *
 * Both can appear side by side. Icons carry a title tooltip for admin clarity.
 */

/** Statuses that qualify as "verified & in pool" for the shield badge. */
const VERIFIED_STATUSES = new Set([
  'in_pool',
  'match_presented',
  'awaiting_payment',
  'active_member',
]);

interface ApplicantStatusIconsProps {
  isGooCampusMember: boolean;
  paymentStatus: string | null | undefined;
  /** Icon size in px. Defaults to 14 for table rows; use 16 for larger contexts. */
  size?: number;
}

export function ApplicantStatusIcons({
  isGooCampusMember,
  paymentStatus,
  size = 14,
}: ApplicantStatusIconsProps) {
  const isVerified = paymentStatus ? VERIFIED_STATUSES.has(paymentStatus) : false;

  if (!isGooCampusMember && !isVerified) return null;

  return (
    <span className="inline-flex items-center gap-0.5 align-middle">
      {isGooCampusMember && (
        <span title="GooCampus member — verification fee waived">
          <StarIcon size={size} />
        </span>
      )}
      {isVerified && (
        <span title="Verified — fee paid & BGV cleared, actively in pool">
          <ShieldIcon size={size} />
        </span>
      )}
    </span>
  );
}

function StarIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M8 1.5l1.764 3.576 3.945.574-2.855 2.781.674 3.928L8 10.5l-3.528 1.859.674-3.928L2.291 5.65l3.945-.574L8 1.5z"
        fill="#7c3aed"
      />
    </svg>
  );
}

function ShieldIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M8 1.5L2.5 4v4c0 3.05 2.314 5.9 5.5 6.5C11.186 13.9 13.5 11.05 13.5 8V4L8 1.5z"
        fill="#16a34a"
      />
      <path
        d="M5.5 8l1.5 1.5 3-3"
        stroke="#ffffff"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
