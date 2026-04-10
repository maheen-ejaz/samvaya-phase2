'use client';

interface StageTiming {
  stage: string;
  avg_days: number | null;
  sample_size: number;
}

interface StageTimingTableProps {
  data: StageTiming[];
}

export function StageTimingTable({ data }: StageTimingTableProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Average Stage Duration</h2>
      <p className="mt-1 text-sm text-gray-500">Average time applicants spend between stages.</p>

      {data.every((d) => d.sample_size === 0) ? (
        <p className="mt-4 text-sm text-gray-400">No timing data available yet.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {(() => {
            const maxDays = Math.max(...data.map((d) => d.avg_days ?? 0), 1);
            return data.map((entry) => {
              const days = entry.avg_days;
              const barColor =
                days === null
                  ? ''
                  : days <= 3
                    ? 'bg-[#4F6EF7]'
                    : days <= 7
                      ? 'bg-amber-400'
                      : 'bg-red-400';
              const barWidth = days !== null ? Math.max((days / maxDays) * 100, 5) : 0;
              return (
                <div key={entry.stage}>
                  <div className="flex items-center gap-3">
                    <span className="w-40 flex-shrink-0 truncate text-sm font-medium text-gray-900">
                      {entry.stage}
                    </span>
                    {days !== null && (
                      <div className="flex-1 overflow-hidden rounded-full bg-gray-100 h-6">
                        <div
                          className={`h-full rounded-full ${barColor} flex items-center justify-end pr-3 transition-all`}
                          style={{ width: `${barWidth}%` }}
                        >
                          {barWidth > 20 && (
                            <span className="text-xs font-semibold text-white tabular-nums">
                              {days} {days === 1 ? 'day' : 'days'}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    {days !== null && barWidth <= 20 && (
                      <span className="w-16 flex-shrink-0 text-right text-sm font-medium text-gray-700">
                        {days} {days === 1 ? 'day' : 'days'}
                      </span>
                    )}
                  </div>
                  {entry.sample_size > 0 && (
                    <p className="mt-1 ml-40 text-xs text-gray-400">
                      {entry.sample_size} applicant{entry.sample_size !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              );
            });
          })()}
        </div>
      )}
    </div>
  );
}
