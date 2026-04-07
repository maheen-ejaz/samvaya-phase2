'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Note {
  id: string;
  noteText: string;
  adminName: string;
  createdAt: string;
}

interface TeamNotesProps {
  userId: string;
  aiRedFlags: string | null;
  notes: Note[];
}

export function TeamNotes({ userId, aiRedFlags, notes }: TeamNotesProps) {
  const router = useRouter();
  const [newNote, setNewNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAddNote() {
    if (!newNote.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/applicants/${userId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteText: newNote.trim() }),
      });
      if (res.ok) {
        setNewNote('');
        router.refresh();
      } else {
        setError('Failed to save note. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-gray-900">Team Notes & Flags</h3>
      </div>

      {/* AI Red Flags */}
      {aiRedFlags && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 p-3">
          <p className="text-xs font-medium text-red-700">AI Red Flags</p>
          <p className="mt-1 text-sm text-red-800">{aiRedFlags}</p>
        </div>
      )}

      {/* Existing Notes */}
      {notes.length > 0 ? (
        <div className="mb-4 space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="rounded border border-gray-100 bg-gray-50 p-3">
              <p className="text-sm text-gray-700">{note.noteText}</p>
              <p className="mt-1 text-xs text-gray-400">
                {note.adminName} — {new Date(note.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          ))}
        </div>
      ) : (
        !aiRedFlags && <p className="mb-4 text-sm text-gray-400">No notes yet.</p>
      )}

      {/* Error */}
      {error && (
        <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      {/* Add Note */}
      <div className="flex gap-2">
        <textarea
          value={newNote}
          onChange={(e) => { setNewNote(e.target.value); setError(null); }}
          placeholder="Add a note..."
          aria-label="New team note"
          rows={2}
          className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
        />
        <button
          onClick={handleAddNote}
          disabled={saving || !newNote.trim()}
          className="self-end rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Add'}
        </button>
      </div>
    </div>
  );
}
