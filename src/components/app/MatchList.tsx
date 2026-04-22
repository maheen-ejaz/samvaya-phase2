'use client';

import { useState, useEffect, useCallback } from 'react';
import { MatchListItem } from './MatchListItem';

interface MatchData {
  id: string;
  status: string;
  myResponse: string;
  theirResponse: string;
  isMutualInterest: boolean;
  presentedAt: string;
  expiresAt: string;
  score: number;
  otherProfile: {
    age: number | null;
    state: string | null;
    country: string | null;
    specialty: string | null;
    blurredPhotoUrl: string | null;
  };
}

const STATUS_PRIORITY: Record<string, number> = {
  pending: 0,
  mutual_interest: 1,
  responded: 2,
  expired: 3,
  declined: 3,
};

function sortMatches(matches: MatchData[]): MatchData[] {
  return [...matches].sort((a, b) => {
    const priorityA = STATUS_PRIORITY[a.status] ?? 99;
    const priorityB = STATUS_PRIORITY[b.status] ?? 99;
    return priorityA - priorityB;
  });
}

export function MatchList() {
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await fetch('/api/app/matches');
      if (!res.ok) throw new Error('Failed to load matches');
      const data = await res.json();
      setMatches(sortMatches(data.matches));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 animate-pulse">
            <div className="h-16 w-16 flex-shrink-0 rounded-lg bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 rounded bg-gray-200" />
              <div className="h-3 w-1/2 rounded bg-gray-200" />
              <div className="h-3 w-1/4 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700" role="alert">
        {error}
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <svg
          className="mx-auto h-12 w-12 text-rose-300"
          viewBox="0 0 48 48"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M24 42s-18-10.2-18-22.8C6 12.6 11.4 6 18 6c3.6 0 6 1.8 6 1.8S27.6 6 30 6c6.6 0 12 6.6 12 13.2C42 31.8 24 42 24 42z" />
        </svg>
        <p className="mt-4 text-sm font-medium text-gray-700">
          No matches yet — we&apos;re on it!
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Our team is carefully reviewing profiles to find someone truly compatible for you. You&apos;ll be notified as soon as a match is ready.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end">
        <button
          onClick={() => fetchMatches(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
          aria-label="Refresh matches"
        >
          <svg
            className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`}
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M14 8A6 6 0 1 1 8 2" strokeLinecap="round" />
            <path d="M8 0l3 2-3 2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Refresh
        </button>
      </div>
      {matches.map((match) => (
        <MatchListItem
          key={match.id}
          id={match.id}
          status={match.status}
          myResponse={match.myResponse}
          score={match.score}
          expiresAt={match.expiresAt}
          isMutualInterest={match.isMutualInterest}
          otherProfile={match.otherProfile}
        />
      ))}
    </div>
  );
}
