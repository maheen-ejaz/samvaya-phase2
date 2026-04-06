import { MatchingNav } from '@/components/admin/matching/MatchingNav';

export default function MatchingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="type-heading-xl text-gray-900">Matching</h1>
        <p className="mt-1 text-sm text-gray-500">AI-powered compatibility scoring and match management</p>
      </div>
      <MatchingNav />
      {children}
    </div>
  );
}
