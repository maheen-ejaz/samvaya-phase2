'use client';

import Link from 'next/link';

interface MatchListItemProps {
  id: string;
  status: string;
  myResponse: string;
  score: number;
  expiresAt: string;
  isMutualInterest: boolean;
  otherProfile: {
    age: number | null;
    state: string | null;
    country: string | null;
    specialty: string | null;
    blurredPhotoUrl: string | null;
  };
}

export function MatchListItem({
  id,
  status,
  myResponse,
  score,
  expiresAt,
  isMutualInterest,
  otherProfile,
}: MatchListItemProps) {
  const daysRemaining = getDaysRemaining(expiresAt);
  const statusBadge = getStatusDisplay(status, myResponse, isMutualInterest);

  return (
    <Link
      href={`/app/matches/${id}`}
      className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md active:scale-[0.99]"
    >
      {/* Blurred photo thumbnail */}
      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
        {otherProfile.blurredPhotoUrl ? (
          <img
            src={otherProfile.blurredPhotoUrl}
            alt="Match photo"
            width={64}
            height={64}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg className="h-8 w-8 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        )}
      </div>

      {/* Profile info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-900 truncate">
            {otherProfile.age ? `${otherProfile.age} yrs` : 'Age N/A'}
            {otherProfile.state && `, ${otherProfile.state}`}
          </p>
          <span
            className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge.color}`}
          >
            {statusBadge.label}
          </span>
        </div>
        {otherProfile.specialty && (
          <p className="mt-0.5 text-xs text-gray-500 truncate">
            {otherProfile.specialty}
          </p>
        )}
        <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
          <span>{score}% Compatible</span>
          {status === 'pending' && myResponse === 'pending' && daysRemaining && (
            <span className={daysRemaining.urgent ? 'text-red-500' : ''}>
              {daysRemaining.text}
            </span>
          )}
        </div>
      </div>

      {/* Arrow */}
      <svg className="h-4 w-4 flex-shrink-0 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </Link>
  );
}

function getDaysRemaining(expiresAt: string): { text: string; urgent: boolean } | null {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return { text: 'Expired', urgent: true };
  const days = Math.ceil(diff / (24 * 60 * 60 * 1000));
  return {
    text: `${days}d left`,
    urgent: days <= 2,
  };
}

function getStatusDisplay(
  status: string,
  myResponse: string,
  isMutualInterest: boolean
): { label: string; color: string } {
  if (isMutualInterest) {
    return { label: 'Mutual Interest', color: 'bg-green-100 text-green-800' };
  }

  switch (status) {
    case 'pending':
      if (myResponse === 'pending') {
        return { label: 'Awaiting Response', color: 'bg-blue-100 text-blue-800' };
      }
      return { label: 'Responded', color: 'bg-gray-100 text-gray-600' };
    case 'one_sided':
      return { label: 'Not a Match', color: 'bg-gray-100 text-gray-600' };
    case 'declined':
      return { label: 'Declined', color: 'bg-gray-100 text-gray-600' };
    case 'expired':
      return { label: 'Expired', color: 'bg-yellow-100 text-yellow-800' };
    default:
      return { label: status, color: 'bg-gray-100 text-gray-600' };
  }
}
