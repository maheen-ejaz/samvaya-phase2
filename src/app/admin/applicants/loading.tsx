import { Skeleton } from '@/components/ui/skeleton';

export default function ApplicantsLoading() {
  return (
    <div role="status" aria-label="Loading applicants">
      <div className="mb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-32" />
      </div>

      {/* Search + Filter skeleton */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Skeleton className="h-10 w-64 rounded-lg" />
        <Skeleton className="h-10 w-44 rounded-lg" />
      </div>

      {/* Table skeleton */}
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <div className="bg-gray-50 px-4 py-3">
          <div className="flex gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-20" />
            ))}
          </div>
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="border-t border-gray-200 px-4 py-3">
            <div className="flex gap-4">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
