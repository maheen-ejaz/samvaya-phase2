export default function VerificationLoading() {
  return (
    <div role="status" aria-label="Loading verification tracker">
      <div className="mb-6">
        <div className="h-8 w-52 animate-pulse rounded bg-gray-200" />
        <div className="mt-2 h-4 w-40 animate-pulse rounded bg-gray-100" />
      </div>

      {/* Verification card grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
              <div>
                <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
                <div className="mt-1 h-3 w-24 animate-pulse rounded bg-gray-100" />
              </div>
            </div>
            <div className="mt-4 h-2 w-full animate-pulse rounded-full bg-gray-100" />
            <div className="mt-2 h-3 w-20 animate-pulse rounded bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
