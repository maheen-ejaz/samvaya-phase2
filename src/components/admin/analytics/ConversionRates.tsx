'use client';

interface Conversion {
  from: string;
  to: string;
  rate: number;
  fromCount?: number;
  toCount?: number;
}

interface ConversionRatesProps {
  data: Conversion[];
}

export function ConversionRates({ data }: ConversionRatesProps) {
  if (data.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-gray-900">Conversion Rates</h2>
      <p className="mt-1 text-sm text-gray-500">Stage-to-stage conversion percentages.</p>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {data.map((c) => (
          <div
            key={`${c.from}-${c.to}`}
            className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-center"
          >
            <p className="text-2xl font-bold text-gray-900">{Math.min(c.rate, 100)}%</p>
            {c.fromCount !== undefined && c.toCount !== undefined && (
              <p className="mt-0.5 text-xs text-gray-400">
                {c.toCount} of {c.fromCount}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {c.from} → {c.to}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
