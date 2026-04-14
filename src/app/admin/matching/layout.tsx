import { MatchingNav } from '@/components/admin/matching/MatchingNav';

export default function MatchingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Matching</h1>
        <p className="mt-1 text-sm text-muted-foreground">AI-powered compatibility scoring and match management</p>
      </div>
      <MatchingNav />
      {children}
    </div>
  );
}
