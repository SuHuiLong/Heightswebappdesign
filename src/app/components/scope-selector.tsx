import { useMemo, useState, type ComponentType, type CSSProperties } from 'react';
import {
  Building2,
  ChevronDown,
  ChevronRight,
  Globe,
  Home,
  Layers,
  MapPin,
  Router,
  Target,
  Users,
  Wifi,
} from 'lucide-react';
import { motion } from 'motion/react';
import type { WorkspaceId } from '../lib/workspace-definitions';
import type { ScopeSelection } from '../lib/scope-data';
import {
  getScopeCommandOptionsForWorkspace,
  getWorkspaceScopeConfig,
  getWorkspaceScopePaletteStateForTarget,
  getWorkspaceScopeSelectorLabel,
  type WorkspaceScopeLevel,
} from '../lib/workspace-experience';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export type { ScopeSelection } from '../lib/scope-data';

interface ScopeSelectorProps {
  value: ScopeSelection;
  onChange: (value: ScopeSelection) => void;
  compact?: boolean;
  workspaceId?: WorkspaceId;
}

type IconComponent = ComponentType<{ className?: string; style?: CSSProperties }>;

function getLevelIcon(
  workspaceId: WorkspaceId,
  level: WorkspaceScopeLevel,
): IconComponent {
  if (workspaceId === 'support') {
    switch (level) {
      case 'region':
        return Users;
      case 'organization':
        return Home;
      case 'subscriber':
        return Router;
      case 'device':
        return Wifi;
      case 'all':
        return Globe;
    }
  }

  if (workspaceId === 'growth') {
    switch (level) {
      case 'all':
        return Globe;
      case 'region':
        return Layers;
      case 'organization':
        return Target;
      case 'subscriber':
        return Users;
      case 'device':
        return Wifi;
    }
  }

  switch (level) {
    case 'all':
      return Globe;
    case 'region':
      return MapPin;
    case 'organization':
      return Building2;
    case 'subscriber':
      return Layers;
    case 'device':
      return Wifi;
  }
}

function getLevelColor(workspaceId: WorkspaceId, level: WorkspaceScopeLevel) {
  if (workspaceId === 'support') {
    switch (level) {
      case 'region':
        return 'var(--warning)';
      case 'organization':
        return 'var(--ambient-cyan)';
      case 'subscriber':
        return 'var(--primary)';
      case 'device':
        return 'var(--success)';
      case 'all':
        return 'var(--primary)';
    }
  }

  if (workspaceId === 'growth') {
    switch (level) {
      case 'all':
        return 'var(--ambient-warm)';
      case 'region':
        return 'var(--ambient-warm)';
      case 'organization':
        return 'var(--warning)';
      case 'subscriber':
        return 'var(--primary)';
      case 'device':
        return 'var(--success)';
    }
  }

  switch (level) {
    case 'all':
      return 'var(--primary)';
    case 'region':
      return 'var(--secondary-foreground)';
    case 'organization':
      return 'var(--success)';
    case 'subscriber':
      return 'var(--warning)';
    case 'device':
      return 'var(--primary)';
  }
}

function hasSelectionForLevel(value: ScopeSelection, level: WorkspaceScopeLevel) {
  switch (level) {
    case 'all':
      return value.level === 'all';
    case 'region':
      return Boolean(value.region);
    case 'organization':
      return Boolean(value.organization);
    case 'subscriber':
      return Boolean(value.subscriber);
    case 'device':
      return Boolean(value.device);
  }
}

function shouldShowLevel(
  value: ScopeSelection,
  levelOrder: WorkspaceScopeLevel[],
  level: WorkspaceScopeLevel,
) {
  const levelIndex = levelOrder.indexOf(level);
  if (levelIndex <= 0) {
    return true;
  }

  const previousLevel = levelOrder[levelIndex - 1];
  if (previousLevel === 'all') {
    return true;
  }
  return hasSelectionForLevel(value, previousLevel);
}

export function ScopeSelector({
  value,
  onChange,
  compact = false,
  workspaceId = 'fleet',
}: ScopeSelectorProps) {
  const [openLevel, setOpenLevel] = useState<WorkspaceScopeLevel | null>(null);
  const scopeSpec = getWorkspaceScopeConfig(workspaceId);

  const visibleLevels = useMemo(
    () =>
      scopeSpec.levelOrder.filter((level) =>
        shouldShowLevel(value, scopeSpec.levelOrder, level),
      ),
    [scopeSpec.levelOrder, value],
  );

  const buttonClassName = compact
    ? 'flex h-8 items-center gap-1.5 rounded-md px-2 text-[11px] font-medium transition-all'
    : 'flex items-center gap-1.5 rounded px-2 py-0.5 text-[11px] font-medium transition-all';

  return (
    <div className={`flex items-center ${compact ? 'gap-1' : 'gap-1.5'}`}>
      <div
        className={`${
          compact ? 'min-w-0 flex flex-1 items-center gap-1' : 'ml-1 flex items-center gap-0.5'
        }`}
      >
        {visibleLevels.map((level, index) => {
          const Icon = getLevelIcon(workspaceId, level);
          const color = getLevelColor(workspaceId, level);
          const label = getWorkspaceScopeSelectorLabel(workspaceId, level, value);
          const options = getScopeCommandOptionsForWorkspace(
            workspaceId,
            getWorkspaceScopePaletteStateForTarget(workspaceId, level, value),
            '',
            value,
          ).filter((option) => option.scope);

          const isSelected =
            level === 'all' ? value.level === 'all' : value.level === level;

          return (
            <div key={level} className="flex items-center">
              {index > 0 && (
                <ChevronRight
                  className="h-3 w-3 text-[color:var(--neutral-400)]"
                />
              )}

              <DropdownMenu
                open={openLevel === level}
                onOpenChange={(isOpen) => setOpenLevel(isOpen ? level : null)}
              >
                <DropdownMenuTrigger asChild>
                  <motion.button
                    className={buttonClassName}
                    style={{
                      background: isSelected
                        ? `${color}22`
                        : 'transparent',
                      color:
                        isSelected || hasSelectionForLevel(value, level)
                          ? 'var(--foreground)'
                          : 'var(--muted-foreground)',
                    }}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className={compact ? 'max-w-[120px] truncate' : ''}>
                      {label}
                    </span>
                    <ChevronDown className="h-3 w-3" />
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {options.map((option) => (
                    <DropdownMenuItem
                      key={option.id}
                      onClick={() => {
                        if (option.scope) {
                          onChange(option.scope);
                        }
                        setOpenLevel(null);
                      }}
                    >
                      <Icon
                        className="mr-2 h-4 w-4"
                        style={{ color }}
                      />
                      <div className="flex min-w-0 flex-col">
                        <span>{option.label}</span>
                        <span className="text-[10px] text-[color:var(--neutral-500)]">
                          {option.description}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}
      </div>
    </div>
  );
}
