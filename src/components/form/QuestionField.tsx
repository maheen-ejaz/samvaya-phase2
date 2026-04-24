'use client';

import { BgvConsentInput } from './inputs/BgvConsentInput';
import { TextInput } from './inputs/TextInput';
import { PhoneInput } from './inputs/PhoneInput';
import { SelectInput } from './inputs/SelectInput';
import { StageSelector } from './inputs/StageSelector';
import { MultiSelectInput } from './inputs/MultiSelectInput';
import { GroupedMultiSelectInput } from './inputs/GroupedMultiSelectInput';
import { DateInput } from './inputs/DateInput';
import { TimeInput } from './inputs/TimeInput';
import { NumberInput } from './inputs/NumberInput';
import { RangeInput } from './inputs/RangeInput';
import { IllustratedMCInput } from './inputs/IllustratedMCInput';
import { FileUploadInput } from './inputs/FileUploadInput';
import { GuidedPhotoUpload } from './inputs/GuidedPhotoUpload';
import { TimelineInput } from './inputs/TimelineInput';
import { AutocompleteInput } from './inputs/AutocompleteInput';
import { ComboboxInput } from './inputs/ComboboxInput';
import { TagInput } from './inputs/TagInput';
import { DualLocationInput } from './inputs/DualLocationInput';
import type { DualLocationValue } from './inputs/DualLocationInput';
import { InternationalLocationInput } from './inputs/InternationalLocationInput';
import type { InternationalLocationValue } from './inputs/InternationalLocationInput';
import { useForm } from './FormProvider';
import { getQuestion } from '@/lib/form/questions';
import type { QuestionConfig, QuestionOption } from '@/lib/form/types';
import { Label } from '@/components/ui/label';

interface QuestionFieldProps {
  question: QuestionConfig;
  value: unknown;
  onChange: (value: unknown) => void;
  hasError?: boolean;
}

export function QuestionField({ question, value, onChange, hasError }: QuestionFieldProps) {
  const inputId = `input-${question.id}`;
  const errorId = `${inputId}-error`;
  const helpId = `${inputId}-help`;
  const hasHelpText = !!question.helpText;

  // Build aria-describedby from present elements
  const describedByParts: string[] = [];
  if (hasError) describedByParts.push(errorId);
  if (hasHelpText) describedByParts.push(helpId);
  const ariaDescribedBy = describedByParts.length > 0 ? describedByParts.join(' ') : undefined;

  return (
    <div id={question.id}>
      <div className="mb-1.5 flex items-baseline gap-1.5">
        <Label htmlFor={inputId} className="form-label">
          {question.text}
        </Label>
        {!question.required && (
          <span className="text-xs font-normal text-[color:var(--color-form-text-muted)]">
            Optional
          </span>
        )}
      </div>

      {hasHelpText && (
        <p id={helpId} className="form-helper mb-3">
          {question.helpText}
        </p>
      )}

      <InputSwitch
        question={question}
        value={value}
        onChange={onChange}
        inputId={inputId}
        ariaDescribedBy={ariaDescribedBy}
        ariaInvalid={hasError}
      />

      {hasError && (
        <p id={errorId} role="alert" aria-live="assertive" className="form-error mt-2">
          This field is required
        </p>
      )}
    </div>
  );
}

interface InputSwitchProps {
  question: QuestionConfig;
  value: unknown;
  onChange: (value: unknown) => void;
  inputId?: string;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
}

export function InputSwitch({ question, value, onChange, inputId, ariaDescribedBy, ariaInvalid }: InputSwitchProps) {
  const { state } = useForm();

  // Dynamic options: derive from another question's selected answers
  if (question.dynamicOptionsFrom) {
    const raw = state.answers[question.dynamicOptionsFrom];
    const sourceAnswer = Array.isArray(raw) ? (raw as string[]) : undefined;
    const sourceQuestion = getQuestion(question.dynamicOptionsFrom);
    const derivedOptions: QuestionOption[] = (sourceAnswer || [])
      .map((v) => sourceQuestion?.options?.find((o) => o.value === v))
      .filter((o): o is QuestionOption => !!o);
    const derived = { ...question, options: derivedOptions };
    const currentValue = Array.isArray(value) ? (value as string[]) : [];
    const validValues = new Set(derivedOptions.map((o) => o.value));
    const cleanedValue = currentValue.filter((v) => validValues.has(v));
    return (
      <MultiSelectInput
        question={derived}
        value={cleanedValue}
        onChange={onChange as (value: string[]) => void}
        inputId={inputId}
        ariaDescribedBy={ariaDescribedBy}
        ariaInvalid={ariaInvalid}
      />
    );
  }

  switch (question.type) {
    case 'text':
    case 'email':
      if (question.type === 'text' && question.autocompleteSource) {
        return (
          <AutocompleteInput
            question={question}
            value={(value as string) || ''}
            onChange={onChange}
            inputId={inputId}
            ariaDescribedBy={ariaDescribedBy}
            ariaInvalid={ariaInvalid}
          />
        );
      }
      return (
        <TextInput
          question={question}
          value={(value as string) || ''}
          onChange={onChange}
          disabled={question.type === 'email' && question.targetTable === 'auth_users'}
          inputId={inputId}
          ariaDescribedBy={ariaDescribedBy}
          ariaInvalid={ariaInvalid}
        />
      );

    case 'phone':
      return (
        <PhoneInput
          question={question}
          value={(value as string) || ''}
          onChange={onChange}
          inputId={inputId}
          ariaDescribedBy={ariaDescribedBy}
          ariaInvalid={ariaInvalid}
        />
      );

    case 'stage_selector':
      return (
        <StageSelector
          question={question}
          value={(value as string) || ''}
          onChange={onChange}
          inputId={inputId}
          ariaDescribedBy={ariaDescribedBy}
          ariaInvalid={ariaInvalid}
        />
      );

    case 'select':
      if (question.searchable || question.optionsSource) {
        return (
          <ComboboxInput
            question={question}
            value={(value as string) || ''}
            onChange={onChange}
            inputId={inputId}
            ariaDescribedBy={ariaDescribedBy}
            ariaInvalid={ariaInvalid}
          />
        );
      }
      return (
        <SelectInput
          question={question}
          value={(value as string) || ''}
          onChange={onChange}
          inputId={inputId}
          ariaDescribedBy={ariaDescribedBy}
          ariaInvalid={ariaInvalid}
        />
      );

    case 'illustrated_mc':
      return (
        <IllustratedMCInput
          question={question}
          value={(value as string) || ''}
          onChange={onChange}
          inputId={inputId}
          ariaDescribedBy={ariaDescribedBy}
          ariaInvalid={ariaInvalid}
        />
      );

    case 'multi_select': {
      const arrValue = Array.isArray(value) ? (value as string[]) : [];
      if (question.optionGroups?.length) {
        return (
          <GroupedMultiSelectInput
            question={question}
            value={arrValue}
            onChange={onChange}
            inputId={inputId}
            ariaDescribedBy={ariaDescribedBy}
            ariaInvalid={ariaInvalid}
          />
        );
      }
      if (question.searchable || question.optionsSource) {
        return (
          <TagInput
            question={question}
            value={arrValue}
            onChange={onChange}
            inputId={inputId}
            ariaDescribedBy={ariaDescribedBy}
            ariaInvalid={ariaInvalid}
          />
        );
      }
      return (
        <MultiSelectInput
          question={question}
          value={arrValue}
          onChange={onChange}
          inputId={inputId}
          ariaDescribedBy={ariaDescribedBy}
          ariaInvalid={ariaInvalid}
        />
      );
    }

    case 'date':
      return (
        <DateInput
          question={question}
          value={(value as string) || ''}
          onChange={onChange}
          inputId={inputId}
          ariaDescribedBy={ariaDescribedBy}
          ariaInvalid={ariaInvalid}
        />
      );

    case 'time':
      return (
        <TimeInput
          question={question}
          value={(value as string) || ''}
          onChange={onChange}
          inputId={inputId}
          ariaDescribedBy={ariaDescribedBy}
          ariaInvalid={ariaInvalid}
        />
      );

    case 'number':
      return (
        <NumberInput
          question={question}
          value={(value as number | string) ?? ''}
          onChange={onChange}
          inputId={inputId}
          ariaDescribedBy={ariaDescribedBy}
          ariaInvalid={ariaInvalid}
        />
      );

    case 'range':
      return (
        <RangeInput
          question={question}
          value={(value as [number | null, number | null]) || [null, null]}
          onChange={onChange}
          inputId={inputId}
          ariaDescribedBy={ariaDescribedBy}
          ariaInvalid={ariaInvalid}
        />
      );

    case 'file_upload':
      return <FileUploadInput question={question} value={value} onChange={onChange} />;

    case 'guided_photo_upload':
      return <GuidedPhotoUpload question={question} value={value} onChange={onChange} />;

    case 'claude_chat':
      return null;

    case 'bgv_consent':
      return (
        <BgvConsentInput
          question={question}
          value={(value as string) || ''}
          onChange={onChange as (value: string) => void}
        />
      );

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
      return <p className="text-muted-foreground">Unsupported question type</p>;
  }
}
