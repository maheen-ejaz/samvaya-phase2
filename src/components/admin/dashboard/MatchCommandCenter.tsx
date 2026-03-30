'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { DashboardMatch, MatchStageCounts } from '@/types/dashboard';
import { MatchStageCard } from './MatchStageCard';
import { MatchTable } from './MatchTable';

type StageFilter = 'all' | 'pending_review' | 'approved' | 'presented' | 'mutual_interest';
type SortField = 'score' | 'days' | 'stage';
type SortDir = 'asc' | 'desc';

interface MatchCommandCenterProps {
  initialMatches: DashboardMatch[];
  stageCounts: MatchStageCounts;
}

const STAGE_ORDER: Record<string, number> = {
  pending_review: 0,
  approved: 1,
  presented: 2,
  mutual_interest: 3,
};

export function MatchCommandCenter({ initialMatches, stageCounts }: MatchCommandCenterProps) {
  const router = useRouter();
  const [stageFilter, setStageFilter] = useState<StageFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Filter + search + sort
  const filteredMatches = useMemo(() => {
    let result = initialMatches;

    // Stage filter
    if (stageFilter !== 'all') {
      result = result.filter((m) => m.currentStage === stageFilter);
    }

    // Search by name
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.personA.name.toLowerCase().includes(q) ||
          m.personB.name.toLowerCase().includes(q)
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'score') cmp = a.compatibilityScore - b.compatibilityScore;
      else if (sortField === 'days') cmp = a.daysInStage - b.daysInStage;
      else if (sortField === 'stage') cmp = (STAGE_ORDER[a.currentStage] || 0) - (STAGE_ORDER[b.currentStage] || 0);
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [initialMatches, stageFilter, searchQuery, sortField, sortDir]);

  function handleStageClick(stage: StageFilter) {
    setStageFilter(stageFilter === stage ? 'all' : stage);
    setExpandedId(null);
  }

  function handleToggleExpand(id: string) {
    setExpandedId(expandedId === id ? null : id);
  }

  async function handleAction(match: DashboardMatch) {
    // Navigate to the appropriate admin page based on stage
    if (match.currentStage === 'pending_review') {
      router.push(`/admin/matching`);
    } else if (match.currentStage === 'approved') {
      router.push(`/admin/matching`);
    } else if (match.currentStage === 'presented' && match.presentationId) {
      router.push(`/admin/matching/presentations`);
    } else if (match.currentStage === 'mutual_interest') {
      router.push(`/admin/matching/introductions`);
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 px-6 py-4">
        <h3 className="text-lg font-semibold text-gray-900">Match Command Center</h3>
        <p className="mt-0.5 text-sm text-gray-500">All active matches across the pipeline.</p>
      </div>

      {/* Stage cards */}
      <div className="grid grid-cols-4 gap-3 px-6 py-4">
        <MatchStageCard
          label="Pending Review"
          count={stageCounts.pendingReview}
          isActive={stageFilter === 'pending_review'}
          onClick={() => handleStageClick('pending_review')}
          colorClass="bg-blue-50 text-blue-700"
        />
        <MatchStageCard
          label="Approved & Ready"
          count={stageCounts.approvedReady}
          isActive={stageFilter === 'approved'}
          onClick={() => handleStageClick('approved')}
          colorClass="bg-purple-50 text-purple-700"
        />
        <MatchStageCard
          label="Awaiting Response"
          count={stageCounts.presentedPending}
          isActive={stageFilter === 'presented'}
          onClick={() => handleStageClick('presented')}
          colorClass="bg-amber-50 text-amber-700"
        />
        <MatchStageCard
          label="Mutual Interest"
          count={stageCounts.mutualInterest}
          isActive={stageFilter === 'mutual_interest'}
          onClick={() => handleStageClick('mutual_interest')}
          colorClass="bg-green-50 text-green-700"
        />
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-4 border-t border-gray-100 px-6 py-3">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-64 rounded-md border border-gray-300 px-3 py-1.5 text-sm placeholder-gray-400 focus:border-gray-400 focus:outline-none"
        />
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Sort by:</span>
          <select
            value={`${sortField}-${sortDir}`}
            onChange={(e) => {
              const [f, d] = e.target.value.split('-') as [SortField, SortDir];
              setSortField(f);
              setSortDir(d);
            }}
            className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-gray-400 focus:outline-none"
          >
            <option value="score-desc">Score (High → Low)</option>
            <option value="score-asc">Score (Low → High)</option>
            <option value="days-desc">Days (Most → Least)</option>
            <option value="days-asc">Days (Least → Most)</option>
            <option value="stage-asc">Stage (Early → Late)</option>
            <option value="stage-desc">Stage (Late → Early)</option>
          </select>
        </div>
        <span className="ml-auto text-xs text-gray-400">
          {filteredMatches.length} match{filteredMatches.length !== 1 ? 'es' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="border-t border-gray-100">
        <MatchTable
          matches={filteredMatches}
          expandedId={expandedId}
          onToggleExpand={handleToggleExpand}
          onAction={handleAction}
          actionLoading={actionLoading}
        />
      </div>
    </div>
  );
}
