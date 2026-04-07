import { Section } from './IdentitySnapshot';

const IconAI = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

interface PersonalitySummaryProps {
  aiSummary: string | null;
  compatibilityKeywords: string[];
}

export function PersonalitySummary({ aiSummary, compatibilityKeywords }: PersonalitySummaryProps) {
  return (
    <Section title="AI Personality Summary" icon={<IconAI />}>
      {aiSummary ? (
        <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">{aiSummary}</p>
      ) : (
        <p className="text-sm text-gray-400">No AI summary generated yet.</p>
      )}
      {compatibilityKeywords.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs text-gray-400">Compatibility Keywords</p>
          <div className="flex flex-wrap gap-2">
            {compatibilityKeywords.map((kw) => (
              <span
                key={kw}
                className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </Section>
  );
}
