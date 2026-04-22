'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { MatchCardHeader } from './MatchCardHeader';
import { MatchRationale } from './MatchRationale';
import { CompatibilityChart } from './CompatibilityChart';
import { AboutThem } from './AboutThem';
import { LifeSnapshot } from './LifeSnapshot';
import { InterestsSection } from './InterestsSection';
import { ResponsePrompt } from './ResponsePrompt';
import { ProfileReveal } from './ProfileReveal';
import { ScheduleIntroduction } from '@/components/app/ScheduleIntroduction';

export interface MatchCardData {
  id: string;
  status: string;
  myResponse: string;
  theirResponse: string;
  isMutualInterest: boolean;
  presentedAt: string;
  expiresAt: string;
  canSeeOriginal: boolean;
  revealData: {
    firstName: string | null;
    email: string | null;
    phone: string | null;
  } | null;
  score: number;
  narrative: string | null;
  recommendation: string | null;
  dimensionScores: Record<string, { score: number; note: string }> | null;
  highlights: string[];
  concerns: string[];
  spiderWeb: {
    mine: Record<string, number> | null;
    theirs: Record<string, number> | null;
  };
  otherProfile: {
    age: number | null;
    gender: string | null;
    heightCm: number | null;
    city: string | null;
    state: string | null;
    country: string | null;
    religion: string | null;
    caste: string | null;
    motherTongue: string | null;
    diet: string | null;
    smoking: string | null;
    drinking: string | null;
    exerciseFrequency: string | null;
    marriageTimeline: string | null;
    childrenPreference: string | null;
    livingArrangement: string | null;
    settlementPreference: string | null;
    personalitySummary: string | null;
    medicalDegree: string | null;
    specialty: string | null;
    yearsOfExperience: number | null;
    designation: string | null;
    hobbies: string[];
    photos: string[];
  };
}

export function MatchCardView({ presentationId }: { presentationId: string }) {
  const [data, setData] = useState<MatchCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/app/matches/${presentationId}`);
      if (!res.ok) {
        if (res.status === 410) throw new Error('This match has expired');
        throw new Error('Failed to load match details');
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [presentationId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse" role="status" aria-label="Loading match details">
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="aspect-[4/3] bg-gray-200" />
          <div className="p-4 space-y-2">
            <div className="h-5 w-1/3 rounded bg-gray-200" />
            <div className="h-4 w-1/2 rounded bg-gray-200" />
            <div className="h-3 w-2/3 rounded bg-gray-200" />
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-2">
          <div className="h-4 w-full rounded bg-gray-200" />
          <div className="h-4 w-3/4 rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-center text-sm text-red-700" role="alert">
        {error ?? 'Match not found'}
      </div>
    );
  }

  const hasReveal = data.isMutualInterest;
  const delayOffset = hasReveal ? 80 : 0;

  return (
    <div className="space-y-5 pb-8">
      {/* Back button */}
      <Link
        href="/app/matches"
        className="inline-flex items-center gap-1 py-2 text-sm text-gray-500 hover:text-gray-700"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Back to matches
      </Link>

      {/* Profile Reveal — shown at top when mutual interest exists */}
      {hasReveal && (
        <div className="animate-fade-in-up" style={{ animationDelay: '0ms' }}>
          <ProfileReveal
            isMutualInterest={data.isMutualInterest}
            canSeeOriginal={data.canSeeOriginal}
            revealData={data.revealData}
            presentationId={data.id}
          />
        </div>
      )}

      {/* Section 1: Header */}
      <div className="animate-fade-in-up" style={{ animationDelay: `${delayOffset}ms` }}>
        <MatchCardHeader profile={data.otherProfile} canSeeOriginal={data.canSeeOriginal} />
      </div>

      {/* Section 2: Rationale */}
      {data.narrative && (
        <div className="animate-fade-in-up" style={{ animationDelay: `${delayOffset + 80}ms` }}>
          <MatchRationale
            narrative={data.narrative}
            highlights={data.highlights}
            score={data.score}
          />
        </div>
      )}

      {/* Section 3: Compatibility Chart */}
      <div className="animate-fade-in-up" style={{ animationDelay: `${delayOffset + 160}ms` }}>
        <CompatibilityChart spiderWeb={data.spiderWeb} dimensionScores={data.dimensionScores} />
      </div>

      {/* Section 4: About Them */}
      {data.otherProfile.personalitySummary && (
        <div className="animate-fade-in-up" style={{ animationDelay: `${delayOffset + 240}ms` }}>
          <AboutThem summary={data.otherProfile.personalitySummary} />
        </div>
      )}

      {/* Section 5: Life Snapshot */}
      <div className="animate-fade-in-up" style={{ animationDelay: `${delayOffset + 320}ms` }}>
        <LifeSnapshot profile={data.otherProfile} />
      </div>

      {/* Section 6: Interests */}
      {data.otherProfile.hobbies.length > 0 && (
        <div className="animate-fade-in-up" style={{ animationDelay: `${delayOffset + 400}ms` }}>
          <InterestsSection hobbies={data.otherProfile.hobbies} />
        </div>
      )}

      {/* Section 7: Response */}
      <div className="animate-fade-in-up" style={{ animationDelay: `${delayOffset + 480}ms` }}>
        <ResponsePrompt
          presentationId={data.id}
          myResponse={data.myResponse}
          isMutualInterest={data.isMutualInterest}
          expiresAt={data.expiresAt}
          status={data.status}
          onResponseRecorded={fetchData}
        />
      </div>

      {/* Section 8: Schedule Introduction — only for active members with mutual interest */}
      {data.isMutualInterest && data.canSeeOriginal && (
        <div className="animate-fade-in-up" style={{ animationDelay: `${delayOffset + 560}ms` }}>
          <ScheduleIntroduction presentationId={data.id} />
        </div>
      )}
    </div>
  );
}
