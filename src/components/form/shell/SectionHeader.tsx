import { Separator } from '@/components/ui/separator';

interface SectionHeaderProps {
  positionLabel: string;
  totalLabel: string;
  title: string;
  subtitle?: string;
  progress: number;
}

export function SectionHeader({
  positionLabel,
  totalLabel,
  title,
  subtitle,
  progress,
}: SectionHeaderProps) {
  const pct = Math.max(0, Math.min(1, progress)) * 100;

  return (
    <header className="mb-10 lg:mb-14">
      <div className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Section {positionLabel} of {totalLabel}
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground lg:text-3xl mb-3">{title}</h1>
      {subtitle && <p className="text-sm text-muted-foreground max-w-2xl">{subtitle}</p>}
      <div className="mt-6 max-w-md">
        <div className="h-1 w-full rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </header>
  );
}
