'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ApplicantActions } from './ApplicantActions';
import { PaymentStatusBadge, ConsentBadge, GooCampusBadge } from './StatusBadge';

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

export function ApplicantList({ applicants }: ApplicantListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('submittedAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

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

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }

  function SortIndicator({ field }: { field: SortField }) {
    if (sortField !== field) return <span className="ml-1 text-gray-300">↕</span>;
    return <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Applicants</h1>
        <p className="mt-1 text-sm text-gray-500">
          {applicants.length} applicant{applicants.length !== 1 ? 's' : ''} completed the form
        </p>
      </div>

      {/* Search + Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-64 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
          aria-label="Search applicants"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
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
                <th
                  scope="col"
                  className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  onClick={() => toggleSort('name')}
                >
                  Name <SortIndicator field="name" />
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Email
                </th>
                <th
                  scope="col"
                  className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  onClick={() => toggleSort('specialty')}
                >
                  Specialty <SortIndicator field="specialty" />
                </th>
                <th
                  scope="col"
                  className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  onClick={() => toggleSort('submittedAt')}
                >
                  Submitted <SortIndicator field="submittedAt" />
                </th>
                <th
                  scope="col"
                  className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  onClick={() => toggleSort('paymentStatus')}
                >
                  Status <SortIndicator field="paymentStatus" />
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
              {filtered.map((applicant) => (
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
                    {applicant.specialty || '—'}
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
