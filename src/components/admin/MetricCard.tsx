interface MetricCardProps {
  label: string;
  value: number | string;
  subtitle?: string;
  trend?: {
    direction: 'up' | 'down' | 'flat';
    percentage: number;
    label: string; // e.g., "vs last week"
  };
  sparkline?: number[]; // array of values for mini chart
}

export function MetricCard({ label, value, subtitle, trend, sparkline }: MetricCardProps) {
  return (
    <div className="min-w-0 rounded-lg border border-gray-200 bg-white p-4">
      <p className="truncate text-xs font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>

      {/* Trend indicator */}
      {trend && (
        <p className={`mt-1 text-xs font-medium ${
          trend.direction === 'up' ? 'text-green-600' :
          trend.direction === 'down' ? 'text-red-600' :
          'text-gray-400'
        }`}>
          {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'}
          {' '}{trend.percentage}% {trend.label}
        </p>
      )}

      {/* Sparkline mini chart */}
      {sparkline && sparkline.length > 1 && (
        <div className="mt-2">
          <Sparkline data={sparkline} color={trend?.direction === 'down' ? '#EF4444' : '#22C55E'} />
        </div>
      )}

      {subtitle && !trend && (
        <p className="mt-1 truncate text-xs text-gray-400">{subtitle}</p>
      )}
    </div>
  );
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const width = 80;
  const height = 24;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
