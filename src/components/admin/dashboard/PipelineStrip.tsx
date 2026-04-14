'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { PipelineStripStage } from '@/types/dashboard';

interface PipelineStripProps {
  stages: PipelineStripStage[];
}

export function PipelineStrip({ stages }: PipelineStripProps) {
  const row1 = stages.slice(0, 5);
  const row2 = stages.slice(5, 10);

  return (
    <div className="space-y-3">
      <PipelineRow stages={row1} />
      <PipelineRow stages={row2} />
    </div>
  );
}

function PipelineRow({ stages }: { stages: PipelineStripStage[] }) {
  return (
    <div className="flex items-stretch gap-3">
      {stages.map((stage, i) => (
        <div key={stage.key} className="flex min-w-0 flex-1 items-stretch gap-3">
          {/* Card */}
          <Link
            href={stage.href}
            className="group relative block min-w-0 flex-1 rounded-xl border border-border bg-card py-0 transition-all hover:shadow-md hover:-translate-y-0.5"
          >
            <CardContent className="p-5 pb-6">
              {/* Label */}
              <p className="text-lg font-medium text-foreground">
                {stage.stage}
              </p>

              {/* Count */}
              <p className="mt-3 text-3xl font-light tabular-nums tracking-tight text-foreground">
                {stage.count.toLocaleString('en-IN')}
              </p>

              {/* Trend badge */}
              {stage.trend ? (
                <Badge
                  variant="secondary"
                  className={cn(
                    'mt-2 h-auto rounded-full px-2 py-0.5 text-[10px] font-semibold border-0',
                    stage.trend.direction === 'up'
                      ? 'bg-emerald-50 text-emerald-700'
                      : stage.trend.direction === 'down'
                        ? 'bg-red-50 text-red-600'
                        : 'bg-gray-100 text-gray-500'
                  )}
                >
                  {stage.trend.direction === 'up' ? '↑' : stage.trend.direction === 'down' ? '↓' : '→'}
                  {stage.trend.percentage}% vs 7d ago
                </Badge>
              ) : (
                <span className="mt-2 block text-[10px] text-gray-300">&mdash;</span>
              )}
            </CardContent>
          </Link>

          {/* Chevron with conversion % between cards (not after last) */}
          {i < stages.length - 1 && (
            <div className="flex flex-col items-center justify-center">
              <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
              {stage.conversionPct !== null && stage.conversionPct !== undefined && (
                <p className="mt-0.5 text-[9px] font-medium text-gray-400">
                  {stage.conversionPct}%
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
