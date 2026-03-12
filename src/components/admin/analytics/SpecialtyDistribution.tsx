'use client';

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
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-gray-900">Specialty Distribution</h2>
      <p className="mt-1 text-sm text-gray-500">Medical specialties of applicants.</p>

      {data.length === 0 ? (
        <p className="mt-4 text-sm text-gray-400">No specialty data available yet.</p>
      ) : (
        <div className="mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th scope="col" className="pb-2 text-left font-medium text-gray-500">Specialty</th>
                <th scope="col" className="pb-2 text-right font-medium text-gray-500">Count</th>
                <th scope="col" className="pb-2 pl-4 text-left font-medium text-gray-500 w-40"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.map((entry, i) => (
                <tr key={i}>
                  <td className="py-2 text-gray-900">{entry.specialty}</td>
                  <td className="py-2 text-right font-medium text-gray-900">{entry.count}</td>
                  <td className="py-2 pl-4">
                    <div className="h-4 w-full rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-rose-400"
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
