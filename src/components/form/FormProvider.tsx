'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
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
import { getSectionForQuestion } from '@/lib/form/sections';
import { getVisibleQuestionsForSection, getNextSectionId, getPrevSectionId } from '@/lib/form/section-navigation';
import { getQuestion } from '@/lib/form/questions';
import type { FormState, FormAction, FormAnswers, SectionId } from '@/lib/form/types';

// ============================================================
// Context
// ============================================================

interface FormContextValue {
  state: FormState;
  userId: string;
  chatState: Record<string, unknown>;
  formSubmitted: boolean;
  setAnswer: (questionId: string, value: unknown) => void;
  navigateNext: () => void;
  navigatePrev: () => void;
  navigateTo: (index: number) => void;
  navigateToSection: (sectionId: SectionId) => void;
  navigateNextSection: () => void;
  navigatePrevSection: () => void;
  flushNow: () => Promise<void>;
  submitForm: () => Promise<boolean>;
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

    case 'NAVIGATE_TO_SECTION': {
      const sectionId = action.sectionId;
      // Find the first visible question in this section to update position tracking
      const sectionQuestionIds = getVisibleQuestionsForSection(sectionId, state.answers);
      const firstQId = sectionQuestionIds[0];
      let newIndex = state.currentQuestionIndex;
      if (firstQId) {
        const idx = state.visibleQuestions.indexOf(firstQId);
        if (idx >= 0) newIndex = idx;
      }
      return { ...state, currentSectionId: sectionId, currentQuestionIndex: newIndex };
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

  // Derive initial section from resume question number
  const resumeSection = getSectionForQuestion(resumeQuestionNumber || 1);
  const initialSectionId: SectionId = (resumeSection?.id as SectionId) || 'A';

  const [state, dispatch] = useReducer(formReducer, {
    answers: initialAnswers,
    currentQuestionIndex: initialIndex,
    visibleQuestions: initialVisible,
    currentSectionId: initialSectionId,
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

  const navigateToSection = useCallback((sectionId: SectionId) => {
    dispatch({ type: 'NAVIGATE_TO_SECTION', sectionId });
  }, [dispatch]);

  const navigateNextSection = useCallback(() => {
    const next = getNextSectionId(stateRef.current.currentSectionId);
    if (next) dispatch({ type: 'NAVIGATE_TO_SECTION', sectionId: next });
  }, [dispatch]);

  const navigatePrevSection = useCallback(() => {
    const prev = getPrevSectionId(stateRef.current.currentSectionId);
    if (prev) dispatch({ type: 'NAVIGATE_TO_SECTION', sectionId: prev });
  }, [dispatch]);

  const flushNow = useCallback(async () => {
    await autoSaveRef.current?.flushNow();
  }, []);

  const [formSubmitted, setFormSubmitted] = useState(false);
  const submittingRef = useRef(false);

  const submitForm = useCallback(async (): Promise<boolean> => {
    // Prevent concurrent submissions
    if (submittingRef.current || formSubmitted) return false;
    submittingRef.current = true;

    try {
      await autoSaveRef.current?.flushNow();

      const res = await fetch('/api/form/submit', { method: 'POST' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error('Form submission failed:', data.error);
        submittingRef.current = false;
        return false;
      }

      setFormSubmitted(true);
      return true;
    } catch (err) {
      console.error('Form submission error:', err);
      submittingRef.current = false;
      return false;
    }
  }, [formSubmitted]);

  return (
    <FormContext.Provider
      value={{
        state,
        userId,
        chatState: initialChatState,
        formSubmitted,
        setAnswer,
        navigateNext,
        navigatePrev,
        navigateTo,
        navigateToSection,
        navigateNextSection,
        navigatePrevSection,
        flushNow,
        submitForm,
      }}
    >
      {children}
    </FormContext.Provider>
  );
}
