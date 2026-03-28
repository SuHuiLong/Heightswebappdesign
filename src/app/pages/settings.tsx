import { AppLayout } from '../components/app-layout';
import { Bell, Shield, Palette, Database, Users, Lock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';

export function Settings() {
  return (
    <AppLayout showTopBar={false}>
      <div className="h-full overflow-auto">
        <div className="max-w-4xl mx-auto p-6">
          <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
            Settings
          </h1>
          <p className="mb-8" style={{ color: 'var(--neutral-500)' }}>
            Configure your Heights AI operations center
          </p>

          <div className="space-y-6">
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
                  className="w-full mt-4"
                  style={{ borderRadius: 'var(--radius-control)' }}
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
                    className="px-3 py-2 rounded-lg border bg-transparent"
                    style={{
                      borderColor: 'var(--border)',
                      color: 'var(--foreground)',
                    }}
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
                    className="px-3 py-2 rounded-lg border bg-transparent"
                    style={{
                      borderColor: 'var(--border)',
                      color: 'var(--foreground)',
                    }}
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
    <div
      className="border rounded-lg p-6"
      style={{
        background: 'var(--card)',
        borderColor: 'var(--border)',
        borderRadius: 'var(--radius-card)',
      }}
    >
      <div className="flex items-start gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
        >
          {icon}
        </div>
        <div>
          <h3 className="font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
            {title}
          </h3>
          <p className="text-sm" style={{ color: 'var(--neutral-500)' }}>
            {description}
          </p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
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
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <div className="font-medium mb-1" style={{ color: 'var(--foreground)' }}>
          {label}
        </div>
        <div className="text-sm" style={{ color: 'var(--neutral-500)' }}>
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
    <div
      className="flex items-center justify-between p-3 rounded-lg"
      style={{
        background: 'var(--neutral-50)',
        border: '1px solid var(--border)',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: 'var(--primary)' }}
        >
          <Lock className="h-5 w-5" style={{ color: 'var(--primary-foreground)' }} />
        </div>
        <div>
          <div className="font-medium" style={{ color: 'var(--foreground)' }}>
            {name}
          </div>
          <div className="text-sm" style={{ color: 'var(--neutral-500)' }}>
            {email}
          </div>
        </div>
      </div>
      <div
        className="px-3 py-1 rounded text-sm font-medium"
        style={{
          background: 'var(--primary)',
          color: 'var(--primary-foreground)',
        }}
      >
        {role}
      </div>
    </div>
  );
}
