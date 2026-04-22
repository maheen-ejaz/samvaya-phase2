'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const TABS = [
  { label: 'Suggestions', href: '/admin/matching' },
  { label: 'Presentations', href: '/admin/matching/presentations' },
  { label: 'Introductions', href: '/admin/matching/introductions' },
  { label: 'History', href: '/admin/matching/history' },
];

export function MatchingNav() {
  const pathname = usePathname();

  return (
    <Card className="px-4 py-3">
      <div className="flex items-center gap-2">
        {TABS.map((tab) => {
          const isActive = tab.href === '/admin/matching'
            ? pathname === '/admin/matching'
            : pathname.startsWith(tab.href);

          return (
            <Button
              key={tab.href}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              className="rounded-full"
              asChild
            >
              <Link href={tab.href}>
                {tab.label}
              </Link>
            </Button>
          );
        })}
      </div>
    </Card>
  );
}
