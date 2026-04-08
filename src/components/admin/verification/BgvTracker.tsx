'use client';

import { useState, useEffect, useCallback } from 'react';

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

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  verified: 'bg-green-100 text-green-700',
  flagged: 'bg-red-100 text-red-700',
};

const STATUS_ICONS: Record<string, string> = {
  pending: '⬜',
  in_progress: '🔄',
  verified: '✅',
  flagged: '🚩',
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

  return (
    <div>
      {/* Summary */}
      <div className="mb-4 flex items-center gap-4">
        <span className="text-sm text-gray-500">
          {verifiedCount}/13 verified
        </span>
        {flaggedCount > 0 && (
          <span className="text-sm text-red-600">{flaggedCount} flagged</span>
        )}
        {userInfo?.isBgvComplete && (
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
            BGV Complete
          </span>
        )}
      </div>

      {/* Prerequisites warning */}
      {!canEditChecks && (
        <div className="mb-4 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          BGV checks cannot be edited until both conditions are met:
          <ul className="mt-1 list-inside list-disc">
            <li>Verification fee paid: {feePaid ? '✓' : '✗'}</li>
            <li>BGV consent given: {consentGiven ? '✓' : '✗'}</li>
          </ul>
        </div>
      )}

      {/* Bulk controls */}
      {canEditChecks && (
        <div className="mb-4 flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Set all to:</label>
          <select
            onChange={(e) => {
              if (!e.target.value) return;
              const newStatus = e.target.value;
              setChecks((prev) => prev.map((c) => ({ ...c, status: newStatus })));
              setHasUnsavedChanges(true);
              e.target.value = '';
            }}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm"
            defaultValue=""
          >
            <option value="" disabled>Choose status...</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
            ))}
          </select>
          {hasUnsavedChanges && (
            <button
              onClick={saveAllChanges}
              disabled={isSavingAll}
              className="rounded-md bg-gray-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:bg-gray-400"
            >
              {isSavingAll ? 'Saving...' : 'Save All Changes'}
            </button>
          )}
          {saveSuccess && (
            <span className="text-sm text-green-600">Saved</span>
          )}
        </div>
      )}

      {/* Checks Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="min-w-full">
          <thead className="admin-table-thead">
            <tr className="border-b border-gray-100">
              <th className="px-5 py-3.5 text-left text-sm font-normal text-gray-500">Check</th>
              <th className="px-5 py-3.5 text-left text-sm font-normal text-gray-500">Status</th>
              <th className="px-5 py-3.5 text-left text-sm font-normal text-gray-500">Notes</th>
              <th className="px-5 py-3.5 text-left text-sm font-normal text-gray-500">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 bg-white">
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
          </tbody>
        </table>
      </div>
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
    <tr className={`border-l-2 border-l-transparent transition-colors hover:border-l-admin-blue-300 hover:bg-gray-50 ${isUpdating ? 'opacity-50' : ''}`}>
      <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-gray-900">
        {CHECK_LABELS[check.check_type] || check.check_type}
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-sm">
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[check.status]}`}>
          <span>{STATUS_ICONS[check.status]}</span>
          {check.status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
        </span>
      </td>
      <td className="px-5 py-4 text-sm text-gray-600">
        {editingNotes ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={localNotes}
              onChange={(e) => setLocalNotes(e.target.value)}
              className="w-48 rounded border border-gray-300 px-2 py-1 text-sm"
              aria-label={`Notes for ${CHECK_LABELS[check.check_type] || check.check_type}`}
              autoFocus
            />
            <button
              onClick={() => {
                onUpdate(check.check_type, check.status, localNotes);
                setEditingNotes(false);
              }}
              className="text-xs text-blue-600 hover:underline"
            >
              Save
            </button>
            <button
              onClick={() => setEditingNotes(false)}
              className="text-xs text-gray-400 hover:underline"
            >
              Cancel
            </button>
          </div>
        ) : (
          <span
            className={canEdit ? 'cursor-pointer hover:text-blue-600' : ''}
            onClick={() => canEdit && setEditingNotes(true)}
          >
            {check.notes || <span className="text-gray-300">—</span>}
          </span>
        )}
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-sm">
        {canEdit ? (
          <select
            value={check.status}
            onChange={(e) => onUpdate(check.check_type, e.target.value)}
            disabled={isUpdating}
            aria-label={`Status for ${CHECK_LABELS[check.check_type] || check.check_type}`}
            className="rounded border border-gray-300 px-2 py-1 text-xs"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>
        ) : (
          <span className="text-xs text-gray-400">Locked</span>
        )}
      </td>
    </tr>
  );
}
