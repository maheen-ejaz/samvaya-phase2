'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CommLog {
  id: string;
  channel: string;
  subject: string | null;
  body: string;
  status: string;
  sent_at: string | null;
  created_at: string;
}

interface CommunicationHistoryProps {
  userId: string;
  refreshKey?: number;
}

export function CommunicationHistory({ userId, refreshKey }: CommunicationHistoryProps) {
  const [logs, setLogs] = useState<CommLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/applicants/${userId}/communications`);
      const data = await res.json();
      if (res.ok) {
        setLogs(data.logs);
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs, refreshKey]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading communication history...</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Communication History</CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No emails or messages sent yet.</p>
        ) : (
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-3">
              {logs.map((log) => (
                <Card key={log.id} className="bg-muted/50">
                  <CardContent className="pt-3 pb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        {log.subject || '(no subject)'}
                      </span>
                      <Badge variant={log.status === 'sent' ? 'default' : 'destructive'}>
                        {log.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{log.body}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {log.channel} — {log.sent_at ? new Date(log.sent_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'pending'}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
