'use client';

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-samvaya-blush px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-8 w-8 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>

        <h1 className="mb-2 type-heading text-gray-900">Something went wrong</h1>
        <p className="mb-6 text-sm text-gray-600">
          We hit an unexpected issue. Please try again or contact our support team if it persists.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="w-full rounded-lg bg-samvaya-red py-3 text-sm font-medium text-white hover:bg-samvaya-red-dark transition-colors"
          >
            Try again
          </button>
          <a
            href="/app"
            className="text-sm font-medium text-samvaya-red hover:text-samvaya-red-dark"
          >
            Go to home
          </a>
        </div>
      </div>
    </div>
  );
}
