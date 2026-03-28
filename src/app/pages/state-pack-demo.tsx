import { useState } from 'react';
import { AppLayout } from '../components/app-layout';
import { Button } from '../components/ui/button';
import {
  LoadingState,
  EmptyState,
  ErrorState,
  PermissionState,
  StreamingState,
} from '../components/state-pack';

export function StatePackDemo() {
  const [activeState, setActiveState] = useState<'empty' | 'loading' | 'error' | 'permission' | 'streaming'>('empty');

  const renderState = () => {
    switch (activeState) {
      case 'empty':
        return <EmptyState onSuggestionClick={(s) => console.log(s)} />;
      case 'loading':
        return <LoadingState message="Analyzing network health across all regions..." />;
      case 'error':
        return (
          <ErrorState
            title="Gateway Operation Failed"
            message="Unable to restart gateway GW-4521. The device is not responding to management commands."
            onRetry={() => setActiveState('loading')}
            onEscalate={() => alert('Escalating to Tier-2 support...')}
          />
        );
      case 'permission':
        return (
          <PermissionState
            action="restart gateways"
            requiredRole="Admin or Operator"
          />
        );
      case 'streaming':
        return (
          <div className="max-w-4xl mx-auto p-6">
            <StreamingState />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <AppLayout showTopBar={false}>
      <div className="h-full flex flex-col">
        <div className="border-b p-6" style={{ borderColor: 'var(--border)' }}>
          <h1 className="text-2xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
            State Pack Demo
          </h1>
          <div className="flex gap-2">
            <Button
              variant={activeState === 'empty' ? 'default' : 'outline'}
              onClick={() => setActiveState('empty')}
            >
              Empty State
            </Button>
            <Button
              variant={activeState === 'loading' ? 'default' : 'outline'}
              onClick={() => setActiveState('loading')}
            >
              Loading State
            </Button>
            <Button
              variant={activeState === 'error' ? 'default' : 'outline'}
              onClick={() => setActiveState('error')}
            >
              Error State
            </Button>
            <Button
              variant={activeState === 'permission' ? 'default' : 'outline'}
              onClick={() => setActiveState('permission')}
            >
              Permission State
            </Button>
            <Button
              variant={activeState === 'streaming' ? 'default' : 'outline'}
              onClick={() => setActiveState('streaming')}
            >
              Streaming State
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto flex items-center justify-center">
          {renderState()}
        </div>
      </div>
    </AppLayout>
  );
}
