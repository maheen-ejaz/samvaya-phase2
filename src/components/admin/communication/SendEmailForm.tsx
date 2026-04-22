'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface SendEmailFormProps {
  userId: string;
  applicantEmail: string;
  onSent?: () => void;
}

export function SendEmailForm({ userId, applicantEmail, onSent }: SendEmailFormProps) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSend() {
    if (!subject.trim() || !body.trim()) return;

    setSending(true);

    try {
      const res = await fetch(`/api/admin/applicants/${userId}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: subject.trim(), body: body.trim() }),
      });

      if (res.ok) {
        toast.success('Email sent successfully');
        setSubject('');
        setBody('');
        onSent?.();
      } else {
        toast.error('Failed to send email');
      }
    } catch {
      toast.error('Failed to send email');
    } finally {
      setSending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Email</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-xs text-muted-foreground">To: {applicantEmail}</p>

        <div className="space-y-3">
          <Input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            aria-label="Email subject"
            maxLength={255}
          />
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Email body..."
            aria-label="Email body"
            maxLength={5000}
            rows={4}
            className="resize-none"
          />
          <Button
            onClick={handleSend}
            disabled={sending || !subject.trim() || !body.trim()}
          >
            {sending ? 'Sending...' : 'Send Email'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
