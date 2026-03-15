'use client';

import Link from 'next/link';
import { useUserStatus } from '@/lib/app/user-context';
import { ContactPaymentCTA } from './ContactPaymentCTA';
import { PRICING } from '@/lib/constants';
import type { DashboardData } from '@/app/app/page';

export function StatusDashboard({ data }: { data: DashboardData }) {
  const {
    firstName,
    paymentStatus,
    isGoocampusMember,
    membershipEndDate,
  } = useUserStatus();

  const greeting = firstName ? `Hi ${firstName}` : 'Hi there';

  // Determine which statuses qualify for match stats
  const showMatchStats = ['in_pool', 'match_presented', 'awaiting_payment', 'active_member'].includes(paymentStatus);

  // Membership countdown
  const daysRemaining = membershipEndDate
    ? Math.max(0, Math.ceil((new Date(membershipEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="space-y-4">
      {/* Greeting */}
      <div className="rounded-2xl bg-samvaya-blush px-5 py-4">
        <h2 className="text-xl font-semibold text-gray-900">{greeting}</h2>
        <p className="mt-0.5 text-sm text-gray-500">Here&apos;s your current status</p>
      </div>

      {/* Profile Summary */}
      <ProfileSummary data={data} />

      {/* Status Card */}
      <StatusCard
        paymentStatus={paymentStatus}
        isGoocampusMember={isGoocampusMember}
        membershipEndDate={membershipEndDate}
      />

      {/* Match Stats (conditional) */}
      {showMatchStats && (
        <MatchStats total={data.totalMatches} pending={data.pendingMatches} />
      )}

      {/* Membership Countdown (conditional) */}
      {paymentStatus === 'active_member' && daysRemaining !== null && (
        <MembershipCountdown daysRemaining={daysRemaining} />
      )}

      {/* Quick Actions */}
      <QuickActions />

      {/* Activity Timeline */}
      <ActivityTimeline
        data={data}
        paymentStatus={paymentStatus}
      />
    </div>
  );
}

// --- Profile Summary Card ---

function ProfileSummary({ data }: { data: DashboardData }) {
  const name = [data.firstName, data.lastName].filter(Boolean).join(' ');
  const specialty = data.specialty?.join(', ');
  const location = [data.currentCity, data.currentState].filter(Boolean).join(', ');

  return (
    <div className="relative rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <Link
        href="/app/profile/edit"
        className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        aria-label="Edit profile"
      >
        <PencilIcon />
      </Link>
      <div className="pr-8">
        {name && (
          <p className="text-base font-semibold text-gray-900">Dr. {name}</p>
        )}
        {(specialty || data.currentDesignation) && (
          <p className="mt-0.5 text-sm text-gray-600">
            {[specialty, data.currentDesignation].filter(Boolean).join(' · ')}
          </p>
        )}
        {location && (
          <p className="mt-0.5 text-sm text-gray-500">{location}</p>
        )}
      </div>
    </div>
  );
}

// --- Match Stats ---

function MatchStats({ total, pending }: { total: number; pending: number }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900">Matches</h3>
      <div className="mt-2 flex items-baseline gap-4">
        <div>
          <span className="text-2xl font-bold text-gray-900">{total}</span>
          <span className="ml-1 text-sm text-gray-500">total</span>
        </div>
        {pending > 0 && (
          <div>
            <span className="text-2xl font-bold text-samvaya-red">{pending}</span>
            <span className="ml-1 text-sm text-gray-500">pending response</span>
          </div>
        )}
      </div>
      {total > 0 && (
        <Link
          href="/app/matches"
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-samvaya-red hover:text-samvaya-red-dark"
        >
          View Matches
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
          </svg>
        </Link>
      )}
    </div>
  );
}

// --- Membership Countdown ---

function MembershipCountdown({ daysRemaining }: { daysRemaining: number }) {
  const totalDays = 180; // 6 months
  const elapsed = totalDays - daysRemaining;
  const pct = Math.min(100, Math.round((elapsed / totalDays) * 100));

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Membership</h3>
        <span className="text-sm font-medium text-gray-600">{daysRemaining} days remaining</span>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-samvaya-red transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// --- Quick Actions ---

function QuickActions() {
  return (
    <div className="flex gap-3">
      <Link
        href="/app/profile/edit"
        className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-center text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
      >
        Edit Profile
      </Link>
      <Link
        href="/app/settings"
        className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-center text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
      >
        Settings
      </Link>
    </div>
  );
}

// --- Activity Timeline ---

const STATUS_ORDER = [
  'unverified',
  'verification_pending',
  'in_pool',
  'match_presented',
  'awaiting_payment',
  'active_member',
  'membership_expired',
];

function ActivityTimeline({
  data,
  paymentStatus,
}: {
  data: DashboardData;
  paymentStatus: string;
}) {
  const statusIdx = STATUS_ORDER.indexOf(paymentStatus);

  const milestones = [
    {
      label: 'Profile submitted',
      date: data.createdAt,
      done: true, // Always true — user has completed onboarding
    },
    {
      label: 'Payment received',
      date: data.paidAt,
      done: !!data.paidAt,
    },
    {
      label: 'Verification complete',
      date: data.verifiedAt,
      done: !!data.verifiedAt || statusIdx >= STATUS_ORDER.indexOf('in_pool'),
    },
    {
      label: 'Added to candidate pool',
      date: data.verifiedAt, // Same time as verification
      done: statusIdx >= STATUS_ORDER.indexOf('in_pool'),
    },
  ];

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">Timeline</h3>
      <div className="space-y-0">
        {milestones.map((m, i) => (
          <div key={i} className="flex gap-3">
            {/* Dot + line */}
            <div className="flex flex-col items-center">
              <div
                className={`h-3 w-3 flex-shrink-0 rounded-full ${
                  m.done ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
              {i < milestones.length - 1 && (
                <div
                  className={`w-0.5 flex-1 ${
                    m.done && milestones[i + 1].done ? 'bg-green-300' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
            {/* Label + date */}
            <div className="pb-5">
              <p
                className={`text-sm ${
                  m.done ? 'font-medium text-gray-900' : 'text-gray-400'
                }`}
              >
                {m.label}
              </p>
              {m.done && m.date && (
                <p className="text-xs text-gray-500">{formatDate(m.date)}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Status Card (existing, unchanged) ---

function StatusCard({
  paymentStatus,
  isGoocampusMember,
  membershipEndDate,
}: {
  paymentStatus: string;
  isGoocampusMember: boolean;
  membershipEndDate: string | null;
}) {
  switch (paymentStatus) {
    case 'unverified':
      if (isGoocampusMember) {
        return (
          <Card
            icon={<CheckCircleIcon className="text-green-600" />}
            title="GooCampus Member"
            description="Your GooCampus membership covers the verification fee. Our team will begin your verification process shortly."
            badge={{ label: 'GooCampus', color: 'green' }}
          />
        );
      }
      return (
        <Card
          icon={<ClockIcon className="text-samvaya-gold" />}
          title="Verification Fee Required"
          description={`Thank you for completing your profile. To begin the verification process, please complete the one-time verification fee of ${PRICING.VERIFICATION_FEE_DISPLAY} (${PRICING.VERIFICATION_BASE} + ${PRICING.GST_RATE} GST).`}
          badge={{ label: 'Pending Payment', color: 'amber' }}
        >
          <ContactPaymentCTA amount={PRICING.VERIFICATION_FEE_DISPLAY} feeType="verification" />
        </Card>
      );

    case 'verification_pending':
      return (
        <Card
          icon={<ShieldIcon className="text-blue-600" />}
          title="Verification In Progress"
          description="Your payment has been received. Our team is conducting your background verification. This typically takes 7-10 working days."
          badge={{ label: 'Verifying', color: 'blue' }}
        >
          <ProgressSteps
            steps={[
              { label: 'Profile Submitted', done: true },
              { label: 'Payment Received', done: true },
              { label: 'Background Verification', done: false, active: true },
              { label: 'Added to Pool', done: false },
            ]}
          />
        </Card>
      );

    case 'in_pool':
      return (
        <Card
          icon={<SearchIcon className="text-indigo-600" />}
          title="You&apos;re in the Pool"
          description="Your verification is complete. You're now in our curated candidate pool. Our team is carefully reviewing profiles to find your best match. We'll notify you as soon as we find someone special."
          badge={{ label: 'Verified', color: 'green' }}
        />
      );

    case 'match_presented':
      return (
        <Card
          icon={<HeartIcon className="text-samvaya-red" />}
          title="You Have a Match!"
          description="We've found someone we think could be a great fit for you. Review their profile and let us know what you think."
          badge={{ label: 'Match Found', color: 'rose' }}
        >
          <Link
            href="/app/matches"
            className="block w-full rounded-lg bg-samvaya-red px-6 py-3 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-samvaya-red-dark"
          >
            View Your Match
          </Link>
        </Card>
      );

    case 'awaiting_payment':
      return (
        <Card
          icon={<SparklesIcon className="text-samvaya-red" />}
          title="Mutual Interest Confirmed!"
          description={`Great news — you both expressed interest in each other! To proceed with the introduction, please complete the membership fee of ${PRICING.MEMBERSHIP_FEE_DISPLAY} (${PRICING.MEMBERSHIP_BASE} + ${PRICING.GST_RATE} GST).`}
          badge={{ label: 'Mutual Interest', color: 'rose' }}
        >
          <ContactPaymentCTA amount={PRICING.MEMBERSHIP_FEE_DISPLAY} feeType="membership" />
        </Card>
      );

    case 'active_member':
      return (
        <Card
          icon={<CheckCircleIcon className="text-green-600" />}
          title="Membership Active"
          description={
            membershipEndDate
              ? `Your membership is active until ${new Date(membershipEndDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.`
              : 'Your membership is currently active.'
          }
          badge={{ label: 'Active Member', color: 'green' }}
        >
          <Link
            href="/app/matches"
            className="block w-full rounded-lg border border-gray-300 px-6 py-3 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            View Matches
          </Link>
        </Card>
      );

    case 'membership_expired':
      return (
        <Card
          icon={<ClockIcon className="text-gray-500" />}
          title="Membership Expired"
          description="Your 6-month membership window has ended. Contact us if you'd like to renew and continue your search."
          badge={{ label: 'Expired', color: 'gray' }}
        >
          <ContactPaymentCTA amount="" feeType="renewal" />
        </Card>
      );

    default:
      return (
        <Card
          icon={<ClockIcon className="text-gray-500" />}
          title="Status Unknown"
          description="We're having trouble determining your current status. Please contact our team for assistance."
          badge={{ label: 'Unknown', color: 'gray' }}
        />
      );
  }
}

// --- Shared card shell ---

function Card({
  icon,
  title,
  description,
  badge,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge: { label: string; color: string };
  children?: React.ReactNode;
}) {
  const badgeColors: Record<string, string> = {
    green: 'bg-green-100 text-green-800',
    amber: 'bg-samvaya-gold-light text-samvaya-charcoal',
    blue: 'bg-blue-100 text-blue-800',
    rose: 'bg-samvaya-blush-dark text-samvaya-red',
    indigo: 'bg-indigo-100 text-indigo-800',
    gray: 'bg-gray-100 text-gray-600',
  };

  const iconBgColors: Record<string, string> = {
    green: 'bg-green-50',
    amber: 'bg-amber-50',
    blue: 'bg-blue-50',
    rose: 'bg-samvaya-blush',
    indigo: 'bg-indigo-50',
    gray: 'bg-gray-50',
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${iconBgColors[badge.color] ?? iconBgColors.gray}`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeColors[badge.color] ?? badgeColors.gray}`}
            >
              {badge.label}
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            {description}
          </p>
        </div>
      </div>
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}

// --- Progress steps ---

function ProgressSteps({
  steps,
}: {
  steps: Array<{ label: string; done: boolean; active?: boolean }>;
}) {
  return (
    <div className="space-y-3">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-3">
          <div
            className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium ${
              step.done
                ? 'bg-green-100 text-green-700'
                : step.active
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-400'
            }`}
          >
            {step.done ? (
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              i + 1
            )}
          </div>
          <span
            className={`text-sm ${
              step.done
                ? 'text-green-700'
                : step.active
                  ? 'font-medium text-blue-700'
                  : 'text-gray-400'
            }`}
          >
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// --- Icons ---

function PencilIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={`h-8 w-8 ${className}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={`h-8 w-8 ${className}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={`h-8 w-8 ${className}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={`h-8 w-8 ${className}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={`h-8 w-8 ${className}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={`h-8 w-8 ${className}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  );
}
