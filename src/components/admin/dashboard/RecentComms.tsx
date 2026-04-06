'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { DashboardCommLog } from '@/types/dashboard';
import { formatDateIN } from '@/lib/utils';
import { RecipientProfileDrawer } from './RecipientProfileDrawer';

interface RecentCommsProps {
  communications: DashboardCommLog[];
}

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  sent:    { label: 'Sent',    classes: 'bg-emerald-50 text-gray-900' },
  opened:  { label: 'Opened',  classes: 'bg-blue-50 text-gray-900' },
  pending: { label: 'Pending', classes: 'bg-amber-50 text-gray-900' },
  failed:  { label: 'Failed',  classes: 'bg-red-50 text-gray-900' },
  bounced: { label: 'Bounced', classes: 'bg-orange-50 text-gray-900' },
};

export function RecentComms({ communications }: RecentCommsProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  return (
    <>
      <div className="rounded-xl border border-gray-200/60 bg-white p-5 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="type-heading text-gray-900">Recent Communications</h3>
          <Link
            href="/admin/communications"
            className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            View all
          </Link>
        </div>

        {communications.length === 0 ? (
          <p className="mt-4 text-sm text-gray-400">No communications sent yet.</p>
        ) : (
          <div className="mt-4">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="pb-3 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">Recipient</th>
                  <th className="pb-3 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">Subject</th>
                  <th className="pb-3 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">Date</th>
                  <th className="pb-3 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {communications.map((comm) => {
                  const statusCfg = STATUS_CONFIG[comm.status] ?? { label: comm.status.charAt(0).toUpperCase() + comm.status.slice(1), classes: 'bg-gray-100 text-gray-900' };
                  return (
                    <tr
                      key={comm.id}
                      className="transition-colors hover:bg-gray-50/70"
                    >
                      <td className="py-3.5 pr-4">
                        <button
                          onClick={() => setSelectedUserId(comm.userId)}
                          className="transition-colors hover:text-rose-700"
                        >
                          <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-900">
                            {comm.recipientName}
                          </span>
                        </button>
                      </td>
                      <td className="py-3.5 pr-4 max-w-[240px]">
                        <span className="block truncate text-gray-500">{comm.subject || '(no subject)'}</span>
                      </td>
                      <td className="py-3.5 pr-4 whitespace-nowrap text-gray-500">{formatDateIN(comm.sentAt)}</td>
                      <td className="py-3.5">
                        <span className={`inline-block rounded-md px-2.5 py-1 text-xs font-medium ${statusCfg.classes}`}>
                          {statusCfg.label}
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
