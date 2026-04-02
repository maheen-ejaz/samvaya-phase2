'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { label: 'Suggestions', href: '/admin/matching' },
  { label: 'Presentations', href: '/admin/matching/presentations' },
  { label: 'Introductions', href: '/admin/matching/introductions' },
  { label: 'History', href: '/admin/matching/history' },
];

export function MatchingNav() {
  const pathname = usePathname();

  return (
    <div className="rounded-xl border border-gray-200/60 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2">
        {TABS.map((tab) => {
          const isActive = tab.href === '/admin/matching'
            ? pathname === '/admin/matching'
            : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-admin-green-900 text-white shadow-sm'
                  : 'border border-gray-200 text-gray-500 hover:border-admin-green-300 hover:text-admin-green-900'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
