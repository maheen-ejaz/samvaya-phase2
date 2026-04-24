import type { ThemeConfig } from '@/app/api/admin/theme/route';

// Strict CSS color validator — prevents CSS injection via theme fields
// that are interpolated raw into <style> tags.
const CSS_COLOR_REGEXES: RegExp[] = [
  /^#[0-9a-fA-F]{3,8}$/,
  /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/,
  /^hsla?\(\s*\d+(\.\d+)?\s*,\s*\d+(\.\d+)?%\s*,\s*\d+(\.\d+)?%\s*(,\s*[\d.]+\s*)?\)$/,
  /^oklch\(\s*[\d.]+\s+[\d.]+\s+[\d.]+\s*(\/\s*[\d.]+\s*)?\)$/,
];

export function isValidCssColor(v: string): boolean {
  if (typeof v !== 'string' || v.length > 80) return false;
  return CSS_COLOR_REGEXES.some((r) => r.test(v));
}

export const DEFAULT_THEME: ThemeConfig = {
  // Samvaya brand — Red as primary, charcoal/red gradient for charts.
  primary: '#A3171F',
  chart_1: '#A3171F',
  chart_2: '#7D1118',
  chart_3: '#18181B',
  chart_4: '#3F3F46',
  chart_5: '#A1A1AA',
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

const ALLOWED_RADII = new Set(RADIUS_OPTIONS.map((o) => o.value));

// Defense-in-depth: re-validate every value before interpolating into a <style>
// tag. Input validation runs on PUT, but this guards against DB-level tampering,
// migration bugs, or any future code path that sets theme values without
// running through the validator.
function safeColor(v: string, fallback: string): string {
  return isValidCssColor(v) ? v : fallback;
}
function safeRadius(v: string): string {
  return ALLOWED_RADII.has(v) ? v : DEFAULT_THEME.radius;
}

export function buildThemeCss(theme: ThemeConfig): string {
  const fontSansVar = FONT_VAR_MAP[theme.font_sans] ?? '--font-inter';
  const fontFormVar = FONT_VAR_MAP[theme.font_form] ?? '--font-inter';
  const primary = safeColor(theme.primary, DEFAULT_THEME.primary);
  const chart1 = safeColor(theme.chart_1, DEFAULT_THEME.chart_1);
  const chart2 = safeColor(theme.chart_2, DEFAULT_THEME.chart_2);
  const chart3 = safeColor(theme.chart_3, DEFAULT_THEME.chart_3);
  const chart4 = safeColor(theme.chart_4, DEFAULT_THEME.chart_4);
  const chart5 = safeColor(theme.chart_5, DEFAULT_THEME.chart_5);
  const radius = safeRadius(theme.radius);
  return `
:root {
  --primary: ${primary};
  --sidebar-primary: ${chart3};
  --chart-1: ${chart1};
  --chart-2: ${chart2};
  --chart-3: ${chart3};
  --chart-4: ${chart4};
  --chart-5: ${chart5};
  --radius: ${radius};
  --theme-font-sans: var(${fontSansVar});
  --theme-font-form: var(${fontFormVar});
}`.trim();
}
