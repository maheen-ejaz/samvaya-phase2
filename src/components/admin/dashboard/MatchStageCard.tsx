import { NotchCutout, BTN_SIZE, NOTCH_GAP } from './PipelineStrip';

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
    <div className="relative flex-1">
      <button
        onClick={onClick}
        className={`relative block h-full w-full rounded-xl rounded-br-none border p-5 pb-6 text-left transition-all hover:shadow-md hover:-translate-y-0.5 ${bgColor} ${borderColor} ${
          isActive ? 'ring-2 ring-admin-green-700/30 shadow-md' : ''
        }`}
      >
        {/* Label */}
        <p className="text-lg font-medium text-gray-900">{label}</p>

        {/* Dash separator */}
        <p className="mt-1 text-[11px] text-gray-400">&mdash;</p>

        {/* Count */}
        <p className="mt-3 text-3xl font-bold text-gray-900">
          {count.toLocaleString('en-IN')}
        </p>
      </button>

      {/* Concave notch cutout */}
      <NotchCutout />

      {/* Arrow icon — decorative, sits in the notch */}
      <div
        className="pointer-events-none absolute z-20 flex items-center justify-center rounded-full bg-admin-green-900 text-white shadow-md"
        style={{
          width: `${BTN_SIZE}px`,
          height: `${BTN_SIZE}px`,
          bottom: `${NOTCH_GAP}px`,
          right: `${NOTCH_GAP}px`,
        }}
        aria-hidden="true"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M5 11L11 5M11 5H6M11 5V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
