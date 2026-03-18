'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { QuestionConfig } from '@/lib/form/types';
import type { ChatMessage, ChatResponse, ChatState } from '@/lib/claude/types';
import { CHAT_CONFIGS } from '@/lib/claude/prompts';

interface ChatInterfaceProps {
  question: QuestionConfig;
  initialChatState?: ChatState | null;
  onComplete: () => void | Promise<void> | Promise<boolean>;
  completeButtonLabel?: string;
}

export function ChatInterface({ question, initialChatState, onComplete, completeButtonLabel }: ChatInterfaceProps) {
  const chatId = question.id as 'Q38' | 'Q75' | 'Q100';
  const config = CHAT_CONFIGS[chatId];

  const [messages, setMessages] = useState<ChatMessage[]>(initialChatState?.messages || []);
  const [exchangeCount, setExchangeCount] = useState(initialChatState?.exchangeCount || 0);
  const [isComplete, setIsComplete] = useState(initialChatState?.isComplete || false);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionWarning, setExtractionWarning] = useState<string | null>(null);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hasInitialized = useRef(false);

  // Scroll chat container to bottom when messages change (without moving the page)
  useEffect(() => {
    requestAnimationFrame(() => {
      const container = messagesContainerRef.current;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    });
  }, [messages]);

  // Send the opening message on first mount (if no existing messages)
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    if (messages.length === 0 && !isComplete) {
      initiateConversation();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function initiateConversation() {
    setIsLoading(true);
    setError(null);

    try {
      // Send an empty "start" request — the system prompt tells Claude to open
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId,
          messages: [],
          userMessage: '[START_CONVERSATION]',
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to start conversation');
      }

      const data: ChatResponse = await res.json();

      const openingMessage: ChatMessage = {
        id: `assistant-${crypto.randomUUID()}`,
        role: 'assistant',
        content: data.assistantMessage,
        timestamp: new Date().toISOString(),
      };

      setMessages([openingMessage]);
    } catch {
      setError('Failed to start the conversation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  const runExtraction = useCallback(async (finalMessages: ChatMessage[]) => {
    setIsExtracting(true);

    const transcript = finalMessages
      .map((m) => `${m.role === 'assistant' ? 'Assistant' : 'User'}: ${m.content}`)
      .join('\n\n');

    try {
      const res = await fetch('/api/chat/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, transcript }),
      });
      if (!res.ok) {
        console.error('Extraction API error:', res.status);
        setExtractionWarning('Your conversation was saved, but data extraction encountered an issue. Our team will review it.');
      }
    } catch (err) {
      console.error('Extraction failed:', err);
      setExtractionWarning('Your conversation was saved, but data extraction encountered an issue. Our team will review it.');
    } finally {
      setIsExtracting(false);
    }
  }, [chatId]);

  const sendMessage = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || isLoading || isComplete) return;

    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId,
          messages,
          userMessage: text,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to send message');
      }

      const data: ChatResponse = await res.json();

      const userMsg: ChatMessage = {
        id: `user-${crypto.randomUUID()}`,
        role: 'user',
        content: text,
        timestamp: new Date().toISOString(),
      };

      const assistantMsg: ChatMessage = {
        id: `assistant-${crypto.randomUUID()}`,
        role: 'assistant',
        content: data.assistantMessage,
        timestamp: new Date().toISOString(),
      };

      const updatedMessages = [...messages, userMsg, assistantMsg];
      setMessages(updatedMessages);
      setExchangeCount(data.exchangeCount);

      if (data.isComplete) {
        setIsComplete(true);
        runExtraction(updatedMessages);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [inputValue, isLoading, isComplete, chatId, messages, runExtraction]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleComplete = useCallback(async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onComplete();
    } catch {
      setSubmitError('Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [onComplete]);

  // Read-only mode for completed conversations
  if (isComplete && !isExtracting) {
    return (
      <div className="flex flex-col">
        <ChatHeader title={config.title} exchangeCount={config.maxExchanges} maxExchanges={config.maxExchanges} isComplete />
        <div className="mb-4 max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
        </div>
        {extractionWarning && (
          <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
            {extractionWarning}
          </div>
        )}
        {submitError && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
            {submitError}
          </div>
        )}
        <button
          onClick={handleComplete}
          disabled={isSubmitting}
          className="w-full rounded-lg bg-rose-600 py-3 text-sm font-medium text-white hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-samvaya-red/30 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : (completeButtonLabel || 'Continue to next question')}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <ChatHeader
        title={config.title}
        exchangeCount={exchangeCount}
        maxExchanges={config.maxExchanges}
        isComplete={false}
      />

      {/* Messages area */}
      <div ref={messagesContainerRef} className="mb-4 max-h-96 min-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isLoading && <TypingIndicator />}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 font-medium underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Input area */}
      {!isComplete && (
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your response..."
            disabled={isLoading || messages.length === 0}
            maxLength={2000}
            rows={2}
            aria-label="Your response"
            className="flex-1 resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-samvaya-red focus:outline-none focus:ring-0 focus:shadow-[0_0_0_3px_rgba(163,23,31,0.25)] disabled:bg-gray-100 disabled:text-gray-400"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !inputValue.trim() || messages.length === 0}
            aria-label="Send message"
            className="shrink-0 rounded-lg bg-rose-600 px-4 py-3 text-white hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-samvaya-red/30 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
          </button>
        </div>
      )}

      {/* Nudge text */}
      {!isComplete && (
        <p className="mt-2 text-center text-xs text-gray-500">
          {config.nudgeText}
        </p>
      )}

      {/* Extracting indicator */}
      {isExtracting && (
        <div className="mt-3 flex items-center justify-center gap-2 text-sm text-gray-500">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Saving your conversation...
        </div>
      )}
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================

function ChatHeader({
  title,
  exchangeCount,
  maxExchanges,
  isComplete,
}: {
  title: string;
  exchangeCount: number;
  maxExchanges: number;
  isComplete: boolean;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-samvaya-red/10">
          <svg className="h-4 w-4 text-samvaya-red" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-gray-900">
          {title}
        </h3>
      </div>
      <span
        className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
        role="status"
        aria-live="polite"
        aria-label={isComplete ? 'Conversation complete' : `Exchange ${exchangeCount} of ${maxExchanges}`}
      >
        {isComplete ? 'Complete' : `${exchangeCount} of ${maxExchanges}`}
      </span>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isAssistant = message.role === 'assistant';

  return (
    <div
      className={`animate-fade-in-up mb-3 flex ${isAssistant ? 'justify-start' : 'justify-end'}`}
      role="article"
      aria-label={`${isAssistant ? 'Samvaya' : 'Your'} message`}
    >
      {isAssistant && (
        <div className="mr-2 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-samvaya-red/10" aria-hidden="true">
          <svg className="h-3 w-3 text-samvaya-red" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
          </svg>
        </div>
      )}
      <div
        className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm sm:max-w-[80%] ${
          isAssistant
            ? 'rounded-bl-md bg-white text-gray-700 border border-gray-100'
            : 'rounded-br-md bg-samvaya-red/10 text-gray-900 border border-samvaya-red/20'
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="animate-fade-in mb-3 flex items-start justify-start" role="status" aria-label="Samvaya is thinking...">
      <div className="mr-2 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-samvaya-red/10" aria-hidden="true">
        <svg className="h-3 w-3 text-samvaya-red" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
        </svg>
      </div>
      <div className="rounded-2xl rounded-bl-md bg-white px-4 py-3 border border-gray-100 shadow-sm">
        <div className="flex gap-1.5">
          <span className="h-2 w-2 animate-bounce rounded-full bg-samvaya-red/60" style={{ animationDelay: '0ms' }} />
          <span className="h-2 w-2 animate-bounce rounded-full bg-samvaya-red/60" style={{ animationDelay: '150ms' }} />
          <span className="h-2 w-2 animate-bounce rounded-full bg-samvaya-red/60" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
