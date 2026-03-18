export default function ApplicantDetailLoading() {
  return (
    <div role="status" aria-label="Loading applicant profile">
      {/* Back link + Header */}
      <div className="mb-6">
        <div className="mb-4 h-4 w-24 animate-pulse rounded bg-gray-200" />
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 animate-pulse rounded-full bg-gray-200" />
          <div>
            <div className="h-7 w-48 animate-pulse rounded bg-gray-200" />
            <div className="mt-2 h-4 w-32 animate-pulse rounded bg-gray-100" />
          </div>
          <div className="ml-auto h-6 w-28 animate-pulse rounded-full bg-gray-100" />
        </div>
      </div>

      {/* Two-column card grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="mb-4 h-4 w-32 animate-pulse rounded bg-gray-200" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="flex justify-between">
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
