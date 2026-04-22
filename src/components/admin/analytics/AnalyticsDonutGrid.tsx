import type { DistributionEntry } from '@/types/dashboard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
    <Card>
      <CardHeader>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Distribution
        </p>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="text-sm text-muted-foreground">No data yet.</p>
        ) : (
          <div className="flex items-center gap-5">
            <DonutChart data={slices} size={110} strokeWidth={16} />
            <DonutLegend data={slices} total={total} maxItems={6} />
          </div>
        )}
      </CardContent>
    </Card>
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
