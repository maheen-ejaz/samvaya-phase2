'use client';

import { useState, useEffect, useCallback } from 'react';
import type { EmailTemplate } from '@/types';
import { TemplateList } from './TemplateList';
import { TemplateEditor } from './TemplateEditor';
import { BulkSendForm } from './BulkSendForm';
import { BulkSendHistory } from './BulkSendHistory';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

type Tab = 'send' | 'templates' | 'history';

export function CommunicationsHub() {
  const [activeTab, setActiveTab] = useState<Tab>('send');
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const fetchTemplates = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/admin/templates');
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
      } else {
        setError('Failed to load templates');
      }
    } catch {
      setError('Failed to load templates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setShowEditor(true);
  };

  const handleSaveTemplate = () => {
    setShowEditor(false);
    setEditingTemplate(null);
    fetchTemplates();
  };

  return (
    <div>
      <Tabs
        value={activeTab}
        onValueChange={(v) => { setActiveTab(v as Tab); setShowEditor(false); }}
      >
        <TabsList className="mb-6">
          <TabsTrigger value="send">Send</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Error banner */}
        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">{error}</div>
        )}

        <TabsContent value="send">
          {loading ? (
            <div className="rounded-xl border border-border bg-card p-12 flex items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
            </div>
          ) : (
            <BulkSendForm templates={templates} />
          )}
        </TabsContent>

        <TabsContent value="templates">
          {showEditor ? (
            <TemplateEditor
              template={editingTemplate}
              onSave={handleSaveTemplate}
              onCancel={() => { setShowEditor(false); setEditingTemplate(null); }}
            />
          ) : (
            <>
              <div className="mb-4 flex justify-end">
                <Button
                  onClick={() => { setEditingTemplate(null); setShowEditor(true); }}
                  aria-label="Create new template"
                >
                  New Template
                </Button>
              </div>
              {loading ? (
                <div className="rounded-xl border border-border bg-card p-12 flex items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
                </div>
              ) : (
                <TemplateList
                  templates={templates}
                  onEdit={handleEditTemplate}
                  onRefresh={fetchTemplates}
                />
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="history">
          <BulkSendHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
