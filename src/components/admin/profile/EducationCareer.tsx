import { Section, Grid, Field, formatEnum } from './IdentitySnapshot';
import type { WorkExperienceEntry } from '@/lib/form/types';

const IconEducation = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path d="M12 14l9-5-9-5-9 5 9 5z" />
    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
  </svg>
);

interface EducationCareerProps {
  medicalStatus: string | null;
  pgPlans: string | null;
  additionalQualifications: string[];
  specialty: string[];
  hasWorkExperience: boolean | null;
  workExperience: WorkExperienceEntry[];
  currentDesignation: string | null;
  totalExperienceMonths: number | null;
  linkedinUrl: string | null;
  instagramHandle: string | null;
}

export function EducationCareer({
  medicalStatus,
  pgPlans,
  additionalQualifications,
  specialty,
  hasWorkExperience,
  workExperience,
  currentDesignation,
  totalExperienceMonths,
  linkedinUrl,
  instagramHandle,
}: EducationCareerProps) {
  const expYears = totalExperienceMonths ? Math.floor(totalExperienceMonths / 12) : null;
  const expMonths = totalExperienceMonths ? totalExperienceMonths % 12 : null;
  const expStr = expYears !== null
    ? `${expYears}y${expMonths ? ` ${expMonths}m` : ''}`
    : null;

  return (
    <Section title="Education & Career" icon={<IconEducation />}>
      <Grid>
        <Field label="Medical Status" value={formatEnum(medicalStatus)} />
        {pgPlans && <Field label="PG Plans" value={formatEnum(pgPlans)} />}
        <Field label="Specialty" value={specialty.join(', ') || null} />
        <Field label="Additional Qualifications" value={additionalQualifications.join(', ') || null} />
        <Field label="Current Designation" value={currentDesignation} />
        <Field label="Total Experience" value={expStr} />
        {linkedinUrl && (
          <div>
            <dt className="text-xs text-muted-foreground">LinkedIn</dt>
            <dd className="mt-0.5 text-sm">
              <a href={linkedinUrl.startsWith('http') ? linkedinUrl : `https://${linkedinUrl}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{linkedinUrl}</a>
            </dd>
          </div>
        )}
        {instagramHandle && (
          <div>
            <dt className="text-xs text-muted-foreground">Instagram</dt>
            <dd className="mt-0.5 text-sm">
              <a href={`https://instagram.com/${instagramHandle.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@{instagramHandle.replace(/^@/, '')}</a>
            </dd>
          </div>
        )}
      </Grid>

      {/* Work Timeline */}
      {hasWorkExperience && workExperience.length > 0 && (
        <div className="mt-4">
          <h4 className="mb-2 text-xs font-medium text-muted-foreground">Work Experience</h4>
          <div className="space-y-2">
            {workExperience.map((entry, i) => (
              <div key={i} className="rounded border border-border bg-muted px-3 py-2 text-sm">
                <span className="font-medium text-foreground">{entry.designation}</span>
                <span className="text-muted-foreground"> at {entry.org_name}</span>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {entry.start_month}/{entry.start_year}
                  {' — '}
                  {entry.is_current ? 'Present' : `${entry.end_month}/${entry.end_year}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Section>
  );
}
