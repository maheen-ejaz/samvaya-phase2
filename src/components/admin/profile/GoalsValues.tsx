import { Section, Grid, Field, formatEnum } from './IdentitySnapshot';

const IconGoals = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

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
    <Section title="Goals & Values" icon={<IconGoals />}>
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
