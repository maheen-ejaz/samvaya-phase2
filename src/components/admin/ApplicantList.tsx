'use client';

import { useState, useMemo } from 'react';
import { PaymentStatusBadge, ConsentBadge } from './StatusBadge';
import { ApplicantStatusIcons } from './ApplicantStatusIcons';
import { capitalize } from '@/lib/utils';
import { ApplicantPreviewDrawer } from './applicants/ApplicantPreviewDrawer';

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
  const [drawerUserId, setDrawerUserId] = useState<string | null>(null);
  const drawerApplicant = useMemo(
    () => applicants.find((a) => a.id === drawerUserId) ?? null,
    [applicants, drawerUserId]
  );

  const filtered = useMemo(() => {
    let result = applicants;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          `${a.firstName} ${a.lastName}`.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((a) => a.paymentStatus === statusFilter);
    }

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
    return <span className="ml-1 text-gray-500">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <h1 className="type-heading-xl text-gray-900">{title}</h1>
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-sm font-normal text-gray-600">
          {applicants.length}
        </span>
      </div>

      {/* Search + Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-64 rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-1.5 text-sm text-gray-700 placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:outline-none focus:ring-0"
          aria-label="Search applicants"
        />
        <select
          value={statusFilter}
          onChange={(e) => handleStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-1.5 text-sm text-gray-600 focus:border-gray-400 focus:outline-none focus:ring-0"
          aria-label="Filter by payment status"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {(search || statusFilter !== 'all') && (
          <span className="text-sm text-gray-400">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-200 py-12 text-center">
          <p className="text-sm text-gray-500">
            {applicants.length === 0
              ? 'No applicants have completed the form yet.'
              : 'No applicants match the current filters.'}
          </p>
        </div>
      )}

      {/* Table */}
      {filtered.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
          <table className="min-w-full" role="table">
            <thead>
              <tr className="border-b border-gray-100">
                <th scope="col" className="px-5 py-3.5 text-left text-sm font-normal text-gray-500">
                  <button type="button" onClick={() => toggleSort('name')} className="inline-flex items-center hover:text-gray-700">
                    Name {sortIndicator('name')}
                  </button>
                </th>
                <th scope="col" className="px-5 py-3.5 text-left text-sm font-normal text-gray-500">
                  Email
                </th>
                <th scope="col" className="px-5 py-3.5 text-left text-sm font-normal text-gray-500">
                  <button type="button" onClick={() => toggleSort('specialty')} className="inline-flex items-center hover:text-gray-700">
                    Specialty {sortIndicator('specialty')}
                  </button>
                </th>
                <th scope="col" className="px-5 py-3.5 text-left text-sm font-normal text-gray-500">
                  <button type="button" onClick={() => toggleSort('submittedAt')} className="inline-flex items-center hover:text-gray-700">
                    Submitted {sortIndicator('submittedAt')}
                  </button>
                </th>
                <th scope="col" className="px-5 py-3.5 text-left text-sm font-normal text-gray-500">
                  <button type="button" onClick={() => toggleSort('paymentStatus')} className="inline-flex items-center hover:text-gray-700">
                    Status {sortIndicator('paymentStatus')}
                  </button>
                </th>
                <th scope="col" className="px-5 py-3.5 text-left text-sm font-normal text-gray-500">
                  BGV Consent
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.map((applicant) => {
                const isSelected = drawerUserId === applicant.id;
                return (
                  <tr
                    key={applicant.id}
                    onClick={() => setDrawerUserId(applicant.id)}
                    className={`group relative cursor-pointer border-l-2 transition-all duration-150 ${
                      isSelected
                        ? 'border-l-admin-green-400 bg-admin-green-50'
                        : 'border-l-transparent hover:border-l-admin-green-300 hover:bg-gray-50 hover:shadow-sm hover:-translate-y-px'
                    }`}
                  >
                    <td className="whitespace-nowrap px-5 py-4 text-sm">
                      <span className="inline-flex items-center gap-1.5">
                        <a
                          href={`/admin/applicants/${applicant.id}`}
                          className={`font-medium transition-colors hover:text-rose-700 ${isSelected ? 'text-admin-green-900' : 'text-gray-900'}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {applicant.firstName} {applicant.lastName}
                        </a>
                        <ApplicantStatusIcons
                          isGooCampusMember={applicant.isGooCampusMember}
                          paymentStatus={applicant.paymentStatus}
                        />
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">
                      {applicant.email}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">
                      {applicant.specialty ? capitalize(applicant.specialty) : '—'}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">
                      {formatDate(applicant.submittedAt)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm">
                      <PaymentStatusBadge status={applicant.paymentStatus} />
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm">
                      <ConsentBadge consent={applicant.bgvConsent} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Showing {paginatedStart + 1}–{Math.min(paginatedStart + PER_PAGE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-500 hover:border-gray-300 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-gray-400">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-500 hover:border-gray-300 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Applicant preview drawer */}
      {drawerApplicant && (
        <ApplicantPreviewDrawer
          userId={drawerApplicant.id}
          basicInfo={drawerApplicant}
          onClose={() => setDrawerUserId(null)}
        />
      )}
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 24) {
      const hrs = Math.floor(diffHours);
      if (hrs < 1) return 'Just now';
      return hrs === 1 ? '1 hr ago' : `${hrs} hrs ago`;
    }

    if (diffHours < 48) {
      const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
      return `Yesterday, ${time}`;
    }

    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: '2-digit',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}
