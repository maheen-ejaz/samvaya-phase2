export default function AnalyticsLoading() {
  return (
    <div role="status" aria-label="Loading analytics">
      <div className="mb-6">
        <div className="h-8 w-36 animate-pulse rounded bg-gray-200" />
      </div>

      {/* Metric cards row */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
            <div className="mt-3 h-7 w-16 animate-pulse rounded bg-gray-200" />
            <div className="mt-2 h-3 w-24 animate-pulse rounded bg-gray-100" />
          </div>
        ))}
      </div>

      {/* Chart areas */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="mb-4 h-5 w-36 animate-pulse rounded bg-gray-200" />
            <div className="h-48 animate-pulse rounded bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
