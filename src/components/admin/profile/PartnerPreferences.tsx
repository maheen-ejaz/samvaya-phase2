import { Section, Grid, Field, formatEnum } from './IdentitySnapshot';

interface PartnerPreferencesProps {
  ageMin: number | null;
  ageMax: number | null;
  heightMinCm: number | null;
  heightMaxCm: number | null;
  prefersSpecificSpecialty: boolean | null;
  preferredSpecialties: string[];
  preferredCareerStage: string[];
  preferredIndianStates: string[];
  preferredCountries: string[];
  noLocationPreference: boolean;
  preferredMotherTongue: string[];
  bodyTypePreference: string[];
  attirePreference: string | null;
  dietPreference: string[];
  fitnessPreference: string | null;
  smokingPreference: string | null;
  drinkingPreference: string | null;
  tattooPreference: string | null;
  familyTypePreference: string | null;
  religiousObservancePreference: string | null;
  partnerCareerExpectation: string | null;
  partnerQualities: string[];
  partnerQualitiesOther: string | null;
}

export function PartnerPreferences(props: PartnerPreferencesProps) {
  const ageRange = props.ageMin || props.ageMax
    ? `${props.ageMin || '?'}–${props.ageMax || '?'} years`
    : null;

  const heightRange = props.heightMinCm || props.heightMaxCm
    ? `${props.heightMinCm || '?'}–${props.heightMaxCm || '?'} cm`
    : null;

  const locationStr = props.noLocationPreference
    ? 'No preference'
    : [...(props.preferredIndianStates || []), ...(props.preferredCountries || [])].join(', ') || null;

  return (
    <Section title="Partner Preferences">
      <Grid>
        <Field label="Age Range" value={ageRange} />
        <Field label="Height Range" value={heightRange} />
        <Field label="Specific Specialty" value={props.prefersSpecificSpecialty === null ? null : props.prefersSpecificSpecialty ? 'Yes' : 'No'} />
        {props.preferredSpecialties.length > 0 && (
          <Field label="Preferred Specialties" value={props.preferredSpecialties.join(', ')} />
        )}
        <Field label="Career Stage" value={props.preferredCareerStage.map(s => formatEnum(s)).join(', ') || null} />
        <Field label="Location" value={locationStr} />
        <Field label="Mother Tongue" value={props.preferredMotherTongue.join(', ') || null} />
        <Field label="Body Type" value={props.bodyTypePreference.join(', ') || null} />
        <Field label="Attire" value={formatEnum(props.attirePreference)} />
        <Field label="Diet" value={props.dietPreference.join(', ') || null} />
        <Field label="Fitness" value={formatEnum(props.fitnessPreference)} />
        <Field label="Smoking" value={formatEnum(props.smokingPreference)} />
        <Field label="Drinking" value={formatEnum(props.drinkingPreference)} />
        <Field label="Tattoos" value={formatEnum(props.tattooPreference)} />
        <Field label="Family Type" value={formatEnum(props.familyTypePreference)} />
        <Field label="Religious Observance" value={formatEnum(props.religiousObservancePreference)} />
        <Field label="Career Expectation" value={formatEnum(props.partnerCareerExpectation)} />
      </Grid>

      {/* Qualities */}
      {props.partnerQualities.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs text-gray-400">Top Qualities</p>
          <div className="flex flex-wrap gap-2">
            {props.partnerQualities.map((q) => (
              <span
                key={q}
                className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
              >
                {q}
              </span>
            ))}
          </div>
          {props.partnerQualitiesOther && (
            <p className="mt-2 text-sm text-gray-600">{props.partnerQualitiesOther}</p>
          )}
        </div>
      )}
    </Section>
  );
}
