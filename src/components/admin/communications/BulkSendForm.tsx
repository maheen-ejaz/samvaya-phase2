'use client';

import { useState, useEffect, useRef } from 'react';
import type { EmailTemplate } from '@/types';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface BulkSendFormProps {
  templates: EmailTemplate[];
}

interface RecipientPreview {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface SearchResult {
  userId: string;
  name: string;
  email: string | null;
}

type RecipientMode = 'bulk' | 'single';

export function BulkSendForm({ templates }: BulkSendFormProps) {
  const [step, setStep] = useState(1);

  // Step 1: Content
  const [useTemplate, setUseTemplate] = useState(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [customBody, setCustomBody] = useState('');

  // Step 2: Recipient mode
  const [recipientMode, setRecipientMode] = useState<RecipientMode>('bulk');

  // Bulk filter state
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterGooCampus, setFilterGooCampus] = useState<string>('all');
  const [recipients, setRecipients] = useState<RecipientPreview[]>([]);
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [recipientError, setRecipientError] = useState<string | null>(null);

  // Single recipient search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedSingleRecipient, setSelectedSingleRecipient] = useState<SearchResult | null>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const searchWrapperRef = useRef<HTMLDivElement>(null);

  // Step 3: Schedule
  const [scheduledAt, setScheduledAt] = useState('');

  // Confirm + result
  const [showConfirm, setShowConfirm] = useState(false);
  const [sending, setSending] = useState(false);

  const statuses = [
    'unverified',
    'verification_pending',
    'in_pool',
    'match_presented',
    'awaiting_payment',
    'active_member',
    'membership_expired',
  ];

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  // Inline template editing
  const [editingTemplate, setEditingTemplate] = useState(false);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');
  const [savingTemplate, setSavingTemplate] = useState(false);

  async function saveTemplateEdit() {
    if (!selectedTemplate) return;
    setSavingTemplate(true);
    try {
      const res = await fetch(`/api/admin/templates/${selectedTemplate.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: editSubject, body: editBody }),
      });
      if (res.ok) {
        selectedTemplate.subject = editSubject;
        selectedTemplate.body = editBody;
        setEditingTemplate(false);
        toast.success('Template updated');
      }
    } catch { /* ignore */ }
    finally { setSavingTemplate(false); }
  }

  // Bulk recipient preview fetch
  const fetchRecipients = async () => {
    setLoadingRecipients(true);
    setRecipientError(null);
    try {
      const params = new URLSearchParams();
      if (filterStatus.length > 0) params.set('payment_status', filterStatus.join(','));
      if (filterGooCampus !== 'all') params.set('goocampus', filterGooCampus);
      params.set('preview', 'true');

      const res = await fetch(`/api/admin/communications/bulk-send?${params}`);
      if (res.ok) {
        const data = await res.json();
        setRecipients(data.recipients || []);
      } else {
        setRecipientError('Failed to load recipients');
      }
    } catch {
      setRecipientError('Failed to load recipients');
    } finally {
      setLoadingRecipients(false);
    }
  };

  useEffect(() => {
    if (step === 2 && recipientMode === 'bulk') fetchRecipients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, filterStatus, filterGooCampus, recipientMode]);

  // Search debounce
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    searchDebounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/admin/applicants/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.applicants || []);
          setShowDropdown(true);
        }
      } catch { /* ignore */ }
      finally { setSearchLoading(false); }
    }, 300);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function selectSingleRecipient(r: SearchResult) {
    setSelectedSingleRecipient(r);
    setSearchQuery('');
    setSearchResults([]);
    setShowDropdown(false);
  }

  function switchMode(mode: RecipientMode) {
    setRecipientMode(mode);
    if (mode === 'bulk') {
      setSelectedSingleRecipient(null);
      setSearchQuery('');
      setSearchResults([]);
    } else {
      setFilterStatus([]);
      setFilterGooCampus('all');
      setRecipients([]);
    }
  }

  const handleSend = async () => {
    setSending(true);

    try {
      const payload: Record<string, unknown> = {};

      if (useTemplate && selectedTemplateId) {
        payload.template_id = selectedTemplateId;
      } else {
        payload.subject = customSubject;
        payload.body = customBody;
      }

      if (recipientMode === 'single' && selectedSingleRecipient) {
        payload.user_id = selectedSingleRecipient.userId;
      } else {
        payload.payment_status = filterStatus;
        payload.goocampus = filterGooCampus;
      }

      if (scheduledAt) {
        payload.scheduled_at = new Date(scheduledAt).toISOString();
      }

      const res = await fetch('/api/admin/communications/bulk-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Send failed');

      const sent = data.sent ?? data.count ?? 0;
      const failed = data.failed ?? 0;
      const message = scheduledAt
        ? `Scheduled ${sent} email${sent !== 1 ? 's' : ''} for ${new Date(scheduledAt).toLocaleString()}`
        : `Sent ${sent} email${sent !== 1 ? 's' : ''} successfully${failed > 0 ? ` (${failed} failed)` : ''}`;
      toast.success(message);
      setShowConfirm(false);
      setStep(1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Send failed');
    } finally {
      setSending(false);
    }
  };

  const canProceedStep1 = useTemplate ? !!selectedTemplateId : (!!customSubject && !!customBody);
  const canProceedStep2 = recipientMode === 'single'
    ? !!selectedSingleRecipient
    : recipients.length > 0;

  const recipientCount = recipientMode === 'single' ? (selectedSingleRecipient ? 1 : 0) : recipients.length;

  return (
    <div>
      {/* Step indicator */}
      <div className="mb-6 flex items-center gap-2 text-sm">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                step === s
                  ? 'bg-primary text-primary-foreground'
                  : step > s
                  ? 'bg-primary/80 text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {step > s ? '✓' : s}
            </div>
            <span className={step === s ? 'font-medium text-foreground' : step > s ? 'text-primary font-medium' : 'text-muted-foreground'}>
              {s === 1 ? 'Content' : s === 2 ? 'Recipients' : 'Review & Send'}
            </span>
            {s < 3 && <span className="mx-2 text-muted-foreground/40">—</span>}
          </div>
        ))}
      </div>

      {/* Step 1: Content */}
      {step === 1 && (
        <Card>
          <CardContent className="space-y-5 pt-6">
            {/* Segmented control */}
            <div className="flex rounded-lg border border-border p-0.5 bg-muted w-fit">
              <button
                type="button"
                onClick={() => setUseTemplate(true)}
                className={`rounded-md px-4 py-1.5 text-sm transition-all duration-150 ${
                  useTemplate
                    ? 'bg-card shadow-sm text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Use Template
              </button>
              <button
                type="button"
                onClick={() => setUseTemplate(false)}
                className={`rounded-md px-4 py-1.5 text-sm transition-all duration-150 ${
                  !useTemplate
                    ? 'bg-card shadow-sm text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Custom Content
              </button>
            </div>

            {useTemplate ? (
              <div>
                <Label htmlFor="bulk-template">Select Template</Label>
                <Select
                  value={selectedTemplateId || undefined}
                  onValueChange={setSelectedTemplateId}
                >
                  <SelectTrigger id="bulk-template" className="mt-1">
                    <SelectValue placeholder="Choose a template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedTemplate && (
                  <Card className="mt-3 bg-muted/50">
                    <CardContent className="pt-4 text-sm">
                      {editingTemplate ? (
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs">Subject</Label>
                            <Input
                              type="text"
                              value={editSubject}
                              onChange={(e) => setEditSubject(e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Body</Label>
                            <Textarea
                              value={editBody}
                              onChange={(e) => setEditBody(e.target.value)}
                              rows={8}
                              className="mt-1 font-mono"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={saveTemplateEdit}
                              disabled={savingTemplate}
                            >
                              {savingTemplate ? 'Saving...' : 'Save Template'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingTemplate(false)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-3">
                            <p className="font-medium text-foreground">Subject: {selectedTemplate.subject}</p>
                            <Button
                              variant="link"
                              size="sm"
                              className="flex-shrink-0 text-xs"
                              onClick={() => {
                                setEditSubject(selectedTemplate.subject);
                                setEditBody(selectedTemplate.body);
                                setEditingTemplate(true);
                              }}
                            >
                              Edit
                            </Button>
                          </div>
                          <p className="mt-2 whitespace-pre-wrap text-muted-foreground">{selectedTemplate.body}</p>
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bulk-subject">Subject</Label>
                  <Input
                    id="bulk-subject"
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    maxLength={255}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="bulk-body">Body</Label>
                  <Textarea
                    id="bulk-body"
                    value={customBody}
                    onChange={(e) => setCustomBody(e.target.value)}
                    rows={8}
                    maxLength={10000}
                    className="mt-1 font-mono"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end pt-1">
              <Button
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
              >
                Next: Select Recipients
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Recipients */}
      {step === 2 && (
        <Card>
          <CardContent className="space-y-5 pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">Select Recipients</h3>
              {/* Mode toggle */}
              <div className="flex rounded-lg border border-border p-0.5 bg-muted">
                <button
                  type="button"
                  onClick={() => switchMode('bulk')}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                    recipientMode === 'bulk'
                      ? 'bg-card shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Filter (Bulk)
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('single')}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                    recipientMode === 'single'
                      ? 'bg-card shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Single Recipient
                </button>
              </div>
            </div>

            {recipientMode === 'single' ? (
              /* Single recipient search */
              <div>
                <Label className="mb-2 block">Search by name</Label>
                <div ref={searchWrapperRef} className="relative">
                  <div className="relative">
                    <Input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Start typing a name..."
                      autoComplete="off"
                      className="pr-8"
                    />
                    {searchLoading && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-primary" />
                      </div>
                    )}
                  </div>

                  {/* Dropdown */}
                  {showDropdown && searchResults.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full rounded-xl border border-border bg-popover shadow-lg overflow-hidden">
                      {searchResults.map((r) => (
                        <button
                          key={r.userId}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => selectSingleRecipient(r)}
                          className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-accent transition-colors"
                        >
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                            {r.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{r.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{r.email ?? 'No email on file'}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {showDropdown && searchResults.length === 0 && !searchLoading && searchQuery.length >= 2 && (
                    <div className="absolute z-10 mt-1 w-full rounded-xl border border-border bg-popover shadow-lg px-4 py-3">
                      <p className="text-sm text-muted-foreground">No matching applicants found.</p>
                    </div>
                  )}
                </div>

                {/* Selected recipient chip */}
                {selectedSingleRecipient && (
                  <div className="mt-3 flex items-center gap-3 rounded-lg bg-primary/5 border border-primary/20 px-4 py-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                      {selectedSingleRecipient.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground">{selectedSingleRecipient.name}</p>
                      <p className="text-xs text-primary font-medium">{selectedSingleRecipient.email ?? 'No email on file'}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedSingleRecipient(null)}
                      className="flex-shrink-0 rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      aria-label="Remove recipient"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Bulk filter */
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Payment Status</p>
                    <div className="space-y-2">
                      {statuses.map((s) => (
                        <label key={s} className="flex items-center gap-2.5 text-sm cursor-pointer group">
                          <Checkbox
                            checked={filterStatus.includes(s)}
                            onCheckedChange={(checked) => {
                              setFilterStatus(checked
                                ? [...filterStatus, s]
                                : filterStatus.filter((x) => x !== s)
                              );
                            }}
                          />
                          <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                            {s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                          </span>
                        </label>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">GooCampus Member</p>
                      <Select value={filterGooCampus} onValueChange={setFilterGooCampus}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="yes">GooCampus Only</SelectItem>
                          <SelectItem value="no">Non-GooCampus Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Recipients count banner */}
            <div className={`rounded-lg border p-3 ${
              recipientCount > 0
                ? 'bg-primary/5 border-primary/20'
                : 'bg-muted border-border'
            }`}>
              {recipientMode === 'bulk' && recipientError ? (
                <p className="text-sm text-destructive">{recipientError}</p>
              ) : recipientMode === 'bulk' && loadingRecipients ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-primary" />
                  <p className="text-sm text-muted-foreground">Loading recipients...</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    <span className={`font-semibold ${recipientCount > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                      {recipientCount}
                    </span>{' '}
                    recipient{recipientCount !== 1 ? 's' : ''}{' '}
                    {recipientMode === 'bulk' ? 'match your filters' : 'selected'}
                  </p>
                  {recipientMode === 'bulk' && recipients.length > 100 && (
                    <p className="mt-1 text-xs text-amber-600 font-medium">
                      Warning: Resend free tier allows 100 emails/day. Consider sending in batches.
                    </p>
                  )}
                  {recipientMode === 'bulk' && recipients.length > 0 && recipients.length <= 10 && (
                    <ul className="mt-2 space-y-0.5">
                      {recipients.map((r) => (
                        <li key={r.id} className="text-xs text-primary">
                          {r.first_name} {r.last_name} — <span className="text-muted-foreground">{r.email}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>

            {/* Schedule option */}
            <Card>
              <CardContent className="pt-4">
                <Label htmlFor="schedule-at">
                  Schedule <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input
                  id="schedule-at"
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="mt-2 w-fit"
                />
                {scheduledAt && (
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Will be sent at {new Date(scheduledAt).toLocaleString()}
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-between pt-1">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!canProceedStep2}
              >
                Next: Review
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review & Send */}
      {step === 3 && (
        <Card>
          <CardContent className="space-y-5 pt-6">
            <h3 className="text-base font-semibold text-foreground">Review & Confirm</h3>

            <Card className="bg-muted/50">
              <CardContent className="pt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Content</span>
                  <span className="font-medium text-foreground">{useTemplate ? selectedTemplate?.name : 'Custom content'}</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Recipients</span>
                  <span className="font-semibold text-primary">
                    {recipientMode === 'single' && selectedSingleRecipient
                      ? `${selectedSingleRecipient.name} (${selectedSingleRecipient.email})`
                      : `${recipients.length} applicant${recipients.length !== 1 ? 's' : ''}`}
                  </span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-medium text-foreground">
                    {scheduledAt ? `Scheduled for ${new Date(scheduledAt).toLocaleString()}` : 'Immediate'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between pt-1">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={() => setShowConfirm(true)}>
                {scheduledAt ? 'Schedule Send' : 'Send Now'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Send</DialogTitle>
            <DialogDescription>
              You are about to {scheduledAt ? 'schedule' : 'send'}{' '}
              {recipientMode === 'single' && selectedSingleRecipient ? (
                <>an email to <span className="font-semibold text-foreground">{selectedSingleRecipient.name}</span> ({selectedSingleRecipient.email})</>
              ) : (
                <><span className="font-semibold text-foreground">{recipients.length}</span> email{recipients.length !== 1 ? 's' : ''}</>
              )}.
              {' '}This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirm(false)}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={sending}
            >
              {sending ? 'Sending...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
