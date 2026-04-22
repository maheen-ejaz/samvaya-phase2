'use client';

import { useState } from 'react';
import { TASK_EMAIL_TEMPLATES } from '@/lib/email/task-templates';
import type { AdminTask } from '@/types/dashboard';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle } from 'lucide-react';

interface EmailComposeModalProps {
  task: AdminTask;
  onClose: () => void;
}

export function EmailComposeModal({ task, onClose }: EmailComposeModalProps) {
  const [templateId, setTemplateId] = useState('');
  const [to, setTo] = useState(task.applicantEmail ?? '');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function applyTemplate(id: string) {
    const realId = id === '__none__' ? '' : id;
    setTemplateId(realId);
    if (!realId) return;
    const tpl = TASK_EMAIL_TEMPLATES.find((t) => t.id === realId);
    if (!tpl) return;
    const name = task.applicantName?.split(' ')[0] ?? 'there';
    setSubject(tpl.subject);
    setBody(tpl.body.replace(/\{name\}/g, name));
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!to || !subject || !body) {
      setError('Please fill in all fields.');
      return;
    }
    setSending(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/tasks/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to,
          subject,
          text_body: body,
          task_id: task.id,
          applicant_user_id: task.entityId,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Send failed');
      }

      setSent(true);
      toast.success('Email sent successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Send failed');
      toast.error(err instanceof Error ? err.message : 'Send failed');
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Compose Email</DialogTitle>
        </DialogHeader>

        {sent ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-foreground">Email sent successfully</p>
            <p className="mt-1 text-xs text-muted-foreground">Logged to communication history.</p>
            <Button onClick={onClose} className="mt-6">
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-4">
            {/* Template selector */}
            <div>
              <Label>Template</Label>
              <Select value={templateId || '__none__'} onValueChange={applyTemplate}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="— Free-form (no template) —" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Free-form (no template) —</SelectItem>
                  {TASK_EMAIL_TEMPLATES.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* To */}
            <div>
              <Label>To</Label>
              <Input
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="applicant@email.com"
                className="mt-1.5"
                required
              />
            </div>

            {/* Subject */}
            <div>
              <Label>Subject</Label>
              <Input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject"
                className="mt-1.5"
                required
              />
            </div>

            {/* Body */}
            <div>
              <Label>Message</Label>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your message..."
                rows={8}
                className="mt-1.5 resize-none"
                required
              />
            </div>

            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={sending}>
                {sending ? 'Sending...' : 'Send Email'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
