'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatEnumValue } from '@/lib/utils';

interface ProfileData {
  profile: Record<string, unknown> | null;
  partnerPreferences: Record<string, unknown> | null;
}

const DIET_OPTIONS = ['vegetarian', 'non_vegetarian', 'eggetarian', 'vegan', 'jain', 'no_preference'];
const SMOKING_OPTIONS = ['never', 'occasionally', 'regularly', 'trying_to_quit'];
const DRINKING_OPTIONS = ['never', 'socially', 'regularly', 'trying_to_quit'];
const EXERCISE_OPTIONS = ['daily', 'several_times_a_week', 'occasionally', 'rarely', 'never'];
const MARRIAGE_TIMELINE_OPTIONS = ['within_6_months', 'within_1_year', 'within_2_years', 'flexible', 'not_sure'];
const CHILDREN_OPTIONS = ['want_children', 'dont_want_children', 'open_to_discussion', 'already_have_children'];

export function EditProfileForm() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Clear saved banner when user starts editing again
  useEffect(() => {
    if (hasChanges) setSaved(false);
  }, [hasChanges]);

  // Warn on navigation with unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasChanges]);

  // Form state
  const [currentCity, setCurrentCity] = useState('');
  const [currentState, setCurrentState] = useState('');
  const [currentCountry, setCurrentCountry] = useState('');
  const [diet, setDiet] = useState('');
  const [smoking, setSmoking] = useState('');
  const [drinking, setDrinking] = useState('');
  const [exerciseFrequency, setExerciseFrequency] = useState('');
  const [marriageTimeline, setMarriageTimeline] = useState('');
  const [childrenPreference, setChildrenPreference] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/app/profile');
        if (!res.ok) throw new Error('Failed to load profile');
        const json = await res.json();
        setData(json);
        const p = json.profile ?? {};
        setCurrentCity((p.current_city as string) ?? '');
        setCurrentState((p.current_state as string) ?? '');
        setCurrentCountry((p.current_country as string) ?? '');
        setDiet((p.diet as string) ?? '');
        setSmoking((p.smoking as string) ?? '');
        setDrinking((p.drinking as string) ?? '');
        setExerciseFrequency((p.exercise_frequency as string) ?? '');
        setMarriageTimeline((p.marriage_timeline as string) ?? '');
        setChildrenPreference((p.children_preference as string) ?? '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch('/api/app/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            current_city: currentCity || null,
            current_state: currentState || null,
            current_country: currentCountry || null,
            diet: diet || null,
            smoking: smoking || null,
            drinking: drinking || null,
            exercise_frequency: exerciseFrequency || null,
            marriage_timeline: marriageTimeline || null,
            children_preference: childrenPreference || null,
          },
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Failed to save');
      }
      setSaved(true);
      setHasChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-samvaya-red" />
      </div>
    );
  }

  if (!data?.profile) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700" role="alert">
        Profile not found. Please complete onboarding first.
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/app/profile"
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100"
            aria-label="Back to profile"
          >
            <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <h2 className="type-heading text-gray-900">Edit Profile</h2>
        </div>
      </div>

      {/* Location */}
      <fieldset className="rounded-xl border border-gray-200 bg-white p-5">
        <legend className="text-sm font-semibold text-gray-900 px-1">Location</legend>
        <div className="mt-2 space-y-3">
          <TextInput label="City" value={currentCity} onChange={(v) => { setCurrentCity(v); setHasChanges(true); }} />
          <TextInput label="State" value={currentState} onChange={(v) => { setCurrentState(v); setHasChanges(true); }} />
          <TextInput label="Country" value={currentCountry} onChange={(v) => { setCurrentCountry(v); setHasChanges(true); }} />
        </div>
      </fieldset>

      {/* Lifestyle */}
      <fieldset className="rounded-xl border border-gray-200 bg-white p-5">
        <legend className="text-sm font-semibold text-gray-900 px-1">Lifestyle</legend>
        <div className="mt-2 space-y-3">
          <SelectInput label="Diet" value={diet} onChange={(v) => { setDiet(v); setHasChanges(true); }} options={DIET_OPTIONS} />
          <SelectInput label="Smoking" value={smoking} onChange={(v) => { setSmoking(v); setHasChanges(true); }} options={SMOKING_OPTIONS} />
          <SelectInput label="Drinking" value={drinking} onChange={(v) => { setDrinking(v); setHasChanges(true); }} options={DRINKING_OPTIONS} />
          <SelectInput label="Exercise" value={exerciseFrequency} onChange={(v) => { setExerciseFrequency(v); setHasChanges(true); }} options={EXERCISE_OPTIONS} />
        </div>
      </fieldset>

      {/* Life Goals */}
      <fieldset className="rounded-xl border border-gray-200 bg-white p-5">
        <legend className="text-sm font-semibold text-gray-900 px-1">Life Goals</legend>
        <div className="mt-2 space-y-3">
          <SelectInput label="Marriage Timeline" value={marriageTimeline} onChange={(v) => { setMarriageTimeline(v); setHasChanges(true); }} options={MARRIAGE_TIMELINE_OPTIONS} />
          <SelectInput label="Children" value={childrenPreference} onChange={(v) => { setChildrenPreference(v); setHasChanges(true); }} options={CHILDREN_OPTIONS} />
        </div>
      </fieldset>

      {/* Status Messages */}
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}
      {saved && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700" role="status">
          Profile updated successfully.
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving || !hasChanges}
        className="form-btn-primary w-full"
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>

      <p className="text-center text-xs text-gray-400">
        Some fields like name, date of birth, and medical credentials can only be updated by contacting our team.
      </p>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-samvaya-red focus:outline-none focus:ring-1 focus:ring-samvaya-red"
      />
    </div>
  );
}

function SelectInput({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-samvaya-red focus:outline-none focus:ring-1 focus:ring-samvaya-red"
      >
        <option value="">Not specified</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {formatEnumValue(opt)}
          </option>
        ))}
      </select>
    </div>
  );
}
