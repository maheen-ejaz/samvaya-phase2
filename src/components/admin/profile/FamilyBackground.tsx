import { Section, Grid, Field } from './IdentitySnapshot';

const IconFamily = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

interface FamilyBackgroundProps {
  fatherName: string | null;
  fatherOccupation: string | null;
  motherName: string | null;
  motherOccupation: string | null;
  siblingsCount: number | null;
  keyQuote: string | null;
}

export function FamilyBackground({
  fatherName,
  fatherOccupation,
  motherName,
  motherOccupation,
  siblingsCount,
  keyQuote,
}: FamilyBackgroundProps) {
  return (
    <Section title="Family Background" icon={<IconFamily />}>
      <Grid>
        <Field label="Father" value={fatherName} />
        <Field label="Father's Occupation" value={fatherOccupation} />
        <Field label="Mother" value={motherName} />
        <Field label="Mother's Occupation" value={motherOccupation} />
        <Field label="Siblings" value={siblingsCount !== null ? String(siblingsCount) : null} />
      </Grid>
      {keyQuote && (
        <blockquote className="mt-4 border-l-2 border-rose-300 pl-3 text-sm italic text-gray-600">
          &ldquo;{keyQuote}&rdquo;
        </blockquote>
      )}
    </Section>
  );
}
