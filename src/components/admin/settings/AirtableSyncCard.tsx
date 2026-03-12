'use client';

import { useState } from 'react';

interface AirtableSyncCardProps {
  lastSync: {
    synced_at: string | null;
    status: string;
    records_synced: number;
  } | null;
}

export function AirtableSyncCard({ lastSync }: AirtableSyncCardProps) {
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [syncData, setSyncData] = useState(lastSync);

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/admin/sync/airtable', { method: 'POST' });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Sync failed');
      }

      const data = await res.json();
      setSyncData({
        synced_at: new Date().toISOString(),
        status: 'success',
        records_synced: data.records_synced ?? 0,
      });
      setSuccess(`Synced ${data.records_synced ?? 0} records successfully`);
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never synced';
    return new Date(dateStr).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-gray-900">Airtable Sync</h2>
      <p className="mt-1 text-sm text-gray-500">
        Supabase is the source of truth. Airtable is a read-only copy for team access.
      </p>

      {error && (
        <div className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</div>
      )}
      {success && (
        <div className="mt-3 rounded-md bg-green-50 p-3 text-sm text-green-700" role="status" aria-live="polite">{success}</div>
      )}

      <div className="mt-4 flex items-center justify-between rounded-lg bg-gray-50 p-4">
        <div>
          <p className="text-sm text-gray-500">Last Sync</p>
          <p className="text-sm font-medium text-gray-900">
            {formatDate(syncData?.synced_at ?? null)}
          </p>
          {syncData?.records_synced ? (
            <p className="text-xs text-gray-400">{syncData.records_synced} records</p>
          ) : null}
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Sync data to Airtable now"
        >
          {syncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>
    </div>
  );
}
