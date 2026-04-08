'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import type { Applicant } from '@/components/admin/ApplicantList';
import { ApplicantPipeline } from '@/components/admin/profile/ApplicantPipeline';
import { ApplicantActions } from '@/components/admin/ApplicantActions';
import { ApplicantStatusIcons } from '@/components/admin/ApplicantStatusIcons';
import { PaymentStatusBadge, GooCampusBadge, BgvBadge } from '@/components/admin/StatusBadge';
import { capitalize } from '@/lib/utils';
import { DrawerBgvTracker } from '@/components/admin/applicants/DrawerBgvTracker';

interface PartnerPrefs {
  ageMin: number | null;
  ageMax: number | null;
  states: string[];
  noLocationPreference: boolean;
  specialties: string[];
  prefersSpecificSpecialty: boolean;
  motherTongue: string[];
  familyType: string | null;
  partnerQualities: string[];
}

interface MatchStats {
  totalSuggestions: number;
  approvedSuggestions: number;
  totalPresented: number;
  mutualInterest: number;
  pendingResponse: number;
}

interface DocStats {
  totalDocs: number;
  verifiedDocs: number;
  pendingDocs: number;
  rejectedDocs: number;
}

interface ApplicantPreview {
  id: string;
  paymentStatus: string;
  membershipStatus: string;
  isBgvComplete: boolean;
  bgvFlagged: boolean;
  isGooCampusMember: boolean;
  createdAt: string | null;
  firstName: string | null;
  lastName: string | null;
  gender: string | null;
  age: number | null;
  city: string | null;
  state: string | null;
  religion: string | null;
  maritalStatus: string | null;
  heightCm: number | null;
  medicalStatus: string | null;
  specialty: string | null;
  designation: string | null;
  email: string | null;
  phone: string | null;
  photoUrl: string | null;
  personalitySummary: string | null;
  compatibilityKeywords: string[];
  partnerPrefs: PartnerPrefs | null;
  matchStats: MatchStats;
  docStats: DocStats;
  latestNote: { text: string; createdAt: string } | null;
}

interface ApplicantPreviewDrawerProps {
  userId: string;
  basicInfo: Applicant;
  onClose: () => void;
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-gray-100 ${className ?? ''}`} />;
}

function cmToFeetInches(cm: number): string {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet}′${inches}″`;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return new Date(iso).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

function SectionCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
      <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400">{label}</p>
      {children}
    </div>
  );
}

// ─── Journey milestones ───────────────────────────────────────────────────────

const PAYMENT_STATUS_ORDER = [
  'unverified',
  'verification_pending',
  'in_pool',
  'match_presented',
  'awaiting_payment',
  'active_member',
  'membership_expired',
] as const;

type MilestoneKey = (typeof PAYMENT_STATUS_ORDER)[number];

const MILESTONE_LABELS: Record<MilestoneKey, string> = {
  unverified: 'Signed up',
  verification_pending: 'Form submitted',
  in_pool: 'Verified & in pool',
  match_presented: 'Match presented',
  awaiting_payment: 'Membership fee requested',
  active_member: 'Active member',
  membership_expired: 'Membership expired',
};

function JourneyTimeline({
  preview,
  basicInfo,
}: {
  preview: ApplicantPreview | null;
  loading: boolean;
}) {
  const paymentStatus = preview?.paymentStatus ?? basicInfo.paymentStatus;
  const currentIdx = PAYMENT_STATUS_ORDER.indexOf(paymentStatus as MilestoneKey);
  const joinedDate = preview?.createdAt
    ? new Date(preview.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : null;

  return (
    <div className="px-5 py-5">
      <p className="mb-4 text-xs text-gray-400">Applicant journey milestones</p>
      <ol className="relative space-y-0">
        {PAYMENT_STATUS_ORDER.map((status, idx) => {
          const isPast = currentIdx > idx;
          const isCurrent = currentIdx === idx;
          const isFuture = currentIdx < idx;
          const isLast = idx === PAYMENT_STATUS_ORDER.length - 1;

          return (
            <li key={status} className="flex gap-3">
              {/* Timeline spine */}
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold transition-colors ${
                    isCurrent
                      ? 'border-admin-blue-500 bg-admin-blue-500 text-white'
                      : isPast
                      ? 'border-admin-blue-300 bg-admin-blue-50 text-admin-blue-600'
                      : 'border-gray-200 bg-white text-gray-300'
                  }`}
                >
                  {isPast ? (
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l3.5 3.5L13 5" />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </div>
                {!isLast && (
                  <div
                    className={`my-0.5 w-px flex-1 ${isPast || isCurrent ? 'bg-admin-blue-200' : 'bg-gray-100'}`}
                    style={{ minHeight: '20px' }}
                  />
                )}
              </div>

              {/* Label */}
              <div className={`pb-4 pt-0.5 ${isLast ? '' : ''}`}>
                <p
                  className={`text-sm leading-tight ${
                    isCurrent
                      ? 'font-semibold text-admin-blue-900'
                      : isPast
                      ? 'text-gray-600'
                      : 'text-gray-300'
                  }`}
                >
                  {MILESTONE_LABELS[status]}
                </p>
                {isCurrent && (
                  <p className="mt-0.5 text-[11px] text-admin-blue-600">Current stage</p>
                )}
                {status === 'unverified' && joinedDate && (
                  <p className="mt-0.5 text-[11px] text-gray-400">{joinedDate}</p>
                )}
                {isFuture && (
                  <p className="mt-0.5 text-[11px] text-gray-300">Upcoming</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// ─── Main drawer ──────────────────────────────────────────────────────────────

export function ApplicantPreviewDrawer({ userId, basicInfo, onClose }: ApplicantPreviewDrawerProps) {
  const [preview, setPreview] = useState<ApplicantPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'verification'>('overview');

  const fetchPreview = useCallback(async (id: string) => {
    setLoading(true);
    setError(false);
    setPreview(null);
    try {
      const res = await fetch(`/api/admin/applicants/${id}/preview`);
      if (!res.ok) throw new Error('Failed');
      const data: ApplicantPreview = await res.json();
      setPreview(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPreview(userId);
  }, [userId, fetchPreview]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Derived display values
  const name = preview
    ? `${preview.firstName ?? ''} ${preview.lastName ?? ''}`.trim() || basicInfo.firstName
    : `${basicInfo.firstName} ${basicInfo.lastName}`.trim();
  const email = preview?.email ?? basicInfo.email;
  const paymentStatus = preview?.paymentStatus ?? basicInfo.paymentStatus;
  const membershipStatus = preview?.membershipStatus ?? '';
  const specialty = preview?.specialty ?? basicInfo.specialty;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className="fixed right-0 top-0 z-50 flex h-full w-[35%] flex-col bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label={`Preview: ${name}`}
      >
        {/* Sticky header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-3.5">
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="Close preview"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          <Link
            href={`/admin/applicants/${userId}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-admin-blue-900 px-3.5 py-1.5 text-xs font-medium text-white transition-all hover:bg-admin-blue-800 hover:shadow-md"
          >
            View Full Profile
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M5 11L11 5M11 5H6M11 5V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {/* Hero — photo + identity */}
        <div className="flex shrink-0 gap-4 px-5 py-4">
          {loading ? (
            <Skeleton className="h-16 w-16 rounded-xl" />
          ) : preview?.photoUrl ? (
            <img src={preview.photoUrl} alt={name} className="h-16 w-16 rounded-xl object-cover shrink-0" />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-2xl font-light text-gray-400">
              {name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h2 className="inline-flex items-center gap-1.5 text-base font-semibold text-gray-900">
              <span className="truncate">{name}</span>
              <ApplicantStatusIcons isGooCampusMember={preview?.isGooCampusMember ?? basicInfo.isGooCampusMember} paymentStatus={paymentStatus} size={14} />
            </h2>
            {loading ? (
              <div className="mt-1 space-y-1">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            ) : (
              <>
                <p className="mt-0.5 text-xs text-gray-500">
                  {[
                    preview?.age ? `${preview.age} yrs` : null,
                    preview?.gender ? capitalize(preview.gender) : null,
                    preview?.heightCm ? cmToFeetInches(preview.heightCm) : null,
                  ].filter(Boolean).join(' · ')}
                </p>
                {(preview?.city || preview?.state) && (
                  <p className="text-xs text-gray-500">
                    {[preview.city, preview.state].filter(Boolean).join(', ')}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-400">{email}</p>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex shrink-0 border-b border-gray-100">
          {(['overview', 'timeline', 'verification'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-xs font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-admin-blue-500 text-admin-blue-900'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">

          {/* ── OVERVIEW TAB ─────────────────────────────────────────── */}
          {activeTab === 'overview' && (
            <div className="space-y-3 px-5 py-4 pb-8">

              {/* Pipeline stage */}
              <SectionCard label="Pipeline Stage">
                <ApplicantPipeline paymentStatus={paymentStatus} membershipStatus={membershipStatus} />
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  <PaymentStatusBadge status={paymentStatus} />
                  {loading ? (
                    <Skeleton className="h-5 w-16 rounded-full" />
                  ) : (
                    <>
                      <GooCampusBadge isMember={preview?.isGooCampusMember ?? basicInfo.isGooCampusMember} />
                      <BgvBadge
                        isComplete={preview?.isBgvComplete ?? false}
                        isFlagged={preview?.bgvFlagged ?? false}
                      />
                    </>
                  )}
                </div>
              </SectionCard>

              {/* Quick actions — only shown for unverified applicants */}
              {!loading && basicInfo.paymentStatus === 'unverified' && (
                <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                  <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Actions</p>
                  <ApplicantActions
                    userId={userId}
                    paymentStatus={basicInfo.paymentStatus}
                    bgvConsent={basicInfo.bgvConsent}
                    isGooCampusMember={basicInfo.isGooCampusMember}
                  />
                </div>
              )}

              {/* Medical */}
              <SectionCard label="Medical">
                {loading ? (
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                ) : (
                  <>
                    {specialty && <p className="text-sm font-medium text-gray-800">{capitalize(specialty)}</p>}
                    {preview?.medicalStatus && (
                      <p className="mt-0.5 text-xs text-gray-500">{capitalize(preview.medicalStatus.replace(/_/g, ' '))}</p>
                    )}
                    {preview?.designation && (
                      <p className="mt-0.5 text-xs text-gray-500">{preview.designation}</p>
                    )}
                    {preview?.phone && (
                      <p className="mt-1.5 text-xs text-gray-400">✆ {preview.phone}</p>
                    )}
                  </>
                )}
              </SectionCard>

              {/* Personal */}
              {!loading && preview && (preview.religion || preview.maritalStatus) && (
                <SectionCard label="Personal">
                  <div className="flex flex-wrap gap-x-5 gap-y-2">
                    {preview.religion && (
                      <div>
                        <p className="text-[10px] text-gray-400">Religion</p>
                        <p className="text-sm text-gray-700">{capitalize(preview.religion)}</p>
                      </div>
                    )}
                    {preview.maritalStatus && (
                      <div>
                        <p className="text-[10px] text-gray-400">Marital Status</p>
                        <p className="text-sm text-gray-700">{capitalize(preview.maritalStatus.replace(/_/g, ' '))}</p>
                      </div>
                    )}
                  </div>
                </SectionCard>
              )}

              {/* Match stats */}
              {!loading && preview && (
                <SectionCard label="Matches">
                  {preview.matchStats.totalSuggestions === 0 ? (
                    <p className="text-sm text-gray-400">No matches suggested yet</p>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">Suggestions reviewed</p>
                        <p className="text-sm font-medium text-gray-900">{preview.matchStats.approvedSuggestions} / {preview.matchStats.totalSuggestions}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">Presented to applicant</p>
                        <p className="text-sm font-medium text-gray-900">{preview.matchStats.totalPresented}</p>
                      </div>
                      {preview.matchStats.mutualInterest > 0 && (
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">Mutual interest</p>
                          <span className="inline-flex items-center gap-1 rounded-full bg-admin-blue-50 px-2 py-0.5 text-xs font-medium text-admin-blue-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-admin-blue-500" />
                            {preview.matchStats.mutualInterest}
                          </span>
                        </div>
                      )}
                      {preview.matchStats.pendingResponse > 0 && (
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">Awaiting response</p>
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                            {preview.matchStats.pendingResponse}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </SectionCard>
              )}

              {/* Documents */}
              {!loading && preview && (
                <SectionCard label="Documents">
                  {preview.docStats.totalDocs === 0 ? (
                    <p className="text-sm text-gray-400">No documents uploaded</p>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">Verified</p>
                        <p className="text-sm font-medium text-gray-900">
                          {preview.docStats.verifiedDocs} / {preview.docStats.totalDocs}
                        </p>
                      </div>
                      {preview.docStats.pendingDocs > 0 && (
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">Pending review</p>
                          <span className="text-xs text-amber-600">{preview.docStats.pendingDocs}</span>
                        </div>
                      )}
                      {preview.docStats.rejectedDocs > 0 && (
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">Rejected</p>
                          <span className="text-xs text-red-600">{preview.docStats.rejectedDocs}</span>
                        </div>
                      )}
                    </div>
                  )}
                </SectionCard>
              )}

              {/* Partner preferences */}
              {!loading && preview?.partnerPrefs && (
                <SectionCard label="Partner Preferences">
                  <div className="space-y-1.5">
                    {(preview.partnerPrefs.ageMin || preview.partnerPrefs.ageMax) && (
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">Age range</p>
                        <p className="text-sm text-gray-800">
                          {preview.partnerPrefs.ageMin ?? '—'} – {preview.partnerPrefs.ageMax ?? '—'} yrs
                        </p>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="text-sm text-gray-800">
                        {preview.partnerPrefs.noLocationPreference
                          ? 'Any location'
                          : preview.partnerPrefs.states.length > 0
                          ? preview.partnerPrefs.states.slice(0, 2).map(capitalize).join(', ') + (preview.partnerPrefs.states.length > 2 ? ` +${preview.partnerPrefs.states.length - 2}` : '')
                          : '—'}
                      </p>
                    </div>
                    {preview.partnerPrefs.motherTongue.length > 0 && (
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">Language</p>
                        <p className="text-sm text-gray-800">
                          {preview.partnerPrefs.motherTongue.slice(0, 2).map(capitalize).join(', ')}
                          {preview.partnerPrefs.motherTongue.length > 2 ? ` +${preview.partnerPrefs.motherTongue.length - 2}` : ''}
                        </p>
                      </div>
                    )}
                    {preview.partnerPrefs.familyType && (
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">Family type</p>
                        <p className="text-sm text-gray-800">{capitalize(preview.partnerPrefs.familyType.replace(/_/g, ' '))}</p>
                      </div>
                    )}
                    {preview.partnerPrefs.partnerQualities.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {preview.partnerPrefs.partnerQualities.slice(0, 4).map((q) => (
                          <span key={q} className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[10px] text-gray-600">
                            {capitalize(q.replace(/_/g, ' '))}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </SectionCard>
              )}

              {/* Team notes */}
              {!loading && preview?.latestNote && (
                <SectionCard label="Latest Team Note">
                  <p className="text-sm leading-relaxed text-gray-700">&ldquo;{preview.latestNote.text}&rdquo;</p>
                  <p className="mt-1.5 text-[11px] text-gray-400">{timeAgo(preview.latestNote.createdAt)}</p>
                </SectionCard>
              )}

              {/* AI personality summary */}
              {!loading && preview?.personalitySummary && (
                <div className="rounded-xl border border-admin-blue-200 bg-admin-blue-50 p-4">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-admin-blue-800">
                    AI Personality Summary
                  </p>
                  <p className="text-sm leading-relaxed text-gray-700">{preview.personalitySummary}</p>
                  {preview.compatibilityKeywords.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {preview.compatibilityKeywords.map((kw) => (
                        <span
                          key={kw}
                          className="rounded-full border border-admin-blue-200 bg-white px-2.5 py-0.5 text-[11px] font-medium text-admin-blue-800"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {loading && (
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                  <Skeleton className="h-3 w-3/5" />
                </div>
              )}

              {error && (
                <p className="text-center text-sm text-gray-400">
                  Could not load details.{' '}
                  <Link href={`/admin/applicants/${userId}`} className="text-rose-500 underline">
                    Open full profile
                  </Link>
                </p>
              )}
            </div>
          )}

          {/* ── TIMELINE TAB ─────────────────────────────────────────── */}
          {activeTab === 'timeline' && (
            <JourneyTimeline preview={preview} loading={loading} basicInfo={basicInfo} />
          )}

          {/* ── VERIFICATION TAB ─────────────────────────────────────── */}
          {activeTab === 'verification' && (
            <DrawerBgvTracker userId={userId} />
          )}
        </div>
      </div>
    </>
  );
}
