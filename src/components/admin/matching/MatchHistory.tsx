'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { MatchSuggestionWithProfiles, CompatibilityReport } from '@/types/matching';
import { CompatibilityBreakdown } from './CompatibilityBreakdown';
import { ApplicantStatusIcons } from '@/components/admin/ApplicantStatusIcons';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function MatchHistory() {
  const [suggestions, setSuggestions] = useState<MatchSuggestionWithProfiles[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/matching/suggestions?status=${statusFilter}&page=${page}&limit=20`
      );
      if (!res.ok) throw new Error('Failed to fetch history');
      const data = await res.json();
      setSuggestions(data.suggestions);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'approved': return 'secondary';
      case 'rejected': return 'destructive';
      case 'pending_review': return 'default';
      case 'expired': return 'outline';
      default: return 'outline';
    }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Label htmlFor="history-status" className="text-sm font-medium">Status:</Label>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending_review">Pending Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{total} total</span>
      </div>

      {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">{error}</div>}

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
        </div>
      )}

      {!loading && suggestions.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-sm text-muted-foreground">No match history found.</p>
          </CardContent>
        </Card>
      )}

      {!loading && suggestions.length > 0 && (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Person A</TableHead>
                <TableHead>Person B</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Recommendation</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suggestions.map((s) => (
                <React.Fragment key={s.id}>
                  <TableRow className="group hover:bg-muted/50">
                    <TableCell>
                      <span className="inline-flex items-center gap-1 font-medium text-foreground">
                        {s.profile_a.full_name}
                        <ApplicantStatusIcons isGooCampusMember={s.profile_a.is_goocampus_member ?? false} paymentStatus={s.profile_a.payment_status} size={12} />
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 font-medium text-foreground">
                        {s.profile_b.full_name}
                        <ApplicantStatusIcons isGooCampusMember={s.profile_b.is_goocampus_member ?? false} paymentStatus={s.profile_b.payment_status} size={12} />
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{s.overall_compatibility_score}</TableCell>
                    <TableCell className="text-muted-foreground">{s.recommendation?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(s.admin_status)}>
                        {s.admin_status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(s.created_at).toLocaleDateString('en-IN')}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {expandedId === s.id ? 'Hide' : 'Details'}
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expandedId === s.id && (
                    <TableRow key={`${s.id}-details`}>
                      <TableCell colSpan={7} className="bg-muted/50 px-6 py-4">
                        <CompatibilityBreakdown report={s.compatibility_report as CompatibilityReport} />
                        {s.admin_notes && (
                          <div className="mt-3">
                            <p className="text-xs font-medium text-muted-foreground">Admin Notes:</p>
                            <p className="text-sm text-foreground">{s.admin_notes}</p>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
