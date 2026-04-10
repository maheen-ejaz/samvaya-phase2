import Link from 'next/link';

function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 3l4 4-4 4" />
    </svg>
  );
}

interface AdminKPICardProps {
  label: string;
  count: number;
  icon: React.ReactNode;
  href: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
    comparedTo: string;
  };
  /** Override icon circle bg color (CSS color string). Defaults to indigo #4F6EF7. */
  iconColor?: string;
}

export function AdminKPICard({
  label,
  count,
  icon,
  href,
  trend,
  iconColor = '#4F6EF7',
}: AdminKPICardProps) {
  return (
    <Link href={href} className="admin-kpi-card block group">
      {/* Top row: icon + label + chevron */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="admin-kpi-icon flex-shrink-0" style={{ backgroundColor: iconColor }}>
            {icon}
          </div>
          <p className="text-xs font-medium text-gray-500 leading-tight">{label}</p>
        </div>
        <span className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-400 group-hover:bg-blue-50 group-hover:text-[#4F6EF7] transition-colors">
          <ChevronRightIcon />
        </span>
      </div>

      {/* Count + trend badge */}
      <div className="mt-3 flex items-end gap-2">
        <p className="type-display-sm type-stat text-gray-900 leading-none">
          {count.toLocaleString('en-IN')}
        </p>
        {trend && (
          <span className={trend.direction === 'up' ? 'admin-badge-trend-up mb-0.5' : 'admin-badge-trend-down mb-0.5'}>
            {trend.direction === 'up' ? '↑' : '↓'}{trend.value}%
          </span>
        )}
      </div>

      {/* Footer */}
      <p className="mt-1.5 text-xs text-gray-400">
        {trend ? `Compared to ${trend.comparedTo}` : '\u00a0'}
      </p>
    </Link>
  );
}
