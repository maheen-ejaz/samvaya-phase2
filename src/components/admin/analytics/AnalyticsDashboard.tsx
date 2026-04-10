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

  // Top 10 states by applicant count
  const topStates = [...(data.geographic || [])]
    .reduce<Array<{ state: string; count: number }>>((acc, row) => {
      const existing = acc.find((r) => r.state === row.state);
      if (existing) { existing.count += row.count; } else { acc.push({ state: row.state, count: row.count }); }
      return acc;
    }, [])
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const maxStateCount = topStates[0]?.count || 1;

  return (
    <div className="space-y-6">
      <HorizontalWaveFunnel data={data.funnel} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SpecialtyDistribution data={data.specialties} />
        <StageTimingTable data={data.stage_timing} />
      </div>
      {topStates.length > 0 && (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Geography</p>
          <h2 className="mt-1 text-lg font-semibold text-gray-900">Top States</h2>
          <p className="mt-0.5 text-sm text-gray-500">Applicant distribution by state (top 10).</p>
          <div className="mt-5 space-y-3">
            {topStates.map((row) => (
              <div key={row.state} className="flex items-center gap-3">
                <span className="w-32 shrink-0 truncate text-sm text-gray-700">{row.state || 'Unknown'}</span>
                <div className="flex-1 overflow-hidden rounded-full bg-indigo-50 h-2">
                  <div
                    className="h-2 rounded-full bg-indigo-500"
                    style={{ width: `${Math.round((row.count / maxStateCount) * 100)}%` }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right text-sm font-medium text-gray-600">{row.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
