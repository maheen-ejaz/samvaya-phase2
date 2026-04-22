'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle2Icon, AlertTriangleIcon, XCircleIcon } from 'lucide-react';

interface BgvCheck {
  id: string;
  check_type: string;
  status: string;
  notes: string | null;
}

interface BgvUserInfo {
  paymentStatus: string;
  bgvConsent: string;
  isBgvComplete: boolean;
  bgvFlagged: boolean;
}

const CHECK_LABELS: Record<string, string> = {
  aadhaar: 'Aadhaar Verification',
  pan: 'PAN Verification',
  bank_account: 'Bank Account',
  credit_check: 'Credit Check',
  employment: 'Employment History',
  education: 'Education Verification',
  professional_reference: 'Professional Reference',
  court_records: 'Court Records',
  criminal_records: 'Criminal Records',
  global_database: 'Global Database',
  address_digital: 'Address (Digital)',
  address_physical: 'Address (Physical)',
  social_media: 'Social Media',
};

const STATUS_OPTIONS = ['pending', 'in_progress', 'verified', 'flagged'] as const;

const STATUS_BADGE_VARIANT: Record<string, 'secondary' | 'default' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  in_progress: 'outline',
  verified: 'default',
  flagged: 'destructive',
};

const STATUS_BADGE_CLASSES: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
  verified: 'bg-green-100 text-green-700',
  flagged: 'bg-red-100 text-red-700',
};

export function DrawerBgvTracker({ userId }: { userId: string }) {
  const [checks, setChecks] = useState<BgvCheck[]>([]);
  const [userInfo, setUserInfo] = useState<BgvUserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingCheck, setSavingCheck] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  const fetchChecks = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/applicants/${userId}/bgv`);
      const data = await res.json();
      if (res.ok) {
        setChecks(data.checks);
        setUserInfo(data.user);
      } else {
        setError(data.error || 'Failed to load BGV checks');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchChecks();
  }, [fetchChecks]);

  async function saveCheck(checkType: string, status: string, notes: string | null) {
    setSavingCheck(checkType);
    // Optimistic update
    setChecks((prev) =>
      prev.map((c) => (c.check_type === checkType ? { ...c, status, notes } : c))
    );
    try {
      const res = await fetch(`/api/admin/applicants/${userId}/bgv`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkType, status, notes }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.isBgvComplete !== undefined && userInfo) {
          setUserInfo({ ...userInfo, isBgvComplete: data.isBgvComplete, bgvFlagged: data.bgvFlagged });
        }
      } else {
        // Revert on error
        await fetchChecks();
        showToast(data.error || 'Failed to save', 'error');
      }
    } catch {
      await fetchChecks();
      showToast('Network error \u2014 changes not saved', 'error');
    } finally {
      setSavingCheck(null);
    }
  }

  if (loading) {
    return (
      <div className="px-5 py-5 space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="px-5 py-5 text-sm text-red-500">{error}</p>;
  }

  const feePaid = userInfo?.paymentStatus !== 'unverified';
  const consentGiven =
    userInfo?.bgvConsent === 'consented' || userInfo?.bgvConsent === 'consented_wants_call';
  const canEdit = feePaid && consentGiven;

  const verifiedCount = checks.filter((c) => c.status === 'verified').length;
  const flaggedCount = checks.filter((c) => c.status === 'flagged').length;
  const progressPercent = Math.round((verifiedCount / 13) * 100);

  return (
    <div className="px-5 py-4 pb-8">
      {/* Toast */}
      {toast && (
        <div
          className={`mb-3 rounded-lg px-3 py-2 text-xs font-medium ${
            toast.type === 'error'
              ? 'bg-red-50 text-red-700'
              : 'bg-green-50 text-green-700'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Summary with progress */}
      <Card className="mb-3">
        <CardContent className="p-3">
          <div className="mb-2 flex items-center gap-3">
            <span className="text-sm text-gray-500">{verifiedCount} / 13 verified</span>
            {flaggedCount > 0 && (
              <span className="text-sm text-red-500">{flaggedCount} flagged</span>
            )}
            {userInfo?.isBgvComplete && (
              <Badge variant="default" className="bg-green-100 text-green-800">
                BGV Complete
              </Badge>
            )}
          </div>
          <Progress value={progressPercent} className="h-1.5" />
        </CardContent>
      </Card>

      {/* Prerequisites warning */}
      {!canEdit && (
        <Card className="mb-4 border-amber-200 bg-amber-50">
          <CardContent className="p-3 text-xs text-amber-800">
            <p className="font-medium mb-1">BGV checks are read-only</p>
            <p>Both conditions must be met to edit:</p>
            <ul className="mt-1 space-y-0.5">
              <li className="flex items-center gap-1.5">
                {feePaid ? (
                  <CheckCircle2Icon className="h-3 w-3 text-green-600" />
                ) : (
                  <XCircleIcon className="h-3 w-3 text-red-500" />
                )}
                Verification fee paid
              </li>
              <li className="flex items-center gap-1.5">
                {consentGiven ? (
                  <CheckCircle2Icon className="h-3 w-3 text-green-600" />
                ) : (
                  <XCircleIcon className="h-3 w-3 text-red-500" />
                )}
                BGV consent given
              </li>
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Checks list */}
      <Card>
        <CardContent className="divide-y divide-gray-50 p-0">
          {checks.map((check) => (
            <DrawerCheckRow
              key={check.check_type}
              check={check}
              canEdit={canEdit}
              isSaving={savingCheck === check.check_type}
              onSave={saveCheck}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function DrawerCheckRow({
  check,
  canEdit,
  isSaving,
  onSave,
}: {
  check: BgvCheck;
  canEdit: boolean;
  isSaving: boolean;
  onSave: (checkType: string, status: string, notes: string | null) => void;
}) {
  const [localNotes, setLocalNotes] = useState(check.notes ?? '');

  // Keep local notes in sync when check updates (e.g. after revert)
  useEffect(() => {
    setLocalNotes(check.notes ?? '');
  }, [check.notes]);

  return (
    <div className={`px-4 py-3 transition-opacity ${isSaving ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Badge
            variant={STATUS_BADGE_VARIANT[check.status] || 'secondary'}
            className={`shrink-0 text-[10px] ${STATUS_BADGE_CLASSES[check.status] || ''}`}
          >
            {check.status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </Badge>
          <span className="truncate text-sm text-gray-800">
            {CHECK_LABELS[check.check_type] || check.check_type}
          </span>
        </div>

        {canEdit ? (
          <Select
            value={check.status}
            onValueChange={(val) => onSave(check.check_type, val, localNotes || null)}
            disabled={isSaving}
          >
            <SelectTrigger
              className="h-7 w-28 shrink-0 text-xs"
              aria-label={`Status for ${CHECK_LABELS[check.check_type] || check.check_type}`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <span className="shrink-0 text-xs text-gray-300">Locked</span>
        )}
      </div>

      {/* Notes */}
      <div className="mt-1.5 pl-1">
        {canEdit ? (
          <Input
            type="text"
            value={localNotes}
            onChange={(e) => setLocalNotes(e.target.value)}
            onBlur={() => {
              const newNotes = localNotes.trim() || null;
              if (newNotes !== (check.notes ?? null)) {
                onSave(check.check_type, check.status, newNotes);
              }
            }}
            placeholder="Add notes..."
            maxLength={2000}
            aria-label={`Notes for ${CHECK_LABELS[check.check_type] || check.check_type}`}
            className="h-6 border-0 bg-transparent px-0 text-xs text-gray-500 placeholder:text-gray-300 shadow-none focus-visible:ring-0"
          />
        ) : check.notes ? (
          <p className="text-xs text-gray-400">{check.notes}</p>
        ) : null}
      </div>
    </div>
  );
}
