'use client';

interface MatchRationaleProps {
  narrative: string;
  highlights: string[];
  score: number;
}

export function MatchRationale({ narrative, highlights, score }: MatchRationaleProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-900">
          Why We Think This Could Work
        </h4>
        <span className="rounded-full bg-samvaya-gold px-3 py-1 text-sm font-bold text-samvaya-charcoal shadow-sm">
          {score}% match
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-gray-600">{narrative}</p>

      {highlights.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {highlights.map((h, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
              <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {h}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
