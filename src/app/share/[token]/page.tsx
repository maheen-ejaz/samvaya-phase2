import type { Metadata } from 'next';
import { fetchMatchShareData } from '@/lib/share/match-data';
import { MatchShareView, MatchExpiredView } from '@/components/share/MatchShareView';

export const metadata: Metadata = {
  title: 'Match Preview · Samvaya',
  robots: { index: false, follow: false },
};

// No caching — is_full_revealed must be read live on every request
export const dynamic = 'force-dynamic';

export default async function ShareMatchPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const data = await fetchMatchShareData(token);

  if (!data) {
    return <MatchExpiredView />;
  }

  return <MatchShareView data={data} />;
}
