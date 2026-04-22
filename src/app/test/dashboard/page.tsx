'use client';

import { useState } from 'react';

// --- Dummy data ---
const DUMMY = {
  name: 'Dr. Priya Sharma',
  specialty: 'Cardiologist',
  location: 'Mumbai, Maharashtra',
  profileSubmitted: '5 Mar 2026',
  paymentReceived: '8 Mar 2026',
};

interface Milestone {
  icon: MilestoneIconType;
  label: string;
  description: string;
  date?: string;
}

const MILESTONES: Milestone[] = [
  {
    icon: 'profile',
    label: 'Profile Submitted',
    description: 'Your application has been received',
    date: DUMMY.profileSubmitted,
  },
  {
    icon: 'payment',
    label: 'Payment Received',
    description: 'Verification fee of \u20B94,130 confirmed',
    date: DUMMY.paymentReceived,
  },
  {
    icon: 'verification',
    label: 'Background Verification',
    description: '13-point verification in progress',
  },
  {
    icon: 'pool',
    label: 'Added to Pool',
    description: "You'll be matched with verified doctors",
  },
  {
    icon: 'match',
    label: 'Match Found',
    description: 'We found someone compatible for you',
  },
  {
    icon: 'active',
    label: 'Active Member',
    description: 'Your journey together begins',
  },
];

export default function DashboardTestPage() {
  const [activeStep, setActiveStep] = useState(2); // 0-indexed, step 3 = index 2

  return (
    <div className="bg-samvaya-gradient relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      {/* Ambient glow effects */}
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-white/3 blur-3xl" />

      {/* Glass card */}
      <div className="relative w-full max-w-md rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-2xl">
        {/* Subtle inner glow */}
        <div className="pointer-events-none absolute inset-0 rounded-3xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),inset_0_0_40px_0_rgba(255,255,255,0.05)]" />

        {/* Content */}
        <div className="relative">
          {/* Header */}
          <div className="mb-8">
            <p className="text-sm font-medium text-white/50">Welcome back</p>
            <h1 className="mt-1 text-2xl font-bold text-white">{DUMMY.name}</h1>
            <p className="mt-1 text-sm text-white/70">
              {DUMMY.specialty} &middot; {DUMMY.location}
            </p>
          </div>

          {/* Step selector (demo only) */}
          <div className="mb-6 flex items-center gap-2">
            <span className="text-xs text-white/40">Demo step:</span>
            {MILESTONES.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveStep(i)}
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium transition-all ${
                  i === activeStep
                    ? 'bg-white text-samvaya-red'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {/* Vertical milestone stepper */}
          <div className="relative">
            {MILESTONES.map((milestone, i) => {
              const isCompleted = i < activeStep;
              const isCurrent = i === activeStep;
              const isFuture = i > activeStep;

              return (
                <div key={i} className="flex gap-4">
                  {/* Icon column */}
                  <div className="flex flex-col items-center">
                    {/* Icon circle */}
                    <div className="relative">
                      {/* Pulse ring for current step */}
                      {isCurrent && (
                        <div className="absolute -inset-1.5 animate-pulse rounded-full bg-white/20" />
                      )}
                      <div
                        className={`relative flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300 ${
                          isCompleted
                            ? 'bg-emerald-500/20 ring-2 ring-emerald-400/60'
                            : isCurrent
                              ? 'bg-white/20 ring-2 ring-white/80 shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                              : 'bg-white/5 ring-1 ring-white/15'
                        }`}
                      >
                        {isCompleted ? (
                          <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        ) : (
                          <MilestoneIcon
                            type={milestone.icon}
                            className={`h-5 w-5 ${isCurrent ? 'text-white' : 'text-white/30'}`}
                          />
                        )}
                      </div>
                    </div>

                    {/* Connecting line */}
                    {i < MILESTONES.length - 1 && (
                      <div className="my-1 flex-1">
                        <div
                          className={`h-full min-h-[32px] w-0.5 ${
                            isCompleted
                              ? 'bg-emerald-400/50'
                              : isCurrent
                                ? 'bg-gradient-to-b from-white/40 to-white/10'
                                : 'bg-white/10'
                          }`}
                          style={
                            isFuture
                              ? {
                                  backgroundImage:
                                    'repeating-linear-gradient(to bottom, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 4px, transparent 4px, transparent 8px)',
                                  backgroundColor: 'transparent',
                                }
                              : undefined
                          }
                        />
                      </div>
                    )}
                  </div>

                  {/* Text column */}
                  <div className={`pb-8 pt-2 ${i === MILESTONES.length - 1 ? 'pb-0' : ''}`}>
                    <p
                      className={`text-sm font-semibold leading-tight ${
                        isCompleted
                          ? 'text-emerald-300'
                          : isCurrent
                            ? 'text-white'
                            : 'text-white/30'
                      }`}
                    >
                      {milestone.label}
                    </p>
                    <p
                      className={`mt-1 text-xs leading-snug ${
                        isCompleted
                          ? 'text-emerald-300/60'
                          : isCurrent
                            ? 'text-white/60'
                            : 'text-white/20'
                      }`}
                    >
                      {milestone.description}
                    </p>
                    {milestone.date && isCompleted && (
                      <p className="mt-1 text-xs text-emerald-400/50">{milestone.date}</p>
                    )}
                    {isCurrent && (
                      <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1">
                        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                        <span className="text-xs font-medium text-white/80">In progress</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom info */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs leading-relaxed text-white/50">
              Your background verification typically takes 7–10 working days. We&apos;ll
              notify you by email once it&apos;s complete and you&apos;re added to the pool.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Milestone Icons ---

type MilestoneIconType = 'profile' | 'payment' | 'verification' | 'pool' | 'match' | 'active';

function MilestoneIcon({ type, className }: { type: MilestoneIconType; className?: string }) {
  switch (type) {
    case 'profile':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
        </svg>
      );
    case 'payment':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 8.25H9m6 3H9m3 6-3-3h1.5a3 3 0 1 0 0-6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      );
    case 'verification':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
        </svg>
      );
    case 'pool':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
        </svg>
      );
    case 'match':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
        </svg>
      );
    case 'active':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
        </svg>
      );
  }
}
