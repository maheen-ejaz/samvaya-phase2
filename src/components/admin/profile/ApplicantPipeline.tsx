interface ApplicantPipelineProps {
  paymentStatus: string;
  membershipStatus: string;
}

const STAGES = [
  { key: 'signed_up',          label: 'Signed Up' },
  { key: 'form_complete',      label: 'Form Done' },
  { key: 'fee_paid',           label: 'Fee Paid' },
  { key: 'in_pool',            label: 'In Pool' },
  { key: 'match_presented',    label: 'Matched' },
  { key: 'active_member',      label: 'Member' },
  { key: 'membership_expired', label: 'Expired' },
] as const;

function paymentStatusToStep(paymentStatus: string, membershipStatus: string): number {
  if (paymentStatus === 'membership_expired') return 6;
  if (paymentStatus === 'active_member') return 5;
  if (paymentStatus === 'awaiting_payment' || paymentStatus === 'match_presented') return 4;
  if (paymentStatus === 'in_pool') return 3;
  if (paymentStatus === 'verification_pending') return 2;
  if (membershipStatus === 'onboarding_complete' || membershipStatus === 'active') return 1;
  return 0;
}

export function ApplicantPipeline({ paymentStatus, membershipStatus }: ApplicantPipelineProps) {
  const currentStep = paymentStatusToStep(paymentStatus, membershipStatus);
  const isExpired = paymentStatus === 'membership_expired';

  return (
    <div className="flex w-full flex-col gap-1.5">
      {/* Bar segments */}
      <div className="flex items-center gap-1">
        {STAGES.map((stage, i) => {
          const isActive = i <= currentStep;
          const isCurrent = i === currentStep;

          let fill: string;
          if (isActive && isExpired) {
            // Expired state — red stripes
            fill = 'repeating-linear-gradient(-45deg, #F87171, #F87171 3px, #FCA5A5 3px, #FCA5A5 6px)';
          } else if (isActive) {
            // Completed / current — green stripes
            fill = 'repeating-linear-gradient(-45deg, #66BB6A, #66BB6A 3px, #81C784 3px, #81C784 6px)';
          } else {
            // Future — gray stripes
            fill = 'repeating-linear-gradient(-45deg, #E5E7EB, #E5E7EB 3px, #F3F4F6 3px, #F3F4F6 6px)';
          }

          return (
            <div key={stage.key} className="relative h-3 flex-1 overflow-hidden rounded-full">
              <div className="absolute inset-0" style={{ background: fill }} />
              {/* Needle marker on current stage */}
              {isCurrent && (
                <div className="absolute -bottom-1.5 right-0 flex flex-col items-center">
                  <div className="h-3 w-0.5 bg-gray-900" />
                  <div className="h-1.5 w-1.5 rounded-full bg-gray-900" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Labels */}
      <div className="flex">
        {STAGES.map((stage, i) => (
          <span
            key={stage.key}
            className={[
              'flex-1 text-[11px]',
              i <= currentStep ? 'font-medium text-gray-700' : 'text-gray-400',
              i === 0 ? 'text-left' : i === STAGES.length - 1 ? 'text-right' : 'text-center',
            ].join(' ')}
          >
            {stage.label}
          </span>
        ))}
      </div>
    </div>
  );
}
