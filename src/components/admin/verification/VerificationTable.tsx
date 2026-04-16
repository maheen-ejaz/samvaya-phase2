'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { PaymentStatusBadge, ConsentBadge } from '@/components/admin/StatusBadge';
import { ApplicantPreviewDrawer } from '@/components/admin/applicants/ApplicantPreviewDrawer';
import type { Applicant } from '@/components/admin/ApplicantList';

type SortField = 'name' | 'bgv' | 'status';
type SortDir = 'asc' | 'desc';

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
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sortIcon = (field: SortField) => {
    if (sortField !== field) return <span className="ml-1 text-gray-300">↕</span>;
    return <span className="ml-1 text-admin-blue-400">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  const filteredRows = useMemo(() => {
    let result = rows;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((r) =>
        `${r.firstName ?? ''} ${r.lastName ?? ''}`.toLowerCase().includes(q)
      );
    }

    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'name') {
        cmp = `${a.firstName ?? ''} ${a.lastName ?? ''}`.localeCompare(
          `${b.firstName ?? ''} ${b.lastName ?? ''}`
        );
      } else if (sortField === 'bgv') {
        const order = (r: VerificationRow) =>
          r.isBgvComplete ? 0 : r.bgvFlagged ? 1 : 2;
        cmp = order(a) - order(b);
      } else if (sortField === 'status') {
        cmp = a.paymentStatus.localeCompare(b.paymentStatus);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [rows, search, sortField, sortDir]);

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
      {/* Search bar */}
      <div className="mb-4">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name…"
          className="w-64 rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-1.5 text-sm text-gray-700 placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:outline-none focus:ring-0"
          aria-label="Search verification queue"
        />
        {search.trim() && (
          <span className="ml-3 text-sm text-gray-400">
            {filteredRows.length} result{filteredRows.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {filteredRows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 py-12 text-center">
          <p className="text-sm text-gray-500">No applicants match your search.</p>
        </div>
      ) : (
      <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="min-w-full">
          <thead className="admin-table-thead">
            <tr className="border-b border-gray-100">
              <th
                className="cursor-pointer px-5 py-3.5 text-left text-sm font-normal text-gray-500 hover:text-gray-700 select-none"
                onClick={() => toggleSort('name')}
              >
                Name{sortIcon('name')}
              </th>
              <th
                className="cursor-pointer px-5 py-3.5 text-left text-sm font-normal text-gray-500 hover:text-gray-700 select-none"
                onClick={() => toggleSort('status')}
              >
                Status{sortIcon('status')}
              </th>
              <th className="px-5 py-3.5 text-left text-sm font-normal text-gray-500">BGV Consent</th>
              <th
                className="cursor-pointer px-5 py-3.5 text-left text-sm font-normal text-gray-500 hover:text-gray-700 select-none"
                onClick={() => toggleSort('bgv')}
              >
                BGV{sortIcon('bgv')}
              </th>
              <th className="px-5 py-3.5 text-left text-sm font-normal text-gray-500">Documents</th>
              <th className="px-5 py-3.5 text-left text-sm font-normal text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredRows.map((row) => {
              const name = `${row.firstName ?? ''} ${row.lastName ?? ''}`.trim() || 'Unknown';

              const bgvBadge = row.isBgvComplete ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Complete
                </span>
              ) : row.bgvFlagged ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  Flagged
                </span>
              ) : (
                <span className="text-xs text-gray-400">Pending</span>
              );

              const isSelected = drawerRow?.id === row.id;

              return (
                <tr
                  key={row.id}
                  onClick={() => setDrawerRow(row)}
                  className={`group relative cursor-pointer border-l-2 transition-all duration-150 hover:shadow-sm hover:-translate-y-px ${
                    isSelected
                      ? 'border-l-admin-blue-400 bg-admin-blue-50'
                      : 'border-l-transparent hover:border-l-admin-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <td className="whitespace-nowrap px-5 py-4 text-sm">
                    <Link
                      href={`/admin/applicants/${row.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="font-medium text-gray-900 transition-colors hover:text-rose-700"
                    >
                      {name}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm">
                    <PaymentStatusBadge status={row.paymentStatus} />
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm">
                    <ConsentBadge consent={row.bgvConsent ?? ''} />
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm">
                    {bgvBadge}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">
                    {row.docsTotal > 0 ? `${row.docsPending} pending / ${row.docsTotal} total` : '0 docs'}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm">
                    <Link
                      href={`/admin/verification/${row.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-700 hover:border-gray-300 hover:text-gray-900"
                    >
                      BGV Tracker →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}

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
