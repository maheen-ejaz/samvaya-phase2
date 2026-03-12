import { MatchHistory } from '@/components/admin/matching/MatchHistory';

export default function MatchHistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Match History</h1>
        <p className="mt-1 text-sm text-gray-500">
          All match suggestions — approved, rejected, and expired
        </p>
      </div>
      <MatchHistory />
    </div>
  );
}
