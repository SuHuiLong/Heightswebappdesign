import { Loader2, AlertCircle, XCircle, Shield, Lightbulb, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';

// Loading State
interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'AI analyzing your request...' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2
        className="h-12 w-12 animate-spin mb-4"
        style={{ color: 'var(--primary)' }}
      />
      <p className="text-lg font-medium mb-2" style={{ color: 'var(--foreground)' }}>
        {message}
      </p>
      <div className="flex gap-2 mt-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div
      className="w-40 h-24 rounded-lg animate-pulse"
      style={{
        background: 'var(--neutral-100)',
        borderRadius: 'var(--radius-card)',
      }}
    />
  );
}

// Empty State
interface EmptyStateProps {
  onSuggestionClick?: (suggestion: string) => void;
}

export function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  const suggestions = [
    'Show me network health status',
    'List all offline gateways',
    'Find subscribers with issues',
    'Optimize WiFi in downtown region',
  ];

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center max-w-2xl mx-auto">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ background: 'var(--primary)' + '20' }}
      >
        <Lightbulb className="h-8 w-8" style={{ color: 'var(--primary)' }} />
      </div>
      <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
        Welcome to Heights AI Command Center
      </h3>
      <p className="mb-6" style={{ color: 'var(--neutral-500)' }}>
        I'm your AI operations assistant. Ask me anything about your network, subscribers, or devices.
        I can help you monitor, diagnose, and take action.
      </p>

      <div className="w-full space-y-2 mb-4">
        <p className="text-sm font-semibold mb-3" style={{ color: 'var(--neutral-600)' }}>
          TRY ASKING:
        </p>
        {suggestions.map((suggestion, idx) => (
          <button
            key={idx}
            onClick={() => onSuggestionClick?.(suggestion)}
            className="w-full p-3 rounded-lg border text-left hover:shadow-md transition-all"
            style={{
              background: 'var(--card)',
              borderColor: 'var(--border)',
              borderRadius: 'var(--radius-control)',
            }}
          >
            <span className="text-sm" style={{ color: 'var(--foreground)' }}>
              "{suggestion}"
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Error State
interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onEscalate?: () => void;
}

export function ErrorState({
  title = 'Operation Failed',
  message = 'An error occurred while processing your request. Please try again or escalate to support.',
  onRetry,
  onEscalate,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center max-w-lg mx-auto">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ background: 'var(--critical)' + '20' }}
      >
        <XCircle className="h-8 w-8" style={{ color: 'var(--critical)' }} />
      </div>
      <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
        {title}
      </h3>
      <p className="mb-6" style={{ color: 'var(--neutral-600)' }}>
        {message}
      </p>

      <div
        className="w-full p-4 rounded-lg border-l-4 mb-6 text-left"
        style={{
          background: 'var(--critical-bg)',
          borderColor: 'var(--critical)',
        }}
      >
        <div className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 mt-0.5" style={{ color: 'var(--critical)' }} />
          <div>
            <div className="text-sm font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
              Error Details
            </div>
            <div className="text-sm" style={{ color: 'var(--neutral-700)' }}>
              Code: ERR_GATEWAY_TIMEOUT
              <br />
              Timestamp: {new Date().toLocaleString()}
              <br />
              Correlation ID: err-2024-03-27-{Math.random().toString(36).substr(2, 9)}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 w-full">
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            className="flex-1"
            style={{ borderRadius: 'var(--radius-control)' }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        )}
        {onEscalate && (
          <Button
            onClick={onEscalate}
            className="flex-1"
            style={{
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
              borderRadius: 'var(--radius-control)',
            }}
          >
            Escalate to Support
          </Button>
        )}
      </div>
    </div>
  );
}

// Permission State
interface PermissionStateProps {
  action?: string;
  requiredRole?: string;
}

export function PermissionState({
  action = 'perform this action',
  requiredRole = 'Admin or Operator',
}: PermissionStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center max-w-lg mx-auto">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ background: 'var(--warning)' + '20' }}
      >
        <Shield className="h-8 w-8" style={{ color: 'var(--warning)' }} />
      </div>
      <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
        Access Restricted
      </h3>
      <p className="mb-6" style={{ color: 'var(--neutral-600)' }}>
        You don't have permission to {action}. This operation requires {requiredRole} role.
      </p>

      <div
        className="w-full p-4 rounded-lg border text-left mb-6"
        style={{
          background: 'var(--warning-bg)',
          borderColor: 'var(--warning-border)',
        }}
      >
        <div className="text-sm font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
          Your Current Permissions:
        </div>
        <ul className="text-sm space-y-1" style={{ color: 'var(--neutral-700)' }}>
          <li>✓ View network status and metrics</li>
          <li>✓ Query subscriber information</li>
          <li>✓ Generate reports</li>
          <li>✗ Execute gateway operations</li>
          <li>✗ Modify system configurations</li>
        </ul>
      </div>

      <Button
        variant="outline"
        className="w-full"
        style={{ borderRadius: 'var(--radius-control)' }}
      >
        Contact Administrator
      </Button>
    </div>
  );
}

// Streaming Response State
export function StreamingState() {
  return (
    <div className="flex gap-3 mb-4">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: 'var(--primary)' }}
      >
        <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'var(--primary-foreground)' }} />
      </div>
      <div className="flex-1 max-w-[70%]">
        <div
          className="px-4 py-3 rounded-lg border"
          style={{
            background: 'var(--card)',
            borderColor: 'var(--border)',
            borderRadius: 'var(--radius-card)',
          }}
        >
          <div className="flex gap-1.5">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: 'var(--primary)', animationDelay: '0ms' }}
            />
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: 'var(--primary)', animationDelay: '150ms' }}
            />
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: 'var(--primary)', animationDelay: '300ms' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
