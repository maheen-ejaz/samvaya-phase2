import { Section, Grid, Field } from './IdentitySnapshot';

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
    <Section title="Family Background">
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
