'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoutButton } from '@/components/ui/logout-button';

const NAV_ITEMS = [
  {
    href: '/admin',
    label: 'Dashboard',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="5" height="5" rx="1" />
        <rect x="9" y="2" width="5" height="5" rx="1" />
        <rect x="2" y="9" width="5" height="5" rx="1" />
        <rect x="9" y="9" width="5" height="5" rx="1" />
      </svg>
    ),
  },
  {
    href: '/admin/applicants',
    label: 'Applicants',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 14v-1a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v1" />
        <circle cx="6.5" cy="5" r="2.5" />
        <path d="M14 14v-1a2.5 2.5 0 0 0-2-2.45" />
        <path d="M10.5 2.55a2.5 2.5 0 0 1 0 4.9" />
      </svg>
    ),
  },
  {
    href: '/admin/verification',
    label: 'Verification',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 1.5L2 4v4c0 3.5 2.5 6 6 7 3.5-1 6-3.5 6-7V4L8 1.5z" />
        <path d="M5.5 8l2 2 3.5-3.5" />
      </svg>
    ),
  },
  {
    href: '/admin/matching',
    label: 'Matching',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 14s-5.5-3.5-5.5-7.5A3 3 0 0 1 8 4a3 3 0 0 1 5.5 2.5C13.5 10.5 8 14 8 14z" />
      </svg>
    ),
  },
  {
    href: '/admin/analytics',
    label: 'Analytics',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 13V7" />
        <path d="M6 13V3" />
        <path d="M10 13V9" />
        <path d="M14 13V5" />
      </svg>
    ),
  },
  {
    href: '/admin/communications',
    label: 'Communications',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1.5" y="3" width="13" height="10" rx="1.5" />
        <path d="M1.5 5l6.5 4 6.5-4" />
      </svg>
    ),
  },
  {
    href: '/admin/activity',
    label: 'Activity',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8" r="6" />
        <path d="M8 4.5V8l2.5 1.5" />
      </svg>
    ),
  },
] as const;

export function AdminTopNav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-gray-200/60 bg-white">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-2.5">
        {/* Logo */}
        <Link href="/admin" className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight text-gray-900">Samvaya</span>
          <span className="text-xs font-medium text-gray-400">Admin</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1" aria-label="Admin navigation">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#1B4332] text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="flex-shrink-0" aria-hidden="true">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right section */}
        <div className="flex items-center gap-4">
          {/* Search icon */}
          <button className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700" aria-label="Search">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="7" cy="7" r="4.5" />
              <path d="M10.5 10.5L14 14" />
            </svg>
          </button>

          {/* Notification bell */}
          <button className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700" aria-label="Notifications">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6a4 4 0 0 1 8 0c0 3 1.5 4.5 2 5H2c.5-.5 2-2 2-5z" />
              <path d="M6.5 13a1.5 1.5 0 0 0 3 0" />
            </svg>
          </button>

          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
