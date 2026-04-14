import type { DonutSlice } from './DonutChart';

interface DonutLegendProps {
  data: DonutSlice[];
  total: number;
  maxItems?: number;
}

export function DonutLegend({ data, total, maxItems = 6 }: DonutLegendProps) {
  const visible = data.slice(0, maxItems);
  const rest = data.slice(maxItems);
  const restCount = rest.reduce((s, d) => s + d.count, 0);

  return (
    <div className="min-w-0 flex-1 space-y-2">
      {visible.map((slice) => {
        const pct = total > 0 ? Math.round((slice.count / total) * 100) : 0;
        return (
          <div key={slice.label} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
              style={{ backgroundColor: slice.color }}
            />
            <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
              {slice.label}
            </span>
            <span className="flex-shrink-0 text-xs font-medium tabular-nums text-foreground">
              {pct}%
            </span>
          </div>
        );
      })}
      {rest.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-muted" />
          <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
            +{rest.length} more
          </span>
          <span className="flex-shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
            {total > 0 ? Math.round((restCount / total) * 100) : 0}%
          </span>
        </div>
      )}
    </div>
  );
}
