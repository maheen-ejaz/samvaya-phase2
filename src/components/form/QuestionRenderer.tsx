'use client';

import { getQuestionsForStep } from '@/lib/form/navigation';
import { useForm } from './FormProvider';
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
import { ChatInterface } from './inputs/ChatInterface';
import { TimelineInput } from './inputs/TimelineInput';
import { AutocompleteInput } from './inputs/AutocompleteInput';
import type { QuestionConfig } from '@/lib/form/types';
import type { ChatState } from '@/lib/claude/types';

export function QuestionRenderer() {
  const { state, chatState, setAnswer, navigateNext } = useForm();
  const currentId = state.visibleQuestions[state.currentQuestionIndex];

  if (!currentId) return null;

  const questionsToRender = getQuestionsForStep(currentId);

  return (
    <div className="space-y-6">
      {questionsToRender.map((question) => {
        // Chat questions get their own full-width layout — no label wrapper
        if (question.type === 'claude_chat') {
          const savedChatState = chatState[question.id] as ChatState | undefined;
          return (
            <ChatInterface
              key={question.id}
              question={question}
              initialChatState={savedChatState || null}
              onComplete={navigateNext}
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
          <span className="ml-1 text-sm font-normal text-gray-400">(optional)</span>
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
      return <FileUploadInput question={question} />;

    case 'claude_chat':
      // Handled directly in QuestionRenderer — should not reach here
      return null;

    case 'timeline':
      return <TimelineInput question={question} value={value} onChange={onChange} />;

    default:
      return <p className="text-gray-500">Unsupported question type</p>;
  }
}
