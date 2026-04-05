import { useState, useEffect, useCallback } from 'react';

export interface ScenarioCard {
  id: string;
  title: string;
  description: string;
  query: string;
  icon: string;
  hidden?: boolean;
}

export interface ScopeActionCard {
  id: string;
  title: string;
  description: string;
  prompt: string;
  action?: string;
  hidden?: boolean;
}

export interface WorkspaceCardSettings {
  scenarios: ScenarioCard[];
  scopeActions: ScopeActionCard[];
}

export type WorkspaceKey = 'fleet' | 'support' | 'growth';

const STORAGE_KEY = 'heights-workspace-card-settings';
const SETTINGS_CHANGED_EVENT = 'heights-card-settings-changed';

function loadSettings(): Record<WorkspaceKey, WorkspaceCardSettings> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {} as Record<WorkspaceKey, WorkspaceCardSettings>;
}

function saveSettings(settings: Record<WorkspaceKey, WorkspaceCardSettings>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent(SETTINGS_CHANGED_EVENT));
}

export function useWorkspaceCardSettings() {
  const [settings, setSettings] = useState<Record<WorkspaceKey, WorkspaceCardSettings>>(loadSettings);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const getScenarios = useCallback((workspace: WorkspaceKey): ScenarioCard[] | null => {
    return settings[workspace]?.scenarios ?? null;
  }, [settings]);

  const getScopeActions = useCallback((workspace: WorkspaceKey): ScopeActionCard[] | null => {
    return settings[workspace]?.scopeActions ?? null;
  }, [settings]);

  const initScenarios = useCallback((workspace: WorkspaceKey, cards: ScenarioCard[]) => {
    setSettings(prev => ({
      ...prev,
      [workspace]: {
        ...prev[workspace],
        scenarios: cards,
      },
    }));
  }, []);

  const initScopeActions = useCallback((workspace: WorkspaceKey, cards: ScopeActionCard[]) => {
    setSettings(prev => ({
      ...prev,
      [workspace]: {
        ...prev[workspace],
        scopeActions: cards,
      },
    }));
  }, []);

  const updateScenario = useCallback((workspace: WorkspaceKey, id: string, updates: Partial<ScenarioCard>) => {
    setSettings(prev => {
      const ws = prev[workspace] ?? { scenarios: [], scopeActions: [] };
      const exists = ws.scenarios.some(c => c.id === id);
      const updatedScenarios = exists
        ? ws.scenarios.map(c => c.id === id ? { ...c, ...updates } : c)
        : [...ws.scenarios, { id, title: id, description: '', query: '', icon: 'zap', ...updates }];
      return {
        ...prev,
        [workspace]: {
          ...ws,
          scenarios: updatedScenarios,
        },
      };
    });
  }, []);

  const updateScopeAction = useCallback((workspace: WorkspaceKey, id: string, updates: Partial<ScopeActionCard>) => {
    setSettings(prev => {
      const ws = prev[workspace] ?? { scenarios: [], scopeActions: [] };
      // If the card doesn't exist in stored scopeActions, add it first
      const exists = ws.scopeActions.some(c => c.id === id);
      const updatedActions = exists
        ? ws.scopeActions.map(c => c.id === id ? { ...c, ...updates } : c)
        : [...ws.scopeActions, { id, title: id, description: '', prompt: '', ...updates }];
      return {
        ...prev,
        [workspace]: {
          ...ws,
          scopeActions: updatedActions,
        },
      };
    });
  }, []);

  const addScenario = useCallback((workspace: WorkspaceKey, card: ScenarioCard) => {
    setSettings(prev => {
      const ws = prev[workspace] ?? { scenarios: [], scopeActions: [] };
      return {
        ...prev,
        [workspace]: { ...ws, scenarios: [...ws.scenarios, card] },
      };
    });
  }, []);

  const addScopeAction = useCallback((workspace: WorkspaceKey, card: ScopeActionCard) => {
    setSettings(prev => {
      const ws = prev[workspace] ?? { scenarios: [], scopeActions: [] };
      return {
        ...prev,
        [workspace]: { ...ws, scopeActions: [...ws.scopeActions, card] },
      };
    });
  }, []);

  const removeScenario = useCallback((workspace: WorkspaceKey, id: string) => {
    setSettings(prev => {
      const ws = prev[workspace] ?? { scenarios: [], scopeActions: [] };
      return {
        ...prev,
        [workspace]: { ...ws, scenarios: ws.scenarios.filter(c => c.id !== id) },
      };
    });
  }, []);

  const removeScopeAction = useCallback((workspace: WorkspaceKey, id: string) => {
    setSettings(prev => {
      const ws = prev[workspace] ?? { scenarios: [], scopeActions: [] };
      return {
        ...prev,
        [workspace]: { ...ws, scopeActions: ws.scopeActions.filter(c => c.id !== id) },
      };
    });
  }, []);

  const resetWorkspace = useCallback((workspace: WorkspaceKey) => {
    setSettings(prev => {
      const next = { ...prev };
      delete next[workspace];
      return next;
    });
  }, []);

  return {
    settings,
    getScenarios,
    getScopeActions,
    initScenarios,
    initScopeActions,
    updateScenario,
    updateScopeAction,
    addScenario,
    addScopeAction,
    removeScenario,
    removeScopeAction,
    resetWorkspace,
  };
}

/**
 * Merge default cards with stored overrides and filter hidden ones.
 * Used by workspace pages to get their active cards.
 * Stored values override defaults (edited title/description/etc), default order preserved.
 */
export function mergeCards<T extends { id: string; hidden?: boolean }>(
  defaults: T[],
  stored: T[] | null,
): T[] {
  if (!stored) return defaults;
  const storedMap = new Map(stored.map(c => [c.id, c]));
  // Walk defaults in order, apply stored overrides on top
  const result: T[] = defaults.map(card => {
    const override = storedMap.get(card.id);
    return override ? { ...card, ...override } : card;
  });
  // Add any stored cards not in defaults (shouldn't happen but be safe)
  const seen = new Set(defaults.map(c => c.id));
  for (const card of stored) {
    if (!seen.has(card.id)) result.push(card);
  }
  return result.filter(c => !c.hidden);
}

/**
 * Read-only hook for workspace pages.
 * Returns merged (stored + defaults) and filtered (hidden removed) cards.
 * Falls back to defaults if nothing is stored.
 */
export function useWorkspaceCards<T extends { id: string; hidden?: boolean }>(
  defaults: T[],
  workspaceKey: WorkspaceKey,
  cardType: 'scenarios' | 'scopeActions',
): T[] {
  const [cards, setCards] = useState<T[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const stored = JSON.parse(raw)[workspaceKey]?.[cardType] as T[] | undefined;
        return mergeCards(defaults, stored ?? null);
      }
    } catch { /* ignore */ }
    return defaults;
  });

  useEffect(() => {
    const read = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const stored = JSON.parse(raw)[workspaceKey]?.[cardType] as T[] | undefined;
          setCards(mergeCards(defaults, stored ?? null));
        } else {
          setCards(defaults);
        }
      } catch { setCards(defaults); }
    };
    const storageHandler = (e: StorageEvent) => { if (e.key === STORAGE_KEY) read(); };
    const customHandler = () => read();
    window.addEventListener('storage', storageHandler);
    window.addEventListener('focus', customHandler);
    window.addEventListener(SETTINGS_CHANGED_EVENT, customHandler);
    return () => {
      window.removeEventListener('storage', storageHandler);
      window.removeEventListener('focus', customHandler);
      window.removeEventListener(SETTINGS_CHANGED_EVENT, customHandler);
    };
  }, [defaults, workspaceKey, cardType]);

  return cards;
}

/**
 * Returns a Set of hidden scope action IDs for a workspace.
 * Used by workspace pages to filter dynamic getScopeActions() results.
 */
export function useHiddenScopeActionIds(workspaceKey: WorkspaceKey): Set<string> {
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const stored = JSON.parse(raw)[workspaceKey]?.scopeActions as ScopeActionCard[] | undefined;
        if (stored) return new Set(stored.filter(c => c.hidden).map(c => c.id));
      }
    } catch { /* ignore */ }
    return new Set();
  });

  useEffect(() => {
    const read = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const stored = JSON.parse(raw)[workspaceKey]?.scopeActions as ScopeActionCard[] | undefined;
          setHiddenIds(stored ? new Set(stored.filter(c => c.hidden).map(c => c.id)) : new Set());
        } else {
          setHiddenIds(new Set());
        }
      } catch { setHiddenIds(new Set()); }
    };
    const storageHandler = (e: StorageEvent) => { if (e.key === STORAGE_KEY) read(); };
    const customHandler = () => read();
    window.addEventListener('storage', storageHandler);
    window.addEventListener('focus', customHandler);
    window.addEventListener(SETTINGS_CHANGED_EVENT, customHandler);
    return () => {
      window.removeEventListener('storage', storageHandler);
      window.removeEventListener('focus', customHandler);
      window.removeEventListener(SETTINGS_CHANGED_EVENT, customHandler);
    };
  }, [workspaceKey]);

  return hiddenIds;
}

/**
 * Returns a Map of scope action ID -> stored overrides (title, description, prompt, hidden).
 * Workspace pages use this to merge edited values into getScopeActions() results.
 */
export function useScopeActionOverrides(workspaceKey: WorkspaceKey): Map<string, ScopeActionCard> {
  const [overrides, setOverrides] = useState<Map<string, ScopeActionCard>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const stored = JSON.parse(raw)[workspaceKey]?.scopeActions as ScopeActionCard[] | undefined;
        if (stored) return new Map(stored.map(c => [c.id, c]));
      }
    } catch { /* ignore */ }
    return new Map();
  });

  useEffect(() => {
    const read = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const stored = JSON.parse(raw)[workspaceKey]?.scopeActions as ScopeActionCard[] | undefined;
          setOverrides(stored ? new Map(stored.map(c => [c.id, c])) : new Map());
        } else {
          setOverrides(new Map());
        }
      } catch { setOverrides(new Map()); }
    };
    const storageHandler = (e: StorageEvent) => { if (e.key === STORAGE_KEY) read(); };
    const customHandler = () => read();
    window.addEventListener('storage', storageHandler);
    window.addEventListener('focus', customHandler);
    window.addEventListener(SETTINGS_CHANGED_EVENT, customHandler);
    return () => {
      window.removeEventListener('storage', storageHandler);
      window.removeEventListener('focus', customHandler);
      window.removeEventListener(SETTINGS_CHANGED_EVENT, customHandler);
    };
  }, [workspaceKey]);

  return overrides;
}
