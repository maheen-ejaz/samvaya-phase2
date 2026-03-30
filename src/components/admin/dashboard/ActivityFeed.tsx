'use client';

import Link from 'next/link';
import type { DashboardActivityLog } from '@/types/dashboard';
import { timeAgo } from '@/lib/utils';

interface ActivityFeedProps {
  logs: DashboardActivityLog[];
}

function formatAction(action: string): string {
  return action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ActivityFeed({ logs }: ActivityFeedProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Today&apos;s Activity</h3>
        <Link href="/admin/activity" className="text-xs text-rose-600 hover:text-rose-700">
          View all
        </Link>
      </div>

      {logs.length === 0 ? (
        <p className="mt-4 text-sm text-gray-400">No activity in the last 24 hours.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 text-sm">
              <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-rose-400" />
              <div className="flex-1 leading-snug">
                <span className="font-medium text-gray-900">{log.actorName}</span>{' '}
                <span className="text-gray-600">{formatAction(log.action)}</span>{' '}
                <span className="text-gray-400">({log.entityType})</span>
              </div>
              <span className="flex-shrink-0 text-xs text-gray-400">{timeAgo(log.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
