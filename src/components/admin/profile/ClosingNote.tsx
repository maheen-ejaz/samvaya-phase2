import { Section } from './IdentitySnapshot';

interface ClosingNoteProps {
  closingNote: string | null;
}

export function ClosingNote({ closingNote }: ClosingNoteProps) {
  return (
    <Section title="Closing Note (Q100)">
      {closingNote ? (
        <blockquote className="border-l-2 border-border pl-3 text-sm italic text-muted-foreground">
          {closingNote}
        </blockquote>
      ) : (
        <p className="text-sm text-muted-foreground">No closing note recorded.</p>
      )}
    </Section>
  );
}
