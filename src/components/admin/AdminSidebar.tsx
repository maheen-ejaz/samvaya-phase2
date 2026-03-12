'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: '□' },
  { href: '/admin/applicants', label: 'Applicants', icon: '▤' },
  { href: '/admin/verification', label: 'Verification', icon: '✓' },
  { href: '/admin/matching', label: 'Matching', icon: '♡' },
  { href: '/admin/analytics', label: 'Analytics', icon: '◈' },
  { href: '/admin/communications', label: 'Communications', icon: '✉' },
  { href: '/admin/activity', label: 'Activity Log', icon: '⏱' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙' },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex w-56 flex-col border-r border-gray-200 bg-white" aria-label="Admin navigation">
      <ul className="flex flex-col gap-1 p-3">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="text-base" aria-hidden="true">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
