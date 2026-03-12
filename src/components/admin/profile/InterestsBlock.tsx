import { Section } from './IdentitySnapshot';

interface InterestsBlockProps {
  hobbies: string[];
  hobbiesRegular: string | null;
}

export function InterestsBlock({ hobbies, hobbiesRegular }: InterestsBlockProps) {
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
      {hobbiesRegular && (
        <div className="mt-3">
          <p className="text-xs text-gray-400">What they regularly spend time on</p>
          <p className="mt-0.5 text-sm text-gray-700">{hobbiesRegular}</p>
        </div>
      )}
    </Section>
  );
}
