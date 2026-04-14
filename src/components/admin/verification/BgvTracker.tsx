'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CheckCircle2Icon, XCircleIcon } from 'lucide-react';

interface BgvCheck {
  id: string;
  check_type: string;
  status: string;
  notes: string | null;
  document_path: string | null;
}

interface BgvUserInfo {
  paymentStatus: string;
  bgvConsent: string;
  isBgvComplete: boolean;
  bgvFlagged: boolean;
}

interface BgvTrackerProps {
  userId: string;
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

const STATUS_BADGE_CLASSES: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  verified: 'bg-green-100 text-green-700',
  flagged: 'bg-red-100 text-red-700',
};

const STATUS_ICONS: Record<string, string> = {
  pending: '\u2b1c',
  in_progress: '\ud83d\udd04',
  verified: '\u2705',
  flagged: '\ud83d\udea9',
};

export function BgvTracker({ userId }: BgvTrackerProps) {
  const [checks, setChecks] = useState<BgvCheck[]>([]);
  const [userInfo, setUserInfo] = useState<BgvUserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingCheck, setUpdatingCheck] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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

  async function saveAllChanges() {
    setIsSavingAll(true);
    setSaveSuccess(false);
    try {
      // Save all checks in sequence (API handles one at a time)
      for (const check of checks) {
        await fetch(`/api/admin/applicants/${userId}/bgv`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ checkType: check.check_type, status: check.status, notes: check.notes }),
        });
      }
      setHasUnsavedChanges(false);
      setSaveSuccess(true);
      // Refresh to get updated isBgvComplete/bgvFlagged
      await fetchChecks();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setError('Failed to save changes');
    } finally {
      setIsSavingAll(false);
    }
  }

  async function updateCheck(checkType: string, status: string, notes?: string) {
    setUpdatingCheck(checkType);
    try {
      const res = await fetch(`/api/admin/applicants/${userId}/bgv`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkType, status, notes }),
      });
      const data = await res.json();
      if (res.ok) {
        // Update local state
        setChecks((prev) =>
          prev.map((c) =>
            c.check_type === checkType ? { ...c, status, notes: notes ?? c.notes } : c
          )
        );
        if (data.isBgvComplete !== undefined && userInfo) {
          setUserInfo({
            ...userInfo,
            isBgvComplete: data.isBgvComplete,
            bgvFlagged: data.bgvFlagged,
          });
        }
      } else {
        setError(data.error || 'Failed to update check');
      }
    } finally {
      setUpdatingCheck(null);
    }
  }

  if (loading) return <p className="text-sm text-gray-500">Loading BGV checks...</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  const feePaid = userInfo?.paymentStatus !== 'unverified';
  const consentGiven = userInfo?.bgvConsent === 'consented' || userInfo?.bgvConsent === 'consented_wants_call';
  const canEditChecks = feePaid && consentGiven;

  const verifiedCount = checks.filter((c) => c.status === 'verified').length;
  const flaggedCount = checks.filter((c) => c.status === 'flagged').length;
  const progressPercent = Math.round((verifiedCount / 13) * 100);

  return (
    <div>
      {/* Summary with progress */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="mb-2 flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {verifiedCount}/13 verified
            </span>
            {flaggedCount > 0 && (
              <span className="text-sm text-red-600">{flaggedCount} flagged</span>
            )}
            {userInfo?.isBgvComplete && (
              <Badge variant="default" className="bg-green-100 text-green-800">
                BGV Complete
              </Badge>
            )}
          </div>
          <Progress value={progressPercent} className="h-2" />
        </CardContent>
      </Card>

      {/* Prerequisites warning */}
      {!canEditChecks && (
        <Card className="mb-4 border-amber-200 bg-amber-50">
          <CardContent className="p-3 text-sm text-amber-800">
            BGV checks cannot be edited until both conditions are met:
            <ul className="mt-1 space-y-0.5">
              <li className="flex items-center gap-1.5">
                {feePaid ? (
                  <CheckCircle2Icon className="h-3.5 w-3.5 text-green-600" />
                ) : (
                  <XCircleIcon className="h-3.5 w-3.5 text-red-500" />
                )}
                Verification fee paid
              </li>
              <li className="flex items-center gap-1.5">
                {consentGiven ? (
                  <CheckCircle2Icon className="h-3.5 w-3.5 text-green-600" />
                ) : (
                  <XCircleIcon className="h-3.5 w-3.5 text-red-500" />
                )}
                BGV consent given
              </li>
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Bulk controls */}
      {canEditChecks && (
        <div className="mb-4 flex items-center gap-3">
          <Label className="text-sm font-medium text-gray-700">Set all to:</Label>
          <Select
            onValueChange={(val) => {
              if (!val) return;
              setChecks((prev) => prev.map((c) => ({ ...c, status: val })));
              setHasUnsavedChanges(true);
            }}
            value=""
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Choose status..." />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasUnsavedChanges && (
            <Button
              onClick={saveAllChanges}
              disabled={isSavingAll}
              size="sm"
            >
              {isSavingAll ? 'Saving...' : 'Save All Changes'}
            </Button>
          )}
          {saveSuccess && (
            <span className="text-sm text-green-600">Saved</span>
          )}
        </div>
      )}

      {/* Checks Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-100">
              <TableHead className="px-5">Check</TableHead>
              <TableHead className="px-5">Status</TableHead>
              <TableHead className="px-5">Notes</TableHead>
              <TableHead className="px-5">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {checks.map((check) => (
              <BgvCheckRow
                key={check.check_type}
                check={check}
                canEdit={canEditChecks}
                isUpdating={updatingCheck === check.check_type}
                onUpdate={(checkType, status, notes) => {
                  // Update local state (don't save immediately)
                  setChecks((prev) => prev.map((c) => c.check_type === checkType ? { ...c, status, notes: notes ?? c.notes } : c));
                  setHasUnsavedChanges(true);
                }}
              />
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function BgvCheckRow({
  check,
  canEdit,
  isUpdating,
  onUpdate,
}: {
  check: BgvCheck;
  canEdit: boolean;
  isUpdating: boolean;
  onUpdate: (checkType: string, status: string, notes?: string) => void;
}) {
  const [editingNotes, setEditingNotes] = useState(false);
  const [localNotes, setLocalNotes] = useState(check.notes || '');

  return (
    <TableRow className={`border-l-2 border-l-transparent transition-colors hover:border-l-primary/20 hover:bg-gray-50 ${isUpdating ? 'opacity-50' : ''}`}>
      <TableCell className="px-5 py-4 font-medium text-gray-900">
        {CHECK_LABELS[check.check_type] || check.check_type}
      </TableCell>
      <TableCell className="px-5 py-4">
        <Badge
          variant="secondary"
          className={STATUS_BADGE_CLASSES[check.status] || 'bg-gray-100 text-gray-600'}
        >
          <span className="mr-1">{STATUS_ICONS[check.status]}</span>
          {check.status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
        </Badge>
      </TableCell>
      <TableCell className="px-5 py-4 text-gray-600">
        {editingNotes ? (
          <div className="flex gap-2">
            <Input
              type="text"
              value={localNotes}
              onChange={(e) => setLocalNotes(e.target.value)}
              className="h-7 w-48 text-sm"
              aria-label={`Notes for ${CHECK_LABELS[check.check_type] || check.check_type}`}
              autoFocus
            />
            <Button
              variant="link"
              size="xs"
              onClick={() => {
                onUpdate(check.check_type, check.status, localNotes);
                setEditingNotes(false);
              }}
            >
              Save
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setEditingNotes(false)}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <span
            className={canEdit ? 'cursor-pointer hover:text-blue-600' : ''}
            onClick={() => canEdit && setEditingNotes(true)}
          >
            {check.notes || <span className="text-gray-300">{'\u2014'}</span>}
          </span>
        )}
      </TableCell>
      <TableCell className="px-5 py-4">
        {canEdit ? (
          <Select
            value={check.status}
            onValueChange={(val) => onUpdate(check.check_type, val)}
            disabled={isUpdating}
          >
            <SelectTrigger
              className="h-7 w-32 text-xs"
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
          <span className="text-xs text-gray-400">Locked</span>
        )}
      </TableCell>
    </TableRow>
  );
}
