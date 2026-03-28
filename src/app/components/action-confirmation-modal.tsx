import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';

interface ActionConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action: {
    title: string;
    description: string;
    scope: string;
    expectedImpact: string;
    rollbackHint: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  };
}

export function ActionConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  action,
}: ActionConfirmationModalProps) {
  const [confirmed, setConfirmed] = useState(false);

  const isHighRisk = action.riskLevel === 'high' || action.riskLevel === 'critical';

  const riskColors = {
    low: 'var(--success)',
    medium: 'var(--warning)',
    high: 'var(--severity-high)',
    critical: 'var(--critical)',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-[color:var(--overlay-scrim)]"
            onClick={onClose}
            style={{ backdropFilter: 'blur(4px)' }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative mx-4 w-full max-w-lg rounded-[var(--radius-card)] border border-[color:var(--border)] bg-[var(--card)] shadow-[var(--shadow-md)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[color:var(--border)] p-6">
              <div className="flex items-center gap-3">
                {isHighRisk && (
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: riskColors[action.riskLevel] + '20' }}
                  >
                    <AlertTriangle className="h-5 w-5" style={{ color: riskColors[action.riskLevel] }} />
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
                    {action.title}
                  </h2>
                  <div
                    className="inline-block mt-1 px-2 py-1 rounded text-xs font-medium"
                    style={{
                      background: riskColors[action.riskLevel] + '20',
                      color: riskColors[action.riskLevel],
                    }}
                  >
                    {action.riskLevel.toUpperCase()} RISK
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[color:var(--muted-foreground)]">
                  DESCRIPTION
                </label>
                <p className="text-sm text-[color:var(--foreground)]">
                  {action.description}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[color:var(--muted-foreground)]">
                  SCOPE
                </label>
                <div
                  className="rounded-lg border border-[color:var(--border)] bg-[var(--surface-base)] p-3 text-sm"
                  style={{
                    color: 'var(--foreground)',
                  }}
                >
                  {action.scope}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[color:var(--muted-foreground)]">
                  EXPECTED IMPACT
                </label>
                <p className="text-sm text-[color:var(--foreground)]">
                  {action.expectedImpact}
                </p>
              </div>

              {isHighRisk && (
                <div
                  className="p-4 rounded-lg border-l-4"
                  style={{
                    background: riskColors[action.riskLevel] + '10',
                    borderColor: riskColors[action.riskLevel],
                  }}
                >
                  <div className="text-sm font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
                    Rollback Information
                  </div>
                  <p className="text-sm text-[color:var(--muted-foreground)]">
                    {action.rollbackHint}
                  </p>
                </div>
              )}

              <div className="flex items-start gap-3 pt-2">
                <Checkbox
                  id="confirm-action"
                  checked={confirmed}
                  onCheckedChange={(checked) => setConfirmed(checked as boolean)}
                />
                <label
                  htmlFor="confirm-action"
                  className="cursor-pointer text-sm text-[color:var(--foreground)]"
                >
                  I understand the impact and confirm this action
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-[color:var(--border)] p-6">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  onConfirm();
                  setConfirmed(false);
                }}
                disabled={!confirmed}
                style={{
                  background: confirmed ? 'var(--primary)' : 'var(--disabled-bg)',
                  color: confirmed ? 'var(--primary-foreground)' : 'var(--disabled-text)',
                }}
              >
                Confirm Action
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
