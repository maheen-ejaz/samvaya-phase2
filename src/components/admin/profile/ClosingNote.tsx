import { Section } from './IdentitySnapshot';

interface ClosingNoteProps {
  closingNote: string | null;
}

export function ClosingNote({ closingNote }: ClosingNoteProps) {
  return (
    <Section title="Closing Note (Q100)">
      {closingNote ? (
        <blockquote className="border-l-2 border-gray-300 pl-3 text-sm italic text-gray-700">
          {closingNote}
        </blockquote>
      ) : (
        <p className="text-sm text-gray-400">No closing note recorded.</p>
      )}
    </Section>
  );
}
