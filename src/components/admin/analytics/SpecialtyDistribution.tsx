'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { capitalize } from '@/lib/utils';

interface SpecialtyEntry {
  specialty: string;
  count: number;
}

interface SpecialtyDistributionProps {
  data: SpecialtyEntry[];
}

const BAR_COLORS = [
  'bg-chart-1',
  'bg-chart-2',
  'bg-chart-3',
  'bg-chart-4',
  'bg-chart-5',
  'bg-primary/40',
];

export function SpecialtyDistribution({ data }: SpecialtyDistributionProps) {
  const [expanded, setExpanded] = useState(false);
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const visibleData = expanded ? data : data.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Specialty Distribution</CardTitle>
        <CardDescription>Medical specialties of applicants.</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No specialty data available yet.</p>
        ) : (
          <>
            <div className="space-y-3">
              {visibleData.map((entry, i) => {
                const color = BAR_COLORS[Math.min(i, BAR_COLORS.length - 1)];
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-32 flex-shrink-0 truncate text-sm font-medium text-foreground">
                      {capitalize(entry.specialty)}
                    </span>
                    <div className="flex-1 overflow-hidden rounded-full bg-muted h-6">
                      <div
                        className={`h-full rounded-full ${color} flex items-center justify-end pr-3 transition-all`}
                        style={{ width: `${Math.max((entry.count / maxCount) * 100, 5)}%` }}
                      >
                        {(entry.count / maxCount) * 100 > 15 && (
                          <span className="text-xs font-semibold text-white tabular-nums">
                            {entry.count}
                          </span>
                        )}
                      </div>
                    </div>
                    {(entry.count / maxCount) * 100 <= 15 && (
                      <span className="w-10 flex-shrink-0 text-right text-sm font-medium text-muted-foreground">
                        {entry.count}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            {data.length > 5 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-4 text-xs font-medium text-primary hover:underline"
              >
                {expanded ? 'Show less' : `Show all ${data.length} specialties`}
              </button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
