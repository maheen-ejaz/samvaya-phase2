export default function ApplicantsLoading() {
  return (
    <div role="status" aria-label="Loading applicants">
      <div className="mb-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="mt-2 h-4 w-32 animate-pulse rounded bg-gray-100" />
      </div>

      {/* Search + Filter skeleton */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-gray-200" />
        <div className="h-10 w-44 animate-pulse rounded-lg bg-gray-200" />
      </div>

      {/* Table skeleton */}
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <div className="bg-gray-50 px-4 py-3">
          <div className="flex gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-4 w-20 animate-pulse rounded bg-gray-200" />
            ))}
          </div>
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="border-t border-gray-200 px-4 py-3">
            <div className="flex gap-4">
              <div className="h-4 w-28 animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
              <div className="h-5 w-24 animate-pulse rounded-full bg-gray-100" />
              <div className="h-5 w-20 animate-pulse rounded-full bg-gray-100" />
              <div className="h-5 w-16 animate-pulse rounded-full bg-gray-100" />
              <div className="h-8 w-20 animate-pulse rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
