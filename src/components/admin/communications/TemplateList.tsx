'use client';

import { useState } from 'react';
import type { EmailTemplate } from '@/types';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

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
      toast.success('Template deleted');
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template');
      toast.error(err instanceof Error ? err.message : 'Failed to delete template');
    } finally {
      setDeleting(null);
    }
  };

  if (templates.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-sm text-muted-foreground">No email templates yet. Create one to get started.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={!!confirmDelete} onOpenChange={(open) => { if (!open) setConfirmDelete(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Delete &ldquo;{confirmDelete?.name}&rdquo;? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => confirmDelete && handleDelete(confirmDelete)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-3">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-medium text-foreground">{template.name}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Subject: {template.subject}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground/70">
                    {template.body}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <Badge variant="secondary">
                      {template.category}
                    </Badge>
                    {(template.variables || []).map((v) => (
                      <Badge key={v} variant="outline" className="text-primary">
                        {`{{${v}}}`}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="ml-4 flex flex-shrink-0 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(template)}
                    aria-label={`Edit ${template.name}`}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmDelete(template)}
                    disabled={deleting === template.id}
                    className="text-destructive border-destructive/30 hover:bg-destructive/10"
                    aria-label={`Delete ${template.name}`}
                  >
                    {deleting === template.id ? '...' : 'Delete'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
