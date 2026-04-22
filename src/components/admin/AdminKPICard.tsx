'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ChevronRightIcon, TrendingUpIcon, TrendingDownIcon } from 'lucide-react';

interface AdminKPICardProps {
  label: string;
  count: number;
  icon: React.ReactNode;
  href: string;
  trend?: { value: number; direction: 'up' | 'down'; comparedTo: string };
}

export function AdminKPICard({ label, count, icon, href, trend }: AdminKPICardProps) {
  return (
    <Card className="group transition-all hover:shadow-md hover:-translate-y-0.5">
      <CardContent>
        <Link href={href} className="block">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {icon}
              </div>
              <span className="text-xs font-medium text-muted-foreground leading-tight">{label}</span>
            </div>
            <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <ChevronRightIcon className="size-3.5" />
            </div>
          </div>

          <div className="mt-3 flex items-end gap-2">
            <span className="text-3xl font-light tracking-tight tabular-nums text-foreground leading-none">
              {count.toLocaleString('en-IN')}
            </span>
            {trend && (
              <Badge
                variant="outline"
                className={cn(
                  'mb-0.5 gap-1 text-[10px] font-semibold border-0',
                  trend.direction === 'up'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-red-50 text-red-600',
                )}
              >
                {trend.direction === 'up' ? (
                  <TrendingUpIcon className="size-3" />
                ) : (
                  <TrendingDownIcon className="size-3" />
                )}
                {trend.direction === 'up' ? '+' : ''}{trend.value}%
              </Badge>
            )}
          </div>

          {trend && (
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              vs. {trend.comparedTo}
            </p>
          )}
        </Link>
      </CardContent>
    </Card>
  );
}
