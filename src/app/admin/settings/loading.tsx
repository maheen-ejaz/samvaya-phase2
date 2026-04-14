import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function SettingsLoading() {
  return (
    <div role="status" aria-label="Loading settings">
      <div className="mb-6">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="mt-2 h-4 w-56" />
      </div>

      {/* Three stacked cards (Pricing, Feature Flags, Airtable Sync) */}
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="mb-4 h-5 w-40" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-6 w-11 rounded-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
