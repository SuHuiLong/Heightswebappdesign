import type { ScenarioDefinition } from './scenario-definitions';

export interface ReasoningStep {
  id: string;
  label: string;
  detail: string;
  confidence?: number;
  status: 'complete' | 'in-progress' | 'pending';
}

export interface BackendAction {
  id: string;
  label: string;
  status: 'success' | 'running' | 'pending' | 'failed';
  timestamp: string;
  detail?: string;
}

export interface AuditEntry {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  type: 'query' | 'action' | 'system' | 'alert';
  detail?: string;
}

export interface WorkbenchCurrentQuestion {
  title: string;
  summary: string;
  scopeLabel: string;
  recognizedObjects: string[];
  suggestedRefinements: string[];
}

export interface WorkbenchCapabilityStage {
  id: 'device' | 'cloud' | 'agent';
  title: 'Device Signals' | 'Cloud Checks' | 'Agent Reasoning / Actions';
  summary: string;
  bullets: string[];
  status: 'complete' | 'active' | 'queued';
}

export interface WorkbenchModel {
  currentQuestion: WorkbenchCurrentQuestion;
  capabilityChain: WorkbenchCapabilityStage[];
  processRail: {
    reasoning: ReasoningStep[];
    backendActions: BackendAction[];
    auditEntries: AuditEntry[];
  };
}

interface BuildWorkbenchModelOptions {
  scenario: ScenarioDefinition;
  activeQuery: string;
  scopeLabel: string;
}

export function buildWorkbenchModel({
  scenario,
  activeQuery,
  scopeLabel,
}: BuildWorkbenchModelOptions): WorkbenchModel {
  const currentQuestion = scenario.workbench?.currentQuestion;
  const capabilityChain =
    scenario.workbench?.capabilityChain ?? [
      {
        id: 'device',
        title: 'Device Signals',
        summary: `Collecting edge evidence for ${scenario.title}.`,
        bullets: scenario.evidenceDomains.slice(0, 2),
        status: 'complete',
      },
      {
        id: 'cloud',
        title: 'Cloud Checks',
        summary: 'Resolving platform and historical context.',
        bullets: scenario.evidenceDomains.slice(1, 3),
        status: 'active',
      },
      {
        id: 'agent',
        title: 'Agent Reasoning / Actions',
        summary: 'Synthesizing findings and proposing the next action.',
        bullets: scenario.followUps.slice(0, 2),
        status: 'queued',
      },
    ];

  const processRail = scenario.workbench?.processRail ?? {
    reasoning: [
      {
        id: `${scenario.id}-reasoning-1`,
        label: 'Scenario evidence assembled',
        detail: scenario.description,
        confidence: scenario.confidence / 100,
        status: 'complete' as const,
      },
    ],
    backendActions: [
      {
        id: `${scenario.id}-backend-1`,
        label: 'Loaded scenario evidence domains',
        status: 'success' as const,
        timestamp: 'just now',
        detail: scenario.evidenceDomains.join(', '),
      },
    ],
    auditEntries: [
      {
        id: `${scenario.id}-audit-1`,
        action: `${scenario.title} investigation prepared`,
        actor: 'AI Assistant',
        timestamp: 'just now',
        type: 'query' as const,
        detail: activeQuery,
      },
    ],
  };

  return {
    currentQuestion: {
      title: activeQuery.trim() || scenario.title,
      summary: currentQuestion?.summary ?? scenario.description,
      scopeLabel,
      recognizedObjects: currentQuestion?.recognizedObjects ?? scenario.evidenceDomains.slice(0, 3),
      suggestedRefinements: currentQuestion?.suggestedRefinements ?? scenario.followUps.slice(0, 3),
    },
    capabilityChain,
    processRail,
  };
}
