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
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6" aria-label="Communications tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setShowEditor(false); }}
              className={`border-b-2 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'border-rose-600 text-rose-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
              role="tab"
              aria-selected={activeTab === tab.key}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {/* Tab content */}
      <div className="mt-6">
        {activeTab === 'send' && (
          loading ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-rose-600" />
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
                    className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
                    aria-label="Create new template"
                  >
                    New Template
                  </button>
                </div>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-rose-600" />
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
