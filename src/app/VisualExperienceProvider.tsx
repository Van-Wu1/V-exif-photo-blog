'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  DEFAULT_VISUAL_EXPERIENCE,
  parseVisualExperience,
  VisualExperience,
  VISUAL_EXPERIENCE_QUERY_KEY,
  VISUAL_EXPERIENCE_STORAGE_KEY,
} from './visualExperience';

type VisualExperienceContextValue = {
  experience: VisualExperience
  isDarkroomExperience: boolean
  setExperience: (experience: VisualExperience) => void
};

const VisualExperienceContext =
  createContext<VisualExperienceContextValue | undefined>(undefined);

const persistExperience = (experience: VisualExperience) => {
  try {
    window.localStorage.setItem(
      VISUAL_EXPERIENCE_STORAGE_KEY,
      experience,
    );
  } catch {
    // Storage may be unavailable in private or restricted browser contexts.
  }
};

const resolveBrowserExperience = (): VisualExperience => {
  const queryExperience = parseVisualExperience(
    new URLSearchParams(window.location.search).get(
      VISUAL_EXPERIENCE_QUERY_KEY,
    ),
  );

  if (queryExperience) {
    persistExperience(queryExperience);
    return queryExperience;
  }

  try {
    return parseVisualExperience(
      window.localStorage.getItem(VISUAL_EXPERIENCE_STORAGE_KEY),
    ) ?? DEFAULT_VISUAL_EXPERIENCE;
  } catch {
    return DEFAULT_VISUAL_EXPERIENCE;
  }
};

export default function VisualExperienceProvider({
  children,
}: {
  children: ReactNode
}) {
  const [experience, setExperienceState] =
    useState<VisualExperience>(DEFAULT_VISUAL_EXPERIENCE);

  const setExperience = useCallback((nextExperience: VisualExperience) => {
    persistExperience(nextExperience);
    setExperienceState(nextExperience);
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setExperienceState(resolveBrowserExperience());
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.visualExperience = experience;
  }, [experience]);

  const value = useMemo<VisualExperienceContextValue>(() => ({
    experience,
    isDarkroomExperience: experience === 'darkroom',
    setExperience,
  }), [experience, setExperience]);

  return (
    <VisualExperienceContext.Provider value={value}>
      {children}
    </VisualExperienceContext.Provider>
  );
}

export const useVisualExperience = () => {
  const context = useContext(VisualExperienceContext);

  if (!context) {
    throw new Error(
      'useVisualExperience must be used within VisualExperienceProvider',
    );
  }

  return context;
};
