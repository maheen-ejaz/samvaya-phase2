import { Section } from './IdentitySnapshot';

const IconInterests = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

interface InterestsBlockProps {
  hobbies: string[];
  hobbiesRegular: string[] | string | null;
}

export function InterestsBlock({ hobbies, hobbiesRegular }: InterestsBlockProps) {
  const regularList = Array.isArray(hobbiesRegular)
    ? hobbiesRegular
    : hobbiesRegular
      ? [hobbiesRegular]
      : [];

  return (
    <Section title="Interests" icon={<IconInterests />}>
      {hobbies.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {hobbies.map((h) => (
            <span
              key={h}
              className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
            >
              {h}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400">No hobbies listed</p>
      )}
      {regularList.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-gray-400">What they regularly spend time on</p>
          <div className="mt-1 flex flex-wrap gap-2">
            {regularList.map((h) => (
              <span
                key={h}
                className="rounded-full bg-rose-100 px-3 py-1 text-sm font-medium text-rose-700"
              >
                {h}
              </span>
            ))}
          </div>
        </div>
      )}
    </Section>
  );
}
