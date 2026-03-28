import { AppLayout } from '../components/app-layout';
import { Bell, Shield, Palette, Database, Users, Lock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';

export function Settings() {
  return (
    <AppLayout showTopBar={false}>
      <div className="h-full overflow-auto">
        <div className="workspace-shell-settings px-3 py-3 lg:px-4 lg:py-4 2xl:px-5 2xl:py-5">
          <h1 className="mb-2 text-lg font-semibold tracking-tight text-[color:var(--foreground)] lg:text-[1.125rem]">
            Settings
          </h1>
          <p className="mb-5 text-[13px] text-[color:var(--neutral-500)]">
            Configure your Heights AI operations center
          </p>

          <div className="space-y-3 lg:space-y-4">
            {/* Notifications */}
            <SettingsSection
              icon={<Bell className="h-5 w-5" />}
              title="Notifications"
              description="Manage your alert and notification preferences"
            >
              <SettingItem
                label="Email Notifications"
                description="Receive email alerts for critical events"
                control={<Switch defaultChecked />}
              />
              <SettingItem
                label="AI Action Confirmations"
                description="Require confirmation before AI executes high-risk actions"
                control={<Switch defaultChecked />}
              />
              <SettingItem
                label="Fleet Status Updates"
                description="Daily summary of fleet health and metrics"
                control={<Switch />}
              />
            </SettingsSection>

            {/* Security & Access */}
            <SettingsSection
              icon={<Shield className="h-5 w-5" />}
              title="Security & Access"
              description="Control access permissions and security settings"
            >
              <SettingItem
                label="Two-Factor Authentication"
                description="Add an extra layer of security to your account"
                control={<Switch defaultChecked />}
              />
              <SettingItem
                label="Session Timeout"
                description="Automatically log out after 30 minutes of inactivity"
                control={<Switch defaultChecked />}
              />
              <SettingItem
                label="Audit Log Retention"
                description="Keep audit logs for 90 days"
                control={
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                }
              />
            </SettingsSection>

            {/* AI Preferences */}
            <SettingsSection
              icon={<Database className="h-5 w-5" />}
              title="AI Preferences"
              description="Customize AI assistant behavior and capabilities"
            >
              <SettingItem
                label="Auto-Remediation"
                description="Allow AI to automatically fix low-risk issues"
                control={<Switch defaultChecked />}
              />
              <SettingItem
                label="Proactive Suggestions"
                description="AI will suggest optimizations based on network patterns"
                control={<Switch defaultChecked />}
              />
              <SettingItem
                label="Learning Mode"
                description="AI learns from your feedback and decisions"
                control={<Switch />}
              />
            </SettingsSection>

            {/* Team & Roles */}
            <SettingsSection
              icon={<Users className="h-5 w-5" />}
              title="Team & Roles"
              description="Manage team members and role-based access control"
            >
              <div className="space-y-3">
                <TeamMember
                  name="Sarah Johnson"
                  email="sarah.johnson@acme.com"
                  role="Admin"
                />
                <TeamMember
                  name="Mike Chen"
                  email="mike.chen@acme.com"
                  role="Operator"
                />
                <TeamMember
                  name="Lisa Wong"
                  email="lisa.wong@acme.com"
                  role="Viewer"
                />
                <Button
                  variant="outline"
                  className="mt-4 w-full rounded-[var(--radius-control)]"
                >
                  Invite Team Member
                </Button>
              </div>
            </SettingsSection>

            {/* Appearance */}
            <SettingsSection
              icon={<Palette className="h-5 w-5" />}
              title="Appearance"
              description="Customize the look and feel of your interface"
            >
              <SettingItem
                label="Theme"
                description="Choose between light and dark mode"
                control={
                  <select
                    className="rounded-lg border border-[color:var(--border)] bg-[var(--surface-raised)] px-3 py-2 text-[12px] text-[color:var(--foreground)] shadow-[var(--shadow-xs)]"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                }
              />
              <SettingItem
                label="Information Density"
                description="Adjust the amount of information displayed"
                control={
                  <select
                    className="rounded-lg border border-[color:var(--border)] bg-[var(--surface-raised)] px-3 py-2 text-[12px] text-[color:var(--foreground)] shadow-[var(--shadow-xs)]"
                  >
                    <option value="comfortable">Comfortable</option>
                    <option value="compact">Compact</option>
                  </select>
                }
              />
            </SettingsSection>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

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
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-[color:var(--border-subtle)] bg-[var(--accent-color)] text-[color:var(--primary)]"
        >
          {icon}
        </div>
        <div>
          <h3 className="mb-1 text-[13px] font-semibold text-[color:var(--foreground)]">
            {title}
          </h3>
          <p className="text-[12px] text-[color:var(--neutral-500)]">
            {description}
          </p>
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
        <div className="mb-1 text-[13px] font-medium text-[color:var(--foreground)]">
          {label}
        </div>
        <div className="text-[12px] text-[color:var(--neutral-500)]">
          {description}
        </div>
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
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-color)]"
        >
          <Lock className="h-5 w-5 text-[color:var(--primary)]" />
        </div>
        <div>
          <div className="text-[13px] font-medium text-[color:var(--foreground)]">
            {name}
          </div>
          <div className="text-[12px] text-[color:var(--neutral-500)]">
            {email}
          </div>
        </div>
      </div>
      <div className="rounded border border-[color:var(--border-subtle)] bg-[var(--surface-overlay)] px-2.5 py-1 text-[12px] font-medium text-[color:var(--foreground)]">
        {role}
      </div>
    </div>
  );
}
