export default function SettingsLoading() {
  return (
    <div role="status" aria-label="Loading settings">
      <div className="mb-6">
        <div className="h-8 w-36 animate-pulse rounded bg-gray-200" />
        <div className="mt-2 h-4 w-56 animate-pulse rounded bg-gray-100" />
      </div>

      {/* Three stacked cards (Pricing, Feature Flags, Airtable Sync) */}
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-4 h-5 w-40 animate-pulse rounded bg-gray-200" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex items-center justify-between">
                  <div className="h-4 w-36 animate-pulse rounded bg-gray-100" />
                  <div className="h-6 w-11 animate-pulse rounded-full bg-gray-100" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
