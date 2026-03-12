'use client';

import { useState } from 'react';
import type { EmailTemplate } from '@/types';
import { PRICING } from '@/lib/constants';

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

      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
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
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-gray-900">
        {isEditing ? 'Edit Template' : 'New Template'}
      </h3>

      {error && (
        <div className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label htmlFor="tpl-name" className="block text-sm font-medium text-gray-700">
            Template Name
          </label>
          <input
            id="tpl-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={100}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-rose-500 focus:ring-rose-500"
            placeholder="e.g. Welcome Email"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="tpl-subject" className="block text-sm font-medium text-gray-700">
              Subject
            </label>
            <input
              id="tpl-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              maxLength={255}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-rose-500 focus:ring-rose-500"
              placeholder="Email subject line"
            />
          </div>
          <div>
            <label htmlFor="tpl-category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              id="tpl-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="tpl-body" className="block text-sm font-medium text-gray-700">
            Body
          </label>
          <textarea
            id="tpl-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            maxLength={10000}
            rows={10}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:border-rose-500 focus:ring-rose-500"
            placeholder={`Hi {{first_name}},\n\nYour template content here...`}
          />
          <p className="mt-1 text-xs text-gray-400">{body.length}/10,000 characters</p>
        </div>

        {/* Variable reference */}
        <div className="rounded-md bg-gray-50 p-3">
          <p className="text-xs font-medium text-gray-500 mb-2">Available Variables (click to insert)</p>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_VARIABLES.map((v) => (
              <button
                key={v.key}
                type="button"
                onClick={() => insertVariable(v.key)}
                className="rounded-full bg-white border border-gray-300 px-2.5 py-1 text-xs text-gray-700 hover:bg-rose-50 hover:border-rose-200"
                title={v.desc}
                aria-label={`Insert {{${v.key}}} variable`}
              >
                {`{{${v.key}}}`}
              </button>
            ))}
          </div>
        </div>

        {/* Preview toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            aria-expanded={showPreview}
            className="text-sm font-medium text-rose-600 hover:text-rose-700"
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          {showPreview && (
            <div className="mt-2 rounded-md border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-medium text-gray-500 mb-2">Preview (with sample data)</p>
              <p className="text-sm font-medium text-gray-900 mb-1">
                Subject: {subject.replace(/\{\{first_name\}\}/g, 'Priya').replace(/\{\{last_name\}\}/g, 'Sharma')}
              </p>
              <div className="whitespace-pre-wrap text-sm text-gray-700">{previewBody}</div>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : isEditing ? 'Update Template' : 'Create Template'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
