'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  type ReactNode,
} from 'react';
import { createClient } from '@/lib/supabase/client';
import { AutoSaveEngine } from '@/lib/form/auto-save';
import {
  computeVisibleQuestions,
  findQuestionIndex,
  findClosestVisibleQuestion,
} from '@/lib/form/navigation';
import type { FormState, FormAction, FormAnswers } from '@/lib/form/types';

// ============================================================
// Context
// ============================================================

interface FormContextValue {
  state: FormState;
  userId: string;
  chatState: Record<string, unknown>;
  setAnswer: (questionId: string, value: unknown) => void;
  navigateNext: () => void;
  navigatePrev: () => void;
  navigateTo: (index: number) => void;
  flushNow: () => Promise<void>;
}

const FormContext = createContext<FormContextValue | null>(null);

export function useForm() {
  const ctx = useContext(FormContext);
  if (!ctx) throw new Error('useForm must be used within a FormProvider');
  return ctx;
}

// ============================================================
// Reducer
// ============================================================

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_ANSWER': {
      const newAnswers = { ...state.answers, [action.questionId]: action.value };
      const newVisible = computeVisibleQuestions(newAnswers);

      // Clear answers for questions that just became hidden (data integrity).
      // Prevents stale data when a parent answer changes — e.g. changing country
      // from India hides state, and the old state value must not persist.
      const newVisibleSet = new Set(newVisible);
      for (const qId of state.visibleQuestions) {
        if (!newVisibleSet.has(qId) && newAnswers[qId] !== undefined) {
          delete newAnswers[qId];
        }
      }

      // Keep current index valid after visibility changes
      let newIndex = state.currentQuestionIndex;
      if (newIndex >= newVisible.length) {
        newIndex = Math.max(0, newVisible.length - 1);
      }

      return {
        ...state,
        answers: newAnswers,
        visibleQuestions: newVisible,
        currentQuestionIndex: newIndex,
      };
    }

    case 'NAVIGATE_NEXT': {
      const nextIndex = Math.min(
        state.currentQuestionIndex + 1,
        state.visibleQuestions.length - 1
      );
      return { ...state, currentQuestionIndex: nextIndex };
    }

    case 'NAVIGATE_PREV': {
      const prevIndex = Math.max(state.currentQuestionIndex - 1, 0);
      return { ...state, currentQuestionIndex: prevIndex };
    }

    case 'NAVIGATE_TO': {
      const idx = Math.max(
        0,
        Math.min(action.questionIndex, state.visibleQuestions.length - 1)
      );
      return { ...state, currentQuestionIndex: idx };
    }

    case 'SET_SAVE_STATUS':
      return {
        ...state,
        saveStatus: action.status,
        saveError: action.error,
      };

    case 'RECALCULATE_VISIBLE': {
      const visible = computeVisibleQuestions(state.answers);
      let idx = state.currentQuestionIndex;
      if (idx >= visible.length) idx = Math.max(0, visible.length - 1);
      return { ...state, visibleQuestions: visible, currentQuestionIndex: idx };
    }

    default:
      return state;
  }
}

// ============================================================
// Provider
// ============================================================

interface FormProviderProps {
  children: ReactNode;
  userId: string;
  initialAnswers: FormAnswers;
  initialGateAnswers: Record<string, string>;
  initialChatState: Record<string, unknown>;
  resumeQuestionNumber: number;
}

export function FormProvider({
  children,
  userId,
  initialAnswers,
  initialGateAnswers,
  initialChatState,
  resumeQuestionNumber,
}: FormProviderProps) {
  const initialVisible = computeVisibleQuestions(initialAnswers);
  const closestId = findClosestVisibleQuestion(initialVisible, resumeQuestionNumber || 1);
  const initialIndex = findQuestionIndex(initialVisible, closestId);

  const [state, dispatch] = useReducer(formReducer, {
    answers: initialAnswers,
    currentQuestionIndex: initialIndex,
    visibleQuestions: initialVisible,
    saveStatus: 'idle',
    isLoaded: true,
  } satisfies FormState);

  // Refs for accessing current state in callbacks
  const autoSaveRef = useRef<AutoSaveEngine | null>(null);
  const stateRef = useRef(state);
  useLayoutEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const supabase = createClient();
    const engine = new AutoSaveEngine(
      supabase,
      userId,
      (status, error) => {
        dispatch({ type: 'SET_SAVE_STATUS', status, error });
      },
      500,
      initialGateAnswers
    );
    autoSaveRef.current = engine;

    // Safety net: flush on browser close/refresh (sendBeacon-style best-effort)
    const handleBeforeUnload = () => {
      engine.flushNow(); // fire-and-forget on page unload
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // flushNow is async but React cleanup is sync — fire-and-forget is the best
      // we can do here. The beforeunload listener above covers browser close.
      // For in-app navigation, Next.js keeps the JS context alive so the
      // promise will complete before GC.
      void engine.flushNow().finally(() => engine.destroy());
    };
  }, [userId, initialGateAnswers]);

  // Track position changes for auto-save
  const currentQuestionId = state.visibleQuestions[state.currentQuestionIndex];
  useEffect(() => {
    if (currentQuestionId && autoSaveRef.current) {
      autoSaveRef.current.markPosition(currentQuestionId);
    }
  }, [currentQuestionId]);

  // Track previous visible questions to detect newly hidden ones
  const prevVisibleRef = useRef<Set<string>>(new Set(initialVisible));

  const setAnswer = useCallback((questionId: string, value: unknown) => {
    const oldVisible = prevVisibleRef.current;

    dispatch({ type: 'SET_ANSWER', questionId, value });
    autoSaveRef.current?.markDirty(questionId, value);

    // After dispatch, compute new visibility to find questions that became hidden.
    // Mark them dirty with null so auto-save clears them from the DB.
    // We re-compute here because we need the result synchronously.
    const tempAnswers = { ...stateRef.current.answers, [questionId]: value };
    const newVisible = computeVisibleQuestions(tempAnswers);
    const newVisibleSet = new Set(newVisible);

    for (const qId of oldVisible) {
      if (!newVisibleSet.has(qId) && qId !== questionId) {
        autoSaveRef.current?.markDirty(qId, null);
      }
    }

    prevVisibleRef.current = newVisibleSet;
  }, [dispatch]);

  const navigateNext = useCallback(() => {
    dispatch({ type: 'NAVIGATE_NEXT' });
  }, [dispatch]);

  const navigatePrev = useCallback(() => {
    dispatch({ type: 'NAVIGATE_PREV' });
  }, [dispatch]);

  const navigateTo = useCallback((index: number) => {
    dispatch({ type: 'NAVIGATE_TO', questionIndex: index });
  }, [dispatch]);

  const flushNow = useCallback(async () => {
    await autoSaveRef.current?.flushNow();
  }, []);

  return (
    <FormContext.Provider
      value={{ state, userId, chatState: initialChatState, setAnswer, navigateNext, navigatePrev, navigateTo, flushNow }}
    >
      {children}
    </FormContext.Provider>
  );
}
