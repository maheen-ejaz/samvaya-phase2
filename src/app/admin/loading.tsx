export default function AdminLoading() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8" role="status" aria-label="Loading admin dashboard">
      <div className="mb-6">
        <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
        <div className="mt-2 h-4 w-48 animate-pulse rounded bg-gray-100" />
      </div>
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <div className="bg-gray-50 px-4 py-3">
          <div className="flex gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-4 w-20 animate-pulse rounded bg-gray-200" />
            ))}
          </div>
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border-t border-gray-200 px-4 py-3">
            <div className="flex gap-4">
              {Array.from({ length: 8 }).map((_, j) => (
                <div key={j} className="h-4 w-20 animate-pulse rounded bg-gray-100" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
