'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { DashboardCommLog } from '@/types/dashboard';
import { formatDateIN } from '@/lib/utils';
import { RecipientProfileDrawer } from './RecipientProfileDrawer';

interface RecentCommsProps {
  communications: DashboardCommLog[];
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; dot: string; text: string }> = {
  sent:    { label: 'Sent',    bg: 'bg-emerald-50', dot: 'bg-emerald-500', text: 'text-emerald-800' },
  opened:  { label: 'Opened',  bg: 'bg-blue-50',    dot: 'bg-blue-500',    text: 'text-blue-800' },
  pending: { label: 'Pending', bg: 'bg-amber-50',   dot: 'bg-amber-400',   text: 'text-amber-800' },
  failed:  { label: 'Failed',  bg: 'bg-red-50',     dot: 'bg-red-500',     text: 'text-red-800' },
  bounced: { label: 'Bounced', bg: 'bg-orange-50',  dot: 'bg-orange-400',  text: 'text-orange-800' },
};

export function RecentComms({ communications }: RecentCommsProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  return (
    <>
      <div className="rounded-xl border border-gray-200/60 bg-white p-5 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="type-heading text-gray-900">Recent Communications</h3>
            {communications.length > 0 && (
              <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-admin-blue-100 px-2 text-xs font-semibold text-admin-blue-900">
                {communications.length}
              </span>
            )}
          </div>
          <Link
            href="/admin/communications"
            className="text-xs font-medium text-admin-blue-800 hover:text-admin-blue-700"
          >
            View all
          </Link>
        </div>

        {communications.length === 0 ? (
          <p className="mt-4 text-sm text-gray-400">No communications sent yet.</p>
        ) : (
          <div className="mt-4">
            <table className="w-full text-sm">
              <thead className="admin-table-thead">
                <tr className="border-b border-gray-100">
                  <th className="pb-3 text-left">Recipient</th>
                  <th className="pb-3 text-left">Subject</th>
                  <th className="pb-3 text-left">Date</th>
                  <th className="pb-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {communications.map((comm) => {
                  const cfg = STATUS_CONFIG[comm.status] ?? {
                    label: comm.status.charAt(0).toUpperCase() + comm.status.slice(1),
                    bg: 'bg-gray-100', dot: 'bg-gray-400', text: 'text-gray-600',
                  };
                  return (
                    <tr
                      key={comm.id}
                      className="group relative border-l-2 border-l-transparent transition-all duration-150 hover:border-l-admin-blue-300 hover:bg-gray-50 hover:-translate-y-px"
                    >
                      <td className="py-3.5 pr-4">
                        <button
                          onClick={() => setSelectedUserId(comm.userId)}
                          className="font-medium text-gray-900 transition-colors hover:text-admin-blue-700"
                        >
                          {comm.recipientName}
                        </button>
                      </td>
                      <td className="py-3.5 pr-4 max-w-[240px]">
                        <span className="block truncate text-gray-500">{comm.subject || '(no subject)'}</span>
                      </td>
                      <td className="py-3.5 pr-4 whitespace-nowrap text-gray-500">{formatDateIN(comm.sentAt)}</td>
                      <td className="py-3.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedUserId && (
        <RecipientProfileDrawer
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </>
  );
}
