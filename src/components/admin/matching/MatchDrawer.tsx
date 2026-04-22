'use client';

import { useState, useEffect, useCallback } from 'react';
import type { MatchSuggestionWithProfiles, CompatibilityReport } from '@/types/matching';
import { CompatibilityBreakdown } from './CompatibilityBreakdown';
import { capitalize } from '@/lib/utils';
import { ApplicantStatusIcons } from '@/components/admin/ApplicantStatusIcons';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MatchDrawerProps {
  suggestions: MatchSuggestionWithProfiles[];
  currentIndex: number;
  onNavigate: (index: number) => void;
  onClose: () => void;
  onApprove: (id: string, narrative: string, notes: string) => Promise<void>;
  onReject: (id: string, notes: string) => Promise<void>;
}

function getPlaceholderSrc(gender?: string | null): string {
  if (gender?.toLowerCase() === 'male') return '/male-placeholder.jpg';
  if (gender?.toLowerCase() === 'female') return '/female-placeholder.jpg';
  return '/male-placeholder.jpg';
}

function getRecommendationLabel(rec: string): string {
  switch (rec) {
    case 'strongly_recommend': return 'Strongly Recommend';
    case 'recommend': return 'Recommend';
    case 'worth_considering': return 'Worth Considering';
    case 'not_recommended': return 'Not Recommended';
    default: return rec;
  }
}

function getRecommendationVariant(rec: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (rec) {
    case 'strongly_recommend': return 'default';
    case 'recommend': return 'secondary';
    case 'worth_considering': return 'outline';
    case 'not_recommended': return 'destructive';
    default: return 'outline';
  }
}

function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'approved': return 'default';
    case 'rejected': return 'destructive';
    case 'pending_review': return 'outline';
    default: return 'outline';
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'pending_review': return 'Pending Review';
    case 'approved': return 'Approved';
    case 'rejected': return 'Rejected';
    default: return status;
  }
}

function getCardGradient(gender?: string | null): string {
  const g = gender?.toLowerCase();
  if (g === 'male') return 'border-blue-200 bg-gradient-to-b from-blue-50/80 to-white';
  if (g === 'female') return 'border-pink-200 bg-gradient-to-b from-pink-50/80 to-white';
  return 'border-gray-200 bg-white';
}

/** Horizontal score bar — diagonal stripe texture */
function ScoreBar({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  let barColor: string;
  if (clamped < 50) barColor = '#EF5350';
  else if (clamped < 75) barColor = '#FFA726';
  else barColor = '#66BB6A';

  return (
    <div className="flex items-center gap-3">
      <span className="text-3xl font-light tabular-nums tracking-tight text-foreground">{score}</span>
      <div className="relative h-4 flex-1 overflow-hidden rounded-md bg-muted">
        <div
          className="absolute inset-y-0 left-0 rounded-md"
          style={{
            width: `${clamped}%`,
            background: `repeating-linear-gradient(-45deg, ${barColor}, ${barColor} 4px, ${barColor}CC 4px, ${barColor}CC 8px)`,
          }}
        />
        <div
          className="absolute inset-y-0 right-0"
          style={{
            left: `${clamped}%`,
            background: 'repeating-linear-gradient(-45deg, #E5E7EB, #E5E7EB 4px, #F3F4F6 4px, #F3F4F6 8px)',
          }}
        />
      </div>
    </div>
  );
}

function ProfileCard({ person }: { person: MatchSuggestionWithProfiles['profile_a'] }) {
  const photoSrc = person.primary_photo_url || getPlaceholderSrc(person.gender);
  const cardStyle = getCardGradient(person.gender);
  const details = [
    person.specialty?.map((s) => capitalize(s)).join(', '),
  ].filter(Boolean);
  const age = person.age ? `${person.age}y` : null;
  const location = [person.current_city, person.current_state].filter(Boolean).map((v) => capitalize(v!)).join(', ') || null;

  return (
    <div className={`flex-1 rounded-2xl border p-4 shadow-sm ${cardStyle}`}>
      <div className="aspect-[4/5] w-full overflow-hidden rounded-xl bg-muted">
        <img src={photoSrc} alt={person.full_name} className="h-full w-full object-cover" />
      </div>
      <div className="mt-3 px-1">
        <p className="inline-flex items-center gap-1.5 text-base font-bold text-foreground">
          {person.full_name}
          <ApplicantStatusIcons isGooCampusMember={person.is_goocampus_member ?? false} paymentStatus={person.payment_status} size={13} />
        </p>
        {details.length > 0 && <p className="mt-1 text-sm text-muted-foreground">{details.join(', ')}</p>}
        {(age || location) && (
          <div className="mt-1 flex items-center justify-between text-sm text-muted-foreground/70">
            {age && <span>{age}</span>}
            {location && <span>{location}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

export function MatchDrawer({
  suggestions,
  currentIndex,
  onNavigate,
  onClose,
  onApprove,
  onReject,
}: MatchDrawerProps) {
  const suggestion = suggestions[currentIndex];
  const [narrative, setNarrative] = useState(suggestion?.match_narrative || '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Reset form fields when suggestion changes
  useEffect(() => {
    setNarrative(suggestion?.match_narrative || '');
    setNotes('');
    setValidationError(null);
    setActionSuccess(null);
  }, [suggestion?.id, suggestion?.match_narrative]);

  // Arrow key navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft' && currentIndex > 0) onNavigate(currentIndex - 1);
    if (e.key === 'ArrowRight' && currentIndex < suggestions.length - 1) onNavigate(currentIndex + 1);
  }, [onNavigate, currentIndex, suggestions.length]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!suggestion) return null;

  const report = suggestion.compatibility_report as CompatibilityReport;
  const isPending = suggestion.admin_status === 'pending_review';
  const daysAgo = Math.floor((Date.now() - new Date(suggestion.created_at).getTime()) / (1000 * 60 * 60 * 24));
  const [firstProfile, secondProfile] = suggestion.profile_a?.gender?.toLowerCase() === 'female'
    ? [suggestion.profile_a, suggestion.profile_b]
    : [suggestion.profile_b, suggestion.profile_a];

  const handleApprove = async () => {
    setValidationError(null);
    setLoading(true);
    try {
      await onApprove(suggestion.id, narrative, notes);
      setActionSuccess('Match approved successfully.');
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : 'Approval failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!notes.trim()) {
      setValidationError('Please provide a rejection reason in the notes field.');
      return;
    }
    setValidationError(null);
    setLoading(true);
    try {
      await onReject(suggestion.id, notes);
      setActionSuccess('Match rejected.');
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : 'Rejection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent
        side="right"
        className="w-[55vw] min-w-[640px] max-w-[900px] p-0 [&>button:last-child]:hidden"
        showCloseButton={false}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center gap-4 border-b px-6 py-4">
          {/* Prev/Next navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => onNavigate(currentIndex - 1)}
              disabled={currentIndex === 0}
              title="Previous match (←)"
              className="rounded-full"
            >
              ←
            </Button>
            <span className="min-w-[60px] text-center text-xs text-muted-foreground">
              {currentIndex + 1} of {suggestions.length}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => onNavigate(currentIndex + 1)}
              disabled={currentIndex === suggestions.length - 1}
              title="Next match (→)"
              className="rounded-full"
            >
              →
            </Button>
          </div>

          <SheetHeader className="flex-1 space-y-0">
            <SheetTitle className="text-sm">
              {firstProfile.full_name} &amp; {secondProfile.full_name}
            </SheetTitle>
            <SheetDescription className="text-xs">
              Created {daysAgo === 0 ? 'today' : `${daysAgo}d ago`}
            </SheetDescription>
          </SheetHeader>

          <Button
            variant="outline"
            size="icon-sm"
            onClick={onClose}
            title="Close (Esc)"
            className="rounded-full"
          >
            ✕
          </Button>
        </div>

        {/* Scrollable body */}
        <ScrollArea className="flex-1 h-[calc(100vh-73px)]">
          {/* Profile cards — female always on the left */}
          <div className="flex gap-4 px-6 pt-6">
            <ProfileCard person={firstProfile} />
            <ProfileCard person={secondProfile} />
          </div>

          {/* Score + badges */}
          <div className="px-6 pt-5">
            <ScoreBar score={suggestion.overall_compatibility_score} />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {suggestion.recommendation && (
                <Badge variant={getRecommendationVariant(suggestion.recommendation)}>
                  {getRecommendationLabel(suggestion.recommendation)}
                </Badge>
              )}
              <Badge variant={getStatusVariant(suggestion.admin_status)}>
                {getStatusLabel(suggestion.admin_status)}
              </Badge>
              {suggestion.is_stale && (
                <Badge variant="outline" className="border-yellow-200 bg-yellow-50 text-yellow-700">
                  Stale — profiles updated
                </Badge>
              )}
            </div>
          </div>

          {/* Compatibility breakdown */}
          {report && (
            <div className="px-6 pt-6">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Compatibility Breakdown</h3>
              <CompatibilityBreakdown report={report} />
            </div>
          )}

          {/* Review form */}
          <div className="px-6 py-6">
            <Card className="bg-muted/50 p-5">
              <CardContent className="space-y-4 p-0">
                <h3 className="text-sm font-semibold text-foreground">
                  {isPending ? 'Review Decision' : 'Admin Review'}
                </h3>

                {/* Narrative preview — styled read-only card */}
                {narrative && (
                  <Card className="px-4 py-3">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Match Narrative</p>
                    <p className="text-sm leading-relaxed text-foreground/80 italic">&ldquo;{narrative}&rdquo;</p>
                  </Card>
                )}

                <div>
                  <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Edit Narrative {!isPending && '(read-only)'}
                  </Label>
                  <Textarea
                    value={narrative}
                    onChange={(e) => setNarrative(e.target.value)}
                    readOnly={!isPending}
                    rows={4}
                    className={`mt-1.5 ${!isPending ? 'opacity-60 cursor-default' : ''}`}
                    placeholder="AI-generated narrative about why these two are compatible..."
                  />
                </div>

                {isPending && (
                  <div>
                    <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Admin Notes (required for rejection)
                    </Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="mt-1.5"
                      placeholder="Notes or rejection reason..."
                    />
                  </div>
                )}

                {suggestion.admin_notes && !isPending && (
                  <div>
                    <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Admin Notes</Label>
                    <p className="mt-1.5 rounded-lg bg-background/60 px-3 py-2 text-sm text-muted-foreground">{suggestion.admin_notes}</p>
                  </div>
                )}

                {validationError && (
                  <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">{validationError}</p>
                )}

                {actionSuccess && (
                  <p className="rounded-lg bg-muted px-3 py-2 text-sm text-primary" role="status">{actionSuccess}</p>
                )}

                {isPending && !actionSuccess && (
                  <div className="flex gap-2 pt-1">
                    <Button
                      onClick={handleApprove}
                      disabled={loading}
                      className="rounded-full"
                    >
                      {loading ? 'Processing...' : 'Approve Match'}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleReject}
                      disabled={loading}
                      className="rounded-full"
                    >
                      {loading ? 'Processing...' : 'Reject'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
