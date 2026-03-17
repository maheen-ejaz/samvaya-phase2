'use client';

import { getQuestionsForStep } from '@/lib/form/navigation';
import { useForm } from './FormProvider';
import { TextInput } from './inputs/TextInput';
import { PhoneInput } from './inputs/PhoneInput';
import { SelectInput } from './inputs/SelectInput';
import { MultiSelectInput } from './inputs/MultiSelectInput';
import { GroupedMultiSelectInput } from './inputs/GroupedMultiSelectInput';
import { DateInput } from './inputs/DateInput';
import { TimeInput } from './inputs/TimeInput';
import { NumberInput } from './inputs/NumberInput';
import { RangeInput } from './inputs/RangeInput';
import { IllustratedMCInput } from './inputs/IllustratedMCInput';
import { FileUploadInput } from './inputs/FileUploadInput';
import { GuidedPhotoUpload } from './inputs/GuidedPhotoUpload';
import { ChatInterface } from './inputs/ChatInterface';
import { TimelineInput } from './inputs/TimelineInput';
import { AutocompleteInput } from './inputs/AutocompleteInput';
import { ComboboxInput } from './inputs/ComboboxInput';
import { TagInput } from './inputs/TagInput';
import { BgvConsentInput } from './inputs/BgvConsentInput';
import { DualLocationInput } from './inputs/DualLocationInput';
import type { DualLocationValue } from './inputs/DualLocationInput';
import { InternationalLocationInput } from './inputs/InternationalLocationInput';
import type { InternationalLocationValue } from './inputs/InternationalLocationInput';
import type { QuestionConfig, QuestionOption } from '@/lib/form/types';
import type { ChatState } from '@/lib/claude/types';
import { getQuestion } from '@/lib/form/questions';

export function QuestionRenderer() {
  const { state, chatState, setAnswer, navigateNext, submitForm } = useForm();
  const currentId = state.visibleQuestions[state.currentQuestionIndex];
  const isLastQuestion = state.currentQuestionIndex === state.visibleQuestions.length - 1;

  if (!currentId) return null;

  const questionsToRender = getQuestionsForStep(currentId);

  return (
    <div className="space-y-6">
      {questionsToRender.map((question) => {
        // Chat questions get their own full-width layout — no label wrapper
        if (question.type === 'claude_chat') {
          const savedChatState = chatState[question.id] as ChatState | undefined;
          // Only Q100 (the closing chat) triggers form submission
          const isLastChat = question.id === 'Q100';
          return (
            <ChatInterface
              key={question.id}
              question={question}
              initialChatState={savedChatState || null}
              onComplete={isLastChat ? () => { submitForm(); } : navigateNext}
              completeButtonLabel={isLastChat ? 'Submit your application' : undefined}
            />
          );
        }

        // BGV consent gets its own rich layout — bypass QuestionField wrapper
        if (question.type === 'bgv_consent') {
          return (
            <BgvConsentInput
              key={question.id}
              question={question}
              value={(state.answers[question.id] as string) || ''}
              onChange={(value) => setAnswer(question.id, value)}
            />
          );
        }

        return (
          <QuestionField
            key={question.id}
            question={question}
            value={state.answers[question.id]}
            onChange={(value) => setAnswer(question.id, value)}
          />
        );
      })}
    </div>
  );
}

interface QuestionFieldProps {
  question: QuestionConfig;
  value: unknown;
  onChange: (value: unknown) => void;
}

function QuestionField({ question, value, onChange }: QuestionFieldProps) {
  return (
    <div>
      <label className="mb-3 block text-lg font-medium text-gray-900">
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
    </div>
  );
}

interface InputSwitchProps {
  question: QuestionConfig;
  value: unknown;
  onChange: (value: unknown) => void;
}

function InputSwitch({ question, value, onChange }: InputSwitchProps) {
  const { state } = useForm();

  // Dynamic options: derive from another question's selected answers
  if (question.dynamicOptionsFrom) {
    const sourceAnswer = state.answers[question.dynamicOptionsFrom] as string[] | undefined;
    const sourceQuestion = getQuestion(question.dynamicOptionsFrom);
    const derivedOptions: QuestionOption[] = (sourceAnswer || [])
      .map((v) => sourceQuestion?.options?.find((o) => o.value === v))
      .filter((o): o is QuestionOption => !!o);
    const derived = { ...question, options: derivedOptions };
    // Clean stale selections: remove any values no longer in source
    const currentValue = (value as string[]) || [];
    const validValues = new Set(derivedOptions.map((o) => o.value));
    const cleanedValue = currentValue.filter((v) => validValues.has(v));
    return (
      <MultiSelectInput
        question={derived}
        value={cleanedValue}
        onChange={onChange as (value: string[]) => void}
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

    case 'phone':
      return (
        <PhoneInput
          question={question}
          value={(value as string) || ''}
          onChange={onChange}
        />
      );

    case 'select':
      if (question.searchable) {
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
      if (question.searchable) {
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

    case 'guided_photo_upload':
      return <GuidedPhotoUpload question={question} value={value} onChange={onChange} />;

    case 'claude_chat':
      // Handled directly in QuestionRenderer — should not reach here
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
      return <p className="text-gray-500">Unsupported question type</p>;
  }
}
