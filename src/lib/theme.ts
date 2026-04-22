import type { ThemeConfig } from '@/app/api/admin/theme/route';

export const DEFAULT_THEME: ThemeConfig = {
  primary: 'oklch(0.511 0.096 186.391)',
  chart_1: 'oklch(0.855 0.138 181.071)',
  chart_2: 'oklch(0.704 0.14 182.503)',
  chart_3: 'oklch(0.6 0.118 184.704)',
  chart_4: 'oklch(0.511 0.096 186.391)',
  chart_5: 'oklch(0.437 0.078 188.216)',
  font_sans: 'inter',
  font_form: 'inter',
  radius: '0.5rem',
};

// Font CSS variable map — all three fonts are loaded in layout.tsx
export const FONT_VAR_MAP: Record<string, string> = {
  'inter': '--font-inter',
  'instrument-sans': '--font-instrument-sans',
  'geist': '--font-geist',
};

export const FONT_LABELS: Record<string, string> = {
  'inter': 'Inter',
  'instrument-sans': 'Instrument Sans',
  'geist': 'Geist',
};

export const RADIUS_OPTIONS = [
  { value: '0rem', label: 'None' },
  { value: '0.25rem', label: 'Small' },
  { value: '0.5rem', label: 'Medium' },
  { value: '0.625rem', label: 'Default' },
  { value: '0.75rem', label: 'Large' },
  { value: '1rem', label: 'Extra Large' },
];

export function buildThemeCss(theme: ThemeConfig): string {
  const fontSansVar = FONT_VAR_MAP[theme.font_sans] ?? '--font-inter';
  const fontFormVar = FONT_VAR_MAP[theme.font_form] ?? '--font-inter';
  return `
:root {
  --primary: ${theme.primary};
  --sidebar-primary: ${theme.chart_3};
  --chart-1: ${theme.chart_1};
  --chart-2: ${theme.chart_2};
  --chart-3: ${theme.chart_3};
  --chart-4: ${theme.chart_4};
  --chart-5: ${theme.chart_5};
  --radius: ${theme.radius};
  --theme-font-sans: var(${fontSansVar});
  --theme-font-form: var(${fontFormVar});
}`.trim();
}
