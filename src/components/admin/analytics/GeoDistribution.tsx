'use client';

interface GeoEntry {
  state: string;
  city: string;
  count: number;
}

interface GeoDistributionProps {
  data: GeoEntry[];
}

export function GeoDistribution({ data }: GeoDistributionProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Geographic Distribution</h2>
      <p className="mt-1 text-sm text-gray-500">Top 20 locations by applicant count.</p>

      {data.length === 0 ? (
        <p className="mt-4 text-sm text-gray-400">No geographic data available yet.</p>
      ) : (
        <div className="mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th scope="col" className="pb-2 text-left font-medium text-gray-500">City</th>
                <th scope="col" className="pb-2 text-left font-medium text-gray-500">State</th>
                <th scope="col" className="pb-2 text-right font-medium text-gray-500">Count</th>
                <th scope="col" className="pb-2 pl-4 text-left font-medium text-gray-500 w-40"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.map((entry, i) => (
                <tr key={i}>
                  <td className="py-2 text-gray-900">{entry.city}</td>
                  <td className="py-2 text-gray-500">{entry.state}</td>
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
