'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { DashboardAlert } from '@/types/dashboard';

interface AlertsListProps {
  alerts: DashboardAlert[];
}

const PRIORITY_COLORS: Record<string, string> = {
  high: 'border-l-red-500',
  medium: 'border-l-amber-400',
  low: 'border-l-blue-400',
};

export function AlertsList({ alerts }: AlertsListProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleAction(alert: DashboardAlert) {
    if (alert.actionHref) {
      router.push(alert.actionHref);
      return;
    }
    if (!alert.actionEndpoint) return;

    setLoadingId(alert.id);
    try {
      const res = await fetch(alert.actionEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert.actionPayload || {}),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch {
      // silently fail — page will refresh anyway
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-gray-900">Alerts &amp; Action Items</h3>

      {alerts.length === 0 ? (
        <p className="mt-4 text-sm text-gray-400">No pending actions. All clear.</p>
      ) : (
        <div className="mt-3 space-y-2 max-h-[340px] overflow-y-auto">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-center justify-between rounded-lg border border-gray-100 border-l-4 ${PRIORITY_COLORS[alert.priority]} bg-white px-4 py-3`}
            >
              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/applicants/${alert.userId}`}
                  className="text-sm font-medium text-gray-900 hover:text-rose-600"
                >
                  {alert.name}
                </Link>
                <p className="text-xs text-gray-500 truncate">{alert.message}</p>
                {alert.daysStuck !== undefined && alert.daysStuck > 0 && (
                  <p className="text-xs text-red-500">{alert.daysStuck} days</p>
                )}
              </div>
              <button
                onClick={() => handleAction(alert)}
                disabled={loadingId === alert.id}
                className="ml-3 flex-shrink-0 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loadingId === alert.id ? '...' : alert.actionLabel}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
