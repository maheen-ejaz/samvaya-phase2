'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface FunnelStage {
  stage: string;
  count: number;
  placeholder?: boolean;
}

interface FunnelChartProps {
  data: FunnelStage[];
}

const BAR_SHADES = [
  'bg-chart-1',
  'bg-chart-2',
  'bg-chart-3',
  'bg-chart-4',
  'bg-chart-5',
  'bg-primary/40',
];

export function FunnelChart({ data }: FunnelChartProps) {
  const activeStages = data.filter((d) => !d.placeholder);
  const placeholderStages = data.filter((d) => d.placeholder);
  const maxCount = Math.max(...activeStages.map((d) => d.count), 1);

  return (
    <Card>
      <CardHeader>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Funnel</p>
        <CardTitle>Applicant Funnel</CardTitle>
        <CardDescription>Stage-by-stage progression with conversion rates.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {activeStages.map((stage, i) => {
            const widthPct = Math.max(10, (stage.count / maxCount) * 100);
            const nextStage = activeStages[i + 1];
            const convPct =
              nextStage && stage.count > 0
                ? Math.min(100, Math.round((nextStage.count / stage.count) * 100))
                : null;
            const shade = BAR_SHADES[Math.min(i, BAR_SHADES.length - 1)];
            const textColor = i <= 1 ? 'text-white' : 'text-primary';

            return (
              <div key={stage.stage}>
                {/* Bar row */}
                <div className="flex items-center gap-3">
                  {/* Stage label — fixed width */}
                  <p className="w-36 flex-shrink-0 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground text-right">
                    {stage.stage}
                  </p>

                  {/* Bar */}
                  <div className="relative flex-1">
                    <div
                      className={`flex h-10 items-center rounded-md px-3 transition-all ${shade}`}
                      style={{ width: `${widthPct}%` }}
                    >
                      <span className={`text-sm font-semibold tabular-nums ${textColor}`}>
                        {stage.count.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Conversion label between stages */}
                {convPct !== null && (
                  <div className="flex items-center gap-3">
                    <div className="w-36 flex-shrink-0" />
                    <div className="flex items-center gap-1 py-0.5 pl-3">
                      <span className="text-[10px] font-medium text-primary">
                        ↓ {convPct}%
                      </span>
                      <span className="text-[10px] text-muted-foreground">conversion</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Placeholder stages */}
          {placeholderStages.length > 0 && (
            <div className="mt-2 flex items-center gap-3 border-t border-dashed border-border pt-3">
              <div className="w-36 flex-shrink-0" />
              <div className="flex flex-col gap-1">
                {placeholderStages.map((stage) => (
                  <p key={stage.stage} className="text-xs italic text-muted-foreground">
                    {stage.stage} — coming soon
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
