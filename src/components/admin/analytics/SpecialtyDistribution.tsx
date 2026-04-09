'use client';

import { useState } from 'react';
import { capitalize } from '@/lib/utils';

interface SpecialtyEntry {
  specialty: string;
  count: number;
}

interface SpecialtyDistributionProps {
  data: SpecialtyEntry[];
}

// Blue gradient: darkest for rank 1, progressively lighter
const BAR_COLORS = [
  'bg-[#1E3A8A]',
  'bg-[#2563EB]',
  'bg-[#4F6EF7]',
  'bg-[#6B8AF9]',
  'bg-[#A5B4FC]',
  'bg-[#C7D2FE]',
];

export function SpecialtyDistribution({ data }: SpecialtyDistributionProps) {
  const [expanded, setExpanded] = useState(false);
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const visibleData = expanded ? data : data.slice(0, 5);

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Specialty Distribution</h2>
      <p className="mt-1 text-sm text-gray-500">Medical specialties of applicants.</p>

      {data.length === 0 ? (
        <p className="mt-4 text-sm text-gray-400">No specialty data available yet.</p>
      ) : (
        <>
          <div className="mt-6 space-y-3">
            {visibleData.map((entry, i) => {
              const color = BAR_COLORS[Math.min(i, BAR_COLORS.length - 1)];
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-32 flex-shrink-0 truncate text-sm font-medium text-gray-900">
                    {capitalize(entry.specialty)}
                  </span>
                  <div className="flex-1 overflow-hidden rounded-full bg-gray-100 h-6">
                    <div
                      className={`h-full rounded-full ${color} flex items-center justify-end pr-3 transition-all`}
                      style={{ width: `${Math.max((entry.count / maxCount) * 100, 5)}%` }}
                    >
                      {(entry.count / maxCount) * 100 > 15 && (
                        <span className="text-xs font-semibold text-white tabular-nums">
                          {entry.count}
                        </span>
                      )}
                    </div>
                  </div>
                  {(entry.count / maxCount) * 100 <= 15 && (
                    <span className="w-10 flex-shrink-0 text-right text-sm font-medium text-gray-700">
                      {entry.count}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          {data.length > 5 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-4 text-xs font-medium text-admin-blue-700 hover:underline"
            >
              {expanded ? 'Show less' : `Show all ${data.length} specialties`}
            </button>
          )}
        </>
      )}
    </div>
  );
}
