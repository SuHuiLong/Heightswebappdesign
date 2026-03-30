import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Bot, Sparkles, ChevronRight, Clock, Shield, Layers } from 'lucide-react';
import { ScenarioDefinition } from '../lib/scenario-definitions';
import { GenerativeBlockRenderer } from './generative-cards';

// ─── Loading Stage Indicator ───────────────────────────────────────────────

function LoadingStageIndicator({ stages, currentStage }: { stages: string[]; currentStage: number }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="chat-card-row mb-3 flex gap-2.5">
      <div className="chat-message-avatar flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--accent-color)]">
        <Bot className="h-4 w-4 text-[color:var(--primary)]" />
      </div>
      <div className="flex-1">
        <div className="chat-card-shell relative overflow-hidden rounded-[var(--radius-card)] border border-[color:var(--border)] bg-[var(--card)] shadow-[var(--shadow-xs)]">
          <div className="chat-card-content p-3.5">
            <div className="mb-3 flex items-center gap-2">
              <motion.div
                animate={
                  shouldReduceMotion
                    ? undefined
                    : { rotate: 360 }
                }
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="h-4 w-4" style={{ color: 'var(--primary)' }} />
              </motion.div>
              <span className="text-[13px] font-medium" style={{ color: 'var(--foreground)' }}>
                Assembling workspace...
              </span>
            </div>
            <div className="space-y-2">
              {stages.map((stage, idx) => {
                const isComplete = idx < currentStage;
                const isActive = idx === currentStage;
                const isPending = idx > currentStage;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-2"
                  >
                    {isComplete && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex h-5 w-5 items-center justify-center rounded-full"
                        style={{ background: 'var(--success)' }}
                      >
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    )}
                    {isActive && (
                      <motion.div
                        animate={shouldReduceMotion ? undefined : { scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="flex h-5 w-5 items-center justify-center rounded-full"
                        style={{ background: 'var(--primary)' }}
                      >
                        <div className="h-2 w-2 rounded-full bg-white" />
                      </motion.div>
                    )}
                    {isPending && (
                      <div
                        className="flex h-5 w-5 items-center justify-center rounded-full"
                        style={{ background: 'var(--neutral-200)' }}
                      >
                        <div className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--neutral-400)' }} />
                      </div>
                    )}
                    <span
                      className="text-[12px]"
                      style={{
                        color: isComplete
                          ? 'var(--success)'
                          : isActive
                            ? 'var(--foreground)'
                            : 'var(--neutral-400)',
                        fontWeight: isActive ? 500 : 400,
                      }}
                    >
                      {stage}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Workspace Session Header ──────────────────────────────────────────────

function WorkspaceSessionHeader({ scenario }: { scenario: ScenarioDefinition }) {
  const confidenceColor =
    scenario.confidence >= 90
      ? 'var(--success)'
      : scenario.confidence >= 80
        ? 'var(--primary)'
        : 'var(--warning)';

  const familyLabel =
    scenario.family === 'operations'
      ? 'Operations'
      : scenario.family === 'business'
        ? 'Business'
        : 'Planning';

  const familyIcon = scenario.family === 'operations' ? Shield : scenario.family === 'business' ? Layers : Clock;

  const FamilyIcon = familyIcon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="chat-card-row mb-3 flex gap-2.5"
    >
      <div className="chat-message-avatar flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--accent-color)]">
        <Bot className="h-4 w-4 text-[color:var(--primary)]" />
      </div>
      <div className="flex-1">
        <div className="chat-card-shell relative overflow-hidden rounded-[var(--radius-card)] border border-[color:var(--border)] bg-[var(--card)] shadow-[var(--shadow-xs)]">
          <div className="chat-card-content p-3.5">
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" style={{ color: 'var(--primary)' }} />
                  <h3 className="text-[14px] font-semibold" style={{ color: 'var(--foreground)' }}>
                    {scenario.title}
                  </h3>
                </div>
                <div className="mt-0.5 text-[12px]" style={{ color: 'var(--neutral-500)' }}>
                  {scenario.subtitle}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-lg border border-[color:var(--border)] px-2 py-1">
                  <FamilyIcon className="h-3 w-3" style={{ color: 'var(--primary)' }} />
                  <span className="text-[11px] font-medium" style={{ color: 'var(--neutral-600)' }}>
                    {familyLabel}
                  </span>
                </div>
                <div
                  className="flex items-center gap-1.5 rounded-lg px-2 py-1"
                  style={{ background: `${confidenceColor}14` }}
                >
                  <div className="h-1.5 w-1.5 rounded-full" style={{ background: confidenceColor }} />
                  <span className="text-[11px] font-semibold" style={{ color: confidenceColor }}>
                    {scenario.confidence}% conf.
                  </span>
                </div>
              </div>
            </div>

            <p className="mb-3 text-[13px] leading-[1.4]" style={{ color: 'var(--neutral-600)' }}>
              {scenario.description}
            </p>

            {/* Evidence Domains */}
            <div className="mb-2 flex flex-wrap gap-1.5">
              {scenario.evidenceDomains.map((domain) => (
                <span
                  key={domain}
                  className="rounded-md border border-[color:var(--border)] px-2 py-0.5 text-[11px] font-medium"
                  style={{ color: 'var(--neutral-600)', background: 'var(--surface-base)' }}
                >
                  {domain}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Follow-up Prompts ─────────────────────────────────────────────────────

function FollowUpPrompts({
  prompts,
  onFollowUp,
}: {
  prompts: string[];
  onFollowUp: (prompt: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.15 }}
      className="chat-card-row mb-3 flex gap-2.5"
    >
      <div className="chat-message-avatar flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--accent-color)]">
        <Bot className="h-4 w-4 text-[color:var(--primary)]" />
      </div>
      <div className="flex-1">
        <div className="space-y-2">
          {prompts.map((prompt, idx) => (
            <motion.button
              key={idx}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + idx * 0.06 }}
              whileHover={{ y: -1, scale: 1.004 }}
              whileTap={{ scale: 0.992 }}
              onClick={() => onFollowUp(prompt)}
              className="group flex w-full items-center gap-2 rounded-xl border border-[color:var(--border)] bg-[var(--card)] px-3 py-2.5 text-left shadow-[var(--shadow-xs)] transition-[border-color,box-shadow,transform] duration-200 hover:border-[color:var(--border-strong)] hover:shadow-[var(--shadow-xs)]"
            >
              <ChevronRight
                className="h-3.5 w-3.5 flex-shrink-0 text-[color:var(--primary)] transition-transform group-hover:translate-x-0.5"
              />
              <span className="text-[12px] font-medium text-[color:var(--foreground)]">{prompt}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Workspace Session ────────────────────────────────────────────────

interface WorkspaceSessionProps {
  scenario: ScenarioDefinition;
  onFollowUp: (prompt: string) => void;
}

export function WorkspaceSession({ scenario, onFollowUp }: WorkspaceSessionProps) {
  const shouldReduceMotion = useReducedMotion();
  const [loadingStage, setLoadingStage] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [visibleBlocks, setVisibleBlocks] = useState(0);
  const timestamp = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  // Staged loading animation
  useEffect(() => {
    const stageCount = scenario.loadingStages.length;
    let current = 0;

    const interval = setInterval(() => {
      current += 1;
      setLoadingStage(current);

      if (current >= stageCount) {
        clearInterval(interval);
        // Small delay before showing content
        setTimeout(() => setIsLoaded(true), 400);
      }
    }, 600);

    return () => clearInterval(interval);
  }, [scenario.loadingStages.length]);

  // Staggered block reveal
  useEffect(() => {
    if (!isLoaded) return;

    const blockCount = scenario.blocks.length;
    let current = 0;

    const interval = setInterval(() => {
      current += 1;
      setVisibleBlocks(current);

      if (current >= blockCount) {
        clearInterval(interval);
      }
    }, 300);

    return () => clearInterval(interval);
  }, [isLoaded, scenario.blocks.length]);

  return (
    <>
      {/* Loading stage */}
      <AnimatePresence>
        {!isLoaded && (
          <LoadingStageIndicator stages={scenario.loadingStages} currentStage={loadingStage} />
        )}
      </AnimatePresence>

      {/* Workspace content */}
      <AnimatePresence>
        {isLoaded && (
          <>
            {/* Session header */}
            <WorkspaceSessionHeader scenario={scenario} />

            {/* Rendered blocks */}
            {scenario.blocks.slice(0, visibleBlocks).map((block, idx) => (
              <motion.div
                key={idx}
                initial={
                  shouldReduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: 14, scale: 0.985 }
                }
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{
                  duration: 0.17,
                  delay: 0.018,
                  type: 'spring',
                  stiffness: 220,
                  damping: 24,
                }}
              >
                <GenerativeBlockRenderer block={block} timestamp={timestamp} source="AI Analysis Engine" />
              </motion.div>
            ))}

            {/* Follow-up prompts (show after all blocks) */}
            {visibleBlocks >= scenario.blocks.length && (
              <FollowUpPrompts prompts={scenario.followUps} onFollowUp={onFollowUp} />
            )}
          </>
        )}
      </AnimatePresence>
    </>
  );
}
