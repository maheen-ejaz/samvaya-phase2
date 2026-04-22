'use client';

interface InterestsSectionProps {
  hobbies: string[];
}

const HOBBY_COLORS = [
  'bg-blue-50 text-blue-700',
  'bg-green-50 text-green-700',
  'bg-purple-50 text-purple-700',
  'bg-amber-50 text-amber-700',
  'bg-pink-50 text-pink-700',
  'bg-teal-50 text-teal-700',
  'bg-indigo-50 text-indigo-700',
  'bg-orange-50 text-orange-700',
];

export function InterestsSection({ hobbies }: InterestsSectionProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h4 className="text-sm font-semibold text-gray-900">Interests</h4>
      <div className="mt-3 flex flex-wrap gap-2">
        {hobbies.map((hobby, i) => (
          <span
            key={hobby}
            className={`rounded-full px-3 py-1 text-xs font-medium ${HOBBY_COLORS[i % HOBBY_COLORS.length]}`}
          >
            {hobby}
          </span>
        ))}
      </div>
    </div>
  );
}
