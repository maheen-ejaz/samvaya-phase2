'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PaymentStatusBadge, ConsentBadge } from '@/components/admin/StatusBadge';
import { ApplicantPreviewDrawer } from '@/components/admin/applicants/ApplicantPreviewDrawer';
import type { Applicant } from '@/components/admin/ApplicantList';
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

export interface VerificationRow {
  id: string;
  firstName: string | null;
  lastName: string | null;
  paymentStatus: string;
  bgvConsent: string | null;
  isBgvComplete: boolean;
  bgvFlagged: boolean;
  isGooCampusMember: boolean;
  docsPending: number;
  docsTotal: number;
}

interface VerificationTableProps {
  rows: VerificationRow[];
}

export function VerificationTable({ rows }: VerificationTableProps) {
  const [drawerRow, setDrawerRow] = useState<VerificationRow | null>(null);

  const drawerBasicInfo: Applicant | null = drawerRow
    ? {
        id: drawerRow.id,
        firstName: drawerRow.firstName ?? '',
        lastName: drawerRow.lastName ?? '',
        email: '',
        specialty: '',
        paymentStatus: drawerRow.paymentStatus,
        bgvConsent: drawerRow.bgvConsent ?? '',
        isGooCampusMember: drawerRow.isGooCampusMember,
        submittedAt: '',
      }
    : null;

  return (
    <>
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-100">
              <TableHead className="px-5">Name</TableHead>
              <TableHead className="px-5">Status</TableHead>
              <TableHead className="px-5">BGV Consent</TableHead>
              <TableHead className="px-5">BGV</TableHead>
              <TableHead className="px-5">Documents</TableHead>
              <TableHead className="px-5">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const name = `${row.firstName ?? ''} ${row.lastName ?? ''}`.trim() || 'Unknown';

              const bgvBadge = row.isBgvComplete ? (
                <Badge variant="secondary" className="bg-green-50 text-green-800">
                  <span className="mr-1 h-1.5 w-1.5 rounded-full bg-green-500" />
                  Complete
                </Badge>
              ) : row.bgvFlagged ? (
                <Badge variant="destructive">
                  <span className="mr-1 h-1.5 w-1.5 rounded-full bg-red-500" />
                  Flagged
                </Badge>
              ) : (
                <span className="text-xs text-gray-400">Pending</span>
              );

              const isSelected = drawerRow?.id === row.id;

              return (
                <TableRow
                  key={row.id}
                  onClick={() => setDrawerRow(row)}
                  className={`group relative cursor-pointer border-l-2 transition-all duration-150 hover:shadow-sm hover:-translate-y-px ${
                    isSelected
                      ? 'border-l-primary/30 bg-muted'
                      : 'border-l-transparent hover:border-l-primary/30 hover:bg-gray-50'
                  }`}
                >
                  <TableCell className="px-5 py-4">
                    <Link
                      href={`/admin/applicants/${row.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="font-medium text-gray-900 transition-colors hover:text-rose-700"
                    >
                      {name}
                    </Link>
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <PaymentStatusBadge status={row.paymentStatus} />
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <ConsentBadge consent={row.bgvConsent ?? ''} />
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    {bgvBadge}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-500">
                    {row.docsTotal > 0 ? `${row.docsPending} pending / ${row.docsTotal} total` : '0 docs'}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <Button
                      variant="outline"
                      size="xs"
                      asChild
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Link
                        href={`/admin/verification/${row.id}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        BGV Tracker &rarr;
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {drawerRow && drawerBasicInfo && (
        <ApplicantPreviewDrawer
          userId={drawerRow.id}
          basicInfo={drawerBasicInfo}
          onClose={() => setDrawerRow(null)}
        />
      )}
    </>
  );
}
