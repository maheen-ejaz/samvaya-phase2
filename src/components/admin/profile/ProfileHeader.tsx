import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { BgvBadge } from '../StatusBadge';
import { ApplicantStatusIcons } from '../ApplicantStatusIcons';
import { capitalize } from '@/lib/utils';
import { ApplicantPipeline } from './ApplicantPipeline';
import { formatEnum } from './IdentitySnapshot';

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
  membershipStatus: string;
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
  membershipStatus,
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

  const statusLabel = formatEnum(medicalStatus) || '';
  const specialtyStr = specialty.length > 0 ? specialty.map((s) => capitalize(s)).join(', ') : '';

  return (
    <Card>
      <CardContent>
        {/* Top row: photo + info + pipeline */}
        <div className="flex gap-5">
          {/* Photo */}
          <Avatar className="h-24 w-24 rounded-2xl">
            {photoUrl ? (
              <AvatarImage src={photoUrl} alt={`${firstName} ${lastName}`} className="rounded-2xl" />
            ) : null}
            <AvatarFallback className="rounded-2xl text-3xl font-light">
              {firstName?.[0] || '?'}
            </AvatarFallback>
          </Avatar>

          {/* Name + details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-8">
              {/* Left: name block — fixed width so pipeline gets the rest */}
              <div className="w-56 flex-shrink-0">
                <h2 className="inline-flex items-center gap-1.5 text-xl font-semibold text-foreground">
                  {firstName} {lastName}
                  <ApplicantStatusIcons isGooCampusMember={isGooCampusMember} paymentStatus={paymentStatus} size={16} />
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {age ? `${age} yrs` : ''}
                  {age && gender ? ' · ' : ''}
                  {gender ? capitalize(gender) : ''}
                  {location ? ` · ${location}` : ''}
                </p>
                {(statusLabel || specialtyStr) && (
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {statusLabel}{statusLabel && specialtyStr ? ' — ' : ''}{specialtyStr}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span>{email}</span>
                  {phone && <span>{phone}</span>}
                </div>
              </div>

              {/* Right: pipeline fills all remaining space */}
              <div className="flex min-w-0 flex-1 flex-col justify-center gap-3 self-stretch">
                <ApplicantPipeline
                  paymentStatus={paymentStatus}
                  membershipStatus={membershipStatus}
                />
                {/* Indicator badges */}
                <div className="flex items-center gap-2">
                  <BgvBadge isComplete={isBgvComplete} isFlagged={bgvFlagged} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
