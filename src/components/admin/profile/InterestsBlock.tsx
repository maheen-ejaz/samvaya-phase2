import { Section } from './IdentitySnapshot';

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
    <Section title="Interests">
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
