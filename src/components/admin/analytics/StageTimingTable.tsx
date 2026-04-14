'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface StageTiming {
  stage: string;
  avg_days: number | null;
  sample_size: number;
}

interface StageTimingTableProps {
  data: StageTiming[];
}

export function StageTimingTable({ data }: StageTimingTableProps) {
  const maxDays = Math.max(...data.map((d) => d.avg_days ?? 0), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Average Stage Duration</CardTitle>
        <CardDescription>Average time applicants spend between stages.</CardDescription>
      </CardHeader>
      <CardContent>
        {data.every((d) => d.sample_size === 0) ? (
          <p className="text-sm text-muted-foreground">No timing data available yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stage</TableHead>
                <TableHead>Avg. Duration</TableHead>
                <TableHead className="text-right">Sample</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((entry) => {
                const days = entry.avg_days;
                const barColor =
                  days === null
                    ? ''
                    : days <= 3
                      ? 'bg-primary'
                      : days <= 7
                        ? 'bg-amber-400'
                        : 'bg-red-400';
                const barWidth = days !== null ? Math.max((days / maxDays) * 100, 5) : 0;
                return (
                  <TableRow key={entry.stage}>
                    <TableCell className="font-medium">{entry.stage}</TableCell>
                    <TableCell>
                      {days !== null ? (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 overflow-hidden rounded-full bg-muted h-2 max-w-[120px]">
                            <div
                              className={`h-full rounded-full ${barColor} transition-all`}
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                          <span className="text-xs tabular-nums text-muted-foreground">
                            {days} {days === 1 ? 'day' : 'days'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">--</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {entry.sample_size > 0
                        ? `${entry.sample_size} applicant${entry.sample_size !== 1 ? 's' : ''}`
                        : '--'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
