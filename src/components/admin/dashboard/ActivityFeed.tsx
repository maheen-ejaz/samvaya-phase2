'use client';

import Link from 'next/link';
import type { DashboardActivityLog } from '@/types/dashboard';
import { timeAgo } from '@/lib/utils';

interface ActivityFeedProps {
  logs: DashboardActivityLog[];
}

interface IconConfig {
  bgColor: string;
  textColor: string;
  icon: React.ReactNode;
}

function getIconConfig(action: string): IconConfig {
  // Matching-related actions
  if (
    action.includes('batch_scoring') ||
    action.includes('pre_filter') ||
    action.includes('compatibility_scored') ||
    action.includes('match_approved') ||
    action.includes('match_rejected') ||
    action.includes('match_response') ||
    action.includes('mutual_interest') ||
    action.includes('match_feedback')
  ) {
    return {
      bgColor: 'bg-violet-50',
      textColor: 'text-violet-500',
      icon: (
        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 1v5H3v2h5v5h2v-5h5V6h-5V1H8z" />
        </svg>
      ),
    };
  }

  // Introduction actions
  if (action.includes('introduction')) {
    return {
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-500',
      icon: (
        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 16 16">
          <path d="M2 2h12v12H2V2zm2 2v8h8V4H4zm1 1h6v6H5V5z" />
        </svg>
      ),
    };
  }

  // User/status actions
  if (
    action.includes('moved_to_pool') ||
    action.includes('marked_verification') ||
    action.includes('marked_goocampus') ||
    action.includes('updated_bgv')
  ) {
    return {
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      icon: (
        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 16 16">
          <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 11-1.06-1.06L12.72 4.22a.75.75 0 011.06 0z" />
        </svg>
      ),
    };
  }

  // Communication actions
  if (action.includes('sent_email') || action.includes('bulk_email')) {
    return {
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-500',
      icon: (
        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 16 16">
          <path d="M2 3h12v10H2V3zm11.5.5l-5.5 3.75L2.5 3.5m0 9h11" strokeWidth="1" stroke="currentColor" fill="none" />
        </svg>
      ),
    };
  }

  // Note actions
  if (action.includes('added_note')) {
    return {
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-500',
      icon: (
        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 16 16">
          <path d="M2.5 2h11v11h-11V2zm1 1v9h9V3h-9z" />
        </svg>
      ),
    };
  }

  // System actions (default)
  return {
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-500',
    icon: (
      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 1a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0V1.75A.75.75 0 018 1zM2.5 3.5a.75.75 0 01.53.22l1.06 1.06a.75.75 0 01-1.06 1.06L1.97 4.78a.75.75 0 010-1.06.75.75 0 01.53-.22zm11 0a.75.75 0 01.53.22.75.75 0 010 1.06l-1.06 1.06a.75.75 0 01-1.06-1.06l1.06-1.06a.75.75 0 01.53-.22zM1 8a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5H1.75A.75.75 0 011 8zm12 0a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5A.75.75 0 0113 8z" />
      </svg>
    ),
  };
}

function formatAction(action: string): string {
  const formatted = action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return formatted;
}

function splitAction(action: string): { verb: string; rest: string } {
  const formatted = formatAction(action);
  const words = formatted.split(' ');
  const verb = words[0];
  const rest = words.slice(1).join(' ');
  return { verb, rest };
}

export function ActivityFeed({ logs }: ActivityFeedProps) {
  return (
    <div className="rounded-xl border border-gray-200/60 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="type-heading text-gray-900">Today&apos;s Activity</h3>
        <Link href="/admin/activity" className="text-xs font-medium text-admin-blue-800 hover:text-admin-blue-700">
          View all
        </Link>
      </div>

      {logs.length === 0 ? (
        <p className="mt-4 text-sm text-gray-400">No activity in the last 24 hours.</p>
      ) : (
        <div className="mt-4 space-y-0">
          {logs.map((log, index) => {
            const { bgColor, textColor, icon } = getIconConfig(log.action);
            const isLast = index === logs.length - 1;
            const { verb, rest } = splitAction(log.action);

            return (
              <div key={log.id} className="relative flex gap-3 py-3">
                {/* Left: icon + vertical line */}
                <div className="flex flex-col items-center">
                  <div className={`z-10 flex h-7 w-7 items-center justify-center rounded-full ${bgColor} ${textColor}`}>
                    {icon}
                  </div>
                  {!isLast && <div className="mt-1 w-px flex-1 bg-gray-200" style={{ height: '24px' }} />}
                </div>

                {/* Right: content */}
                <div className="flex-1 pt-0.5 pb-1">
                  <p className="text-sm leading-snug text-gray-700">
                    <span className="font-semibold text-gray-900">{log.actorName}</span>{' '}
                    <span className="font-medium text-gray-700">{verb}</span>{' '}
                    {rest && <span className="text-gray-500">{rest}</span>}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 capitalize">
                      {log.entityType}
                    </span>
                    <span className="text-xs text-gray-400">{timeAgo(log.createdAt)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
