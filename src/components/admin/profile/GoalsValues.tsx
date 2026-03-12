import { Section, Grid, Field, formatEnum } from './IdentitySnapshot';

interface GoalsValuesProps {
  marriageTimeline: string | null;
  longDistanceComfort: string | null;
  familyArrangement: string | null;
  workingExpectation: string | null;
  wantsChildren: string | null;
  childrenCount: string | null;
  childrenTiming: string | null;
  openToPartnerWithChildren: string | null;
  settlementCountries: string[];
  relocationOpenness: string | null;
  plansToGoAbroad: boolean | null;
  abroadCountries: string[];
}

export function GoalsValues({
  marriageTimeline,
  longDistanceComfort,
  familyArrangement,
  workingExpectation,
  wantsChildren,
  childrenCount,
  childrenTiming,
  openToPartnerWithChildren,
  settlementCountries,
  relocationOpenness,
  plansToGoAbroad,
  abroadCountries,
}: GoalsValuesProps) {
  return (
    <Section title="Goals & Values">
      <Grid>
        <Field label="Marriage Timeline" value={formatEnum(marriageTimeline)} />
        <Field label="Long Distance" value={formatEnum(longDistanceComfort)} />
        <Field label="Family Arrangement" value={formatEnum(familyArrangement)} />
        <Field label="Both Working" value={formatEnum(workingExpectation)} />
        <Field label="Wants Children" value={formatEnum(wantsChildren)} />
        {childrenCount && <Field label="Children Count" value={formatEnum(childrenCount)} />}
        {childrenTiming && <Field label="Children Timing" value={formatEnum(childrenTiming)} />}
        {openToPartnerWithChildren && <Field label="Open to Partner w/ Children" value={formatEnum(openToPartnerWithChildren)} />}
        <Field label="Settlement Countries" value={settlementCountries.join(', ') || null} />
        <Field label="Relocation" value={formatEnum(relocationOpenness)} />
        <Field label="Plans to Go Abroad" value={plansToGoAbroad === null ? null : plansToGoAbroad ? 'Yes' : 'No'} />
        {abroadCountries.length > 0 && <Field label="Abroad Countries" value={abroadCountries.join(', ')} />}
      </Grid>
    </Section>
  );
}
