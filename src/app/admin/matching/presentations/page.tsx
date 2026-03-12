import { PresentationTracker } from '@/components/admin/matching/PresentationTracker';

export default function PresentationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Match Presentations</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track presented matches and record applicant responses
        </p>
      </div>
      <PresentationTracker />
    </div>
  );
}
