import { SuggestionQueue } from '@/components/admin/matching/SuggestionQueue';

export default function MatchingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Matching</h1>
        <p className="mt-1 text-sm text-gray-500">
          AI-powered compatibility scoring and match management
        </p>
      </div>
      <SuggestionQueue />
    </div>
  );
}
