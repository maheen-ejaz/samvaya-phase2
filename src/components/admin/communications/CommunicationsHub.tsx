'use client';

import { useState, useEffect, useCallback } from 'react';
import type { EmailTemplate } from '@/types';
import { TemplateList } from './TemplateList';
import { TemplateEditor } from './TemplateEditor';
import { BulkSendForm } from './BulkSendForm';
import { BulkSendHistory } from './BulkSendHistory';

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

  const tabs: { key: Tab; label: string }[] = [
    { key: 'send', label: 'Send' },
    { key: 'templates', label: 'Templates' },
    { key: 'history', label: 'History' },
  ];

  return (
    <div>
      {/* Pill tab bar */}
      <div className="flex gap-1 rounded-xl bg-gray-100 p-1 w-fit mb-6" role="tablist" aria-label="Communications tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setShowEditor(false); }}
            role="tab"
            aria-selected={activeTab === tab.key}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150 ${
              activeTab === tab.key
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-700">{error}</div>
      )}

      {/* Tab content */}
      <div>
        {activeTab === 'send' && (
          loading ? (
            <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-12 flex items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-[#4F6EF7]" />
            </div>
          ) : (
            <BulkSendForm templates={templates} />
          )
        )}

        {activeTab === 'templates' && (
          <div>
            {showEditor ? (
              <TemplateEditor
                template={editingTemplate}
                onSave={handleSaveTemplate}
                onCancel={() => { setShowEditor(false); setEditingTemplate(null); }}
              />
            ) : (
              <>
                <div className="mb-4 flex justify-end">
                  <button
                    onClick={() => { setEditingTemplate(null); setShowEditor(true); }}
                    className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 transition-all duration-150 hover:shadow-md active:scale-[0.98]"
                    aria-label="Create new template"
                  >
                    New Template
                  </button>
                </div>
                {loading ? (
                  <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-12 flex items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-[#4F6EF7]" />
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
          </div>
        )}

        {activeTab === 'history' && <BulkSendHistory />}
      </div>
    </div>
  );
}
