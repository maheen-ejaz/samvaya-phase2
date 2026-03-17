'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUserStatus } from '@/lib/app/user-context';
import { SpiderWebChart } from './SpiderWebChart';
import { formatHeight, formatEnumValue } from '@/lib/utils';

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '';

interface ProfileData {
  profile: Record<string, unknown> | null;
  medicalCredentials: Record<string, unknown> | null;
  partnerPreferences: Record<string, unknown> | null;
  personalitySummary: string | null;
  spiderWebScores: Record<string, number> | null;
  photos: Array<{ id: string; url: string; isPrimary: boolean; type: string }>;
}

export function ProfileView() {
  const { firstName } = useUserStatus();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/app/profile');
        if (!res.ok) throw new Error('Failed to load profile');
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-samvaya-red" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700" role="alert">
        {error ?? 'Profile not found'}
      </div>
    );
  }

  const p = data.profile;
  const mc = data.medicalCredentials;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          {firstName ? `${firstName}'s Profile` : 'Your Profile'}
        </h2>
        <Link
          href="/app/profile/edit"
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          Edit Profile
        </Link>
      </div>

      {/* Photos */}
      {data.photos.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Photos</h3>
            <Link
              href="/app/profile/photos"
              className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Manage Photos
            </Link>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {data.photos.map((photo) => (
              <div
                key={photo.id}
                className="h-28 w-28 flex-shrink-0 overflow-hidden rounded-lg"
              >
                <img
                  src={photo.url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Personal Info */}
      <Section title="Personal Info">
        <InfoGrid
          items={[
            { label: 'Gender', value: formatEnumValue(p?.gender) },
            { label: 'Date of Birth', value: p?.date_of_birth ? new Date(p.date_of_birth as string).toLocaleDateString('en-IN') : null },
            { label: 'Height', value: formatHeight(p?.height_cm as number | null | undefined) },
            { label: 'Location', value: [p?.current_city, p?.current_state].filter(Boolean).join(', ') || null },
            { label: 'Hometown', value: [p?.hometown_city, p?.hometown_state].filter(Boolean).join(', ') || null },
            { label: 'Religion', value: formatEnumValue(p?.religion) },
            { label: 'Mother Tongue', value: formatEnumValue(p?.mother_tongue) },
          ]}
        />
      </Section>

      {/* Medical Credentials */}
      {mc && (
        <Section title="Medical Credentials">
          <InfoGrid
            items={[
              { label: 'Degree', value: formatEnumValue(mc.medical_degree) },
              { label: 'Specialty', value: formatEnumValue(mc.primary_specialty) },
              { label: 'Designation', value: formatEnumValue(mc.current_designation) },
              { label: 'Experience', value: mc.years_of_experience != null ? `${mc.years_of_experience} years` : null },
            ]}
          />
        </Section>
      )}

      {/* Personality Summary */}
      {data.personalitySummary && (
        <Section title="AI Personality Summary">
          <p className="text-sm leading-relaxed text-gray-600">
            {data.personalitySummary}
          </p>
        </Section>
      )}

      {/* Spider Web */}
      {data.spiderWebScores && (
        <Section title="Your Personality Profile">
          <SpiderWebChart myScores={data.spiderWebScores} theirScores={null} />
        </Section>
      )}

      {/* Lifestyle */}
      <Section title="Lifestyle">
        <InfoGrid
          items={[
            { label: 'Diet', value: formatEnumValue(p?.diet) },
            { label: 'Smoking', value: formatEnumValue(p?.smoking) },
            { label: 'Drinking', value: formatEnumValue(p?.drinking) },
            { label: 'Exercise', value: formatEnumValue(p?.exercise_frequency) },
            { label: 'Marriage Timeline', value: formatEnumValue(p?.marriage_timeline) },
            { label: 'Children', value: formatEnumValue(p?.children_preference) },
          ]}
        />
      </Section>

      <div className="rounded-lg bg-gray-50 p-4 text-center text-xs text-gray-500">
        You can <Link href="/app/profile/edit" className="font-medium text-samvaya-red underline">edit your location, lifestyle, and goals</Link> directly.
        {' '}For changes to name, date of birth, or medical credentials, contact our team via{' '}
        {WHATSAPP_NUMBER ? (
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi, I would like to update my Samvaya profile.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-green-600 hover:text-green-700 underline"
          >
            WhatsApp
          </a>
        ) : (
          <span>WhatsApp</span>
        )}.
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function InfoGrid({ items }: { items: Array<{ label: string; value: string | null }> }) {
  const filtered = items.filter((i) => i.value);
  if (filtered.length === 0) return <p className="text-xs text-gray-400">Not specified</p>;

  return (
    <div className="grid grid-cols-2 gap-3">
      {filtered.map((item) => (
        <div key={item.label}>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            {item.label}
          </p>
          <p className="mt-0.5 text-sm text-gray-700">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

