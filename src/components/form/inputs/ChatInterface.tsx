'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { QuestionConfig } from '@/lib/form/types';
import type { ChatMessage, ChatResponse, ChatState } from '@/lib/claude/types';
import { CHAT_METADATA } from '@/lib/claude/chat-metadata';

interface ChatInterfaceProps {
  question: QuestionConfig;
  initialChatState?: ChatState | null;
  onComplete: () => void | Promise<void> | Promise<boolean>;
  completeButtonLabel?: string;
}

export function ChatInterface({ question, initialChatState, onComplete, completeButtonLabel }: ChatInterfaceProps) {
  const chatId = question.id as 'Q38' | 'Q75' | 'Q100';
  const config = CHAT_METADATA[chatId];

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
        <ChatHeader exchangeCount={config.maxExchanges} maxExchanges={config.maxExchanges} isComplete />
        <div className="mb-4 max-h-[60vh] overflow-y-auto rounded-xl border border-[color:var(--color-form-border)] bg-[color:var(--color-form-surface-muted)] p-5">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
        </div>
        {extractionWarning && (
          <div className="mb-3 rounded-lg border border-[color:var(--color-form-border)] bg-[color:var(--color-form-surface-muted)] px-4 py-2 form-helper">
            {extractionWarning}
          </div>
        )}
        {submitError && (
          <div className="mb-3 rounded-lg border border-[color:var(--color-form-error)]/20 bg-[color:var(--color-form-error)]/5 px-4 py-2 form-error">
            {submitError}
          </div>
        )}
        <button
          onClick={handleComplete}
          disabled={isSubmitting}
          className="form-btn-primary w-full"
        >
          {isSubmitting ? 'Submitting…' : (completeButtonLabel || 'Continue')}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <ChatHeader
        exchangeCount={exchangeCount}
        maxExchanges={config.maxExchanges}
        isComplete={false}
      />

      {/* Messages area */}
      <div ref={messagesContainerRef} role="log" aria-live="polite" className="mb-4 max-h-[60vh] min-h-[20rem] overflow-y-auto rounded-xl border border-[color:var(--color-form-border)] bg-[color:var(--color-form-surface-muted)] p-5">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isLoading && <TypingIndicator />}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-3 rounded-lg border border-[color:var(--color-form-error)]/20 bg-[color:var(--color-form-error)]/5 px-4 py-2 form-error">
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
            placeholder="Type your response…"
            disabled={isLoading || messages.length === 0}
            maxLength={2000}
            rows={2}
            aria-label="Your response"
            className="form-input form-textarea flex-1"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !inputValue.trim() || messages.length === 0}
            aria-label="Send message"
            className="form-btn-primary shrink-0 px-4"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
          </button>
        </div>
      )}

      {/* Responses remaining + nudge */}
      {!isComplete && config.maxExchanges > 1 && (
        <p className="form-caption mt-3 text-center">
          {exchangeCount === 0
            ? `${config.maxExchanges} exchanges in this conversation`
            : `${config.maxExchanges - exchangeCount} ${config.maxExchanges - exchangeCount === 1 ? 'response' : 'responses'} remaining`}
        </p>
      )}

      {!isComplete && (
        <p className="form-caption mt-1 text-center">
          {config.nudgeText}
        </p>
      )}

      {/* Extracting indicator */}
      {isExtracting && (
        <div className="mt-3 flex items-center justify-center gap-2 form-caption">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Saving your conversation…
        </div>
      )}
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================

function ChatHeader({
  exchangeCount,
  maxExchanges,
  isComplete,
}: {
  exchangeCount: number;
  maxExchanges: number;
  isComplete: boolean;
}) {
  const done = isComplete ? maxExchanges : exchangeCount;
  return (
    <div
      className="mb-4"
      role="status"
      aria-live="polite"
      aria-label={
        isComplete
          ? 'Conversation complete'
          : `Exchange ${exchangeCount} of ${maxExchanges}`
      }
    >
      <div className="flex items-center justify-between text-[11.5px] font-medium text-[color:var(--color-form-text-muted)]">
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-[color:var(--color-form-accent)]"
          />
          {isComplete ? 'Complete' : `${exchangeCount} of ${maxExchanges} exchanges`}
        </span>
      </div>
      {maxExchanges > 1 && (
        <div className="mt-2 flex gap-1">
          {Array.from({ length: maxExchanges }).map((_, i) => (
            <span
              key={i}
              className="h-[3px] flex-1 rounded-full"
              style={{
                background:
                  i < done
                    ? 'var(--color-form-accent)'
                    : 'var(--color-form-border)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SamvayaAvatar() {
  return (
    <span
      aria-hidden="true"
      className="flex size-[30px] shrink-0 items-center justify-center rounded-full font-[family-name:var(--font-form-serif)] text-[13px] font-semibold text-white"
      style={{ background: 'var(--color-form-accent)', letterSpacing: '-0.02em' }}
    >
      S
    </span>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isAssistant = message.role === 'assistant';

  if (isAssistant) {
    return (
      <div className="animate-fade-in-up mb-4 flex items-end gap-2.5" role="article" aria-label="Samvaya message">
        <SamvayaAvatar />
        <div
          className="max-w-[80%] border border-[color:var(--color-form-border)] px-3.5 py-3 text-[15px] leading-relaxed text-[color:var(--color-form-text-primary)]"
          style={{
            background: '#F3EFE9',
            borderRadius: '16px 16px 16px 4px',
            letterSpacing: '-0.01em',
          }}
        >
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up mb-4 flex justify-end" role="article" aria-label="Your message">
      <div
        className="max-w-[80%] px-3.5 py-3 text-[15px] leading-relaxed text-white"
        style={{
          background: 'var(--color-form-accent)',
          borderRadius: '16px 16px 4px 16px',
          letterSpacing: '-0.01em',
          boxShadow: '0 2px 8px rgba(163, 23, 31, 0.14)',
        }}
      >
        {message.content}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="animate-fade-in mb-4 flex items-end gap-2.5" role="status" aria-label="Samvaya is thinking…">
      <SamvayaAvatar />
      <div
        className="border border-[color:var(--color-form-border)] px-3.5 py-3"
        style={{ background: '#F3EFE9', borderRadius: '16px 16px 16px 4px' }}
      >
        <div className="flex gap-1.5">
          <span className="h-2 w-2 animate-bounce rounded-full bg-[color:var(--color-form-text-muted)]" style={{ animationDelay: '0ms' }} />
          <span className="h-2 w-2 animate-bounce rounded-full bg-[color:var(--color-form-text-muted)]" style={{ animationDelay: '150ms' }} />
          <span className="h-2 w-2 animate-bounce rounded-full bg-[color:var(--color-form-text-muted)]" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
