'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const MAIN_NAV = [
  { href: '/admin', label: 'Dashboard', icon: '□' },
  { href: '/admin/applicants', label: 'Applicants', icon: '▤' },
  { href: '/admin/verification', label: 'Verification', icon: '✓' },
  { href: '/admin/matching', label: 'Matching', icon: '♡' },
  { href: '/admin/analytics', label: 'Analytics', icon: '◈' },
  { href: '/admin/communications', label: 'Communications', icon: '✉' },
  { href: '/admin/activity', label: 'Activity Log', icon: '⏱' },
] as const;

const SETTINGS_ITEM = { href: '/admin/settings', label: 'Settings', icon: '⚙' } as const;

const STORAGE_KEY = 'samvaya-sidebar-collapsed';

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEY) === 'true';
  });

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  }

  function renderNavLink(item: { href: string; label: string; icon: string }) {
    const isActive =
      item.href === '/admin'
        ? pathname === '/admin'
        : pathname.startsWith(item.href);

    return (
      <Link
        href={item.href}
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          isActive
            ? 'bg-gray-100 text-gray-900'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        } ${collapsed ? 'justify-center' : ''}`}
        aria-current={isActive ? 'page' : undefined}
        aria-label={collapsed ? item.label : undefined}
        title={collapsed ? item.label : undefined}
      >
        <span className="text-base flex-shrink-0" aria-hidden="true">{item.icon}</span>
        {!collapsed && item.label}
      </Link>
    );
  }

  return (
    <nav
      className={`flex flex-col border-r border-gray-200 bg-white transition-all duration-200 ${
        collapsed ? 'w-16' : 'w-56'
      }`}
      aria-label="Admin navigation"
    >
      {/* Main navigation */}
      <ul className="flex-1 space-y-1 p-3">
        {MAIN_NAV.map((item) => (
          <li key={item.href}>{renderNavLink(item)}</li>
        ))}
      </ul>

      {/* Bottom section: Settings + Collapse toggle */}
      <div className="border-t border-gray-100 p-3 space-y-2">
        {renderNavLink(SETTINGS_ITEM)}
        <button
          onClick={toggle}
          className="w-full flex items-center justify-center rounded-lg border border-gray-200 py-2 text-xs text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '→' : '← Collapse'}
        </button>
      </div>
    </nav>
  );
}
