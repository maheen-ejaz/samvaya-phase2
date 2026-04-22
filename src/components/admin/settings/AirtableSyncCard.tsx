'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AirtableSyncCardProps {
  lastSync: {
    synced_at: string | null;
    status: string;
    records_synced: number;
  } | null;
}

export function AirtableSyncCard({ lastSync }: AirtableSyncCardProps) {
  const [syncing, setSyncing] = useState(false);
  const [syncData, setSyncData] = useState(lastSync);

  const handleSync = async () => {
    setSyncing(true);

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
      toast.success(`Synced ${data.records_synced ?? 0} records successfully`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sync failed');
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
    <Card>
      <CardHeader>
        <CardTitle>Airtable Sync</CardTitle>
        <CardDescription>
          Supabase is the source of truth. Airtable is a read-only copy for team access.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between rounded-lg bg-muted p-4">
          <div>
            <p className="text-sm text-muted-foreground">Last Sync</p>
            <p className="text-sm font-medium text-foreground">
              {formatDate(syncData?.synced_at ?? null)}
            </p>
            {syncData?.records_synced ? (
              <Badge variant="secondary" className="mt-1">
                {syncData.records_synced} records
              </Badge>
            ) : null}
          </div>
          <Button
            onClick={handleSync}
            disabled={syncing}
            aria-label="Sync data to Airtable now"
          >
            {syncing ? 'Syncing...' : 'Sync Now'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
