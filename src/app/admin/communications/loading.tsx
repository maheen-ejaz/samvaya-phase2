export default function CommunicationsLoading() {
  return (
    <div role="status" aria-label="Loading communications">
      <div className="mb-6">
        <div className="h-8 w-52 animate-pulse rounded bg-gray-200" />
      </div>

      {/* Tab bar */}
      <div className="mb-6 flex gap-1 rounded-lg bg-gray-100 p-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-9 flex-1 animate-pulse rounded-md bg-gray-200" />
        ))}
      </div>

      {/* Content area */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
                <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-100" />
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-16 animate-pulse rounded-md bg-gray-200" />
                <div className="h-8 w-16 animate-pulse rounded-md bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
