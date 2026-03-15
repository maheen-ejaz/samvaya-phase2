'use client';

import { TextInput } from './inputs/TextInput';
import { SelectInput } from './inputs/SelectInput';
import { MultiSelectInput } from './inputs/MultiSelectInput';
import { GroupedMultiSelectInput } from './inputs/GroupedMultiSelectInput';
import { DateInput } from './inputs/DateInput';
import { TimeInput } from './inputs/TimeInput';
import { NumberInput } from './inputs/NumberInput';
import { RangeInput } from './inputs/RangeInput';
import { IllustratedMCInput } from './inputs/IllustratedMCInput';
import { FileUploadInput } from './inputs/FileUploadInput';
import { TimelineInput } from './inputs/TimelineInput';
import { AutocompleteInput } from './inputs/AutocompleteInput';
import { ComboboxInput } from './inputs/ComboboxInput';
import { TagInput } from './inputs/TagInput';
import { DualLocationInput } from './inputs/DualLocationInput';
import type { DualLocationValue } from './inputs/DualLocationInput';
import { InternationalLocationInput } from './inputs/InternationalLocationInput';
import type { InternationalLocationValue } from './inputs/InternationalLocationInput';
import type { QuestionConfig } from '@/lib/form/types';

interface QuestionFieldProps {
  question: QuestionConfig;
  value: unknown;
  onChange: (value: unknown) => void;
  hasError?: boolean;
}

export function QuestionField({ question, value, onChange, hasError }: QuestionFieldProps) {
  return (
    <div id={question.id}>
      <label className="mb-3 block text-lg font-medium tracking-wide text-gray-900">
        {question.text}
        {!question.required && (
          <span className="ml-1 text-sm font-normal text-gray-500">(optional)</span>
        )}
      </label>

      {question.helpText && (
        <p className="mb-3 text-sm text-gray-500">{question.helpText}</p>
      )}

      <InputSwitch
        question={question}
        value={value}
        onChange={onChange}
      />

      {hasError && (
        <p className="mt-2 text-sm text-red-600">This field is required</p>
      )}
    </div>
  );
}

interface InputSwitchProps {
  question: QuestionConfig;
  value: unknown;
  onChange: (value: unknown) => void;
}

export function InputSwitch({ question, value, onChange }: InputSwitchProps) {
  switch (question.type) {
    case 'text':
    case 'email':
    case 'phone':
      if (question.type === 'text' && question.autocompleteSource) {
        return (
          <AutocompleteInput
            question={question}
            value={(value as string) || ''}
            onChange={onChange}
          />
        );
      }
      return (
        <TextInput
          question={question}
          value={(value as string) || ''}
          onChange={onChange}
          disabled={question.type === 'email' && question.targetTable === 'auth_users'}
        />
      );

    case 'select':
      if (question.searchable || question.optionsSource) {
        return (
          <ComboboxInput
            question={question}
            value={(value as string) || ''}
            onChange={onChange}
          />
        );
      }
      return (
        <SelectInput
          question={question}
          value={(value as string) || ''}
          onChange={onChange}
        />
      );

    case 'illustrated_mc':
      return (
        <IllustratedMCInput
          question={question}
          value={(value as string) || ''}
          onChange={onChange}
        />
      );

    case 'multi_select':
      if (question.optionGroups?.length) {
        return (
          <GroupedMultiSelectInput
            question={question}
            value={(value as string[]) || []}
            onChange={onChange}
          />
        );
      }
      if (question.searchable || question.optionsSource) {
        return (
          <TagInput
            question={question}
            value={(value as string[]) || []}
            onChange={onChange}
          />
        );
      }
      return (
        <MultiSelectInput
          question={question}
          value={(value as string[]) || []}
          onChange={onChange}
        />
      );

    case 'date':
      return (
        <DateInput
          question={question}
          value={(value as string) || ''}
          onChange={onChange}
        />
      );

    case 'time':
      return (
        <TimeInput
          question={question}
          value={(value as string) || ''}
          onChange={onChange}
        />
      );

    case 'number':
      return (
        <NumberInput
          question={question}
          value={(value as number | string) ?? ''}
          onChange={onChange}
        />
      );

    case 'range':
      return (
        <RangeInput
          question={question}
          value={(value as [number | null, number | null]) || [null, null]}
          onChange={onChange}
        />
      );

    case 'file_upload':
      return <FileUploadInput question={question} value={value} onChange={onChange} />;

    case 'claude_chat':
      // Handled separately — should not reach here
      return null;

    case 'timeline':
      return <TimelineInput question={question} value={value} onChange={onChange} />;

    case 'dual_location':
      return (
        <DualLocationInput
          question={question}
          value={(value as DualLocationValue | null) || null}
          onChange={onChange}
        />
      );

    case 'international_location':
      return (
        <InternationalLocationInput
          question={question}
          value={(value as InternationalLocationValue | string | null) || null}
          onChange={onChange}
        />
      );

    default:
      return <p className="text-gray-500">Unsupported question type</p>;
  }
}
