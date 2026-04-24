'use client';

import { useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useUserStatus } from '@/lib/app/user-context';
import { ContactPaymentCTA } from './ContactPaymentCTA';
import { PRICING } from '@/lib/constants';
import type { DashboardData } from '@/app/app/page';

function titleCase(str: string): string {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function StatusDashboard({ data }: { data: DashboardData }) {
  // eslint-disable-next-line react-hooks/purity -- Date.now() used once at mount via ref, stable for display purposes
  const nowRef = useRef(Date.now());
  const {
    firstName,
    paymentStatus,
    isGoocampusMember,
    membershipEndDate,
  } = useUserStatus();

  const greeting = firstName ? `Hi ${firstName}` : 'Hi there';
  const showMatchStats = ['in_pool', 'match_presented', 'awaiting_payment', 'active_member'].includes(paymentStatus);

  const name = [data.firstName, data.lastName].filter(Boolean).join(' ');

  const daysRemaining = useMemo(
    () => membershipEndDate
      ? Math.max(0, Math.ceil((new Date(membershipEndDate).getTime() - nowRef.current) / (1000 * 60 * 60 * 24)))
      : null,
    [membershipEndDate]
  );

  return (
    <div className="space-y-8">
      {/* ═══════════════════════════════════════
          TOP ROW — Greeting + Avatar
          ═══════════════════════════════════════ */}
      <div className="flex items-start justify-between animate-fade-in-up">
        <div>
          <h1 className="type-heading-xl text-gray-900">{greeting}</h1>
          <p className="mt-1 text-sm text-gray-400">Here&apos;s your journey</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Notification bell */}
          <button type="button" aria-label="Notifications" className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
            <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          </button>
          {/* Avatar */}
          <Link href="/app/profile" className="relative h-11 w-11 overflow-hidden rounded-full ring-2 ring-rose-100 shadow-sm">
            {data.primaryPhotoUrl ? (
              <Image
                src={data.primaryPhotoUrl}
                alt={name ? `Dr. ${name}` : 'Profile photo'}
                fill
                className="object-cover"
                sizes="44px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-rose-50">
                <svg className="h-5 w-5 text-rose-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
            )}
          </Link>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          QUICK ACTIONS — Horizontal pill chips
          ═══════════════════════════════════════ */}
      <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-1 px-1 animate-fade-in-up stagger-1">
        <ActionChip href="/app/profile/edit" icon={<PencilIcon />} label="Edit Profile" />
        <ActionChip href="/app/profile/photos" icon={<CameraIcon />} label="Photos" />
        <ActionChip href="/app/matches" icon={<HeartIconSmall />} label="Matches" />
        <ActionChip href="/app/settings" icon={<GearIcon />} label="Settings" />
      </div>

      {/* ═══════════════════════════════════════
          YOUR STATUS — Warm card tile
          ═══════════════════════════════════════ */}
      <div className="animate-fade-in-up stagger-2">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Your Status</h2>
        <StatusTile
          paymentStatus={paymentStatus}
          isGoocampusMember={isGoocampusMember}
          membershipEndDate={membershipEndDate}
        />
      </div>

      {/* ═══════════════════════════════════════
          YOUR JOURNEY — 2-column card grid
          ═══════════════════════════════════════ */}
      <div className="animate-fade-in-up stagger-3">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Your Journey</h2>
        <JourneyGrid data={data} paymentStatus={paymentStatus} />
      </div>

      {/* ═══════════════════════════════════════
          MATCH STATS — conditional
          ═══════════════════════════════════════ */}
      {showMatchStats && (
        <div className="animate-fade-in-up stagger-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-900">Matches</h2>
            {data.totalMatches > 0 && (
              <Link href="/app/matches" className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors">
                See All
              </Link>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="card-warm px-5 py-4">
              <p className="text-3xl font-light tracking-tight text-gray-900">{data.totalMatches}</p>
              <p className="mt-1 text-xs text-gray-400">total matches</p>
            </div>
            <div className="card-warm px-5 py-4">
              <p className={`text-3xl font-light tracking-tight ${data.pendingMatches > 0 ? 'text-samvaya-red' : 'text-gray-900'}`}>
                {data.pendingMatches}
              </p>
              <p className="mt-1 text-xs text-gray-400">pending</p>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          MEMBERSHIP COUNTDOWN — conditional
          ═══════════════════════════════════════ */}
      {paymentStatus === 'active_member' && daysRemaining !== null && (
        <div className="animate-fade-in-up stagger-4">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Membership</h2>
          <div className="card-warm px-5 py-5">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-light tracking-tight text-gray-900">{daysRemaining}</span>
              <div>
                <p className="text-sm text-gray-500">days remaining</p>
                <p className="text-xs text-gray-300">of 180 · {180 - daysRemaining} elapsed</p>
              </div>
            </div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/80">
              <div
                className="h-full rounded-full bg-gradient-to-r from-samvaya-red to-samvaya-gold transition-all duration-700"
                style={{ width: `${Math.min(100, Math.round(((180 - daysRemaining) / 180) * 100))}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// Action Chip — pill-shaped with icon
// ═══════════════════════════════════════════

function ActionChip({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex flex-shrink-0 items-center gap-2 rounded-full bg-white/80 px-4 py-2.5 text-xs font-medium text-gray-600 shadow-sm border border-gray-100/80 transition-all hover:shadow-md hover:bg-white active:scale-95"
    >
      {icon}
      {label}
    </Link>
  );
}

// ═══════════════════════════════════════════
// Status Tile — warm card with status info
// ═══════════════════════════════════════════

function StatusTile({
  paymentStatus,
  isGoocampusMember,
  membershipEndDate,
}: {
  paymentStatus: string;
  isGoocampusMember: boolean;
  membershipEndDate: string | null;
}) {
  const config = getStatusConfig(paymentStatus, isGoocampusMember, membershipEndDate);

  return (
    <div className="card-warm px-5 py-5">
      <div className="flex items-start gap-4">
        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-sm`}>
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900">{config.title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-gray-400">{config.description}</p>
          {config.cta && <div className="mt-4">{config.cta}</div>}
        </div>
      </div>
    </div>
  );
}

const STATUS_ORDER = [
  'unverified',
  'verification_pending',
  'in_pool',
  'match_presented',
  'awaiting_payment',
  'active_member',
  'membership_expired',
];

function getStatusConfig(
  paymentStatus: string,
  isGoocampusMember: boolean,
  membershipEndDate: string | null,
) {
  switch (paymentStatus) {
    case 'unverified':
      if (isGoocampusMember) {
        return {
          icon: <CheckCircleIcon className="text-emerald-500" />,
          title: 'GooCampus Member',
          description: 'Your GooCampus membership covers the verification fee. Our team will begin your verification process shortly.',
          cta: null,
        };
      }
      return {
        icon: <ClockIcon className="text-amber-500" />,
        title: 'Verification Fee Required',
        description: `To begin verification, please complete the one-time fee of ${PRICING.VERIFICATION_FEE_DISPLAY}.`,
        cta: <ContactPaymentCTA amount={PRICING.VERIFICATION_FEE_DISPLAY} feeType="verification" />,
      };
    case 'verification_pending':
      return {
        icon: <ShieldIcon className="text-blue-500" />,
        title: 'Verification In Progress',
        description: 'Your payment has been received. Background verification typically takes 7-10 working days.',
        cta: null,
      };
    case 'in_pool':
      return {
        icon: <SearchIcon className="text-indigo-500" />,
        title: "You're in the Pool",
        description: 'Verification is complete. Our team is reviewing profiles to find your best match.',
        cta: null,
      };
    case 'match_presented':
      return {
        icon: <HeartIcon className="text-samvaya-red" />,
        title: 'You Have a Match!',
        description: "We've found someone who could be a great fit.",
        cta: <Link href="/app/matches" className="btn-primary inline-flex text-sm">View Your Match</Link>,
      };
    case 'awaiting_payment':
      return {
        icon: <SparklesIcon className="text-samvaya-red" />,
        title: 'Mutual Interest Confirmed!',
        description: `You both expressed interest! Service fee: ${PRICING.MEMBERSHIP_FEE_DISPLAY}.`,
        cta: <ContactPaymentCTA amount={PRICING.MEMBERSHIP_FEE_DISPLAY} feeType="membership" />,
      };
    case 'active_member':
      return {
        icon: <CheckCircleIcon className="text-emerald-500" />,
        title: 'Membership Active',
        description: membershipEndDate
          ? `Active until ${new Date(membershipEndDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.`
          : 'Your membership is currently active.',
        cta: <Link href="/app/matches" className="btn-secondary inline-flex text-sm">View Matches</Link>,
      };
    case 'membership_expired':
      return {
        icon: <ClockIcon className="text-gray-400" />,
        title: 'Membership Expired',
        description: 'Your 6-month window has ended. Contact us to renew.',
        cta: <ContactPaymentCTA amount="" feeType="renewal" />,
      };
    default:
      return {
        icon: <ClockIcon className="text-gray-400" />,
        title: 'Status Unknown',
        description: 'Please contact our team.',
        cta: null,
      };
  }
}

// ═══════════════════════════════════════════
// Journey Grid — 2-column warm card tiles
// ═══════════════════════════════════════════

function JourneyGrid({ data, paymentStatus }: { data: DashboardData; paymentStatus: string }) {
  const statusIdx = STATUS_ORDER.indexOf(paymentStatus);

  const milestones = [
    { label: 'Profile Submitted', date: data.createdAt, done: true, icon: '1' },
    { label: 'Payment Received', date: data.paidAt, done: !!data.paidAt, icon: '2' },
    { label: 'Verification Complete', date: data.verifiedAt, done: !!data.verifiedAt || statusIdx >= STATUS_ORDER.indexOf('in_pool'), icon: '3' },
    { label: 'Added to Pool', date: data.verifiedAt, done: statusIdx >= STATUS_ORDER.indexOf('in_pool'), icon: '4' },
  ];

  const activeIdx = milestones.findIndex(m => !m.done);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {milestones.map((m, i) => {
        const isActive = i === activeIdx;
        return (
          <div
            key={i}
            className={`card-warm px-4 py-4 ${isActive ? 'ring-1 ring-samvaya-red/20' : ''}`}
          >
            {/* Icon */}
            <div className="mb-3">
              {m.done ? (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 shadow-sm">
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
              ) : isActive ? (
                <div className="active-glow flex h-8 w-8 items-center justify-center rounded-full bg-samvaya-red shadow-sm">
                  <div className="h-2.5 w-2.5 rounded-full bg-white" />
                </div>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm">
                  <span className="text-xs font-medium text-gray-300">{m.icon}</span>
                </div>
              )}
            </div>
            {/* Label */}
            <p className={`text-sm font-medium ${m.done ? 'text-gray-900' : isActive ? 'text-gray-900' : 'text-gray-300'}`}>
              {m.label}
            </p>
            {/* Date or status */}
            {m.done && m.date ? (
              <p className="mt-0.5 text-xs text-gray-400">{formatDate(m.date)}</p>
            ) : isActive ? (
              <p className="mt-0.5 text-xs text-samvaya-red/60">In progress</p>
            ) : (
              <p className="mt-0.5 text-xs text-gray-300">Upcoming</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════
// Icons
// ═══════════════════════════════════════════

function PencilIcon() {
  return (
    <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  );
}

function HeartIconSmall() {
  return (
    <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={`h-5 w-5 ${className}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={`h-5 w-5 ${className}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={`h-5 w-5 ${className}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={`h-5 w-5 ${className}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={`h-5 w-5 ${className}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={`h-5 w-5 ${className}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  );
}
