import type { DistributionEntry } from '@/types/dashboard';
import { DonutChart, DONUT_COLORS, type DonutSlice } from './DonutChart';
import { DonutLegend } from './DonutLegend';

interface AnalyticsDonutGridProps {
  locationData: DistributionEntry[];
  educationData: DistributionEntry[];
  ageData: DistributionEntry[];
  genderData: DistributionEntry[];
}

function toSlices(data: DistributionEntry[]): DonutSlice[] {
  return data.map((entry, i) => ({
    label: entry.label,
    count: entry.count,
    color: DONUT_COLORS[i % DONUT_COLORS.length],
  }));
}

interface DonutCardProps {
  title: string;
  subtitle: string;
  slices: DonutSlice[];
}

function DonutCard({ title, subtitle, slices }: DonutCardProps) {
  const total = slices.reduce((s, d) => s + d.count, 0);

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
        Distribution
      </p>
      <h3 className="mt-1 text-base font-semibold text-gray-900">{title}</h3>
      <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>

      {total === 0 ? (
        <p className="mt-6 text-sm text-gray-400">No data yet.</p>
      ) : (
        <div className="mt-5 flex items-center gap-5">
          <DonutChart data={slices} size={110} strokeWidth={16} />
          <DonutLegend data={slices} total={total} maxItems={6} />
        </div>
      )}
    </div>
  );
}

export function AnalyticsDonutGrid({
  locationData,
  educationData,
  ageData,
  genderData,
}: AnalyticsDonutGridProps) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <DonutCard
        title="Location"
        subtitle="Top states by applicant count"
        slices={toSlices(locationData)}
      />
      <DonutCard
        title="Education Stage"
        subtitle="Medical qualification level"
        slices={toSlices(educationData)}
      />
      <DonutCard
        title="Age Group"
        subtitle="Applicant age distribution"
        slices={toSlices(ageData)}
      />
      <DonutCard
        title="Gender"
        subtitle="Applicant gender breakdown"
        slices={toSlices(genderData)}
      />
    </div>
  );
}
