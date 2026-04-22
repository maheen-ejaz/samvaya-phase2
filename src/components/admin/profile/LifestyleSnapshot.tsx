import { Section, Grid, Field, formatEnum } from './IdentitySnapshot';

const IconLifestyle = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

interface LifestyleSnapshotProps {
  diet: string | null;
  attire: string | null;
  fitness: string | null;
  smoking: string | null;
  drinking: string | null;
  tattoos: string | null;
  disability: string | null;
  disabilityDescription: string | null;
  hasAllergies: boolean | null;
  allergyDescription: string | null;
}

export function LifestyleSnapshot({
  diet,
  attire,
  fitness,
  smoking,
  drinking,
  tattoos,
  disability,
  disabilityDescription,
  hasAllergies,
  allergyDescription,
}: LifestyleSnapshotProps) {
  return (
    <Section title="Lifestyle" icon={<IconLifestyle />}>
      <Grid>
        <Field label="Diet" value={formatEnum(diet)} />
        <Field label="Attire" value={formatEnum(attire)} />
        <Field label="Fitness" value={formatEnum(fitness)} />
        <Field label="Smoking" value={formatEnum(smoking)} />
        <Field label="Drinking" value={formatEnum(drinking)} />
        <Field label="Tattoos/Piercings" value={formatEnum(tattoos)} />
        <Field label="Disability" value={formatEnum(disability)} />
        {disabilityDescription && <Field label="Disability Details" value={disabilityDescription} />}
        <Field label="Allergies" value={hasAllergies === null ? null : hasAllergies ? 'Yes' : 'No'} />
        {allergyDescription && <Field label="Allergy Details" value={allergyDescription} />}
      </Grid>
    </Section>
  );
}
