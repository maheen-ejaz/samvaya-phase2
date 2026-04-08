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
        <div className="mt-4">
          <table className="w-full text-sm">
            <thead className="admin-table-thead">
              <tr>
                <th className="text-left">Stage Transition</th>
                <th className="text-right">Avg. Days</th>
                <th className="text-right">Sample</th>
                <th className="w-40 pl-4 text-left"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
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
                  return (
                    <tr key={entry.stage} className="transition-colors hover:bg-gray-50">
                      <td className="py-2 text-gray-900">{entry.stage}</td>
                      <td className="py-2 text-right font-medium text-gray-900">
                        {days !== null ? `${days} days` : '—'}
                      </td>
                      <td className="py-2 text-right text-gray-500">
                        {entry.sample_size > 0
                          ? `${entry.sample_size} applicant${entry.sample_size !== 1 ? 's' : ''}`
                          : '—'}
                      </td>
                      <td className="py-2 pl-4">
                        {days !== null && (
                          <div className="h-1.5 w-full rounded-full bg-gray-100">
                            <div
                              className={`h-full rounded-full ${barColor}`}
                              style={{ width: `${(days / maxDays) * 100}%` }}
                            />
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
