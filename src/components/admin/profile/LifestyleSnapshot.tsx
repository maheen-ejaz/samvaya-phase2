import { Section, Grid, Field, formatEnum } from './IdentitySnapshot';

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
    <Section title="Lifestyle">
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
