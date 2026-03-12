import { IntroductionManager } from '@/components/admin/matching/IntroductionManager';

export default function IntroductionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Introductions</h1>
        <p className="mt-1 text-sm text-gray-500">
          Schedule and track video introductions between matched applicants
        </p>
      </div>
      <IntroductionManager />
    </div>
  );
}
