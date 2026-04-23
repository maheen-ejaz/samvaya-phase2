'use client';

import { useState, useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { FormProvider, useForm } from '../FormProvider';
import { SaveStatusBadge } from './SaveStatusBadge';
import { JumpMenuSheet } from './JumpMenuSheet';
import { OnboardingSidebar } from './OnboardingSidebar';
import { buildSectionList } from '@/lib/form/section-routing';
import type { FormAnswers, SectionId } from '@/lib/form/types';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { MenuIcon, LogOutIcon } from 'lucide-react';

interface OnboardingShellProps {
  userId: string;
  initialAnswers: FormAnswers;
  initialGateAnswers: Record<string, string>;
  initialChatState: Record<string, unknown>;
  resumeQuestionNumber: number;
  resumeSection: SectionId;
  currentSection: SectionId;
  children: ReactNode;
}

export function OnboardingShell({
  userId,
  initialAnswers,
  initialGateAnswers,
  initialChatState,
  resumeQuestionNumber,
  resumeSection,
  currentSection,
  children,
}: OnboardingShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Cmd+K or ? opens the mobile jump menu
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (menuOpen) return;
      if (e.key === '?' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        setMenuOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <FormProvider
      userId={userId}
      initialAnswers={initialAnswers}
      initialGateAnswers={initialGateAnswers}
      initialChatState={initialChatState}
      resumeQuestionNumber={resumeQuestionNumber}
    >
      <TooltipProvider>
        <ShellInner
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          currentSection={currentSection}
          resumeSection={resumeSection}
        >
          {children}
        </ShellInner>
      </TooltipProvider>
    </FormProvider>
  );
}

function ShellInner({
  menuOpen,
  setMenuOpen,
  currentSection,
  resumeSection,
  children,
}: {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  currentSection: SectionId;
  resumeSection: SectionId;
  children: ReactNode;
}) {
  const { state } = useForm();
  const router = useRouter();
  const items = buildSectionList(state.answers, resumeSection, currentSection);
  const completedCount = items.filter((i) => i.status === 'complete').length;
  const totalCount = items.length;
  const overallPct = Math.round((completedCount / totalCount) * 100);

  const [isOffline, setIsOffline] = useState(false);
  useEffect(() => {
    const onOffline = () => setIsOffline(true);
    const onOnline = () => setIsOffline(false);
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
    if (typeof navigator !== 'undefined') setIsOffline(!navigator.onLine);
    return () => {
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
    };
  }, []);

  return (
    <SidebarProvider>
      {/* Desktop sidebar — hidden on mobile via the Sidebar component's built-in responsive */}
      <OnboardingSidebar
        currentSection={currentSection}
        resumeSection={resumeSection}
      />

      <SidebarInset className="form-surface border-l border-[color:var(--color-form-border)]">
        {/* Mobile-only progress bar (desktop has sidebar progress) */}
        <div className="h-0.5 w-full bg-muted lg:hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${overallPct}%` }}
          />
        </div>

        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
            {/* Desktop: sidebar toggle + breadcrumb. Mobile: logo */}
            <div className="flex items-center gap-2">
              <SidebarTrigger className="hidden md:flex" />
              <Link href="/app" className="flex items-center gap-2 md:hidden">
                <span className="text-[15px] font-medium tracking-tight text-foreground">
                  samvaya
                </span>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden text-xs text-muted-foreground md:block">
                {completedCount} of {totalCount} complete
              </span>
              <SaveStatusBadge />
              {/* Mobile-only: jump menu button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMenuOpen(true)}
                className="gap-1.5 text-xs text-muted-foreground lg:hidden"
                aria-label="Open section menu"
              >
                <MenuIcon className="size-4" />
                Sections
              </Button>
              {/* TEMP: sign-out button for testing — remove before launch */}
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  const supabase = createClient();
                  await supabase.auth.signOut();
                  router.push('/auth/login');
                }}
                className="gap-1.5 text-xs text-muted-foreground"
                aria-label="Sign out"
              >
                <LogOutIcon className="size-4" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </div>
          </div>
          <Separator />
        </header>

        {/* Offline banner */}
        {isOffline && (
          <div className="border-b border-amber-200 bg-amber-50 px-6 py-2.5 text-center">
            <span className="text-xs text-amber-800">
              You&apos;re offline — your answers will sync when you reconnect.
            </span>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1">
          <div className="mx-auto max-w-2xl px-6 py-10">
            {children}
          </div>
        </main>

        {/* Mobile-only jump menu sheet */}
        <JumpMenuSheet
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          currentSection={currentSection}
          resumeSection={resumeSection}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
