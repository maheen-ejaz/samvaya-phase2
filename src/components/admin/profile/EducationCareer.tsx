import { Section, Grid, Field, formatEnum } from './IdentitySnapshot';
import type { WorkExperienceEntry } from '@/lib/form/types';

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
    <Section title="Education & Career">
      <Grid>
        <Field label="Medical Status" value={formatEnum(medicalStatus)} />
        {pgPlans && <Field label="PG Plans" value={formatEnum(pgPlans)} />}
        <Field label="Specialty" value={specialty.join(', ') || null} />
        <Field label="Additional Qualifications" value={additionalQualifications.join(', ') || null} />
        <Field label="Current Designation" value={currentDesignation} />
        <Field label="Total Experience" value={expStr} />
        {linkedinUrl && (
          <div>
            <dt className="text-xs text-gray-400">LinkedIn</dt>
            <dd className="mt-0.5 text-sm">
              <a href={linkedinUrl.startsWith('http') ? linkedinUrl : `https://${linkedinUrl}`} target="_blank" rel="noopener noreferrer" className="text-rose-700 hover:underline">{linkedinUrl}</a>
            </dd>
          </div>
        )}
        {instagramHandle && (
          <div>
            <dt className="text-xs text-gray-400">Instagram</dt>
            <dd className="mt-0.5 text-sm">
              <a href={`https://instagram.com/${instagramHandle.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer" className="text-rose-700 hover:underline">@{instagramHandle.replace(/^@/, '')}</a>
            </dd>
          </div>
        )}
      </Grid>

      {/* Work Timeline */}
      {hasWorkExperience && workExperience.length > 0 && (
        <div className="mt-4">
          <h4 className="mb-2 text-xs font-medium text-gray-500">Work Experience</h4>
          <div className="space-y-2">
            {workExperience.map((entry, i) => (
              <div key={i} className="rounded border border-gray-100 bg-gray-50 px-3 py-2 text-sm">
                <span className="font-medium text-gray-900">{entry.designation}</span>
                <span className="text-gray-500"> at {entry.org_name}</span>
                <div className="mt-0.5 text-xs text-gray-400">
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
