import { Section } from './IdentitySnapshot';

interface PersonalitySummaryProps {
  aiSummary: string | null;
  compatibilityKeywords: string[];
}

export function PersonalitySummary({ aiSummary, compatibilityKeywords }: PersonalitySummaryProps) {
  return (
    <Section title="AI Personality Summary">
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
