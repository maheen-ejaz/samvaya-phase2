import { Section } from './IdentitySnapshot';
import { Badge } from '@/components/ui/badge';

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
        <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{aiSummary}</p>
      ) : (
        <p className="text-sm text-muted-foreground">No AI summary generated yet.</p>
      )}
      {compatibilityKeywords.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs text-muted-foreground">Compatibility Keywords</p>
          <div className="flex flex-wrap gap-2">
            {compatibilityKeywords.map((kw) => (
              <Badge key={kw} variant="outline">
                {kw}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Section>
  );
}
