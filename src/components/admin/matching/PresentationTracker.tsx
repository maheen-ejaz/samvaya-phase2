'use client';

import { useState, useEffect, useCallback } from 'react';
import { ApplicantStatusIcons } from '@/components/admin/ApplicantStatusIcons';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface Presentation {
  id: string;
  status: string;
  member_a_response: string;
  member_b_response: string;
  is_mutual_interest: boolean;
  is_full_revealed: boolean;
  presented_at: string;
  expires_at: string;
  profile_a_name: string;
  profile_b_name: string;
  profile_a_is_goocampus: boolean;
  profile_a_payment_status: string | null;
  profile_b_is_goocampus: boolean;
  profile_b_payment_status: string | null;
  match_share_token: string | null;
  match_suggestions: {
    overall_compatibility_score: number;
    profile_a_id: string;
    profile_b_id: string;
  };
}

export function PresentationTracker() {
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [respondingTo, setRespondingTo] = useState<{ presentationId: string; memberId: string; memberLabel: string } | null>(null);
  const [responseValue, setResponseValue] = useState<'interested' | 'not_interested'>('interested');
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealingId, setRevealingId] = useState<string | null>(null);

  const fetchPresentations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/matching/presentations?status=${statusFilter}&limit=50`
      );
      if (!res.ok) throw new Error('Failed to fetch presentations');
      const data = await res.json();
      setPresentations(data.presentations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchPresentations();
  }, [fetchPresentations]);

  const getResponseVariant = (response: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (response) {
      case 'interested': return 'secondary';
      case 'not_interested': return 'destructive';
      case 'pending': return 'outline';
      case 'expired': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'mutual_interest': return 'secondary';
      case 'one_sided': return 'outline';
      case 'declined': return 'destructive';
      case 'expired': return 'outline';
      case 'pending': return 'default';
      default: return 'outline';
    }
  };

  const getDaysRemaining = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'Expired';
    const days = Math.ceil(diff / (24 * 60 * 60 * 1000));
    return `${days}d remaining`;
  };

  const copyMatchLink = (token: string, presentationId: string) => {
    const url = `${window.location.origin}/share/${token}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(presentationId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const revealProfiles = async (presentationId: string) => {
    setRevealingId(presentationId);
    setError(null);
    try {
      const res = await fetch(`/api/admin/matching/presentations/${presentationId}/reveal`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to reveal profiles');
      }
      setSuccessMessage('Full profiles revealed. The share link now shows complete profiles.');
      fetchPresentations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setRevealingId(null);
    }
  };

  const handleRecordResponse = async () => {
    if (!respondingTo) return;
    setActionLoading(true);
    setSuccessMessage(null);
    try {
      const res = await fetch(
        `/api/admin/matching/presentations/${respondingTo.presentationId}/respond`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            memberId: respondingTo.memberId,
            response: responseValue,
          }),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to record response');
      }
      const data = await res.json();
      setSuccessMessage(
        data.is_mutual_interest
          ? 'Mutual interest confirmed!'
          : `Response recorded. Status: ${data.status}`
      );
      setRespondingTo(null);
      fetchPresentations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center gap-4">
        <Label htmlFor="pres-status" className="text-sm font-medium">Status:</Label>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="mutual_interest">Mutual Interest</SelectItem>
            <SelectItem value="one_sided">One-Sided</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">{error}</div>}
      {successMessage && <div className="rounded-md bg-green-50 p-3 text-sm text-green-700" role="status">{successMessage}</div>}

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
        </div>
      )}

      {!loading && presentations.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-sm text-muted-foreground">No presentations found.</p>
          </CardContent>
        </Card>
      )}

      {!loading && presentations.length > 0 && (
        <div className="space-y-3">
          {presentations.map((p) => (
            <Card key={p.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="inline-flex items-center gap-1 text-sm font-medium text-foreground">
                        {p.profile_a_name}
                        <ApplicantStatusIcons isGooCampusMember={p.profile_a_is_goocampus ?? false} paymentStatus={p.profile_a_payment_status} size={12} />
                      </p>
                      <Badge variant={getResponseVariant(p.member_a_response)} className="mt-1 block w-fit">
                        {p.member_a_response}
                      </Badge>
                    </div>
                    <span className="text-muted-foreground">×</span>
                    <div>
                      <p className="inline-flex items-center gap-1 text-sm font-medium text-foreground">
                        {p.profile_b_name}
                        <ApplicantStatusIcons isGooCampusMember={p.profile_b_is_goocampus ?? false} paymentStatus={p.profile_b_payment_status} size={12} />
                      </p>
                      <Badge variant={getResponseVariant(p.member_b_response)} className="mt-1 block w-fit">
                        {p.member_b_response}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={getStatusVariant(p.status)}>
                      {p.status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </Badge>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Score: {p.match_suggestions.overall_compatibility_score}
                    </p>
                    {p.status === 'pending' && (
                      <p className="text-xs text-muted-foreground">{getDaysRemaining(p.expires_at)}</p>
                    )}
                  </div>
                </div>

                {/* Action bar */}
                <div className="mt-3 flex flex-wrap gap-2 border-t pt-3">
                  {/* Copy share link */}
                  {p.match_share_token && (
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => copyMatchLink(p.match_share_token!, p.id)}
                    >
                      {copiedId === p.id ? '✓ Copied!' : '🔗 Copy Match Link'}
                    </Button>
                  )}

                  {/* Reveal full profiles (mutual interest, not yet revealed) */}
                  {p.is_mutual_interest && !p.is_full_revealed && (
                    <Button
                      size="xs"
                      onClick={() => revealProfiles(p.id)}
                      disabled={revealingId === p.id}
                    >
                      {revealingId === p.id ? 'Revealing...' : '✦ Reveal Full Profiles'}
                    </Button>
                  )}

                  {/* Already revealed badge */}
                  {p.is_full_revealed && (
                    <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                      ✓ Full profiles revealed
                    </span>
                  )}

                  {/* Record responses */}
                  {p.status === 'pending' && p.member_a_response === 'pending' && (
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => setRespondingTo({
                        presentationId: p.id,
                        memberId: p.match_suggestions.profile_a_id,
                        memberLabel: p.profile_a_name,
                      })}
                    >
                      Record {p.profile_a_name}&apos;s Response
                    </Button>
                  )}
                  {p.status === 'pending' && p.member_b_response === 'pending' && (
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => setRespondingTo({
                        presentationId: p.id,
                        memberId: p.match_suggestions.profile_b_id,
                        memberLabel: p.profile_b_name,
                      })}
                    >
                      Record {p.profile_b_name}&apos;s Response
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Response dialog */}
      <Dialog open={!!respondingTo} onOpenChange={(open) => { if (!open) setRespondingTo(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Record Response</DialogTitle>
            <DialogDescription>
              Recording response for <strong>{respondingTo?.memberLabel}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="response"
                value="interested"
                checked={responseValue === 'interested'}
                onChange={() => setResponseValue('interested')}
              />
              <span className="text-sm">Interested</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="response"
                value="not_interested"
                checked={responseValue === 'not_interested'}
                onChange={() => setResponseValue('not_interested')}
              />
              <span className="text-sm">Not Interested</span>
            </label>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRespondingTo(null)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRecordResponse}
              disabled={actionLoading}
            >
              {actionLoading ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
