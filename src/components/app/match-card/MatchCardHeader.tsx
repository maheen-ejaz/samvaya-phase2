'use client';

import { formatHeightShort } from '@/lib/utils';

interface MatchCardHeaderProps {
  profile: {
    age: number | null;
    gender: string | null;
    heightCm: number | null;
    city: string | null;
    state: string | null;
    country: string | null;
    religion: string | null;
    medicalDegree: string | null;
    specialty: string | null;
    designation: string | null;
    yearsOfExperience: number | null;
    photos: string[];
  };
  canSeeOriginal: boolean;
}

export function MatchCardHeader({ profile, canSeeOriginal }: MatchCardHeaderProps) {
  const primaryPhoto = profile.photos[0];
  const location = [profile.city, profile.state, profile.country]
    .filter(Boolean)
    .join(', ');
  const height = formatHeightShort(profile.heightCm);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      {/* Photo */}
      <div className="relative aspect-[4/3] bg-gray-100">
        {primaryPhoto ? (
          <img
            src={primaryPhoto}
            alt="Match profile photo"
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg className="h-16 w-16 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        )}
        {!canSeeOriginal && primaryPhoto && (
          <div className="absolute bottom-2 left-2 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white">
            Photo will be revealed after mutual interest
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-baseline gap-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {profile.age
              ? `${profile.age} years`
              : profile.specialty || profile.medicalDegree || 'Age not specified'}
          </h3>
          {height && (
            <span className="text-sm text-gray-500">{height}</span>
          )}
        </div>

        {location && (
          <p className="mt-1 text-sm text-gray-600">{location}</p>
        )}

        <div className="mt-3 space-y-1">
          {profile.designation && (
            <p className="text-sm text-gray-700">{profile.designation}</p>
          )}
          {profile.specialty && (
            <p className="text-sm text-gray-500">{profile.specialty}</p>
          )}
          {profile.medicalDegree && (
            <p className="text-xs text-gray-400">{profile.medicalDegree}</p>
          )}
          {profile.yearsOfExperience != null && (
            <p className="text-xs text-gray-400">
              {profile.yearsOfExperience} years of experience
            </p>
          )}
        </div>

        {profile.religion && (
          <p className="mt-2 text-xs text-gray-400">{profile.religion}</p>
        )}
      </div>
    </div>
  );
}
