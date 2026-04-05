import { useState, useCallback, useEffect } from 'react';
import { AppLayout } from '../components/app-layout';
import { Bell, Shield, Palette, Database, Users, Lock, LayoutGrid, Eye, EyeOff, Plus, Trash2, Pencil, Check, X, GripVertical, ChevronDown, ChevronRight, MessageSquare, Layers } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { ThemeToggle } from '../components/theme-toggle';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '../components/ui/dialog';
import {
  useWorkspaceCardSettings,
  type WorkspaceKey,
  type ScenarioCard,
  type ScopeActionCard,
} from '../lib/use-workspace-card-settings';
import { toast } from 'sonner';
import { OPERATIONS_SCENARIOS, ALL_OPS_SCOPE_ACTIONS } from './workspace-operations';
import { SUPPORT_SCENARIOS, ALL_SUPPORT_SCOPE_ACTIONS } from './workspace-support';
import { GROWTH_SCENARIOS, ALL_GROWTH_SCOPE_ACTIONS } from './workspace-growth';
import { getWorkspaceScopeConfig } from '../lib/workspace-experience';

const WORKSPACE_META: Record<WorkspaceKey, { label: string; color: string }> = {
  fleet: { label: 'Fleet Intelligence', color: 'var(--ambient-violet)' },
  support: { label: 'Support', color: 'var(--ambient-cyan)' },
  growth: { label: 'Growth', color: 'var(--ambient-amber)' },
};

function toScenarioCards(items: typeof OPERATIONS_SCENARIOS): ScenarioCard[] {
  return items.map(s => ({ id: s.id, title: s.title, description: s.description, query: s.query, icon: s.icon ?? 'zap', hidden: false }));
}

function toScopeActionCards(items: { id: string; title: string; description: string; prompt: string; action?: string }[]): ScopeActionCard[] {
  return items.map(a => ({ id: a.id, title: a.title, description: a.description, prompt: a.prompt ?? '', action: (a as any).action, hidden: false }));
}

const DEFAULT_SCENARIOS: Record<WorkspaceKey, ScenarioCard[]> = {
  fleet: toScenarioCards(OPERATIONS_SCENARIOS),
  support: toScenarioCards(SUPPORT_SCENARIOS),
  growth: toScenarioCards(GROWTH_SCENARIOS),
};

const DEFAULT_SCOPE_ACTIONS: Record<WorkspaceKey, ScopeActionCard[]> = {
  fleet: toScopeActionCards(ALL_OPS_SCOPE_ACTIONS),
  support: toScopeActionCards(ALL_SUPPORT_SCOPE_ACTIONS),
  growth: toScopeActionCards(ALL_GROWTH_SCOPE_ACTIONS),
};

const SCOPE_LEVELS = [
  { prefix: 'all-', level: 'all' },
  { prefix: 'region-', level: 'region' },
  { prefix: 'org-', level: 'organization' },
  { prefix: 'sub-', level: 'subscriber' },
  { prefix: 'device-', level: 'device' },
] as const;

function groupByScopeLevel(workspace: WorkspaceKey, cards: ScopeActionCard[]) {
  const scopeConfig = getWorkspaceScopeConfig(workspace);

  return SCOPE_LEVELS.map(({ prefix, level }) => ({
    level: prefix,
    label: scopeConfig.levelLabels[level] ?? level,
    cards: cards.filter(c => c.id.startsWith(prefix)),
  })).filter(g => g.cards.length > 0);
}

export function Settings() {
  return (
    <AppLayout showTopBar={true}>
      <div className="h-full overflow-auto">
        <div className="workspace-shell-settings px-3 py-3 lg:px-4 lg:py-4 2xl:px-5 2xl:py-5">
          <h1 className="mb-2 text-lg font-semibold tracking-tight text-[color:var(--foreground)] lg:text-[1.125rem]">
            Settings
          </h1>
          <p className="mb-5 text-[13px] text-[color:var(--neutral-500)]">
            Configure your Heights AI operations center
          </p>

          <div className="space-y-3 lg:space-y-4">
            <WorkspaceCardsSection />

            <SettingsSection icon={<Bell className="h-5 w-5" />} title="Notifications" description="Manage your alert and notification preferences">
              <SettingItem label="Email Notifications" description="Receive email alerts for critical events" control={<Switch defaultChecked />} />
              <SettingItem label="AI Action Confirmations" description="Require confirmation before AI executes high-risk actions" control={<Switch defaultChecked />} />
              <SettingItem label="Fleet Status Updates" description="Daily summary of fleet health and metrics" control={<Switch />} />
            </SettingsSection>

            <SettingsSection icon={<Shield className="h-5 w-5" />} title="Security & Access" description="Control access permissions and security settings">
              <SettingItem label="Two-Factor Authentication" description="Add an extra layer of security to your account" control={<Switch defaultChecked />} />
              <SettingItem label="Session Timeout" description="Automatically log out after 30 minutes of inactivity" control={<Switch defaultChecked />} />
              <SettingItem label="Audit Log Retention" description="Keep audit logs for 90 days" control={<Button variant="outline" size="sm">Configure</Button>} />
            </SettingsSection>

            <SettingsSection icon={<Database className="h-5 w-5" />} title="AI Preferences" description="Customize AI assistant behavior and capabilities">
              <SettingItem label="Auto-Remediation" description="Allow AI to automatically fix low-risk issues" control={<Switch defaultChecked />} />
              <SettingItem label="Proactive Suggestions" description="AI will suggest optimizations based on network patterns" control={<Switch defaultChecked />} />
              <SettingItem label="Learning Mode" description="AI learns from your feedback and decisions" control={<Switch />} />
            </SettingsSection>

            <SettingsSection icon={<Users className="h-5 w-5" />} title="Team & Roles" description="Manage team members and role-based access control">
              <div className="space-y-3">
                <TeamMember name="Sarah Johnson" email="sarah.johnson@acme.com" role="Admin" />
                <TeamMember name="Mike Chen" email="mike.chen@acme.com" role="Operator" />
                <TeamMember name="Lisa Wong" email="lisa.wong@acme.com" role="Viewer" />
                <Button variant="outline" className="mt-4 w-full rounded-[var(--radius-control)]">Invite Team Member</Button>
              </div>
            </SettingsSection>

            <SettingsSection icon={<Palette className="h-5 w-5" />} title="Appearance" description="Customize the look and feel of your interface">
              <SettingItem label="Theme" description="Toggle between light and dark mode" control={<ThemeToggle />} />
              <SettingItem label="Information Density" description="Adjust the amount of information displayed" control={
                <select className="rounded-lg border border-[color:var(--border)] bg-[var(--surface-raised)] px-3 py-2 text-[12px] text-[color:var(--foreground)] shadow-[var(--shadow-xs)]">
                  <option value="comfortable">Comfortable</option>
                  <option value="compact">Compact</option>
                </select>
              } />
            </SettingsSection>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

/* ═══════════════════════════════════════════════════════════
   Workspace Cards — Collapsible Workspace Panels
   ═══════════════════════════════════════════════════════════ */

function WorkspaceCardsSection() {
  const cardSettings = useWorkspaceCardSettings();

  return (
    <SettingsSection
      icon={<LayoutGrid className="h-5 w-5" />}
      title="Workspace Cards"
      description="Show, hide or customize cards in each workspace"
    >
      <div className="space-y-1">
        {(Object.keys(WORKSPACE_META) as WorkspaceKey[]).map(ws => (
          <WorkspacePanel key={ws} workspace={ws} cardSettings={cardSettings} />
        ))}
      </div>
    </SettingsSection>
  );
}

function WorkspacePanel({ workspace, cardSettings }: { workspace: WorkspaceKey; cardSettings: ReturnType<typeof useWorkspaceCardSettings> }) {
  const [open, setOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const { label, color } = WORKSPACE_META[workspace];

  // Init defaults on mount
  useEffect(() => {
    if (!initialized) {
      if (!cardSettings.getScenarios(workspace)) cardSettings.initScenarios(workspace, DEFAULT_SCENARIOS[workspace]);
      if (!cardSettings.getScopeActions(workspace)) cardSettings.initScopeActions(workspace, DEFAULT_SCOPE_ACTIONS[workspace]);
      setInitialized(true);
    }
  }, [initialized]);

  const scenarios = cardSettings.getScenarios(workspace) ?? DEFAULT_SCENARIOS[workspace];
  const scopeActions = cardSettings.getScopeActions(workspace) ?? DEFAULT_SCOPE_ACTIONS[workspace];

  const scVisible = scenarios.filter(c => !c.hidden).length;
  const scTotal = scenarios.length;
  const saVisible = scopeActions.filter(c => !c.hidden).length;
  const saTotal = scopeActions.length;

  return (
    <div className="rounded-lg border" style={{ borderColor: 'var(--border)' }}>
      {/* Header — always visible */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left hover:bg-[var(--surface-raised)] transition-colors"
      >
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--neutral-400)' }} />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--neutral-400)' }} />
        )}
        <div
          className="h-2 w-2 rounded-full shrink-0"
          style={{ background: color }}
        />
        <span className="text-[13px] font-medium flex-1" style={{ color: 'var(--foreground)' }}>
          {label}
        </span>
        <span className="text-[10px] tabular-nums px-1.5 py-0.5 rounded-full" style={{ background: 'var(--surface-raised)', color: 'var(--neutral-400)' }}>
          <MessageSquare className="h-2.5 w-2.5 inline -mt-px mr-0.5" />{scVisible}/{scTotal}
        </span>
        <span className="text-[10px] tabular-nums px-1.5 py-0.5 rounded-full" style={{ background: 'var(--surface-raised)', color: 'var(--neutral-400)' }}>
          <Layers className="h-2.5 w-2.5 inline -mt-px mr-0.5" />{saVisible}/{saTotal}
        </span>
      </button>

      {/* Body — only when expanded */}
      {open && (
        <div className="px-3 pb-3 space-y-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          {/* Scope Actions by level */}
          <CompactScopeList
            scopeActions={scopeActions}
            workspace={workspace}
            cardSettings={cardSettings}
          />
        </div>
      )}
    </div>
  );
}

/* ─── Compact scenario list (inline rows, no description by default) ─── */

function CompactCardList({ title, icon, cards, onToggle, onReset, workspace, cardSettings }: {
  title: string;
  icon: string;
  cards: ScenarioCard[];
  onToggle: (id: string) => void;
  onReset: () => void;
  workspace: WorkspaceKey;
  cardSettings: ReturnType<typeof useWorkspaceCardSettings>;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = cards.filter(c => !c.hidden).length;

  return (
    <div className="pt-2">
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-2 py-1">
          {expanded ? (
            <ChevronDown className="h-3.5 w-3.5" style={{ color: 'var(--neutral-400)' }} />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" style={{ color: 'var(--neutral-400)' }} />
          )}
          <span className="text-[12px] font-semibold tracking-[0.06em] uppercase" style={{ color: 'var(--neutral-500)' }}>
            {title}
          </span>
          <span className="text-[11px] tabular-nums" style={{ color: 'var(--neutral-400)' }}>
            {visible}/{cards.length}
          </span>
        </button>
        <button onClick={onReset} className="text-[11px] px-2 py-1 rounded-md hover:bg-[var(--surface-raised)] transition-colors" style={{ color: 'var(--neutral-400)' }}>
          Reset
        </button>
      </div>

      {expanded && (
        <div className="space-y-0.5">
          {cards.map(card => (
            <CompactRow
              key={card.id}
              title={card.title}
              hidden={!!card.hidden}
              onToggle={() => onToggle(card.id)}
              fields={[
                { key: 'title', label: 'Title', value: card.title },
                { key: 'description', label: 'Description', value: card.description },
                { key: 'query', label: 'Query', value: card.query },
              ]}
              onSave={(updates) => { cardSettings.updateScenario(workspace, card.id, updates); toast.success('Saved'); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Compact scope action list grouped by level ─── */

function CompactScopeList({ scopeActions, workspace, cardSettings }: {
  scopeActions: ScopeActionCard[];
  workspace: WorkspaceKey;
  cardSettings: ReturnType<typeof useWorkspaceCardSettings>;
}) {
  const [expandedLevel, setExpandedLevel] = useState<string | null>(null);
  const groups = groupByScopeLevel(workspace, scopeActions);

  return (
    <div className="pt-1">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-semibold tracking-[0.06em] uppercase" style={{ color: 'var(--neutral-500)' }}>
          Scope Actions
        </span>
        <button
          onClick={() => cardSettings.initScopeActions(workspace, DEFAULT_SCOPE_ACTIONS[workspace])}
          className="text-[10px] px-1.5 py-0.5 rounded-md"
          style={{ color: 'var(--neutral-400)' }}
        >
          Reset All
        </button>
      </div>

      <div className="space-y-0.5">
        {groups.map(group => {
          const vis = group.cards.filter(c => !c.hidden).length;
          const isOpen = expandedLevel === group.level;
          return (
            <div key={group.level}>
              <button
                onClick={() => setExpandedLevel(isOpen ? null : group.level)}
                className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-left hover:bg-[var(--surface-raised)] transition-colors"
              >
                {isOpen ? (
                  <ChevronDown className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--neutral-400)' }} />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--neutral-400)' }} />
                )}
                <span className="text-[12px] font-medium flex-1" style={{ color: 'var(--foreground)' }}>
                  {group.label}
                </span>
                <span className="text-[11px] tabular-nums" style={{ color: vis === 0 ? 'var(--critical)' : 'var(--neutral-400)' }}>
                  {vis}/{group.cards.length}
                </span>
              </button>
              {isOpen && (
                <div className="ml-4 space-y-0.5">
                  {group.cards.map(card => (
                    <CompactRow
                      key={card.id}
                      title={card.title}
                      hidden={!!card.hidden}
                      onToggle={() => cardSettings.updateScopeAction(workspace, card.id, { hidden: !card.hidden })}
                      fields={[
                        { key: 'title', label: 'Title', value: card.title },
                        { key: 'description', label: 'Description', value: card.description },
                        { key: 'prompt', label: 'Prompt', value: card.prompt },
                      ]}
                      onSave={(updates) => { cardSettings.updateScopeAction(workspace, card.id, updates); toast.success('Saved'); }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Single compact row: title + edit + eye toggle ─── */

interface EditableField {
  key: string;
  label: string;
  value: string;
}

function CompactRow({ title, hidden, onToggle, fields, onSave }: {
  title: string;
  hidden: boolean;
  onToggle: () => void;
  fields?: EditableField[];
  onSave?: (updates: Record<string, string>) => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});

  const startEdit = () => {
    if (fields && onSave) {
      const initial: Record<string, string> = {};
      fields.forEach(f => initial[f.key] = f.value);
      setDraft(initial);
      setDialogOpen(true);
    }
  };

  const handleSave = () => {
    if (!onSave) return;
    onSave(draft);
    setDialogOpen(false);
    toast.success('Saved');
  };

  return (
    <>
      <div
        onClick={fields && onSave ? startEdit : undefined}
        className={`flex items-center gap-2 px-2 py-1.5 rounded-md ${fields && onSave ? 'cursor-pointer hover:bg-[var(--surface-raised)] transition-colors' : ''}`}
        style={{ opacity: hidden ? 0.45 : 1 }}
      >
        <span className="text-[12px] flex-1 truncate" style={{ color: hidden ? 'var(--neutral-400)' : 'var(--foreground)' }}>
          {title}
        </span>
        <button
          onClick={e => { e.stopPropagation(); onToggle(); }}
          className="p-1.5 rounded-md shrink-0 hover:bg-[var(--surface-raised)] transition-colors"
          title={hidden ? 'Show' : 'Hide'}
        >
          {hidden ? (
            <EyeOff className="h-3.5 w-3.5" style={{ color: 'var(--neutral-400)' }} />
          ) : (
            <Eye className="h-3.5 w-3.5" style={{ color: 'var(--primary)' }} />
          )}
        </button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          style={{ background: 'var(--card)', color: 'var(--foreground)' }}
          className="sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--foreground)' }}>Edit Card</DialogTitle>
            <DialogDescription style={{ color: 'var(--neutral-500)' }}>
              {title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {fields!.map(field => (
              <div key={field.key} className="space-y-1">
                <label className="text-[12px] font-medium" style={{ color: 'var(--neutral-500)' }}>
                  {field.label}
                </label>
                <input
                  value={draft[field.key] ?? ''}
                  onChange={e => setDraft(prev => ({ ...prev, [field.key]: e.target.value }))}
                  onKeyDown={e => {
                    if (e.key === 'Enter') { e.preventDefault(); handleSave(); }
                  }}
                  placeholder={field.label}
                  autoFocus={field.key === 'title'}
                  className="w-full text-sm px-3 py-2 rounded-lg border"
                  style={{
                    background: 'var(--surface-base)',
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)',
                  }}
                />
              </div>
            ))}
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="rounded-[var(--radius-control)]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="rounded-[var(--radius-control)]"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ─── Shared UI ─── */

interface SettingsSectionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}

function SettingsSection({ icon, title, description, children }: SettingsSectionProps) {
  return (
    <div className="rounded-[var(--radius-card)] border border-[color:var(--border)] bg-[var(--card)] p-4 lg:p-5 shadow-[var(--shadow-xs)]">
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[color:var(--border-subtle)] bg-[var(--accent-color)] text-[color:var(--primary)]">
          {icon}
        </div>
        <div>
          <h3 className="mb-1 text-[13px] font-semibold text-[color:var(--foreground)]">{title}</h3>
          <p className="text-[12px] text-[color:var(--neutral-500)]">{description}</p>
        </div>
      </div>
      <div className="space-y-2.5 lg:space-y-3">{children}</div>
    </div>
  );
}

interface SettingItemProps {
  label: string;
  description: string;
  control: React.ReactNode;
}

function SettingItem({ label, description, control }: SettingItemProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex-1">
        <div className="mb-1 text-[13px] font-medium text-[color:var(--foreground)]">{label}</div>
        <div className="text-[12px] text-[color:var(--neutral-500)]">{description}</div>
      </div>
      <div className="ml-4">{control}</div>
    </div>
  );
}

interface TeamMemberProps {
  name: string;
  email: string;
  role: string;
}

function TeamMember({ name, email, role }: TeamMemberProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[color:var(--border)] bg-[var(--surface-base)] p-3 shadow-[var(--shadow-xs)]">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-color)]">
          <Lock className="h-5 w-5 text-[color:var(--primary)]" />
        </div>
        <div>
          <div className="text-[13px] font-medium text-[color:var(--foreground)]">{name}</div>
          <div className="text-[12px] text-[color:var(--neutral-500)]">{email}</div>
        </div>
      </div>
      <div className="rounded border border-[color:var(--border-subtle)] bg-[var(--surface-overlay)] px-2.5 py-1 text-[12px] font-medium text-[color:var(--foreground)]">{role}</div>
    </div>
  );
}
