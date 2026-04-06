'use client';

import { useState, useMemo } from 'react';
import { capitalize } from '@/lib/utils';

export interface WaitlistEntry {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  specialty: string;
  city: string;
  status: string;
  createdAt: string;
}

interface WaitlistTableProps {
  entries: WaitlistEntry[];
  title: string;
}

type SortField = 'fullName' | 'specialty' | 'city' | 'status' | 'createdAt';
type SortDir = 'asc' | 'desc';

const PER_PAGE = 25;

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  invited: 'bg-blue-100 text-blue-700',
  signed_up: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export function WaitlistTable({ entries, title }: WaitlistTableProps) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = entries;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.fullName.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q)
      );
    }

    result = [...result].sort((a, b) => {
      const aVal = a[sortField] || '';
      const bVal = b[sortField] || '';
      const cmp = aVal.localeCompare(bVal);
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [entries, search, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }

  function sortIcon(field: SortField) {
    if (sortField !== field) return '↕';
    return sortDir === 'asc' ? '↑' : '↓';
  }

  function formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h1 className="type-heading-xl text-gray-900">{title}</h1>
        <span className="text-sm text-gray-500">{filtered.length} entries</span>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full max-w-sm rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left type-label text-gray-500 cursor-pointer select-none" onClick={() => toggleSort('fullName')}>
                Name {sortIcon('fullName')}
              </th>
              <th className="px-4 py-3 text-left type-label text-gray-500">
                Email
              </th>
              <th className="px-4 py-3 text-left type-label text-gray-500">
                Phone
              </th>
              <th className="px-4 py-3 text-left type-label text-gray-500 cursor-pointer select-none" onClick={() => toggleSort('specialty')}>
                Specialty {sortIcon('specialty')}
              </th>
              <th className="px-4 py-3 text-left type-label text-gray-500 cursor-pointer select-none" onClick={() => toggleSort('city')}>
                City {sortIcon('city')}
              </th>
              <th className="px-4 py-3 text-left type-label text-gray-500 cursor-pointer select-none" onClick={() => toggleSort('status')}>
                Status {sortIcon('status')}
              </th>
              <th className="px-4 py-3 text-left type-label text-gray-500 cursor-pointer select-none" onClick={() => toggleSort('createdAt')}>
                Date {sortIcon('createdAt')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                  No entries match the current filters.
                </td>
              </tr>
            ) : (
              paginated.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                    {entry.fullName}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                    {entry.email}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                    {entry.phone || '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                    {entry.specialty ? capitalize(entry.specialty) : '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                    {entry.city ? capitalize(entry.city) : '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[entry.status] || 'bg-gray-100 text-gray-600'}`}>
                      {entry.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                    {formatDate(entry.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
