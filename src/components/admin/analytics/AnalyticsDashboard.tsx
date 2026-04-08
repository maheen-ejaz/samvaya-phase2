'use client';

import { useState, useEffect } from 'react';
import { HorizontalWaveFunnel } from './HorizontalWaveFunnel';
import { SpecialtyDistribution } from './SpecialtyDistribution';
import { StageTimingTable } from './StageTimingTable';

interface AnalyticsData {
  funnel: Array<{ stage: string; count: number; placeholder?: boolean }>;
  conversions: Array<{ from: string; to: string; rate: number }>;
  geographic: Array<{ state: string; city: string; count: number }>;
  specialties: Array<{ specialty: string; count: number }>;
  stage_timing: Array<{ stage: string; avg_days: number | null; sample_size: number }>;
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/admin/analytics');
        if (!res.ok) throw new Error('Failed to fetch analytics');
        const json = await res.json();
        setData(json);
      } catch {
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse rounded-xl bg-gray-100 h-64" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="animate-pulse rounded-xl bg-gray-100 h-56" />
          <div className="animate-pulse rounded-xl bg-gray-100 h-56" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
        {error || 'Failed to load analytics'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <HorizontalWaveFunnel data={data.funnel} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SpecialtyDistribution data={data.specialties} />
        <StageTimingTable data={data.stage_timing} />
      </div>
    </div>
  );
}
