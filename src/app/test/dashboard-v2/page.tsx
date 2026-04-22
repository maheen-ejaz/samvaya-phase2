'use client';

// ─── Dummy Data ───────────────────────────────────────────────
const DUMMY_USER = {
  name: 'Dr. Priya Sharma',
  specialty: 'Cardiologist',
  designation: 'Senior Consultant',
  location: 'Mumbai, Maharashtra',
};

const DUMMY_MATCH = {
  age: 28,
  specialty: 'Dermatologist',
  location: 'Bangalore, Karnataka',
  compatibility: 87,
  rationale:
    'Strong alignment in family values and career ambitions. Both value independence within partnership.',
  daysRemaining: 5,
  myScores: {
    family_orientation: 82,
    career_ambition: 90,
    independence_togetherness: 75,
    emotional_expressiveness: 68,
    social_orientation: 55,
    traditionalism: 60,
    relocation_openness: 70,
    life_pace: 85,
  },
  theirScores: {
    family_orientation: 78,
    career_ambition: 85,
    independence_togetherness: 80,
    emotional_expressiveness: 72,
    social_orientation: 65,
    traditionalism: 55,
    relocation_openness: 60,
    life_pace: 78,
  },
};

const MILESTONES = [
  { icon: 'profile' as const, label: 'Profile Submitted', desc: 'Your application has been received', date: '5 Mar 2026' },
  { icon: 'payment' as const, label: 'Payment Received', desc: 'Verification fee of ₹4,130 confirmed', date: '8 Mar 2026' },
  { icon: 'verification' as const, label: 'Background Verification', desc: '13-point verification complete', date: '15 Mar 2026' },
  { icon: 'pool' as const, label: 'Added to Pool', desc: "You're matched with verified doctors", date: '15 Mar 2026' },
  { icon: 'match' as const, label: 'Match Found', desc: 'We found someone compatible for you' },
  { icon: 'active' as const, label: 'Active Member', desc: 'Your journey together begins' },
];

const ACTIVE_STEP = 4;

// ─── Design Tokens ───────────────────────────────────────────
const t = {
  card: 'bg-white/60 backdrop-blur-xl border border-white/80 shadow-lg shadow-black/[0.04]',
  innerCard: 'bg-white/40 backdrop-blur-lg border border-white/50',
  heading: 'text-gray-900',
  subtext: 'text-gray-500',
  muted: 'text-gray-400',
  completedDot: 'bg-emerald-500/15 ring-2 ring-emerald-500/60',
  completedCheck: 'text-emerald-600',
  completedLine: 'bg-emerald-500/40',
  completedLabel: 'text-emerald-700',
  completedDesc: 'text-emerald-600/60',
  completedDate: 'text-emerald-600/50',
  currentDot: 'bg-samvaya-red/10 ring-2 ring-samvaya-red shadow-[0_0_20px_rgba(163,23,31,0.15)]',
  currentIcon: 'text-samvaya-red',
  currentLabel: 'text-gray-900',
  currentDesc: 'text-gray-500',
  currentBadgeBg: 'bg-samvaya-red/10',
  currentBadgeDot: 'bg-samvaya-red',
  currentBadgeText: 'text-samvaya-red/80',
  futureDot: 'bg-gray-100 ring-1 ring-gray-200',
  futureIcon: 'text-gray-300',
  futureLabel: 'text-gray-300',
  futureDesc: 'text-gray-300/60',
  matchBadge: 'bg-samvaya-red/10 text-samvaya-red',
  matchPhotoBg: 'bg-gradient-to-br from-gray-200 to-gray-300',
  ctaPrimary: 'bg-samvaya-red text-white hover:bg-samvaya-red-dark',
  ctaSecondary: 'border border-gray-300 text-gray-600 hover:bg-gray-50',
  pill: 'bg-white/60 backdrop-blur-lg border border-white/70 text-gray-600 hover:bg-white/80 hover:shadow-md shadow-sm shadow-black/[0.03]',
  footer: 'bg-white/30 backdrop-blur-lg border border-white/50',
  footerText: 'text-gray-400',
  chartRing: '#e5e7eb',
  chartAxis: '#d1d5db',
  chartLabel: 'fill-gray-400',
  legendText: 'text-gray-400',
  pulseRing: 'bg-samvaya-red/10',
};

// ─── Main Page ────────────────────────────────────────────────
export default function DashboardV2Page() {
  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #F0EEEB 0%, #E8E6E3 40%, #EDEBEA 70%, #F2F0ED 100%)',
      }}
    >
      {/* ── Ambient Glow Orbs ── */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-samvaya-red/[0.04] blur-[120px]" />
      <div className="pointer-events-none absolute right-0 top-1/4 h-[400px] w-[400px] rounded-full bg-blue-200/20 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-[350px] w-[350px] rounded-full bg-amber-100/25 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-[300px] w-[300px] rounded-full bg-rose-100/20 blur-[80px]" />

      {/* ── Content ── */}
      <div className="relative mx-auto max-w-7xl px-5 py-6 lg:px-10 lg:py-8">

        {/* ── Desktop Layout (≥1024px): Two Columns ── */}
        <div className="hidden lg:block">
          {/* Greeting — spans full width */}
          <div className="mb-8">
            <p className={`text-xs font-medium uppercase tracking-widest ${t.muted}`}>Welcome back</p>
            <h1 className={`mt-1 text-2xl font-bold ${t.heading}`}>{DUMMY_USER.name}</h1>
            <p className={`mt-0.5 text-sm ${t.subtext}`}>
              {DUMMY_USER.specialty} &middot; {DUMMY_USER.location}
            </p>
          </div>

          <div className="flex gap-8 items-start">
            {/* ── Left Column: Journey + Quick Actions ── */}
            <div className="w-[380px] flex-shrink-0 space-y-6">
              {/* Milestone Progress Tracker */}
              <div className={`rounded-2xl p-6 ${t.card}`}>
                <p className={`mb-5 text-xs font-semibold uppercase tracking-wider ${t.muted}`}>
                  Your Journey
                </p>
                <MilestoneTracker />
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3">
                {['Edit Profile', 'Photos', 'Settings'].map((label) => (
                  <button
                    key={label}
                    className={`flex-1 rounded-xl px-4 py-3 text-[13px] font-medium transition-all ${t.pill}`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Footer Note */}
              <div className={`rounded-xl p-4 ${t.footer}`}>
                <p className={`text-center text-[12px] leading-relaxed ${t.footerText}`}>
                  Your match is waiting for your response. Take your time — you have {DUMMY_MATCH.daysRemaining} days.
                </p>
              </div>
            </div>

            {/* ── Right Column: Match Card ── */}
            <div className="flex-1 min-w-0">
              <div className={`rounded-2xl p-6 ${t.card}`}>
                <MatchCardContent chartSize="large" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Mobile Layout (<1024px): Single Column ── */}
        <div className="lg:hidden">
          {/* Greeting */}
          <div className="mb-5">
            <p className={`text-xs font-medium uppercase tracking-widest ${t.muted}`}>Welcome back</p>
            <h2 className={`mt-1 text-xl font-bold ${t.heading}`}>{DUMMY_USER.name}</h2>
            <p className={`mt-0.5 text-sm ${t.subtext}`}>
              {DUMMY_USER.specialty} &middot; {DUMMY_USER.location}
            </p>
          </div>

          {/* Milestone Progress Tracker */}
          <div className={`rounded-2xl p-5 ${t.card}`}>
            <p className={`mb-4 text-xs font-semibold uppercase tracking-wider ${t.muted}`}>
              Your Journey
            </p>
            <MilestoneTracker />
          </div>

          {/* Match Card */}
          <div className={`mt-4 rounded-2xl p-5 ${t.card}`}>
            <MatchCardContent chartSize="small" />
          </div>

          {/* Quick Actions */}
          <div className="mt-4 flex gap-2">
            {['Edit Profile', 'Photos', 'Settings'].map((label) => (
              <button
                key={label}
                className={`flex-1 rounded-xl px-3 py-2.5 text-[12px] font-medium transition-all ${t.pill}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Footer Note */}
          <div className={`mt-4 rounded-xl p-3.5 ${t.footer}`}>
            <p className={`text-center text-[11px] leading-relaxed ${t.footerText}`}>
              Your match is waiting for your response. Take your time — you have {DUMMY_MATCH.daysRemaining} days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Milestone Tracker (shared) ──────────────────────────────
function MilestoneTracker() {
  return (
    <div className="relative">
      {MILESTONES.map((m, i) => {
        const isCompleted = i < ACTIVE_STEP;
        const isCurrent = i === ACTIVE_STEP;
        const isFuture = i > ACTIVE_STEP;

        return (
          <div key={i} className="flex gap-3.5">
            {/* Icon column */}
            <div className="flex flex-col items-center">
              <div className="relative">
                {isCurrent && (
                  <div className={`absolute -inset-1.5 animate-pulse rounded-full ${t.pulseRing}`} />
                )}
                <div
                  className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 ${
                    isCompleted ? t.completedDot : isCurrent ? t.currentDot : t.futureDot
                  }`}
                >
                  {isCompleted ? (
                    <svg className={`h-4 w-4 ${t.completedCheck}`} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    <MilestoneIcon type={m.icon} className={`h-4 w-4 ${isCurrent ? t.currentIcon : t.futureIcon}`} />
                  )}
                </div>
              </div>

              {i < MILESTONES.length - 1 && (
                <div className="my-0.5 flex-1">
                  <div
                    className={`h-full min-h-[24px] w-0.5 ${
                      isCompleted
                        ? t.completedLine
                        : isCurrent
                          ? 'bg-gradient-to-b from-samvaya-red/30 to-gray-200'
                          : ''
                    }`}
                    style={
                      isFuture
                        ? {
                            backgroundImage: 'repeating-linear-gradient(to bottom, rgba(209,213,219,0.5) 0px, rgba(209,213,219,0.5) 3px, transparent 3px, transparent 6px)',
                            backgroundColor: 'transparent',
                          }
                        : undefined
                    }
                  />
                </div>
              )}
            </div>

            {/* Text column */}
            <div className={`pb-5 pt-1.5 ${i === MILESTONES.length - 1 ? 'pb-0' : ''}`}>
              <p className={`text-[13px] font-semibold leading-tight ${isCompleted ? t.completedLabel : isCurrent ? t.currentLabel : t.futureLabel}`}>
                {m.label}
              </p>
              <p className={`mt-0.5 text-[11px] leading-snug ${isCompleted ? t.completedDesc : isCurrent ? t.currentDesc : t.futureDesc}`}>
                {m.desc}
              </p>
              {m.date && isCompleted && (
                <p className={`mt-0.5 text-[10px] ${t.completedDate}`}>{m.date}</p>
              )}
              {isCurrent && (
                <div className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 ${t.currentBadgeBg}`}>
                  <div className={`h-1.5 w-1.5 animate-pulse rounded-full ${t.currentBadgeDot}`} />
                  <span className={`text-[10px] font-medium ${t.currentBadgeText}`}>Awaiting your response</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Match Card Content (shared) ─────────────────────────────
function MatchCardContent({ chartSize }: { chartSize: 'small' | 'large' }) {
  const chartMaxW = chartSize === 'large' ? 'max-w-[280px]' : 'max-w-[200px]';

  return (
    <>
      {/* Match header */}
      <div className="mb-4 flex items-center justify-between">
        <p className={`text-xs font-semibold uppercase tracking-wider ${t.muted}`}>Your Match</p>
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${t.matchBadge}`}>
          {DUMMY_MATCH.compatibility}% Compatible
        </span>
      </div>

      {/* Photo + basic info */}
      <div className="flex gap-4">
        <div className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl ${t.matchPhotoBg} lg:h-28 lg:w-28`}>
          <div className="flex h-full w-full items-center justify-center">
            <svg className="h-10 w-10 text-gray-300 lg:h-14 lg:w-14" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </div>
        </div>

        <div className="flex-1 pt-1">
          <p className={`text-base font-bold lg:text-lg ${t.heading}`}>
            {DUMMY_MATCH.age} &middot; {DUMMY_MATCH.specialty}
          </p>
          <p className={`mt-0.5 text-sm ${t.subtext}`}>{DUMMY_MATCH.location}</p>
          <div className="mt-2 flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            <span className={`text-[11px] font-medium ${t.subtext}`}>
              {DUMMY_MATCH.daysRemaining} days to respond
            </span>
          </div>
        </div>
      </div>

      {/* Match rationale */}
      <div className={`mt-4 rounded-xl p-3 lg:p-4 ${t.innerCard}`}>
        <p className={`text-xs font-medium ${t.muted}`}>Why we think you&apos;re compatible</p>
        <p className={`mt-1 text-[13px] leading-relaxed lg:text-sm ${t.subtext}`}>
          {DUMMY_MATCH.rationale}
        </p>
      </div>

      {/* Spider Chart */}
      <div className="mt-4 flex justify-center lg:mt-6">
        <MiniSpiderChart
          myScores={DUMMY_MATCH.myScores}
          theirScores={DUMMY_MATCH.theirScores}
          maxWidth={chartMaxW}
        />
      </div>

      {/* Legend */}
      <div className={`mt-2 flex items-center justify-center gap-4 text-[11px] ${t.legendText}`}>
        <div className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
          You
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-rose-500" />
          Them
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-5 flex gap-3 lg:mt-6">
        <button className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition-all lg:py-3 ${t.ctaSecondary}`}>
          Not Interested
        </button>
        <button className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition-all lg:py-3 ${t.ctaPrimary}`}>
          Interested
        </button>
      </div>
    </>
  );
}

// ─── Mini Spider Web Chart ────────────────────────────────────
const AXES = [
  { key: 'family_orientation', label: 'Family' },
  { key: 'career_ambition', label: 'Career' },
  { key: 'independence_togetherness', label: 'Indep.' },
  { key: 'emotional_expressiveness', label: 'Emotion' },
  { key: 'social_orientation', label: 'Social' },
  { key: 'traditionalism', label: 'Trad.' },
  { key: 'relocation_openness', label: 'Reloc.' },
  { key: 'life_pace', label: 'Pace' },
];

const CHART_SIZE = 200;
const CHART_CENTER = CHART_SIZE / 2;
const CHART_RADIUS = 75;

function polarToCartesian(angle: number, value: number): [number, number] {
  const r = (value / 100) * CHART_RADIUS;
  return [CHART_CENTER + r * Math.cos(angle), CHART_CENTER + r * Math.sin(angle)];
}

function buildPolygon(scores: Record<string, number>): string {
  return AXES.map((axis, i) => {
    const angle = (Math.PI * 2 * i) / AXES.length - Math.PI / 2;
    const [x, y] = polarToCartesian(angle, scores[axis.key] ?? 50);
    return `${x},${y}`;
  }).join(' ');
}

function MiniSpiderChart({
  myScores,
  theirScores,
  maxWidth,
}: {
  myScores: Record<string, number>;
  theirScores: Record<string, number>;
  maxWidth: string;
}) {
  return (
    <svg viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`} className={`w-full ${maxWidth}`} aria-label="Compatibility chart">
      {[25, 50, 75, 100].map((ring) => (
        <circle key={ring} cx={CHART_CENTER} cy={CHART_CENTER} r={(ring / 100) * CHART_RADIUS} fill="none" stroke={t.chartRing} strokeWidth={0.5} />
      ))}

      {AXES.map((axis, i) => {
        const angle = (Math.PI * 2 * i) / AXES.length - Math.PI / 2;
        const [endX, endY] = polarToCartesian(angle, 100);
        const [labelX, labelY] = polarToCartesian(angle, 120);
        return (
          <g key={axis.key}>
            <line x1={CHART_CENTER} y1={CHART_CENTER} x2={endX} y2={endY} stroke={t.chartAxis} strokeWidth={0.5} />
            <text x={labelX} y={labelY} textAnchor="middle" dominantBaseline="middle" className={`text-[7px] ${t.chartLabel}`}>
              {axis.label}
            </text>
          </g>
        );
      })}

      <polygon points={buildPolygon(myScores)} fill="rgba(59, 130, 246, 0.15)" stroke="#3b82f6" strokeWidth={1.2} />
      <polygon points={buildPolygon(theirScores)} fill="rgba(244, 63, 94, 0.12)" stroke="#f43f5e" strokeWidth={1.2} />
    </svg>
  );
}

// ─── Milestone Icons ──────────────────────────────────────────
type MilestoneIconType = 'profile' | 'payment' | 'verification' | 'pool' | 'match' | 'active';

function MilestoneIcon({ type, className }: { type: MilestoneIconType; className?: string }) {
  const sw = 1.5;
  switch (type) {
    case 'profile':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={sw} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
        </svg>
      );
    case 'payment':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={sw} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 8.25H9m6 3H9m3 6-3-3h1.5a3 3 0 1 0 0-6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      );
    case 'verification':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={sw} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
        </svg>
      );
    case 'pool':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={sw} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
        </svg>
      );
    case 'match':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={sw} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
        </svg>
      );
    case 'active':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={sw} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
        </svg>
      );
  }
}
