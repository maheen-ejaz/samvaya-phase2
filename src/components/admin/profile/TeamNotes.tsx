'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { MessageSquare } from 'lucide-react';

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

  async function handleAddNote() {
    if (!newNote.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/applicants/${userId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteText: newNote.trim() }),
      });
      if (res.ok) {
        setNewNote('');
        toast.success('Note added successfully');
        router.refresh();
      } else {
        toast.error('Failed to save note. Please try again.');
      }
    } catch {
      toast.error('Network error. Please check your connection.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <MessageSquare className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold text-foreground">Team Notes & Flags</span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {/* AI Red Flags */}
        {aiRedFlags && (
          <div className="mb-4 rounded border border-destructive/30 bg-destructive/10 p-3">
            <p className="text-xs font-medium text-destructive">AI Red Flags</p>
            <p className="mt-1 text-sm text-destructive">{aiRedFlags}</p>
          </div>
        )}

        {/* Existing Notes */}
        {notes.length > 0 ? (
          <div className="mb-4 space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="rounded border border-border bg-muted p-3">
                <p className="text-sm text-foreground">{note.noteText}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {note.adminName} — {new Date(note.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
        ) : (
          !aiRedFlags && <p className="mb-4 text-sm text-muted-foreground">No notes yet.</p>
        )}

        {/* Add Note */}
        <div className="flex gap-2">
          <Textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note..."
            aria-label="New team note"
            rows={2}
            className="flex-1 resize-none"
          />
          <Button
            onClick={handleAddNote}
            disabled={saving || !newNote.trim()}
            className="self-end"
          >
            {saving ? 'Saving...' : 'Add'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
