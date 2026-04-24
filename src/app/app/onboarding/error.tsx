'use client';

import { useEffect, useState } from 'react';

// Survives re-mounts within the same page session so we don't loop forever.
let didAutoRetry = false;

export default function OnboardingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // First mount → attempt a silent retry; only show the error UI if it fails again.
  const [showError, setShowError] = useState(didAutoRetry);

  useEffect(() => {
    if (didAutoRetry) {
      setShowError(true);
      return;
    }
    didAutoRetry = true;
    const timer = setTimeout(() => {
      reset();
      // If reset() fails, this component re-mounts with didAutoRetry=true → showError=true.
      // If reset() succeeds, this component unmounts entirely — no further action needed.
      // Give the reset a moment; if we're still mounted after 2 s, show the error UI.
      setTimeout(() => setShowError(true), 2000);
    }, 600);
    return () => clearTimeout(timer);
  }, [reset]);

  if (!showError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3">
          <svg className="h-6 w-6 animate-spin text-rose-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-gray-500">Reconnecting…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
          <svg className="h-7 w-7 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
        </div>
        <h2 className="mb-2 text-lg font-semibold text-gray-900">Something went wrong</h2>
        <p className="mb-6 text-sm text-gray-600">
          We had trouble loading your form. Your progress has been saved — please try again.
        </p>
        <button
          onClick={() => { didAutoRetry = false; reset(); }}
          className="rounded-lg bg-rose-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
        >
          Try again
        </button>
        {error.digest && (
          <p className="mt-4 text-xs text-gray-400">Error ID: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
