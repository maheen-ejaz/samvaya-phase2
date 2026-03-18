export default function VerificationDetailLoading() {
  return (
    <div role="status" aria-label="Loading BGV details">
      {/* Back link + Header */}
      <div className="mb-6">
        <div className="mb-4 h-4 w-36 animate-pulse rounded bg-gray-200" />
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 animate-pulse rounded-full bg-gray-200" />
          <div>
            <div className="h-6 w-44 animate-pulse rounded bg-gray-200" />
            <div className="mt-1 h-4 w-28 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
      </div>

      {/* 13 BGV check cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 13 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
              <div className="h-5 w-16 animate-pulse rounded-full bg-gray-100" />
            </div>
            <div className="mt-3 h-3 w-full animate-pulse rounded bg-gray-100" />
            <div className="mt-2 h-3 w-20 animate-pulse rounded bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
