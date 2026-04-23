'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface IntroductionData {
  id: string;
  match_presentation_id: string;
  introduction_number: number;
  scheduled_at: string | null;
  meeting_link: string | null;
  is_team_facilitated: boolean;
  facilitator_id: string | null;
  status: string;
  outcome_member_a: string | null;
  outcome_member_b: string | null;
  team_feedback_notes: string | null;
  created_at: string;
}

export function IntroductionManager() {
  const [introductions, setIntroductions] = useState<IntroductionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [outcomeModal, setOutcomeModal] = useState<string | null>(null);
  const [outcomeA, setOutcomeA] = useState('want_to_continue');
  const [outcomeB, setOutcomeB] = useState('want_to_continue');
  const [teamNotes, setTeamNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchIntroductions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/matching/introductions?status=${statusFilter}&limit=50`
      );
      if (!res.ok) throw new Error('Failed to fetch introductions');
      const data = await res.json();
      setIntroductions(data.introductions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchIntroductions();
  }, [fetchIntroductions]);

  const handleRecordOutcome = async () => {
    if (!outcomeModal) return;
    setActionLoading(true);
    try {
      const res = await fetch(
        `/api/admin/matching/introductions/${outcomeModal}/outcome`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            outcomeMemberA: outcomeA,
            outcomeMemberB: outcomeB,
            teamFeedbackNotes: teamNotes,
          }),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to record outcome');
      }
      setOutcomeModal(null);
      setTeamNotes('');
      fetchIntroductions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'scheduled': return 'default';
      case 'completed': return 'secondary';
      case 'rescheduled': return 'outline';
      case 'cancelled': return 'outline';
      case 'no_show': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Label htmlFor="intro-status" className="text-sm font-medium">Status:</Label>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="rescheduled">Rescheduled</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">{error}</div>}

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
        </div>
      )}

      {!loading && introductions.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-sm text-muted-foreground">No introductions scheduled yet.</p>
          </CardContent>
        </Card>
      )}

      {!loading && introductions.length > 0 && (
        <div className="space-y-3">
          {introductions.map((intro) => (
            <Card key={intro.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Introduction #{intro.introduction_number}
                      {intro.is_team_facilitated && (
                        <span className="ml-2 text-xs text-muted-foreground">(facilitated)</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {intro.scheduled_at
                        ? new Date(intro.scheduled_at).toLocaleString('en-IN')
                        : 'Not yet scheduled'}
                    </p>
                    {intro.meeting_link && (
                      <a
                        href={intro.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:text-primary/80"
                      >
                        Meeting Link
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusVariant(intro.status)}>
                      {intro.status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </Badge>
                    {(intro.status === 'scheduled' || intro.status === 'rescheduled') && (
                      <Button
                        size="xs"
                        onClick={() => setOutcomeModal(intro.id)}
                      >
                        Record Outcome
                      </Button>
                    )}
                  </div>
                </div>

                {/* Show outcomes if completed */}
                {intro.status === 'completed' && (
                  <div className="mt-2 border-t pt-2">
                    <p className="text-xs text-muted-foreground">
                      Member A: <span className="font-medium">{intro.outcome_member_a?.replace('_', ' ')}</span>
                      {' | '}
                      Member B: <span className="font-medium">{intro.outcome_member_b?.replace('_', ' ')}</span>
                    </p>
                    {intro.team_feedback_notes && (
                      <p className="mt-1 text-xs text-muted-foreground">Notes: {intro.team_feedback_notes}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Outcome recording dialog */}
      <Dialog open={!!outcomeModal} onOpenChange={(open) => { if (!open) setOutcomeModal(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record Introduction Outcome</DialogTitle>
            <DialogDescription>Record the outcome for both members after the introduction.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Member A Outcome</Label>
              <Select value={outcomeA} onValueChange={setOutcomeA}>
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="want_to_continue">Want to Continue</SelectItem>
                  <SelectItem value="not_a_match">Not a Match</SelectItem>
                  <SelectItem value="need_more_time">Need More Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Member B Outcome</Label>
              <Select value={outcomeB} onValueChange={setOutcomeB}>
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="want_to_continue">Want to Continue</SelectItem>
                  <SelectItem value="not_a_match">Not a Match</SelectItem>
                  <SelectItem value="need_more_time">Need More Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Team Feedback Notes</Label>
              <Textarea
                value={teamNotes}
                onChange={(e) => setTeamNotes(e.target.value)}
                rows={3}
                className="mt-1"
                placeholder="Observations from the facilitated call..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOutcomeModal(null)}
            >
              Cancel
            </Button>
            <button
              type="button"
              onClick={handleRecordOutcome}
              disabled={actionLoading}
              className="form-btn-primary"
            >
              {actionLoading ? 'Saving...' : 'Save Outcome'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
