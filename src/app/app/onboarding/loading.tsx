export default function OnboardingLoading() {
  return (
    <div className="mx-auto max-w-lg animate-pulse">
      {/* Progress bar skeleton */}
      <div className="mb-6">
        <div className="mb-2 flex justify-between">
          <div className="h-4 w-32 rounded bg-gray-200" />
          <div className="h-4 w-8 rounded bg-gray-200" />
        </div>
        <div className="h-1.5 w-full rounded-full bg-gray-200" />
      </div>

      {/* Question skeleton */}
      <div className="space-y-4">
        <div className="h-6 w-3/4 rounded bg-gray-200" />
        <div className="h-12 w-full rounded-lg bg-gray-200" />
      </div>

      {/* Navigation skeleton */}
      <div className="mt-8 flex justify-between">
        <div className="h-10 w-20 rounded-lg bg-gray-200" />
        <div className="h-10 w-24 rounded-lg bg-gray-200" />
      </div>
    </div>
  );
}
