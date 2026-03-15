import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-samvaya-blush px-4">
      <div className="w-full max-w-md text-center">
        <p className="mb-2 text-6xl font-bold text-samvaya-red">404</p>
        <h1 className="mb-2 text-xl font-bold text-gray-900">Page not found</h1>
        <p className="mb-6 text-sm text-gray-600">
          The page you&rsquo;re looking for doesn&rsquo;t exist or has been moved.
        </p>

        <Link
          href="/app"
          className="inline-block rounded-lg bg-samvaya-red px-6 py-3 text-sm font-medium text-white hover:bg-samvaya-red-dark transition-colors"
        >
          Go to home
        </Link>
      </div>
    </div>
  );
}
