'use client';

import { useState, useMemo } from 'react';
import { capitalize } from '@/lib/utils';
import { WaitlistEntryDrawer } from './WaitlistEntryDrawer';

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

const STATUS_STYLES: Record<string, { bg: string; dot: string; text: string }> = {
  pending:   { bg: 'bg-amber-50',  dot: 'bg-amber-400',  text: 'text-amber-800' },
  invited:   { bg: 'bg-blue-50',   dot: 'bg-blue-500',   text: 'text-blue-800' },
  signed_up: { bg: 'bg-green-50',  dot: 'bg-green-500',  text: 'text-green-800' },
  rejected:  { bg: 'bg-red-50',    dot: 'bg-red-500',    text: 'text-red-800' },
};

export function WaitlistTable({ entries, title }: WaitlistTableProps) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [drawerEntry, setDrawerEntry] = useState<WaitlistEntry | null>(null);

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

  const sortIndicator = (field: SortField) => {
    if (sortField !== field) return <span className="ml-1 text-gray-300">↕</span>;
    return <span className="ml-1 text-gray-500">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  function formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <h1 className="type-heading-xl text-gray-900">{title}</h1>
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-sm font-normal text-gray-600">
          {entries.length}
        </span>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full max-w-sm rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-1.5 text-sm text-gray-700 placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:outline-none focus:ring-0"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-5 py-3.5 text-left text-sm font-normal text-gray-500 cursor-pointer select-none" onClick={() => toggleSort('fullName')}>
                <span className="inline-flex items-center">Name {sortIndicator('fullName')}</span>
              </th>
              <th className="px-5 py-3.5 text-left text-sm font-normal text-gray-500">
                Email
              </th>
              <th className="px-5 py-3.5 text-left text-sm font-normal text-gray-500">
                Phone
              </th>
              <th className="px-5 py-3.5 text-left text-sm font-normal text-gray-500 cursor-pointer select-none" onClick={() => toggleSort('specialty')}>
                <span className="inline-flex items-center">Specialty {sortIndicator('specialty')}</span>
              </th>
              <th className="px-5 py-3.5 text-left text-sm font-normal text-gray-500 cursor-pointer select-none" onClick={() => toggleSort('city')}>
                <span className="inline-flex items-center">City {sortIndicator('city')}</span>
              </th>
              <th className="px-5 py-3.5 text-left text-sm font-normal text-gray-500 cursor-pointer select-none" onClick={() => toggleSort('status')}>
                <span className="inline-flex items-center">Status {sortIndicator('status')}</span>
              </th>
              <th className="px-5 py-3.5 text-left text-sm font-normal text-gray-500 cursor-pointer select-none" onClick={() => toggleSort('createdAt')}>
                <span className="inline-flex items-center">Date {sortIndicator('createdAt')}</span>
              </th>
              <th className="px-5 py-3.5 text-left text-sm font-normal text-gray-500">
                {/* actions column */}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-sm text-gray-500">
                  No entries match the current filters.
                </td>
              </tr>
            ) : (
              paginated.map((entry) => {
                const style = STATUS_STYLES[entry.status] || { bg: 'bg-gray-100', dot: 'bg-gray-400', text: 'text-gray-600' };
                const label = entry.status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
                const isSelected = drawerEntry?.id === entry.id;
                return (
                  <tr
                    key={entry.id}
                    onClick={() => setDrawerEntry(entry)}
                    className={`group relative cursor-pointer border-l-2 transition-all duration-150 ${
                      isSelected
                        ? 'border-l-admin-green-400 bg-admin-green-50'
                        : 'border-l-transparent hover:border-l-admin-green-300 hover:bg-gray-50 hover:shadow-sm hover:-translate-y-px'
                    }`}
                  >
                    <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-gray-900">
                      {entry.fullName}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">
                      {entry.email}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">
                      {entry.phone || '—'}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">
                      {entry.specialty ? capitalize(entry.specialty) : '—'}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">
                      {entry.city ? capitalize(entry.city) : '—'}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${style.bg} ${style.text}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                        {label}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">
                      {formatDate(entry.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setDrawerEntry(entry); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity rounded-md border border-gray-200 px-2.5 py-1 text-xs text-gray-600 hover:border-gray-300 hover:text-gray-900"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-500 hover:border-gray-300 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-500 hover:border-gray-300 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {drawerEntry && (
        <WaitlistEntryDrawer entry={drawerEntry} onClose={() => setDrawerEntry(null)} />
      )}
    </div>
  );
}
