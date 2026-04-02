import { PaymentStatusBadge, GooCampusBadge, BgvBadge } from '../StatusBadge';
import { capitalize } from '@/lib/utils';

interface ProfileHeaderProps {
  firstName: string;
  lastName: string;
  age: number | null;
  gender: string | null;
  currentCity: string | null;
  currentState: string | null;
  currentCountry: string | null;
  medicalStatus: string | null;
  specialty: string[];
  paymentStatus: string;
  isGooCampusMember: boolean;
  isBgvComplete: boolean;
  bgvFlagged: boolean;
  photoUrl: string | null;
  email: string;
  phone: string;
}

export function ProfileHeader({
  firstName,
  lastName,
  age,
  gender,
  currentCity,
  currentState,
  currentCountry,
  medicalStatus,
  specialty,
  paymentStatus,
  isGooCampusMember,
  isBgvComplete,
  bgvFlagged,
  photoUrl,
  email,
  phone,
}: ProfileHeaderProps) {
  const location = [currentCity, currentState, currentCountry]
    .filter(Boolean)
    .map((v) => capitalize(v!))
    .join(', ');

  const statusLabel = medicalStatus?.replace(/_/g, ' ') || '';
  const specialtyStr = specialty.length > 0 ? specialty.map((s) => capitalize(s)).join(', ') : '';

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex gap-6">
        {/* Photo */}
        <div className="h-28 w-28 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt={`${firstName} ${lastName}`} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl text-gray-300">
              {firstName?.[0] || '?'}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {firstName} {lastName}
              </h2>
              <p className="mt-0.5 text-sm text-gray-500">
                {age ? `${age} years` : ''}{age && gender ? ', ' : ''}{gender ? capitalize(gender) : ''}
                {location ? ` — ${location}` : ''}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <PaymentStatusBadge status={paymentStatus} />
              <GooCampusBadge isMember={isGooCampusMember} />
              <BgvBadge isComplete={isBgvComplete} isFlagged={bgvFlagged} />
            </div>
          </div>

          {/* Medical */}
          {(statusLabel || specialtyStr) && (
            <p className="mt-2 text-sm text-gray-700">
              {statusLabel}{statusLabel && specialtyStr ? ' — ' : ''}{specialtyStr}
            </p>
          )}

          {/* Contact */}
          <div className="mt-3 flex gap-4 text-xs text-gray-500">
            <span>{email}</span>
            {phone && <span>{phone}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
