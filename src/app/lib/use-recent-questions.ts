import { useState, useCallback } from 'react';
import { WORKSPACES, WorkspaceId } from './workspace-definitions';

const MAX_RECENT = 5;

export function useRecentQuestions(workspaceId: WorkspaceId) {
  const [recentQuestions, setRecentQuestions] = useState<string[]>(
    () => WORKSPACES[workspaceId].recentQuestions,
  );

  const addToRecent = useCallback((question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return;

    setRecentQuestions((prev) => {
      // Remove duplicate if exists
      const filtered = prev.filter((q) => q !== trimmed);
      // Prepend new question, limit to MAX_RECENT
      return [trimmed, ...filtered].slice(0, MAX_RECENT);
    });
  }, []);

  return { recentQuestions, addToRecent };
}
