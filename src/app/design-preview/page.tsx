export default function DesignPreviewPage() {
  return (
    <div className="bg-page p-8 lg:p-12">
      <div className="mx-auto max-w-4xl space-y-10">
        {/* Header */}
        <div className="animate-fade-in-up">
          <h1 className="text-2xl font-bold text-gray-900">Design System Preview</h1>
          <p className="mt-1 text-sm text-gray-500">Phase 2F — Glass cards, buttons, badges, inputs</p>
        </div>

        {/* === CARDS === */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Glass Cards</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Stat Card */}
            <div className="card-glass card-glass-hover p-6">
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

            {/* Stat Card 2 */}
            <div className="card-glass card-glass-hover p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                  <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Verified Members</p>
                  <p className="text-2xl font-bold text-gray-900">89</p>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-400">36% conversion rate</p>
            </div>
          </div>

          {/* Profile Card */}
          <div className="card-glass card-glass-hover overflow-hidden md:max-w-sm">
            <div className="aspect-[4/3] bg-gradient-to-br from-rose-100 to-rose-200" />
            <div className="p-5">
              <h3 className="text-base font-semibold text-gray-900">Dr. Priya Sharma</h3>
              <p className="mt-0.5 text-sm text-gray-500">28 · Cardiologist · Mumbai</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="badge badge-success">Verified</span>
                <span className="badge badge-info">In Pool</span>
              </div>
            </div>
          </div>
        </section>

        {/* === BUTTONS === */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Buttons</h2>
          <div className="card-glass p-6">
            <div className="space-y-4">
              <div>
                <p className="mb-3 text-xs font-medium text-gray-500">Primary</p>
                <div className="flex flex-wrap gap-3">
                  <button className="btn-primary">Continue</button>
                  <button className="btn-primary">Accept Match</button>
                  <button className="btn-primary" disabled>Disabled</button>
                </div>
              </div>
              <div>
                <p className="mb-3 text-xs font-medium text-gray-500">Secondary (Glass)</p>
                <div className="flex flex-wrap gap-3">
                  <button className="btn-secondary">Skip for now</button>
                  <button className="btn-secondary">View Details</button>
                  <button className="btn-secondary" disabled>Disabled</button>
                </div>
              </div>
              <div>
                <p className="mb-3 text-xs font-medium text-gray-500">Ghost</p>
                <div className="flex flex-wrap gap-3">
                  <button className="btn-ghost">Cancel</button>
                  <button className="btn-ghost">Back</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* === BADGES === */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Badges</h2>
          <div className="card-glass p-6">
            <div className="flex flex-wrap gap-3">
              <span className="badge badge-success">Verified</span>
              <span className="badge badge-warning">Pending</span>
              <span className="badge badge-error">Declined</span>
              <span className="badge badge-info">In Pool</span>
              <span className="badge badge-neutral">Expired</span>
              <span className="badge badge-brand">GooCampus</span>
            </div>
          </div>
        </section>

        {/* === INPUTS === */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Inputs</h2>
          <div className="card-glass space-y-4 p-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">What is your full name?</label>
              <input type="text" placeholder="Enter your name" className="input-glass" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Email address</label>
              <input type="email" placeholder="you@example.com" className="input-glass" />
            </div>
          </div>
        </section>

        {/* === COMBINED EXAMPLE === */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Combined — Form Question</h2>
          <div className="card-glass space-y-5 p-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-rose-600">Section A · Question 1</p>
              <h3 className="mt-2 text-lg font-semibold text-gray-900">What is your full name?</h3>
              <p className="mt-1 text-sm text-gray-500">As it appears on your medical registration.</p>
            </div>
            <input type="text" placeholder="Dr. " className="input-glass" />
            <div className="flex justify-between pt-2">
              <button className="btn-ghost">← Previous</button>
              <button className="btn-primary">Next →</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
