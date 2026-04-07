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
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-2 text-left font-medium text-gray-500">Stage Transition</th>
                <th className="pb-2 text-right font-medium text-gray-500">Avg. Days</th>
                <th className="pb-2 text-right font-medium text-gray-500">Sample</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.map((entry) => (
                <tr key={entry.stage}>
                  <td className="py-2 text-gray-900">{entry.stage}</td>
                  <td className="py-2 text-right font-medium text-gray-900">
                    {entry.avg_days !== null ? `${entry.avg_days} days` : '—'}
                  </td>
                  <td className="py-2 text-right text-gray-500">
                    {entry.sample_size > 0 ? `${entry.sample_size} applicant${entry.sample_size !== 1 ? 's' : ''}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
