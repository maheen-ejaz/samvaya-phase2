'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface FeatureFlagEditorProps {
  flags: Record<string, boolean>;
}

const FLAG_DESCRIPTIONS: Record<string, string> = {
  airtable_sync_enabled: 'Enable real-time Supabase → Airtable sync via webhooks',
  bulk_email_enabled: 'Allow sending bulk emails from the Communications page',
};

export function FeatureFlagEditor({ flags: initialFlags }: FeatureFlagEditorProps) {
  const [flags, setFlags] = useState<Record<string, boolean>>(initialFlags);
  const [saving, setSaving] = useState<string | null>(null);

  const handleToggle = async (flagKey: string) => {
    setSaving(flagKey);

    const newFlags = { ...flags, [flagKey]: !flags[flagKey] };

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'feature_flags', value: newFlags }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update');
      }

      setFlags(newFlags);
      toast.success(`"${flagKey}" ${newFlags[flagKey] ? 'enabled' : 'disabled'}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update feature flag');
    } finally {
      setSaving(null);
    }
  };

  const entries = Object.entries(flags);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Flags</CardTitle>
        <CardDescription>
          Toggle features on or off. Changes take effect immediately.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-0">
          {entries.map(([key, enabled], index) => (
            <div key={key}>
              {index > 0 && <Separator className="my-0" />}
              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{key}</p>
                  <p className="text-xs text-muted-foreground">
                    {FLAG_DESCRIPTIONS[key] || 'No description available'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={enabled ? 'default' : 'secondary'}>
                    {enabled ? 'On' : 'Off'}
                  </Badge>
                  <Switch
                    checked={enabled}
                    onCheckedChange={() => handleToggle(key)}
                    disabled={saving === key}
                    aria-label={`Toggle ${key}`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
