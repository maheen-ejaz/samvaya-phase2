'use client';

import { useState } from 'react';
import type { EmailTemplate } from '@/types';
import { PRICING } from '@/lib/constants';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TemplateEditorProps {
  template?: EmailTemplate | null;
  onSave: () => void;
  onCancel: () => void;
}

const AVAILABLE_VARIABLES = [
  { key: 'first_name', desc: "Applicant's first name" },
  { key: 'last_name', desc: "Applicant's last name" },
  { key: 'email', desc: "Applicant's email" },
  { key: 'payment_status', desc: 'Current payment status' },
  { key: 'next_step', desc: 'Next action for the applicant' },
  { key: 'verification_fee', desc: `Verification fee amount (${PRICING.VERIFICATION_FEE_DISPLAY})` },
  { key: 'membership_fee', desc: `Membership fee amount (${PRICING.MEMBERSHIP_FEE_DISPLAY})` },
];

const CATEGORIES = ['general', 'payment', 'verification', 'matching', 'notification'];

export function TemplateEditor({ template, onSave, onCancel }: TemplateEditorProps) {
  const isEditing = !!template;
  const [name, setName] = useState(template?.name || '');
  const [subject, setSubject] = useState(template?.subject || '');
  const [body, setBody] = useState(template?.body || '');
  const [category, setCategory] = useState(template?.category || 'general');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const url = isEditing ? `/api/admin/templates/${template.id}` : '/api/admin/templates';
    const method = isEditing ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, subject, body, category }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save template');
      }

      toast.success(isEditing ? 'Template updated' : 'Template created');
      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
      toast.error(err instanceof Error ? err.message : 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const insertVariable = (varKey: string) => {
    setBody((prev) => prev + `{{${varKey}}}`);
  };

  const previewBody = body
    .replace(/\{\{first_name\}\}/g, 'Priya')
    .replace(/\{\{last_name\}\}/g, 'Sharma')
    .replace(/\{\{email\}\}/g, 'priya@example.com')
    .replace(/\{\{payment_status\}\}/g, 'Verification Pending')
    .replace(/\{\{next_step\}\}/g, 'Complete background verification')
    .replace(/\{\{verification_fee\}\}/g, PRICING.VERIFICATION_FEE_DISPLAY)
    .replace(/\{\{membership_fee\}\}/g, PRICING.MEMBERSHIP_FEE_DISPLAY);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Template' : 'New Template'}</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="tpl-name">Template Name</Label>
            <Input
              id="tpl-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
              className="mt-1"
              placeholder="e.g. Welcome Email"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tpl-subject">Subject</Label>
              <Input
                id="tpl-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                maxLength={255}
                className="mt-1"
                placeholder="Email subject line"
              />
            </div>
            <div>
              <Label htmlFor="tpl-category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="tpl-category" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="tpl-body">Body</Label>
            <Textarea
              id="tpl-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              maxLength={10000}
              rows={10}
              className="mt-1 font-mono"
              placeholder={`Hi {{first_name}},\n\nYour template content here...`}
            />
            <p className="mt-1 text-xs text-muted-foreground">{body.length}/10,000 characters</p>
          </div>

          {/* Variable reference */}
          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">Available Variables (click to insert)</p>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_VARIABLES.map((v) => (
                  <Badge
                    key={v.key}
                    variant="outline"
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => insertVariable(v.key)}
                    title={v.desc}
                    aria-label={`Insert {{${v.key}}} variable`}
                  >
                    {`{{${v.key}}}`}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Preview toggle */}
          <div>
            <Button
              type="button"
              variant="link"
              onClick={() => setShowPreview(!showPreview)}
              aria-expanded={showPreview}
              className="px-0"
            >
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </Button>
            {showPreview && (
              <Card className="mt-2 bg-muted/50">
                <CardContent className="pt-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Preview (with sample data)</p>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Subject: {subject.replace(/\{\{first_name\}\}/g, 'Priya').replace(/\{\{last_name\}\}/g, 'Sharma')}
                  </p>
                  <div className="whitespace-pre-wrap text-sm text-muted-foreground">{previewBody}</div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : isEditing ? 'Update Template' : 'Create Template'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
