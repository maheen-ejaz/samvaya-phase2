'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarRail,
  SidebarInput,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  LayoutDashboardIcon,
  BarChart3Icon,
  UsersIcon,
  ShieldCheckIcon,
  HeartIcon,
  SendIcon,
  HistoryIcon,
  ListChecksIcon,
  MailIcon,
  ClockIcon,
  SettingsIcon,
  LogOutIcon,
  SearchIcon,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboardIcon, exact: true },
      { href: '/admin/analytics', label: 'Analytics', icon: BarChart3Icon },
    ],
  },
  {
    label: 'People',
    items: [
      { href: '/admin/applicants', label: 'Applicants', icon: UsersIcon },
      { href: '/admin/verification', label: 'Verification', icon: ShieldCheckIcon },
    ],
  },
  {
    label: 'Matching',
    items: [
      { href: '/admin/matching', label: 'Suggestions', icon: HeartIcon, exact: true },
      { href: '/admin/matching/introductions', label: 'Introductions', icon: SendIcon },
      { href: '/admin/matching/history', label: 'History', icon: HistoryIcon },
    ],
  },
  {
    label: 'Operations',
    items: [
      { href: '/admin/tasks', label: 'Tasks', icon: ListChecksIcon },
      { href: '/admin/communications', label: 'Communications', icon: MailIcon },
      { href: '/admin/activity', label: 'Activity Log', icon: ClockIcon },
    ],
  },
];

export function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="px-3 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin">
                <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-[color:var(--color-admin-accent)] text-white">
                  <span className="text-sm font-bold">S</span>
                </div>
                <div className="flex flex-col gap-1 leading-none">
                  <Image src="/samvaya-logo-red.png" alt="Samvaya" width={100} height={28} style={{ height: '18px', width: 'auto' }} />
                  <span className="text-xs text-muted-foreground">Admin</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                  const Icon = item.icon;

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                        <Link href={item.href}>
                          <Icon className="size-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {/* Settings — standalone */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith('/admin/settings')}
                  tooltip="Settings"
                >
                  <Link href="/admin/settings">
                    <SettingsIcon className="size-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-3 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/auth/signout" className="text-muted-foreground">
                <LogOutIcon className="size-4" />
                <span>Sign out</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
