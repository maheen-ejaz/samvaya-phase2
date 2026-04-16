'use client';

import Link from 'next/link';
import { HorizontalWaveFunnel } from '@/components/admin/analytics/HorizontalWaveFunnel';

export interface StageCounts {
  waitlist: number;
  invited: number;
  signed_up: number;
  form_in_progress: number;
  form_complete: number;
  payment_verified: number;
  bgv_complete: number;
  in_pool: number;
  active_member: number;
}

interface ApplicantDashboardProps {
  stageCounts: StageCounts;
}

// Derived inside the component so it has access to stageCounts
function buildStageLinks(s: StageCounts) {
  return [
    { stage: 'waitlist', label: 'Waitlist', count: s.waitlist },
    { stage: 'invited', label: 'Invited', count: s.invited },
    { stage: 'signed_up', label: 'Signed Up', count: s.signed_up },
    { stage: 'form_in_progress', label: 'In Progress', count: s.form_in_progress },
    { stage: 'form_complete', label: 'Form Done', count: s.form_complete },
    { stage: 'payment_verified', label: 'Fee Paid', count: s.payment_verified },
    { stage: 'bgv_complete', label: 'BGV Done', count: s.bgv_complete },
    { stage: 'in_pool', label: 'In Pool', count: s.in_pool },
    { stage: 'active_member', label: 'Active', count: s.active_member },
  ];
}

export function ApplicantDashboard({ stageCounts }: ApplicantDashboardProps) {
  const STAGE_LINKS = buildStageLinks(stageCounts);
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="type-heading-xl text-gray-900">Applicants</h1>
        <p className="mt-1 text-sm text-gray-500">Pipeline overview</p>
      </div>

      {/* Funnel chart */}
      <HorizontalWaveFunnel
        data={[
          { stage: 'Waitlist', count: stageCounts.waitlist },
          { stage: 'Invited', count: stageCounts.invited },
          { stage: 'Signed Up', count: stageCounts.signed_up },
          { stage: 'Form Started', count: stageCounts.form_in_progress },
          { stage: 'Form Complete', count: stageCounts.form_complete },
          { stage: 'Fee Paid', count: stageCounts.payment_verified },
          { stage: 'BGV Done', count: stageCounts.bgv_complete },
          { stage: 'In Pool', count: stageCounts.in_pool },
          { stage: 'Active', count: stageCounts.active_member },
        ]}
      />

      {/* Stage links grid */}
      <div className="grid grid-cols-3 gap-3 xl:grid-cols-5">
        {STAGE_LINKS.map(({ stage, label, count }) => (
          <Link
            key={stage}
            href={`/admin/applicants?stage=${stage}`}
            className="group flex items-center justify-between rounded-xl border border-gray-200/60 bg-white px-4 py-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                {label}
              </p>
              <p className="mt-0.5 text-2xl font-[350] tabular-nums text-gray-900">
                {count}
              </p>
            </div>
            <span className="text-gray-200 transition-colors group-hover:text-admin-blue-400">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
