interface SectionHeaderProps {
  positionLabel: string;
  totalLabel: string;
  title: string;
  subtitle?: string;
  progress: number;
  /** Optional micro-meta: e.g. "11 questions · ~5 min · Fully private" */
  meta?: string[];
}

export function SectionHeader({
  positionLabel,
  totalLabel,
  title,
  subtitle,
  progress,
  meta,
}: SectionHeaderProps) {
  const pct = Math.max(0, Math.min(1, progress)) * 100;

  return (
    <header className="mb-8 lg:mb-12">
      <div className="form-eyebrow mb-3">
        Section {positionLabel} / {totalLabel}
      </div>
      <h1 className="form-title">{title}</h1>
      {subtitle && <p className="form-subtitle mt-3 max-w-xl">{subtitle}</p>}
      {meta && meta.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium text-[color:var(--color-form-text-muted)]">
          {meta.map((m, i) => (
            <span key={m} className="flex items-center gap-2">
              {i > 0 && (
                <span
                  aria-hidden="true"
                  className="size-[3px] rounded-full bg-[color:var(--color-form-border-strong)]"
                />
              )}
              {m}
            </span>
          ))}
        </div>
      )}
      <div className="form-progress-track mt-5 max-w-md">
        <div className="form-progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </header>
  );
}
