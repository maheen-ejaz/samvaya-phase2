import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function CommunicationsLoading() {
  return (
    <div role="status" aria-label="Loading communications">
      <div className="mb-6">
        <Skeleton className="h-8 w-52" />
      </div>

      {/* Tab bar */}
      <div className="mb-6 flex gap-1 rounded-lg bg-muted p-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-9 flex-1 rounded-md" />
        ))}
      </div>

      {/* Content area */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <Skeleton className="h-5 w-40" />
                <Skeleton className="mt-2 h-4 w-64" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-16 rounded-md" />
                <Skeleton className="h-8 w-16 rounded-md" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
