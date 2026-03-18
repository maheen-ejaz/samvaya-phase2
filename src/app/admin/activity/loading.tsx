export default function ActivityLoading() {
  return (
    <div role="status" aria-label="Loading activity log">
      <div className="mb-6">
        <div className="h-8 w-40 animate-pulse rounded bg-gray-200" />
      </div>

      {/* Filter bar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="h-10 w-40 animate-pulse rounded-lg bg-gray-200" />
        <div className="h-10 w-36 animate-pulse rounded-lg bg-gray-200" />
        <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-200" />
      </div>

      {/* Log entries */}
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4">
            <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
            <div className="flex-1">
              <div className="h-4 w-72 animate-pulse rounded bg-gray-200" />
              <div className="mt-2 h-3 w-40 animate-pulse rounded bg-gray-100" />
            </div>
            <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
