'use client';

import { capitalize } from '@/lib/utils';

interface SpecialtyEntry {
  specialty: string;
  count: number;
}

interface SpecialtyDistributionProps {
  data: SpecialtyEntry[];
}

export function SpecialtyDistribution({ data }: SpecialtyDistributionProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Specialty Distribution</h2>
      <p className="mt-1 text-sm text-gray-500">Medical specialties of applicants.</p>

      {data.length === 0 ? (
        <p className="mt-4 text-sm text-gray-400">No specialty data available yet.</p>
      ) : (
        <div className="mt-4">
          <table className="w-full text-sm">
            <thead className="admin-table-thead">
              <tr>
                <th scope="col" className="w-6 text-left">#</th>
                <th scope="col" className="text-left">Specialty</th>
                <th scope="col" className="text-right">Count</th>
                <th scope="col" className="w-40 pl-4 text-left"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.map((entry, i) => (
                <tr key={i} className="transition-colors hover:bg-gray-50">
                  <td className="py-2 text-[10px] tabular-nums text-gray-400">{i + 1}</td>
                  <td className="py-2 text-gray-900">{capitalize(entry.specialty)}</td>
                  <td className="py-2 text-right font-medium text-gray-900">{entry.count}</td>
                  <td className="py-2 pl-4">
                    <div className="h-1.5 w-full rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-[#4F6EF7]"
                        style={{ width: `${(entry.count / maxCount) * 100}%` }}
                      />
                    </div>
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
