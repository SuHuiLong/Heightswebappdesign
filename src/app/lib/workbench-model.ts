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

export type WorkbenchProcessPhase =
  | 'idle'
  | 'intake'
  | 'evidence'
  | 'synthesis'
  | 'ready';

export const DEMO_PROCESS_TIMING = {
  stageMs: 850,
  finalPauseMs: 550,
  blockRevealMs: 360,
} as const;

interface BuildWorkbenchModelOptions {
  scenario: ScenarioDefinition;
  activeQuery: string;
  scopeLabel: string;
}

interface BuildProcessRailSnapshotOptions {
  scenario: ScenarioDefinition;
  activeQuery: string;
  scopeLabel: string;
  phase: WorkbenchProcessPhase;
}

const PROCESS_PHASE_ORDER: WorkbenchProcessPhase[] = [
  'idle',
  'intake',
  'evidence',
  'synthesis',
  'ready',
];

function getPhaseRank(phase: WorkbenchProcessPhase) {
  return PROCESS_PHASE_ORDER.indexOf(phase);
}

export function getScenarioProcessDuration(stageCount: number) {
  return Math.max(stageCount, 1) * DEMO_PROCESS_TIMING.stageMs + DEMO_PROCESS_TIMING.finalPauseMs;
}

function getProcessStatus(
  currentPhase: WorkbenchProcessPhase,
  targetPhase: Exclude<WorkbenchProcessPhase, 'idle'>,
): ReasoningStep['status'] {
  const currentRank = getPhaseRank(currentPhase);
  const targetRank = getPhaseRank(targetPhase);

  if (currentRank > targetRank || currentPhase === 'ready') {
    return 'complete';
  }

  if (currentRank === targetRank) {
    return currentPhase === 'ready' ? 'complete' : 'in-progress';
  }

  return 'pending';
}

function getActionStatus(
  currentPhase: WorkbenchProcessPhase,
  targetPhase: Exclude<WorkbenchProcessPhase, 'idle'>,
): BackendAction['status'] {
  const currentRank = getPhaseRank(currentPhase);
  const targetRank = getPhaseRank(targetPhase);

  if (currentRank > targetRank || currentPhase === 'ready') {
    return 'success';
  }

  if (currentRank === targetRank) {
    return currentPhase === 'ready' ? 'success' : 'running';
  }

  return 'pending';
}

function hasReachedPhase(
  currentPhase: WorkbenchProcessPhase,
  targetPhase: Exclude<WorkbenchProcessPhase, 'idle'>,
) {
  return (
    currentPhase !== 'idle' &&
    getPhaseRank(currentPhase) >= getPhaseRank(targetPhase)
  );
}

function extractRecognizedObjects(activeQuery: string, scenario: ScenarioDefinition) {
  const normalizedQuery = activeQuery.toLowerCase();
  const objects = [
    'subscriber',
    'home',
    'gateway',
    'device',
    'session',
    'region',
    'organization',
    'cohort',
    'segment',
    'campaign',
    'offer',
  ].filter((objectName) => normalizedQuery.includes(objectName));

  if (objects.length > 0) {
    return objects;
  }

  return scenario.evidenceDomains.slice(0, 3);
}

function buildCapabilityChain(
  scenario: ScenarioDefinition,
  scopeLabel: string,
): WorkbenchCapabilityStage[] {
  return [
    {
      id: 'device',
      title: 'Device Signals',
      summary: `Collecting edge evidence for ${scopeLabel}.`,
      bullets: scenario.evidenceDomains.slice(0, 2),
      status: 'complete',
    },
    {
      id: 'cloud',
      title: 'Cloud Checks',
      summary: `Correlating historical and platform context for ${scenario.title}.`,
      bullets: scenario.evidenceDomains.slice(1, 3),
      status: 'complete',
    },
    {
      id: 'agent',
      title: 'Agent Reasoning / Actions',
      summary: `Preparing the demo answer and next-step guidance for ${scopeLabel}.`,
      bullets: scenario.followUps.slice(0, 2),
      status: 'active',
    },
  ];
}

export function buildProcessRailSnapshot({
  scenario,
  activeQuery,
  scopeLabel,
  phase,
}: BuildProcessRailSnapshotOptions): WorkbenchModel['processRail'] {
  const reasoning: ReasoningStep[] = [];
  const backendActions: BackendAction[] = [];
  const auditEntries: AuditEntry[] = [];
  const evidencePreview = scenario.evidenceDomains.slice(0, 3).join(', ');
  const evidenceDetail = scenario.evidenceDomains.join(', ');

  if (hasReachedPhase(phase, 'intake')) {
    const status = getProcessStatus(phase, 'intake');
    const actionStatus = getActionStatus(phase, 'intake');

    reasoning.push({
      id: `${scenario.id}-reasoning-intake`,
      label: status === 'in-progress' ? 'Framing question' : 'Question framed',
      detail:
        status === 'in-progress'
          ? `Framing "${activeQuery}" within ${scopeLabel}.`
          : `Scoped "${activeQuery}" to ${scopeLabel}.`,
      confidence: 0.99,
      status,
    });

    backendActions.push({
      id: `${scenario.id}-backend-intake`,
      label:
        actionStatus === 'running'
          ? 'Logging query and scope context'
          : 'Logged query and scope context',
      status: actionStatus,
      timestamp: 'just now',
      detail: scopeLabel,
    });

    auditEntries.push({
      id: `${scenario.id}-audit-query`,
      action: `Queued question: ${activeQuery}`,
      actor: 'AI Assistant',
      timestamp: 'just now',
      type: 'query',
      detail: scopeLabel,
    });
  }

  if (hasReachedPhase(phase, 'evidence')) {
    const status = getProcessStatus(phase, 'evidence');
    const actionStatus = getActionStatus(phase, 'evidence');

    reasoning.push({
      id: `${scenario.id}-reasoning-evidence`,
      label:
        status === 'in-progress'
          ? 'Selecting evidence bundle'
          : 'Evidence bundle selected',
      detail:
        status === 'in-progress'
          ? `Checking ${evidencePreview} for ${scenario.title}.`
          : `Selected ${evidencePreview} for ${scenario.title}.`,
      confidence: 0.94,
      status,
    });

    backendActions.push({
      id: `${scenario.id}-backend-evidence`,
      label:
        actionStatus === 'running'
          ? 'Loading scenario evidence domains'
          : 'Loaded scenario evidence domains',
      status: actionStatus,
      timestamp: 'just now',
      detail: evidenceDetail,
    });

    auditEntries.push({
      id: `${scenario.id}-audit-evidence`,
      action: `Loaded evidence for ${scenario.title}`,
      actor: 'AI Engine',
      timestamp: 'just now',
      type: 'system',
      detail: evidenceDetail,
    });
  }

  if (hasReachedPhase(phase, 'synthesis')) {
    const status = getProcessStatus(phase, 'synthesis');
    const actionStatus = getActionStatus(phase, 'synthesis');

    reasoning.push({
      id: `${scenario.id}-reasoning-synthesis`,
      label:
        status === 'in-progress'
          ? 'Assembling demo answer'
          : 'Demo answer assembled',
      detail:
        status === 'in-progress'
          ? `Synthesizing ${scenario.title.toLowerCase()} findings into a scoped operator view.`
          : `Synthesized ${scenario.title.toLowerCase()} findings into a scoped operator view.`,
      confidence: scenario.confidence / 100,
      status,
    });

    backendActions.push({
      id: `${scenario.id}-backend-synthesis`,
      label:
        actionStatus === 'running'
          ? 'Synthesizing scoped demo response'
          : 'Synthesized scoped demo response',
      status: actionStatus,
      timestamp: 'just now',
      detail: scenario.title,
    });

    auditEntries.push({
      id: `${scenario.id}-audit-synthesis`,
      action: `Synthesizing answer for ${activeQuery}`,
      actor: 'AI Assistant',
      timestamp: 'just now',
      type: 'system',
      detail: scenario.title,
    });
  }

  if (hasReachedPhase(phase, 'ready')) {
    const status = getProcessStatus(phase, 'ready');
    const actionStatus = getActionStatus(phase, 'ready');

    reasoning.push({
      id: `${scenario.id}-reasoning-ready`,
      label: 'Next action prepared',
      detail: scenario.followUps[0]
        ? `Prepared the next recommended question: ${scenario.followUps[0]}`
        : `Prepared the next recommended operator action for ${scopeLabel}.`,
      confidence: 0.9,
      status,
    });

    backendActions.push({
      id: `${scenario.id}-backend-ready`,
      label: 'Prepared scoped demo response',
      status: actionStatus,
      timestamp: 'just now',
      detail: scenario.title,
    });

    auditEntries.push({
      id: `${scenario.id}-audit-ready`,
      action: `Demo answer ready for ${activeQuery}`,
      actor: 'System',
      timestamp: 'just now',
      type: 'action',
      detail: scenario.title,
    });
  }

  return {
    reasoning,
    backendActions,
    auditEntries,
  };
}

export function buildWorkbenchModel({
  scenario,
  activeQuery,
  scopeLabel,
}: BuildWorkbenchModelOptions): WorkbenchModel {
  const trimmedQuery = activeQuery.trim() || scenario.title;
  const processRail = buildProcessRailSnapshot({
    scenario,
    activeQuery: trimmedQuery,
    scopeLabel,
    phase: 'ready',
  });

  return {
    currentQuestion: {
      title: trimmedQuery,
      summary: trimmedQuery,
      scopeLabel,
      recognizedObjects: extractRecognizedObjects(trimmedQuery, scenario),
      suggestedRefinements: scenario.followUps.slice(0, 3),
    },
    capabilityChain: buildCapabilityChain(scenario, scopeLabel),
    processRail,
  };
}
