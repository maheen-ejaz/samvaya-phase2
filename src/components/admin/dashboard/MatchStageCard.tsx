interface MatchStageCardProps {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
  bgColor: string;
  borderColor: string;
}

export function MatchStageCard({ label, count, isActive, onClick, bgColor, borderColor }: MatchStageCardProps) {
  return (
    <button
      onClick={onClick}
      className={`relative block w-full rounded-xl border p-5 text-left transition-all hover:shadow-md hover:-translate-y-0.5 ${bgColor} ${borderColor} ${
        isActive ? 'ring-2 ring-admin-blue-700/30 shadow-md' : ''
      }`}
    >
      {/* Label */}
      <p className="text-lg font-medium text-gray-900">{label}</p>

      {/* Dash separator */}
      <p className="mt-1 text-[11px] text-gray-400">&mdash;</p>

      {/* Count */}
      <p className="mt-3 type-display-sm type-stat text-gray-900">
        {count.toLocaleString('en-IN')}
      </p>
    </button>
  );
}
