'use client';

import Link from 'next/link';
import {
  Plus,
  SquareDashed,
  CheckCircle2,
  Mail,
  StickyNote,
  Sun,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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
      icon: <Plus className="h-3.5 w-3.5" />,
    };
  }

  // Introduction actions
  if (action.includes('introduction')) {
    return {
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-500',
      icon: <SquareDashed className="h-3.5 w-3.5" />,
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
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    };
  }

  // Communication actions
  if (action.includes('sent_email') || action.includes('bulk_email')) {
    return {
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-500',
      icon: <Mail className="h-3.5 w-3.5" />,
    };
  }

  // Note actions
  if (action.includes('added_note')) {
    return {
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-500',
      icon: <StickyNote className="h-3.5 w-3.5" />,
    };
  }

  // System actions (default)
  return {
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-500',
    icon: <Sun className="h-3.5 w-3.5" />,
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
    <Card className="shadow-sm ring-1 ring-gray-200/60">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-foreground">Today&apos;s Activity</CardTitle>
        <CardAction>
          <Button variant="link" size="sm" asChild className="text-xs font-medium text-primary hover:text-primary no-underline hover:no-underline p-0 h-auto">
            <Link href="/admin/activity">View all</Link>
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent>
        {logs.length === 0 ? (
          <p className="text-sm text-gray-400">No activity in the last 24 hours.</p>
        ) : (
          <div className="space-y-0">
            {logs.map((log, index) => {
              const { bgColor, textColor, icon } = getIconConfig(log.action);
              const isLast = index === logs.length - 1;
              const { verb, rest } = splitAction(log.action);

              return (
                <div key={log.id} className="relative flex gap-3 py-3">
                  {/* Left: icon + vertical line */}
                  <div className="flex flex-col items-center">
                    <div className={cn('z-10 flex h-7 w-7 items-center justify-center rounded-full', bgColor, textColor)}>
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
                      <Badge variant="secondary" className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 capitalize border-0 h-auto font-normal">
                        {log.entityType}
                      </Badge>
                      <span className="text-xs text-gray-400">{timeAgo(log.createdAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
