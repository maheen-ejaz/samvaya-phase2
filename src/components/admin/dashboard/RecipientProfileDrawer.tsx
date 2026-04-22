'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { cn, formatDateIN } from '@/lib/utils';
import { ApplicantStatusIcons } from '@/components/admin/ApplicantStatusIcons';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UserSummary {
  name: string | null;
  age: number | null;
  gender: string | null;
  specialty: string[];
  religion: string | null;
  location: string | null;
  registrationDate: string;
  paymentStatus: string;
  formProgress: number;
  isGoocampusMember: boolean;
  bgvStatus: boolean;
  membershipStatus: string;
  photoUrl: string | null;
}

interface RecipientProfileDrawerProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  unverified: 'Unverified',
  verification_pending: 'Verification Pending',
  in_pool: 'In Pool',
  match_presented: 'Match Presented',
  awaiting_payment: 'Awaiting Payment',
  active_member: 'Active Member',
  membership_expired: 'Membership Expired',
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  unverified: 'bg-gray-100 text-gray-700',
  verification_pending: 'bg-yellow-100 text-yellow-800',
  in_pool: 'bg-blue-100 text-blue-800',
  match_presented: 'bg-purple-100 text-purple-800',
  awaiting_payment: 'bg-orange-100 text-orange-800',
  active_member: 'bg-muted text-primary',
  membership_expired: 'bg-red-100 text-red-800',
};

export function RecipientProfileDrawer({ userId, open, onOpenChange }: RecipientProfileDrawerProps) {
  const [summary, setSummary] = useState<UserSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailState, setEmailState] = useState<{ open: boolean; subject: string; body: string }>({
    open: false, subject: '', body: '',
  });
  const [emailSending, setEmailSending] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setSummary(null);
    fetch(`/api/admin/users/${userId}/summary`)
      .then((r) => r.json())
      .then((data) => setSummary(data))
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  }, [userId, open]);

  async function handleSendEmail() {
    if (!emailState.subject.trim() || !emailState.body.trim()) return;
    setEmailSending(true);
    setEmailError(null);
    try {
      const res = await fetch(`/api/admin/applicants/${userId}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: emailState.subject, body: emailState.body }),
      });
      if (!res.ok) {
        const d = await res.json();
        setEmailError(d.error || 'Failed to send email.');
      } else {
        setEmailSuccess(true);
        setEmailState({ open: false, subject: '', body: '' });
        setTimeout(() => setEmailSuccess(false), 3000);
      }
    } catch {
      setEmailError('Network error. Please try again.');
    } finally {
      setEmailSending(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[420px] sm:max-w-[420px] flex flex-col p-0">
        {/* Header */}
        <SheetHeader className="border-b border-border p-5">
          <div className="flex items-center gap-4">
            {/* Photo */}
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-muted">
              {summary?.photoUrl ? (
                <Image
                  src={summary.photoUrl}
                  alt={summary.name || 'Profile photo'}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-muted-foreground">
                  {summary?.name?.charAt(0)?.toUpperCase() ?? '?'}
                </div>
              )}
            </div>

            {/* Name + specialty */}
            <div>
              {loading ? (
                <div className="h-5 w-32 animate-pulse rounded bg-muted" />
              ) : (
                <SheetTitle className="inline-flex items-center gap-1.5">
                  {summary?.name || 'Unknown'}
                  <ApplicantStatusIcons isGooCampusMember={summary?.isGoocampusMember ?? false} paymentStatus={summary?.paymentStatus} size={14} />
                </SheetTitle>
              )}
              {summary?.specialty && summary.specialty.length > 0 && (
                <SheetDescription>{summary.specialty.join(', ')}</SheetDescription>
              )}
            </div>
          </div>
        </SheetHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {loading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-4 animate-pulse rounded bg-muted" style={{ width: `${60 + (i % 3) * 15}%` }} />
              ))}
            </div>
          ) : !summary ? (
            <p className="text-sm text-muted-foreground">Could not load profile data.</p>
          ) : (
            <>
              {/* Info grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <InfoItem label="Age" value={summary.age ? `${summary.age} yrs` : null} />
                <InfoItem label="Gender" value={summary.gender ? capitalize(summary.gender) : null} />
                <InfoItem label="Location" value={summary.location} />
                <InfoItem label="Religion" value={summary.religion ? capitalize(summary.religion) : null} />
                <InfoItem label="Registered" value={formatDateIN(summary.registrationDate)} />
                <InfoItem label="BGV" value={summary.bgvStatus ? 'Complete' : 'Pending'} valueClass={summary.bgvStatus ? 'text-primary' : 'text-yellow-700'} />
              </div>

              {/* Payment status */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5">Payment Status</p>
                <Badge
                  variant="outline"
                  className={cn(
                    'rounded-full',
                    PAYMENT_STATUS_COLORS[summary.paymentStatus] || 'bg-gray-100 text-gray-700'
                  )}
                >
                  {PAYMENT_STATUS_LABELS[summary.paymentStatus] || capitalize(summary.paymentStatus)}
                </Badge>
              </div>

              {/* Form progress */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Form Progress</p>
                  <span className="text-xs font-medium text-foreground">{summary.formProgress}%</span>
                </div>
                <Progress value={summary.formProgress} className="h-2" />
              </div>

              <Separator />

              {/* Actions */}
              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</p>

                {emailSuccess && (
                  <Alert>
                    <AlertDescription>Email sent successfully.</AlertDescription>
                  </Alert>
                )}

                {!emailState.open ? (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setEmailState((s) => ({ ...s, open: true }))}
                  >
                    Send Email
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="Subject"
                      value={emailState.subject}
                      onChange={(e) => setEmailState((s) => ({ ...s, subject: e.target.value }))}
                    />
                    <Textarea
                      placeholder="Message..."
                      value={emailState.body}
                      onChange={(e) => setEmailState((s) => ({ ...s, body: e.target.value }))}
                      rows={4}
                      className="resize-none"
                    />
                    {emailError && <p className="text-xs text-destructive">{emailError}</p>}
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSendEmail}
                        disabled={emailSending || !emailState.subject.trim() || !emailState.body.trim()}
                        className="flex-1"
                      >
                        {emailSending ? 'Sending\u2026' : 'Send'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setEmailState({ open: false, subject: '', body: '' })}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href={`/admin/applicants/${userId}`}>
                    View Full Profile &rarr;
                  </a>
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function InfoItem({ label, value, valueClass }: { label: string; value: string | null | undefined; valueClass?: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn('mt-0.5 text-sm font-medium text-foreground', valueClass)}>
        {value || <span className="font-normal text-muted-foreground">&mdash;</span>}
      </p>
    </div>
  );
}

function capitalize(str: string) {
  return str.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
