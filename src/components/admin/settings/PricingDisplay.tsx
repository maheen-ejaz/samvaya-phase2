'use client';

interface PricingDisplayProps {
  verificationFee: { amount: number; gst_pct: number; total: number; currency: string } | null;
  membershipFee: { amount: number; gst_pct: number; total: number; currency: string } | null;
}

function formatPaise(paise: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

export function PricingDisplay({ verificationFee, membershipFee }: PricingDisplayProps) {
  const fees = [
    { label: 'Verification Fee', data: verificationFee, description: 'One-time, non-refundable. Covers 13-check OnGrid BGV.' },
    { label: 'Membership Fee', data: membershipFee, description: 'Charged on mutual interest. 6-month active membership.' },
  ];

  return (
    <div className="rounded-xl border border-gray-200/60 bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Pricing</h2>
        <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
          Locked
        </span>
      </div>
      <p className="mt-1 text-sm text-gray-500">
        Pricing is locked and cannot be changed through the admin interface.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fees.map(({ label, data, description }) => (
          <div
            key={label}
            className="rounded-xl border border-gray-200/60 bg-gray-50 p-4"
          >
            <p className="text-sm font-medium text-gray-500">{label}</p>
            {data ? (
              <>
                <p className="mt-1 type-display-sm type-stat text-gray-900">
                  {formatPaise(data.total)}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {formatPaise(data.amount)} + {data.gst_pct}% GST
                </p>
              </>
            ) : (
              <p className="mt-1 text-sm text-gray-400">Not configured</p>
            )}
            <p className="mt-2 text-xs text-gray-400">{description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
