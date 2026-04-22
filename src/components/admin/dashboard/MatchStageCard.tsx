import { CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MatchStageCardProps {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}

export function MatchStageCard({ label, count, isActive, onClick }: MatchStageCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative block w-full rounded-xl border border-border bg-card text-left transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer',
        isActive && 'ring-2 ring-ring shadow-md'
      )}
    >
      <CardContent className="p-5">
        {/* Label */}
        <p className="text-lg font-medium text-foreground">{label}</p>

        {/* Dash separator */}
        <p className="mt-1 text-[11px] text-muted-foreground">&mdash;</p>

        {/* Count */}
        <p className="mt-3 text-3xl font-light tabular-nums tracking-tight text-foreground">
          {count.toLocaleString('en-IN')}
        </p>
      </CardContent>
    </button>
  );
}
