'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ApplicantActions } from './ApplicantActions';
import { PaymentStatusBadge, ConsentBadge, GooCampusBadge } from './StatusBadge';
import { capitalize } from '@/lib/utils';

export interface Applicant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  specialty: string;
  paymentStatus: string;
  bgvConsent: string;
  isGooCampusMember: boolean;
  submittedAt: string;
}

interface ApplicantListProps {
  applicants: Applicant[];
  title?: string;
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'unverified', label: 'Unverified' },
  { value: 'verification_pending', label: 'Verification Pending' },
  { value: 'in_pool', label: 'In Pool' },
  { value: 'match_presented', label: 'Match Presented' },
  { value: 'awaiting_payment', label: 'Awaiting Payment' },
  { value: 'active_member', label: 'Active Member' },
] as const;

type SortField = 'name' | 'specialty' | 'submittedAt' | 'paymentStatus';
type SortDir = 'asc' | 'desc';

const PER_PAGE = 25;

export function ApplicantList({ applicants, title = 'Applicants' }: ApplicantListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('submittedAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = applicants;

    // Search by name or email
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          `${a.firstName} ${a.lastName}`.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q)
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter((a) => a.paymentStatus === statusFilter);
    }

    // Sort
    result = [...result].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name':
          cmp = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
          break;
        case 'specialty':
          cmp = (a.specialty || '').localeCompare(b.specialty || '');
          break;
        case 'submittedAt':
          cmp = new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
          break;
        case 'paymentStatus':
          cmp = a.paymentStatus.localeCompare(b.paymentStatus);
          break;
      }
      if (cmp === 0) cmp = a.id.localeCompare(b.id);
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [applicants, search, statusFilter, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginatedStart = (page - 1) * PER_PAGE;
  const paginated = filtered.slice(paginatedStart, paginatedStart + PER_PAGE);

  // Reset to page 1 when filters change
  const handleSearch = (value: string) => { setSearch(value); setPage(1); };
  const handleStatusFilter = (value: string) => { setStatusFilter(value); setPage(1); };

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }

  const sortIndicator = (field: SortField) => {
    if (sortField !== field) return <span className="ml-1 text-gray-300">↕</span>;
    return <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {applicants.length} applicant{applicants.length !== 1 ? 's' : ''} completed the form
        </p>
      </div>

      {/* Search + Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-64 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
          aria-label="Search applicants"
        />
        <select
          value={statusFilter}
          onChange={(e) => handleStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
          aria-label="Filter by payment status"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {(search || statusFilter !== 'all') && (
          <span className="text-sm text-gray-500">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-300 py-12 text-center">
          <p className="text-sm text-gray-500">
            {applicants.length === 0
              ? 'No applicants have completed the form yet.'
              : 'No applicants match the current filters.'}
          </p>
        </div>
      )}

      {/* Table */}
      {filtered.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200" role="table">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  <button type="button" onClick={() => toggleSort('name')} className="inline-flex items-center hover:text-gray-700">
                    Name {sortIndicator('name')}
                  </button>
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Email
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  <button type="button" onClick={() => toggleSort('specialty')} className="inline-flex items-center hover:text-gray-700">
                    Specialty {sortIndicator('specialty')}
                  </button>
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  <button type="button" onClick={() => toggleSort('submittedAt')} className="inline-flex items-center hover:text-gray-700">
                    Submitted {sortIndicator('submittedAt')}
                  </button>
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  <button type="button" onClick={() => toggleSort('paymentStatus')} className="inline-flex items-center hover:text-gray-700">
                    Status {sortIndicator('paymentStatus')}
                  </button>
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  BGV Consent
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  GooCampus
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {paginated.map((applicant) => (
                <tr key={applicant.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                    <Link
                      href={`/admin/applicants/${applicant.id}`}
                      className="text-rose-700 hover:text-rose-900 hover:underline"
                    >
                      {applicant.firstName} {applicant.lastName}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                    {applicant.email}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                    {applicant.specialty ? capitalize(applicant.specialty) : '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                    {formatDate(applicant.submittedAt)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    <PaymentStatusBadge status={applicant.paymentStatus} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    <ConsentBadge consent={applicant.bgvConsent} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    <GooCampusBadge isMember={applicant.isGooCampusMember} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <ApplicantActions
                      userId={applicant.id}
                      paymentStatus={applicant.paymentStatus}
                      bgvConsent={applicant.bgvConsent}
                      isGooCampusMember={applicant.isGooCampusMember}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {paginatedStart + 1}–{Math.min(paginatedStart + PER_PAGE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="rounded-md border border-gray-300 px-4 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="rounded-md border border-gray-300 px-4 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}
