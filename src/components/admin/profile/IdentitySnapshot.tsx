import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface IdentitySnapshotProps {
  religion: string | null;
  religiousObservance: string | null;
  motherTongue: string | null;
  languagesSpoken: string[];
  maritalStatus: string | null;
  bloodGroup: string | null;
  referralSource: string | null;
  dateOfBirth: string | null;
  believesInKundali: boolean | null;
  casteComfort: boolean | null;
  caste: string | null;
}

export function IdentitySnapshot({
  religion,
  religiousObservance,
  motherTongue,
  languagesSpoken,
  maritalStatus,
  bloodGroup,
  referralSource,
  dateOfBirth,
  believesInKundali,
  casteComfort,
  caste,
}: IdentitySnapshotProps) {
  return (
    <Section title="Identity Snapshot" icon={<IconPerson />}>
      <Grid>
        <Field label="Religion" value={religion} />
        <Field label="Observance" value={formatEnum(religiousObservance)} />
        <Field label="Mother Tongue" value={motherTongue} />
        <Field label="Languages" value={languagesSpoken.length > 0 ? languagesSpoken.join(', ') : null} />
        <Field label="Marital Status" value={formatEnum(maritalStatus)} />
        <Field label="Blood Group" value={bloodGroup} />
        <Field label="Date of Birth" value={dateOfBirth ? new Date(dateOfBirth).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null} />
        <Field label="Referral Source" value={formatEnum(referralSource)} />
        <Field label="Believes in Kundali" value={believesInKundali === null ? null : believesInKundali ? 'Yes' : 'No'} />
        <Field label="Caste Comfort" value={casteComfort === null ? null : casteComfort ? 'Yes' : 'No'} />
        {caste && <Field label="Caste" value={caste} />}
      </Grid>
    </Section>
  );
}

// Shared helpers used across profile blocks

const IconPerson = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

export function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon && (
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
          )}
          <span className="text-sm font-semibold text-foreground">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-6 gap-y-4 lg:grid-cols-3">{children}</div>;
}

export function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{value || '—'}</p>
    </div>
  );
}

const ACRONYMS = new Set(['ug', 'pg', 'md', 'ms', 'dm', 'mch', 'mbbs', 'bds', 'dnb', 'nri', 'bgv', 'obc', 'sc', 'st', 'gen']);

export function formatEnum(val: string | null | undefined): string | null {
  if (!val) return null;
  return val
    .replace(/_/g, ' ')
    .split(' ')
    .map((word) => ACRONYMS.has(word.toLowerCase()) ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
