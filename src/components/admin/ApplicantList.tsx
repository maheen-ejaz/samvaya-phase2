'use client';

import { useState, useMemo } from 'react';
import { PaymentStatusBadge, ConsentBadge } from './StatusBadge';
import { ApplicantStatusIcons } from './ApplicantStatusIcons';
import { capitalize } from '@/lib/utils';
import { ApplicantPreviewDrawer } from './applicants/ApplicantPreviewDrawer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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

const SORT_OPTIONS = [
  { value: 'submittedAt:desc', label: 'Newest first' },
  { value: 'submittedAt:asc', label: 'Oldest first' },
  { value: 'name:asc', label: 'Name A\u2013Z' },
  { value: 'name:desc', label: 'Name Z\u2013A' },
  { value: 'specialty:asc', label: 'Specialty A\u2013Z' },
  { value: 'paymentStatus:asc', label: 'Status A\u2013Z' },
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
  const handleSortChange = (value: string) => {
    const [field, dir] = value.split(':') as [SortField, SortDir];
    setSortField(field);
    setSortDir(dir);
    setPage(1);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">{title}</h1>
        <Badge variant="secondary" className="text-sm font-normal">
          {applicants.length}
        </Badge>
      </div>

      {/* Search + Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input
          type="search"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by name or email\u2026"
          className="w-64"
          aria-label="Search applicants"
        />
        <Select value={statusFilter} onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-48" aria-label="Filter by payment status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={`${sortField}:${sortDir}`} onValueChange={handleSortChange}>
          <SelectTrigger className="w-44" aria-label="Sort by">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-5">Name</TableHead>
                <TableHead className="px-5">Email</TableHead>
                <TableHead className="px-5">Specialty</TableHead>
                <TableHead className="px-5">Submitted</TableHead>
                <TableHead className="px-5">Status</TableHead>
                <TableHead className="px-5">BGV Consent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((applicant) => {
                const isSelected = drawerUserId === applicant.id;
                return (
                  <TableRow
                    key={applicant.id}
                    onClick={() => setDrawerUserId(applicant.id)}
                    className={`group relative cursor-pointer border-l-2 transition-all duration-150 ${
                      isSelected
                        ? 'border-l-primary/30 bg-muted'
                        : 'border-l-transparent hover:border-l-primary/30 hover:bg-gray-50 hover:shadow-sm hover:-translate-y-px'
                    }`}
                  >
                    <TableCell className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5">
                        <a
                          href={`/admin/applicants/${applicant.id}`}
                          className={`font-medium transition-colors hover:text-rose-700 ${isSelected ? 'text-primary' : 'text-gray-900'}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {applicant.firstName} {applicant.lastName}
                        </a>
                        <ApplicantStatusIcons
                          isGooCampusMember={applicant.isGooCampusMember}
                          paymentStatus={applicant.paymentStatus}
                        />
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-500">
                      {applicant.email}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-500">
                      {applicant.specialty ? capitalize(applicant.specialty) : '\u2014'}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-500">
                      {formatDate(applicant.submittedAt)}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <PaymentStatusBadge status={applicant.paymentStatus} />
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <ConsentBadge consent={applicant.bgvConsent} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Showing {paginatedStart + 1}\u2013{Math.min(paginatedStart + PER_PAGE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-400">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
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
