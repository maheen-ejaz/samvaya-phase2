'use client';

interface LifeSnapshotProps {
  profile: {
    marriageTimeline: string | null;
    childrenPreference: string | null;
    settlementPreference: string | null;
    diet: string | null;
    smoking: string | null;
    drinking: string | null;
    exerciseFrequency: string | null;
    livingArrangement: string | null;
  };
}

function formatLabel(value: string | null): string {
  if (!value) return 'Not specified';
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function LifeSnapshot({ profile }: LifeSnapshotProps) {
  const items = [
    { label: 'Marriage Timeline', value: profile.marriageTimeline },
    { label: 'Children', value: profile.childrenPreference },
    { label: 'Settlement', value: profile.settlementPreference },
    { label: 'Diet', value: profile.diet },
    { label: 'Smoking', value: profile.smoking },
    { label: 'Drinking', value: profile.drinking },
    { label: 'Exercise', value: profile.exerciseFrequency },
    { label: 'Living Arrangement', value: profile.livingArrangement },
  ].filter((item) => item.value);

  if (items.length === 0) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h4 className="text-sm font-semibold text-gray-900">Life Snapshot</h4>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div key={item.label}>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              {item.label}
            </p>
            <p className="mt-0.5 text-sm text-gray-700">
              {formatLabel(item.value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
