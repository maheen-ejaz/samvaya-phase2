import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function MatchingLoading() {
  return (
    <div role="status" aria-label="Loading matching pipeline">
      <div className="mb-6">
        <Skeleton className="h-8 w-52" />
      </div>

      {/* Pipeline controls skeleton */}
      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="flex gap-3">
          <Skeleton className="h-10 w-32 rounded-md" />
          <Skeleton className="h-10 w-36 rounded-md" />
        </CardContent>
      </Card>

      {/* Filter bar */}
      <div className="mb-6 flex items-center gap-4">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-9 w-40 rounded-md" />
        <Skeleton className="h-4 w-16" />
      </div>

      {/* Suggestion cards */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="mt-2 h-4 w-32" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <div className="mt-4 flex gap-3">
                <Skeleton className="h-9 w-24 rounded-md" />
                <Skeleton className="h-9 w-24 rounded-md" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
