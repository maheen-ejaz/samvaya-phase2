'use client';

import type { QuestionConfig } from '@/lib/form/types';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface DateInputProps {
  question: QuestionConfig;
  value: string;
  onChange: (value: string) => void;
  inputId?: string;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
}

export function DateInput({ question, value, onChange, inputId, ariaDescribedBy, ariaInvalid }: DateInputProps) {
  // For date_of_birth (Q9), constrain to reasonable age range for medical professionals
  const isDateOfBirth = question.targetColumn === 'date_of_birth';
  const today = new Date();
  const minDate = isDateOfBirth
    ? `${today.getFullYear() - 55}-01-01`
    : undefined;
  const maxDate = isDateOfBirth
    ? `${today.getFullYear() - 22}-12-31`
    : undefined;

  // Calculate age for date of birth
  let age: number | null = null;
  if (isDateOfBirth && value) {
    const birth = new Date(value);
    const diff = today.getFullYear() - birth.getFullYear();
    const hadBirthday =
      today.getMonth() > birth.getMonth() ||
      (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
    age = hadBirthday ? diff : diff - 1;
  }

  return (
    <div>
      <Input
        id={inputId}
        type="date"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={question.placeholder}
        min={minDate}
        max={maxDate}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid || undefined}
        className={cn(
          'h-11 rounded-xl border-input bg-transparent px-4 text-[15px]',
          'focus-visible:ring-primary/30',
        )}
      />
      {age !== null && age > 0 && (
        <p className="mt-2 text-sm text-muted-foreground">
          Age: <span className="font-medium text-foreground">{age} years</span>
        </p>
      )}
    </div>
  );
}
