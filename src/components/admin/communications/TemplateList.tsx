'use client';

import { useState } from 'react';
import type { EmailTemplate } from '@/types';

interface TemplateListProps {
  templates: EmailTemplate[];
  onEdit: (template: EmailTemplate) => void;
  onRefresh: () => void;
}

export function TemplateList({ templates, onEdit, onRefresh }: TemplateListProps) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<EmailTemplate | null>(null);

  const handleDelete = async (template: EmailTemplate) => {
    setDeleting(template.id);
    setConfirmDelete(null);
    setError(null);

    try {
      const res = await fetch(`/api/admin/templates/${template.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete');
      }
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template');
    } finally {
      setDeleting(null);
    }
  };

  if (templates.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-sm text-gray-500">No email templates yet. Create one to get started.</p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}
      {/* Delete confirmation dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title">
          <div className="mx-4 w-full max-w-sm rounded-lg bg-white p-6 shadow-md">
            <h3 id="delete-dialog-title" className="text-lg font-semibold text-gray-900">Delete Template</h3>
            <p className="mt-2 text-sm text-gray-600">
              Delete &ldquo;{confirmDelete.name}&rdquo;? This cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => setConfirmDelete(null)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {templates.map((template) => (
          <div
            key={template.id}
            className="rounded-lg border border-gray-200 bg-white p-4"
          >
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
                <p className="mt-0.5 text-xs text-gray-500">
                  Subject: {template.subject}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-gray-400">
                  {template.body}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    {template.category}
                  </span>
                  {(template.variables || []).map((v) => (
                    <span key={v} className="rounded-full bg-rose-50 px-2 py-0.5 text-xs text-rose-600">
                      {`{{${v}}}`}
                    </span>
                  ))}
                </div>
              </div>
              <div className="ml-4 flex flex-shrink-0 gap-2">
                <button
                  onClick={() => onEdit(template)}
                  className="rounded-md border border-gray-300 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50"
                  aria-label={`Edit ${template.name}`}
                >
                  Edit
                </button>
                <button
                  onClick={() => setConfirmDelete(template)}
                  disabled={deleting === template.id}
                  className="rounded-md border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={`Delete ${template.name}`}
                >
                  {deleting === template.id ? '...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
