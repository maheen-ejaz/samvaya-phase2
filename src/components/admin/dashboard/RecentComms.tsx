'use client';

import Link from 'next/link';
import type { DashboardCommLog } from '@/types/dashboard';
import { formatDateIN } from '@/lib/utils';

interface RecentCommsProps {
  communications: DashboardCommLog[];
}

const STATUS_COLORS: Record<string, string> = {
  sent: 'bg-admin-green-100 text-admin-green-900',
  failed: 'bg-gray-100 text-gray-600',
  pending: 'bg-admin-green-50 text-admin-green-800',
};

export function RecentComms({ communications }: RecentCommsProps) {
  return (
    <div className="rounded-xl border border-gray-200/60 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="type-heading text-gray-900">Recent Communications</h3>
        <Link href="/admin/communications" className="text-xs font-medium text-admin-green-800 hover:text-admin-green-700">
          View all
        </Link>
      </div>

      {communications.length === 0 ? (
        <p className="mt-4 text-sm text-gray-400">No communications sent yet.</p>
      ) : (
        <div className="mt-3">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="pb-2 type-label text-gray-500">Recipient</th>
                <th className="pb-2 type-label text-gray-500">Subject</th>
                <th className="pb-2 type-label text-gray-500">Date</th>
                <th className="pb-2 type-label text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {communications.map((comm) => (
                <tr key={comm.id} className="border-b border-gray-50">
                  <td className="py-2 font-medium text-gray-900">{comm.recipientName}</td>
                  <td className="py-2 text-gray-600 truncate max-w-[200px]">{comm.subject || '(no subject)'}</td>
                  <td className="py-2 text-gray-500">{formatDateIN(comm.sentAt)}</td>
                  <td className="py-2">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[comm.status] || 'bg-gray-100 text-gray-600'}`}>
                      {comm.status}
                    </span>
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
