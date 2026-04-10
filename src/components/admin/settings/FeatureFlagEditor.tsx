'use client';

import { useState } from 'react';

interface FeatureFlagEditorProps {
  flags: Record<string, boolean>;
}

const FLAG_DESCRIPTIONS: Record<string, string> = {
  airtable_sync_enabled: 'Enable real-time Supabase → Airtable sync via webhooks',
  bulk_email_enabled: 'Allow sending bulk emails from the Communications page',
};

export function FeatureFlagEditor({ flags: initialFlags }: FeatureFlagEditorProps) {
  const [flags, setFlags] = useState<Record<string, boolean>>(initialFlags);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleToggle = async (flagKey: string) => {
    setSaving(flagKey);
    setError(null);
    setSuccess(null);

    const newFlags = { ...flags, [flagKey]: !flags[flagKey] };

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'feature_flags', value: newFlags }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update');
      }

      setFlags(newFlags);
      setSuccess(`"${flagKey}" ${newFlags[flagKey] ? 'enabled' : 'disabled'}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update feature flag');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200/60 bg-white p-6">
      <h2 className="type-heading text-gray-900">Feature Flags</h2>
      <p className="mt-1 text-sm text-gray-500">
        Toggle features on or off. Changes take effect immediately.
      </p>

      {error && (
        <div className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</div>
      )}
      {success && (
        <div className="mt-3 rounded-md bg-green-50 p-3 text-sm text-green-700" role="status" aria-live="polite">{success}</div>
      )}

      <div className="mt-6 divide-y divide-gray-100">
        {Object.entries(flags).map(([key, enabled]) => (
          <div key={key} className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm font-medium text-gray-900">{key}</p>
              <p className="text-xs text-gray-500">
                {FLAG_DESCRIPTIONS[key] || 'No description available'}
              </p>
            </div>
            <button
              onClick={() => handleToggle(key)}
              disabled={saving === key}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                enabled ? 'bg-rose-600' : 'bg-gray-200'
              }`}
              role="switch"
              aria-checked={enabled}
              aria-label={`Toggle ${key}`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
