'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUserStatus } from '@/lib/app/user-context';
import { LogoutButton } from '@/components/ui/logout-button';

interface SettingsPageProps {
  email: string;
}

interface NotificationPrefs {
  email_new_match: boolean;
  email_match_response: boolean;
  email_status_update: boolean;
  email_promotions: boolean;
  push_new_match: boolean;
  push_match_response: boolean;
  push_status_update: boolean;
}

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '';

export function SettingsPage({ email }: SettingsPageProps) {
  const { paymentStatus, isGoocampusMember } = useUserStatus();

  const [isPaused, setIsPaused] = useState(false);
  const [pauseLoading, setPauseLoading] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs | null>(null);
  const [notifSaving, setNotifSaving] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  const statusLabel = getStatusLabel(paymentStatus);
  const statusColor = getStatusColor(paymentStatus);

  // Load settings
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/app/settings');
        if (res.ok) {
          const data = await res.json();
          setIsPaused(data.isPaused);
          setNotifPrefs(data.notificationPreferences as NotificationPrefs);
        }
      } finally {
        setSettingsLoaded(true);
      }
    }
    loadSettings();
  }, []);

  const togglePause = useCallback(async () => {
    const previous = isPaused;
    setIsPaused(!isPaused);
    setPauseLoading(true);
    try {
      const res = await fetch('/api/app/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPaused: !previous }),
      });
      if (!res.ok) setIsPaused(previous);
    } catch {
      setIsPaused(previous);
    } finally {
      setPauseLoading(false);
    }
  }, [isPaused]);

  const updateNotifPref = useCallback(async (key: keyof NotificationPrefs, value: boolean) => {
    if (!notifPrefs) return;
    const previous = { ...notifPrefs };
    setNotifPrefs({ ...notifPrefs, [key]: value });
    setNotifSaving(true);
    try {
      const res = await fetch('/api/app/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationPreferences: { [key]: value } }),
      });
      if (!res.ok) setNotifPrefs(previous);
    } catch {
      setNotifPrefs(previous);
    } finally {
      setNotifSaving(false);
    }
  }, [notifPrefs]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Settings</h2>

      {/* Account Info */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900">Account</h3>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Email</span>
            <span className="text-sm text-gray-700">{email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Status</span>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}>
              {statusLabel}
            </span>
          </div>
          {isGoocampusMember && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">GooCampus</span>
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                Member
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Pause Profile */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Pause Profile</h3>
            <p className="mt-1 text-xs text-gray-500">
              Temporarily hide your profile from the matching pool.
            </p>
          </div>
          {settingsLoaded && (
            <button
              onClick={togglePause}
              disabled={pauseLoading}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-samvaya-red focus:ring-offset-2 disabled:opacity-50 ${
                isPaused ? 'bg-samvaya-red' : 'bg-gray-200'
              }`}
              role="switch"
              aria-checked={isPaused}
              aria-label="Pause profile"
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isPaused ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          )}
        </div>
        {isPaused && (
          <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Your profile is currently paused. You won&apos;t receive new matches while paused.
          </p>
        )}
      </div>

      {/* Notification Preferences */}
      {settingsLoaded && notifPrefs && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900">
            Notifications
            {notifSaving && <span className="ml-2 text-xs font-normal text-gray-400">Saving...</span>}
          </h3>

          <div className="mt-3 space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Email</p>
            <NotifToggle
              label="New match presented"
              checked={notifPrefs.email_new_match}
              onChange={(v) => updateNotifPref('email_new_match', v)}
            />
            <NotifToggle
              label="Match response received"
              checked={notifPrefs.email_match_response}
              onChange={(v) => updateNotifPref('email_match_response', v)}
            />
            <NotifToggle
              label="Status updates"
              checked={notifPrefs.email_status_update}
              onChange={(v) => updateNotifPref('email_status_update', v)}
            />
            <NotifToggle
              label="Promotions & tips"
              checked={notifPrefs.email_promotions}
              onChange={(v) => updateNotifPref('email_promotions', v)}
            />
          </div>

          <div className="mt-4 space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Push</p>
            <NotifToggle
              label="New match presented"
              checked={notifPrefs.push_new_match}
              onChange={(v) => updateNotifPref('push_new_match', v)}
            />
            <NotifToggle
              label="Match response received"
              checked={notifPrefs.push_match_response}
              onChange={(v) => updateNotifPref('push_match_response', v)}
            />
            <NotifToggle
              label="Status updates"
              checked={notifPrefs.push_status_update}
              onChange={(v) => updateNotifPref('push_status_update', v)}
            />
          </div>
        </div>
      )}

      {/* Contact Support */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900">Support</h3>
        <div className="mt-3 space-y-2">
          {WHATSAPP_NUMBER ? (
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi, I need help with my Samvaya account.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-green-700 hover:text-green-800"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp Support
            </a>
          ) : null}
          <a
            href="mailto:support@samvayamatrimony.com"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            support@samvayamatrimony.com
          </a>
        </div>
      </div>

      {/* Legal */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900">Legal</h3>
        <div className="mt-3 space-y-2">
          <a href="/legal/privacy" className="block text-sm text-gray-600 hover:text-gray-800">
            Privacy Policy
          </a>
          <a href="/legal/terms" className="block text-sm text-gray-600 hover:text-gray-800">
            Terms of Service
          </a>
        </div>
      </div>

      {/* Logout & Delete */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
        <LogoutButton />
        <div className="border-t border-gray-100 pt-3">
          {WHATSAPP_NUMBER ? (
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi, I\'d like to request deletion of my Samvaya account.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-red-600 hover:text-red-700"
            >
              Delete Account
            </a>
          ) : (
            <a
              href="mailto:support@samvayamatrimony.com?subject=Account%20Deletion%20Request"
              className="text-sm font-medium text-red-600 hover:text-red-700"
            >
              Delete Account
            </a>
          )}
          <p className="mt-1 text-xs text-gray-400">This action cannot be undone</p>
        </div>
      </div>
    </div>
  );
}

function NotifToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-gray-600">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-samvaya-red focus:ring-offset-2 ${
          checked ? 'bg-samvaya-red' : 'bg-gray-200'
        }`}
        role="switch"
        aria-checked={checked}
        aria-label={label}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'unverified': return 'Unverified';
    case 'verification_pending': return 'Verification Pending';
    case 'in_pool': return 'Verified';
    case 'match_presented': return 'Match Found';
    case 'awaiting_payment': return 'Awaiting Payment';
    case 'active_member': return 'Active Member';
    case 'membership_expired': return 'Expired';
    default: return status;
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'active_member': return 'bg-green-100 text-green-800';
    case 'in_pool': return 'bg-blue-100 text-blue-800';
    case 'match_presented': return 'bg-samvaya-blush-dark text-samvaya-red';
    case 'verification_pending': return 'bg-amber-100 text-amber-800';
    case 'awaiting_payment': return 'bg-purple-100 text-purple-800';
    case 'membership_expired': return 'bg-gray-100 text-gray-600';
    default: return 'bg-gray-100 text-gray-600';
  }
}
