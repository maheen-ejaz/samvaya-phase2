'use client';

import { useState, useEffect, useMemo } from 'react';

interface ScheduleIntroductionProps {
  presentationId: string;
}

interface TimeSlot {
  date: string;
  timeSlot: 'morning' | 'afternoon' | 'evening';
}

interface Introduction {
  id: string;
  scheduled_at: string;
  status: string;
  meeting_link: string | null;
}

export function ScheduleIntroduction({ presentationId }: ScheduleIntroductionProps) {
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
  const [existingSlots, setExistingSlots] = useState<TimeSlot[]>([]);
  const [introductions, setIntroductions] = useState<Introduction[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate next 14 days (memoized to avoid shifting on re-render)
  const dates = useMemo(() => {
    const result: string[] = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      result.push(d.toISOString().split('T')[0]);
    }
    return result;
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/app/introductions?presentationId=${presentationId}`);
        if (res.ok) {
          const data = await res.json();
          const slotsArr = Array.isArray(data.slots) ? data.slots as Array<Record<string, string>> : [];
          const mapped = slotsArr.map((s) => ({
            date: s.available_date,
            timeSlot: s.time_slot as TimeSlot['timeSlot'],
          }));
          setExistingSlots(mapped);
          setSelectedSlots(mapped);
          setIntroductions(data.introductions ?? []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load availability');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [presentationId]);

  const toggleSlot = (date: string, timeSlot: TimeSlot['timeSlot']) => {
    setSelectedSlots((prev) => {
      const exists = prev.some((s) => s.date === date && s.timeSlot === timeSlot);
      if (exists) {
        return prev.filter((s) => !(s.date === date && s.timeSlot === timeSlot));
      }
      return [...prev, { date, timeSlot }];
    });
    setSaved(false);
  };

  const isSlotSelected = (date: string, timeSlot: string) =>
    selectedSlots.some((s) => s.date === date && s.timeSlot === timeSlot);

  const handleSave = async () => {
    if (selectedSlots.length === 0) {
      setError('Please select at least one time slot.');
      return;
    }
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch('/api/app/introductions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          presentationId,
          slots: selectedSlots.map((s) => ({
            date: s.date,
            timeSlot: s.timeSlot,
            notes: notes || undefined,
          })),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }
      setSaved(true);
      setExistingSlots([...selectedSlots]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-1/3 rounded bg-gray-200" />
          <div className="h-20 rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  // If there are scheduled introductions, show them
  const scheduledIntros = introductions.filter((i) => i.status === 'scheduled');
  if (scheduledIntros.length > 0) {
    return (
      <div className="rounded-xl border-2 border-green-200 bg-green-50 p-5">
        <h4 className="text-sm font-semibold text-green-800">Introduction Scheduled</h4>
        {scheduledIntros.map((intro) => (
          <div key={intro.id} className="mt-3 rounded-lg bg-white p-3">
            <p className="text-sm text-gray-700">
              {new Date(intro.scheduled_at).toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              {' at '}
              {new Date(intro.scheduled_at).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            {intro.meeting_link && (
              <a
                href={intro.meeting_link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block rounded-lg bg-samvaya-red px-4 py-2 text-sm font-medium text-white hover:bg-samvaya-red-dark"
              >
                Join Meeting
              </a>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h4 className="text-sm font-semibold text-gray-900">Schedule Your Introduction</h4>
      <p className="mt-1 text-xs text-gray-500">
        Select your available time slots for the next 2 weeks. Our team will coordinate
        a time that works for both of you.
      </p>

      {/* Date/time slot grid */}
      <div className="mt-4 space-y-3">
        {dates.map((date) => {
          const d = new Date(date + 'T00:00:00');
          const dayLabel = d.toLocaleDateString('en-IN', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          });

          return (
            <div key={date}>
              <p className="text-xs font-medium text-gray-600">{dayLabel}</p>
              <div className="mt-1 flex gap-2">
                {(['morning', 'afternoon', 'evening'] as const).map((slot) => (
                  <button
                    key={slot}
                    onClick={() => toggleSlot(date, slot)}
                    className={`flex-1 rounded-lg border px-2 py-2.5 text-xs font-medium transition-colors ${
                      isSlotSelected(date, slot)
                        ? 'border-samvaya-red bg-samvaya-blush text-samvaya-red'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {slot.charAt(0).toUpperCase() + slot.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Notes */}
      <div className="mt-4">
        <label className="block text-xs font-medium text-gray-500">
          Notes for the team (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Any preferences or constraints..."
          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-samvaya-red focus:outline-none focus:ring-1 focus:ring-samvaya-red"
        />
      </div>

      {/* Status */}
      {error && (
        <div className="mt-3 rounded-lg bg-red-50 p-2 text-xs text-red-700" role="alert">
          {error}
        </div>
      )}
      {saved && (
        <div className="mt-3 rounded-lg bg-green-50 p-2 text-xs text-green-700" role="status">
          Availability saved! Our team will confirm a time soon.
        </div>
      )}

      {existingSlots.length > 0 && !saved && (
        <p className="mt-3 text-xs text-gray-400">
          You have {existingSlots.length} time slot{existingSlots.length !== 1 ? 's' : ''} saved.
        </p>
      )}

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving || selectedSlots.length === 0}
        className="form-btn-primary mt-4 w-full"
      >
        {saving ? 'Saving...' : selectedSlots.length === 0 ? 'Select Time Slots' : `Save ${selectedSlots.length} Slot${selectedSlots.length !== 1 ? 's' : ''}`}
      </button>
    </div>
  );
}
