interface MatchStageCardProps {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
  colorClass: string;
}

export function MatchStageCard({ label, count, isActive, onClick, colorClass }: MatchStageCardProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-lg border-2 px-4 py-3 text-left transition-all ${
        isActive
          ? `${colorClass} border-current shadow-sm`
          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
      }`}
    >
      <p className="text-2xl font-semibold">{count}</p>
      <p className="mt-0.5 text-xs font-medium">{label}</p>
    </button>
  );
}
