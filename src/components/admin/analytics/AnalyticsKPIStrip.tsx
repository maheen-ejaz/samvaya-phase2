import { AdminKPICard } from '@/components/admin/AdminKPICard';

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="5" r="2.5" />
      <path d="M2.5 14c0-3.038 2.462-5.5 5.5-5.5s5.5 2.462 5.5 5.5" />
    </svg>
  );
}

function DocumentCheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 1.5H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6L9 1.5Z" />
      <path d="M9 1.5V6h4" />
      <path d="M5.5 9.5l1.5 1.5 3-3" />
    </svg>
  );
}

function CheckBadgeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 1.5 5 3H2.5v2.5L1 8l1.5 2.5V13H5l1.5 1.5L8 13l1.5 1.5L11 13h2.5v-2.5L15 8l-1.5-2.5V3H11L9.5 1.5 8 3 6.5 1.5Z" />
      <path d="M5.5 8l1.5 1.5 3-3" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 9.5a3.536 3.536 0 0 0 5 0l2-2a3.536 3.536 0 0 0-5-5l-1 1" />
      <path d="M9.5 6.5a3.536 3.536 0 0 0-5 0l-2 2a3.536 3.536 0 0 0 5 5l1-1" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 1.5l1.854 3.756 4.146.602-3 2.924.708 4.128L8 10.75l-3.708 1.96.708-4.128-3-2.924 4.146-.602L8 1.5Z" />
    </svg>
  );
}

interface AnalyticsKPIStripProps {
  totalApplicants: number;
  formComplete: number;
  inPool: number;
  matchesPresented: number;
  activeMembers: number;
  addedThisMonth: number;
}

export function AnalyticsKPIStrip({
  totalApplicants,
  formComplete,
  inPool,
  matchesPresented,
  activeMembers,
  addedThisMonth,
}: AnalyticsKPIStripProps) {
  return (
    <div className="grid grid-cols-5 gap-4 text-card-foreground">
      <AdminKPICard
        label="Total Applicants"
        count={totalApplicants}
        icon={<UserIcon />}
        href="/admin/applicants?stage=signed_up"
        trend={addedThisMonth > 0 ? { value: Math.round((addedThisMonth / Math.max(totalApplicants - addedThisMonth, 1)) * 100), direction: 'up', comparedTo: 'last month' } : undefined}
      />
      <AdminKPICard
        label="Form Complete"
        count={formComplete}
        icon={<DocumentCheckIcon />}
        href="/admin/applicants?stage=form_complete"

      />
      <AdminKPICard
        label="In Pool"
        count={inPool}
        icon={<CheckBadgeIcon />}
        href="/admin/applicants?stage=in_pool"

      />
      <AdminKPICard
        label="Matches Presented"
        count={matchesPresented}
        icon={<LinkIcon />}
        href="/admin/applicants"

      />
      <AdminKPICard
        label="Active Members"
        count={activeMembers}
        icon={<StarIcon />}
        href="/admin/applicants?stage=active_member"

      />
    </div>
  );
}
