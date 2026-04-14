'use client';

import { useState, useMemo } from 'react';
import { capitalize } from '@/lib/utils';
import { WaitlistEntryDrawer } from './WaitlistEntryDrawer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowUpDownIcon, ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

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

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDownIcon className="ml-1 inline h-3.5 w-3.5 text-gray-300" />;
    return sortDir === 'asc'
      ? <ArrowUpIcon className="ml-1 inline h-3.5 w-3.5 text-gray-500" />
      : <ArrowDownIcon className="ml-1 inline h-3.5 w-3.5 text-gray-500" />;
  };

  function formatDate(dateStr: string): string {
    if (!dateStr) return '\u2014';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">{title}</h1>
        <Badge variant="secondary" className="text-sm font-normal">
          {entries.length}
        </Badge>
      </div>

      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full max-w-sm"
        />
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-100">
              <TableHead className="cursor-pointer select-none px-5" onClick={() => toggleSort('fullName')}>
                <span className="inline-flex items-center">Name <SortIcon field="fullName" /></span>
              </TableHead>
              <TableHead className="px-5">Email</TableHead>
              <TableHead className="px-5">Phone</TableHead>
              <TableHead className="cursor-pointer select-none px-5" onClick={() => toggleSort('specialty')}>
                <span className="inline-flex items-center">Specialty <SortIcon field="specialty" /></span>
              </TableHead>
              <TableHead className="cursor-pointer select-none px-5" onClick={() => toggleSort('city')}>
                <span className="inline-flex items-center">City <SortIcon field="city" /></span>
              </TableHead>
              <TableHead className="cursor-pointer select-none px-5" onClick={() => toggleSort('status')}>
                <span className="inline-flex items-center">Status <SortIcon field="status" /></span>
              </TableHead>
              <TableHead className="cursor-pointer select-none px-5" onClick={() => toggleSort('createdAt')}>
                <span className="inline-flex items-center">Date <SortIcon field="createdAt" /></span>
              </TableHead>
              <TableHead className="px-5">{/* actions column */}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="px-5 py-8 text-center text-gray-500">
                  No entries match the current filters.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((entry) => {
                const style = STATUS_STYLES[entry.status] || { bg: 'bg-gray-100', dot: 'bg-gray-400', text: 'text-gray-600' };
                const label = entry.status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
                const isSelected = drawerEntry?.id === entry.id;
                return (
                  <TableRow
                    key={entry.id}
                    onClick={() => setDrawerEntry(entry)}
                    className={`group relative cursor-pointer border-l-2 transition-all duration-150 ${
                      isSelected
                        ? 'border-l-primary/30 bg-muted'
                        : 'border-l-transparent hover:border-l-primary/30 hover:bg-gray-50 hover:shadow-sm hover:-translate-y-px'
                    }`}
                  >
                    <TableCell className="px-5 py-4 font-medium text-gray-900">
                      {entry.fullName}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-500">
                      {entry.email}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-500">
                      {entry.phone || '\u2014'}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-500">
                      {entry.specialty ? capitalize(entry.specialty) : '\u2014'}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-500">
                      {entry.city ? capitalize(entry.city) : '\u2014'}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${style.bg} ${style.text}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                        {label}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-500">
                      {formatDate(entry.createdAt)}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={(e) => { e.stopPropagation(); setDrawerEntry(entry); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Showing {(page - 1) * PER_PAGE + 1}\u2013{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {drawerEntry && (
        <WaitlistEntryDrawer entry={drawerEntry} onClose={() => setDrawerEntry(null)} />
      )}
    </div>
  );
}
