export default function DesignSystemPage() {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* === OPTION A: Warm Rose Gradient === */}
      <div
        className="flex-1 p-8 lg:p-12"
        style={{
          background: 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 30%, #FFF5F5 60%, #F5F5F4 100%)',
        }}
      >
        <h2 className="mb-2 text-lg font-bold text-gray-900">Option A: Warm Rose Gradient</h2>
        <p className="mb-8 text-sm text-gray-500">Rose-tinted warmth bleeding through the frost</p>

        <div className="space-y-6">
          {/* Stat Card */}
          <div className="rounded-xl border border-white/60 bg-white/75 p-6 shadow-sm backdrop-blur-xl" style={{ WebkitBackdropFilter: 'blur(24px) saturate(1.5)', backdropFilter: 'blur(24px) saturate(1.5)' }}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100">
                <svg className="h-5 w-5 text-rose-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Total Applicants</p>
                <p className="text-2xl font-bold text-gray-900">247</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-400">+12 this week</p>
          </div>

          {/* Profile Card */}
          <div className="overflow-hidden rounded-xl border border-white/60 bg-white/75 shadow-sm backdrop-blur-xl" style={{ WebkitBackdropFilter: 'blur(24px) saturate(1.5)', backdropFilter: 'blur(24px) saturate(1.5)' }}>
            <div className="aspect-[4/3] bg-gradient-to-br from-rose-100 to-rose-200" />
            <div className="p-5">
              <h3 className="text-base font-semibold text-gray-900">Dr. Priya Sharma</h3>
              <p className="mt-0.5 text-sm text-gray-500">28 &middot; Cardiologist &middot; Mumbai</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-emerald-200/50 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">Verified</span>
                <span className="inline-flex items-center rounded-full border border-blue-200/50 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">In Pool</span>
              </div>
            </div>
          </div>

          {/* Form Input Card */}
          <div className="rounded-xl border border-white/60 bg-white/75 p-6 shadow-sm backdrop-blur-xl" style={{ WebkitBackdropFilter: 'blur(24px) saturate(1.5)', backdropFilter: 'blur(24px) saturate(1.5)' }}>
            <label className="mb-2 block text-sm font-medium text-gray-700">What is your full name?</label>
            <input
              type="text"
              placeholder="Enter your name"
              className="w-full rounded-xl border border-gray-200/60 bg-white/80 px-4 py-3 text-sm text-gray-900 backdrop-blur-sm transition-all duration-200 focus:border-rose-300/50 focus:shadow-[0_0_0_3px_rgba(163,23,31,0.1)] focus:bg-white focus:outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-3">
            <button className="rounded-xl bg-[#A3171F] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(163,23,31,0.3)]">
              Continue
            </button>
            <button className="rounded-xl border border-white/80 bg-white/60 px-6 py-3 text-sm font-medium text-gray-700 backdrop-blur-sm transition-all duration-200 hover:bg-white/80 hover:shadow-sm">
              Skip for now
            </button>
            <button className="rounded-xl bg-transparent px-6 py-3 text-sm font-medium text-gray-600 transition-all duration-200 hover:bg-gray-100/50 hover:text-gray-800">
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* === Divider === */}
      <div className="hidden w-px bg-gray-200 lg:block" />
      <div className="h-px bg-gray-200 lg:hidden" />

      {/* === OPTION B: Neutral with Rose Accent Spots === */}
      <div
        className="relative flex-1 overflow-hidden p-8 lg:p-12"
        style={{
          background: `
            radial-gradient(circle at 20% 20%, rgba(255,228,230,0.5) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255,241,242,0.4) 0%, transparent 50%),
            radial-gradient(circle at 60% 40%, rgba(255,228,230,0.2) 0%, transparent 40%),
            #FAFAF9
          `,
        }}
      >
        <h2 className="mb-2 text-lg font-bold text-gray-900">Option B: Neutral + Rose Accent Spots</h2>
        <p className="mb-8 text-sm text-gray-500">Mostly neutral, rose glows in corners — Apple-restrained</p>

        <div className="space-y-6">
          {/* Stat Card */}
          <div className="rounded-xl border border-white/60 bg-white/75 p-6 shadow-sm backdrop-blur-xl" style={{ WebkitBackdropFilter: 'blur(24px) saturate(1.5)', backdropFilter: 'blur(24px) saturate(1.5)' }}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100">
                <svg className="h-5 w-5 text-rose-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Total Applicants</p>
                <p className="text-2xl font-bold text-gray-900">247</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-400">+12 this week</p>
          </div>

          {/* Profile Card */}
          <div className="overflow-hidden rounded-xl border border-white/60 bg-white/75 shadow-sm backdrop-blur-xl" style={{ WebkitBackdropFilter: 'blur(24px) saturate(1.5)', backdropFilter: 'blur(24px) saturate(1.5)' }}>
            <div className="aspect-[4/3] bg-gradient-to-br from-rose-100 to-rose-200" />
            <div className="p-5">
              <h3 className="text-base font-semibold text-gray-900">Dr. Priya Sharma</h3>
              <p className="mt-0.5 text-sm text-gray-500">28 &middot; Cardiologist &middot; Mumbai</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-emerald-200/50 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">Verified</span>
                <span className="inline-flex items-center rounded-full border border-blue-200/50 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">In Pool</span>
              </div>
            </div>
          </div>

          {/* Form Input Card */}
          <div className="rounded-xl border border-white/60 bg-white/75 p-6 shadow-sm backdrop-blur-xl" style={{ WebkitBackdropFilter: 'blur(24px) saturate(1.5)', backdropFilter: 'blur(24px) saturate(1.5)' }}>
            <label className="mb-2 block text-sm font-medium text-gray-700">What is your full name?</label>
            <input
              type="text"
              placeholder="Enter your name"
              className="w-full rounded-xl border border-gray-200/60 bg-white/80 px-4 py-3 text-sm text-gray-900 backdrop-blur-sm transition-all duration-200 focus:border-rose-300/50 focus:shadow-[0_0_0_3px_rgba(163,23,31,0.1)] focus:bg-white focus:outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-3">
            <button className="rounded-xl bg-[#A3171F] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(163,23,31,0.3)]">
              Continue
            </button>
            <button className="rounded-xl border border-white/80 bg-white/60 px-6 py-3 text-sm font-medium text-gray-700 backdrop-blur-sm transition-all duration-200 hover:bg-white/80 hover:shadow-sm">
              Skip for now
            </button>
            <button className="rounded-xl bg-transparent px-6 py-3 text-sm font-medium text-gray-600 transition-all duration-200 hover:bg-gray-100/50 hover:text-gray-800">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
