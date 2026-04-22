'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { DashboardMatch, MatchStageCounts } from '@/types/dashboard';
import { MatchStageCard } from './MatchStageCard';
import { MatchTable } from './MatchTable';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

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

const SORT_OPTIONS = [
  { value: 'score-desc', label: 'Score (High \u2192 Low)' },
  { value: 'score-asc', label: 'Score (Low \u2192 High)' },
  { value: 'days-desc', label: 'Days (Most \u2192 Least)' },
  { value: 'days-asc', label: 'Days (Least \u2192 Most)' },
  { value: 'stage-asc', label: 'Stage (Early \u2192 Late)' },
  { value: 'stage-desc', label: 'Stage (Late \u2192 Early)' },
];

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

  const DASHBOARD_MATCH_LIMIT = 6;
  const displayedMatches = filteredMatches.slice(0, DASHBOARD_MATCH_LIMIT);
  const hasMore = filteredMatches.length > DASHBOARD_MATCH_LIMIT;

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

  function handleSortChange(value: string) {
    const [f, d] = value.split('-') as [SortField, SortDir];
    setSortField(f);
    setSortDir(d);
  }

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="text-xl font-semibold">Match Command Center</CardTitle>
        <CardDescription>All active matches across the pipeline.</CardDescription>
      </CardHeader>

      {/* Stage cards */}
      <CardContent>
        <div className="grid grid-cols-4 gap-3">
          <MatchStageCard
            label="Pending Review"
            count={stageCounts.pendingReview}
            isActive={stageFilter === 'pending_review'}
            onClick={() => handleStageClick('pending_review')}
          />
          <MatchStageCard
            label="Approved & Ready"
            count={stageCounts.approvedReady}
            isActive={stageFilter === 'approved'}
            onClick={() => handleStageClick('approved')}
          />
          <MatchStageCard
            label="Awaiting Response"
            count={stageCounts.presentedPending}
            isActive={stageFilter === 'presented'}
            onClick={() => handleStageClick('presented')}
          />
          <MatchStageCard
            label="Mutual Interest"
            count={stageCounts.mutualInterest}
            isActive={stageFilter === 'mutual_interest'}
            onClick={() => handleStageClick('mutual_interest')}
          />
        </div>
      </CardContent>

      <Separator />

      {/* Filter bar */}
      <CardContent>
        <div className="flex items-center gap-4">
          <Input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Sort by:</span>
            <Select value={`${sortField}-${sortDir}`} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <span className="ml-auto text-xs text-muted-foreground">
            {hasMore
              ? `Showing 6 of ${filteredMatches.length}`
              : `${filteredMatches.length} match${filteredMatches.length !== 1 ? 'es' : ''}`}
          </span>
        </div>
      </CardContent>

      <Separator />

      {/* Table */}
      <CardContent className="p-0">
        <MatchTable
          matches={displayedMatches}
          expandedId={expandedId}
          onToggleExpand={handleToggleExpand}
          onAction={handleAction}
          actionLoading={actionLoading}
        />
      </CardContent>

      {/* Show all matches CTA */}
      {hasMore && (
        <>
          <Separator />
          <CardContent className="text-center">
            <Button
              variant="outline"
              onClick={() => router.push('/admin/matching?status=all')}
            >
              Show all matches ({filteredMatches.length} total)
            </Button>
          </CardContent>
        </>
      )}
    </Card>
  );
}
