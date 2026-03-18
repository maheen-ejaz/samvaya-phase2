export default function MatchingLoading() {
  return (
    <div role="status" aria-label="Loading matching pipeline">
      <div className="mb-6">
        <div className="h-8 w-52 animate-pulse rounded bg-gray-200" />
      </div>

      {/* Pipeline controls skeleton */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
        <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
        <div className="mt-3 flex gap-3">
          <div className="h-10 w-32 animate-pulse rounded-md bg-gray-200" />
          <div className="h-10 w-36 animate-pulse rounded-md bg-gray-200" />
        </div>
      </div>

      {/* Filter bar */}
      <div className="mb-6 flex items-center gap-4">
        <div className="h-4 w-12 animate-pulse rounded bg-gray-200" />
        <div className="h-9 w-40 animate-pulse rounded-md bg-gray-200" />
        <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
      </div>

      {/* Suggestion cards */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="h-5 w-48 animate-pulse rounded bg-gray-200" />
                <div className="mt-2 h-4 w-32 animate-pulse rounded bg-gray-100" />
              </div>
              <div className="h-6 w-16 animate-pulse rounded-full bg-gray-100" />
            </div>
            <div className="mt-4 flex gap-3">
              <div className="h-9 w-24 animate-pulse rounded-md bg-gray-200" />
              <div className="h-9 w-24 animate-pulse rounded-md bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
