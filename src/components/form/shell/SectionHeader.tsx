interface SectionHeaderProps {
  /** "04" — section number, padded */
  positionLabel: string;
  /** 14 — total section count */
  totalLabel: string;
  /** "About your family" */
  title: string;
  /** "A few questions about your family background and values." */
  subtitle?: string;
  /** Progress through the current section, 0–1 */
  progress: number;
}

/**
 * Section header that appears at the top of every section screen.
 * Renders the section number eyebrow, the title, an optional subtitle,
 * and a thin red progress bar showing position within the current section.
 */
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
      <div className="form-eyebrow mb-3">
        Section {positionLabel} of {totalLabel}
      </div>
      <h1 className="form-title mb-3">{title}</h1>
      {subtitle && <p className="form-subtitle max-w-2xl">{subtitle}</p>}
      <div className="form-progress-track mt-6 max-w-md">
        <div className="form-progress-fill form-progress-fill-animate" style={{ width: `${pct}%` }} />
      </div>
    </header>
  );
}
