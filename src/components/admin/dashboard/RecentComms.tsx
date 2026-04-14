'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { DashboardCommLog } from '@/types/dashboard';
import { formatDateIN } from '@/lib/utils';
import { RecipientProfileDrawer } from './RecipientProfileDrawer';

interface RecentCommsProps {
  communications: DashboardCommLog[];
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; dot: string; text: string }> = {
  sent:    { label: 'Sent',    bg: 'bg-emerald-50', dot: 'bg-emerald-500', text: 'text-emerald-800' },
  opened:  { label: 'Opened',  bg: 'bg-blue-50',    dot: 'bg-blue-500',    text: 'text-blue-800' },
  pending: { label: 'Pending', bg: 'bg-amber-50',   dot: 'bg-amber-400',   text: 'text-amber-800' },
  failed:  { label: 'Failed',  bg: 'bg-red-50',     dot: 'bg-red-500',     text: 'text-red-800' },
  bounced: { label: 'Bounced', bg: 'bg-orange-50',  dot: 'bg-orange-400',  text: 'text-orange-800' },
};

export function RecentComms({ communications }: RecentCommsProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  return (
    <>
      <Card className="shadow-sm ring-1 ring-gray-200/60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <CardTitle className="text-base font-semibold text-foreground">Recent Communications</CardTitle>
            {communications.length > 0 && (
              <Badge variant="secondary" className="h-6 min-w-[24px] rounded-full bg-muted px-2 text-xs font-semibold text-primary border-0">
                {communications.length}
              </Badge>
            )}
          </div>
          <CardAction>
            <Button variant="link" size="sm" asChild className="text-xs font-medium text-primary hover:text-primary p-0 h-auto no-underline hover:no-underline">
              <Link href="/admin/communications">View all</Link>
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent>
          {communications.length === 0 ? (
            <p className="text-sm text-gray-400">No communications sent yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-100">
                  <TableHead className="">Recipient</TableHead>
                  <TableHead className="">Subject</TableHead>
                  <TableHead className="">Date</TableHead>
                  <TableHead className="">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {communications.map((comm) => {
                  const cfg = STATUS_CONFIG[comm.status] ?? {
                    label: comm.status.charAt(0).toUpperCase() + comm.status.slice(1),
                    bg: 'bg-gray-100', dot: 'bg-gray-400', text: 'text-gray-600',
                  };
                  return (
                    <TableRow
                      key={comm.id}
                      className="group relative border-l-2 border-l-transparent transition-all duration-150 hover:border-l-primary/20 hover:bg-gray-50 hover:-translate-y-px"
                    >
                      <TableCell className="py-3.5 pr-4">
                        <button
                          onClick={() => setSelectedUserId(comm.userId)}
                          className="font-medium text-gray-900 transition-colors hover:text-primary"
                        >
                          {comm.recipientName}
                        </button>
                      </TableCell>
                      <TableCell className="py-3.5 pr-4 max-w-[240px]">
                        <span className="block truncate text-gray-500">{comm.subject || '(no subject)'}</span>
                      </TableCell>
                      <TableCell className="py-3.5 pr-4 text-gray-500">{formatDateIN(comm.sentAt)}</TableCell>
                      <TableCell className="py-3.5">
                        <Badge
                          variant="secondary"
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium h-auto border-0',
                            cfg.bg,
                            cfg.text
                          )}
                        >
                          <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />
                          {cfg.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <RecipientProfileDrawer
        userId={selectedUserId ?? ''}
        open={!!selectedUserId}
        onOpenChange={(open) => { if (!open) setSelectedUserId(null); }}
      />
    </>
  );
}
