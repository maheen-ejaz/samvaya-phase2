'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { ThemeConfig } from '@/app/api/admin/theme/route';
import { FONT_LABELS, RADIUS_OPTIONS, DEFAULT_THEME } from '@/lib/theme';

interface ThemeEditorProps {
  initialTheme: ThemeConfig;
}

function oklchToHex(oklch: string): string {
  // If already hex, return as-is
  if (oklch.startsWith('#')) return oklch;
  // Return a best-effort fallback for colour picker display
  // The colour picker stores the pick as hex; we convert back for saving
  return '#14b8a6'; // teal-500 default for display
}

function applyPreview(theme: Partial<ThemeConfig> & { primary?: string; chart_1?: string; chart_2?: string; chart_3?: string; chart_4?: string; chart_5?: string; radius?: string; font_sans?: string }) {
  const root = document.documentElement;
  if (theme.primary) root.style.setProperty('--primary', theme.primary);
  if (theme.chart_1) root.style.setProperty('--chart-1', theme.chart_1);
  if (theme.chart_2) root.style.setProperty('--chart-2', theme.chart_2);
  if (theme.chart_3) {
    root.style.setProperty('--chart-3', theme.chart_3);
    root.style.setProperty('--sidebar-primary', theme.chart_3);
  }
  if (theme.chart_4) root.style.setProperty('--chart-4', theme.chart_4);
  if (theme.chart_5) root.style.setProperty('--chart-5', theme.chart_5);
  if (theme.radius) root.style.setProperty('--radius', theme.radius);
  if (theme.font_sans) {
    const varMap: Record<string, string> = {
      'inter': 'var(--font-inter)',
      'instrument-sans': 'var(--font-instrument-sans)',
      'geist': 'var(--font-geist)',
    };
    root.style.setProperty('--theme-font-sans', varMap[theme.font_sans] ?? 'var(--font-inter)');
  }
}

const CHART_FIELDS = [
  { key: 'chart_1', label: 'Chart 1' },
  { key: 'chart_2', label: 'Chart 2' },
  { key: 'chart_3', label: 'Chart 3' },
  { key: 'chart_4', label: 'Chart 4' },
  { key: 'chart_5', label: 'Chart 5' },
] as const;

export function ThemeEditor({ initialTheme }: ThemeEditorProps) {
  const [theme, setTheme] = useState<ThemeConfig>(initialTheme);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(<K extends keyof ThemeConfig>(key: K, value: ThemeConfig[K]) => {
    const next = { ...theme, [key]: value };
    setTheme(next);
    applyPreview({ [key]: value });
    setSaved(false);
  }, [theme]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(theme),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Save failed');
      }
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setTheme(DEFAULT_THEME);
    applyPreview(DEFAULT_THEME);
    setSaved(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme</CardTitle>
        <CardDescription>
          Customise brand colour, chart palette, typography, and corner radius. Changes preview instantly and apply site-wide on save.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Brand colour */}
        <div>
          <p className="text-sm font-medium text-foreground mb-3">Brand colour</p>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg border border-border flex-shrink-0"
              style={{ backgroundColor: theme.primary.startsWith('oklch') ? 'oklch(0.511 0.096 186.391)' : theme.primary }}
            />
            <input
              type="color"
              defaultValue={oklchToHex(theme.primary)}
              onChange={e => update('primary', e.target.value)}
              className="h-10 w-20 rounded-md border border-input cursor-pointer bg-transparent p-0.5"
              title="Brand colour"
            />
            <span className="text-sm text-muted-foreground font-mono">{theme.primary}</span>
          </div>
        </div>

        {/* Chart colours */}
        <div>
          <p className="text-sm font-medium text-foreground mb-3">Chart colours</p>
          <div className="flex flex-wrap gap-3">
            {CHART_FIELDS.map(({ key, label }) => (
              <div key={key} className="flex flex-col items-center gap-1.5">
                <div
                  className="w-8 h-8 rounded-md border border-border"
                  style={{ backgroundColor: theme[key] }}
                />
                <input
                  type="color"
                  defaultValue={oklchToHex(theme[key])}
                  onChange={e => update(key, e.target.value)}
                  className="h-7 w-16 rounded border border-input cursor-pointer bg-transparent p-0.5"
                  title={label}
                />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Typography */}
        <div>
          <p className="text-sm font-medium text-foreground mb-3">Font family</p>
          <div className="flex gap-4 flex-wrap">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">UI &amp; Admin</label>
              <select
                value={theme.font_sans}
                onChange={e => update('font_sans', e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {Object.entries(FONT_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Form fields</label>
              <select
                value={theme.font_form}
                onChange={e => update('font_form', e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {Object.entries(FONT_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Border radius */}
        <div>
          <p className="text-sm font-medium text-foreground mb-3">Corner radius</p>
          <div className="flex flex-wrap gap-2">
            {RADIUS_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => update('radius', value)}
                className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                  theme.radius === value
                    ? 'border-primary bg-primary/10 text-primary font-medium'
                    : 'border-border bg-background text-muted-foreground hover:border-primary/50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            {RADIUS_OPTIONS.slice(0, 4).map(({ value }) => (
              <div
                key={value}
                className="w-8 h-8 bg-primary/20 border border-primary/30 flex-shrink-0"
                style={{ borderRadius: value }}
                title={value}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2 border-t border-border">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save theme'}
          </Button>
          <Button variant="outline" onClick={handleReset} disabled={saving}>
            Reset to preset defaults
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
