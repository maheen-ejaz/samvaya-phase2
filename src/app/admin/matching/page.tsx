import { Suspense } from 'react';
import { SuggestionQueue } from '@/components/admin/matching/SuggestionQueue';

export default function MatchingPage() {
  return (
    <Suspense>
      <SuggestionQueue />
    </Suspense>
  );
}
