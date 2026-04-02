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
    <Section title="Identity Snapshot">
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

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h3 className="mb-4 text-lg font-medium text-gray-900">{title}</h3>
      {children}
    </div>
  );
}

export function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-6 gap-y-3 lg:grid-cols-3">{children}</div>;
}

export function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs text-gray-400">{label}</dt>
      <dd className="mt-0.5 text-sm text-gray-900">{value || '—'}</dd>
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
