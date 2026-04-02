import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { ChevronDown, Activity, FileText, Settings as SettingsIcon, Search, Menu, X, Users, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ScopeSelector, ScopeSelection } from './scope-selector';
import { useIsMobile } from './ui/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

interface LayoutProps {
  children: ReactNode;
  rightPanel?: ReactNode;
  showTopBar?: boolean;
  scopeIndicator?: string;
  onScopeChange?: (scope: ScopeSelection) => void;
  scopeValue?: ScopeSelection;
}

export function AppLayout({ children, rightPanel, showTopBar = true, scopeIndicator, onScopeChange, scopeValue }: LayoutProps) {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [internalScope, setInternalScope] = useState<ScopeSelection>({
    level: 'all',
  });
  const currentScope = scopeValue ?? internalScope;

  const handleScopeChange = (scope: ScopeSelection) => {
    if (!scopeValue) {
      setInternalScope(scope);
    }
    if (onScopeChange) {
      onScopeChange(scope);
    }
  };

  const navItems = [
    { path: '/operations', label: 'Command Center', icon: Activity },
    { path: '/audit', label: 'Audit', icon: FileText },
    { path: '/settings', label: 'Settings', icon: SettingsIcon },
  ];

  const workspaceItems = [
    { path: '/operations', label: 'Operations', icon: Activity, id: 'operations' },
    { path: '/support', label: 'Support', icon: Users, id: 'support' },
    { path: '/growth', label: 'Growth', icon: TrendingUp, id: 'growth' },
  ];

  // Check if current page should show workspace switcher
  const isWorkspacePage = location.pathname === '/operations' || location.pathname === '/support' || location.pathname === '/growth';
  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      {showTopBar && (
        <div
          className="relative flex h-12 items-center gap-2 border-b px-3"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--surface-base)',
          }}
        >
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Heights Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'var(--primary)' }}>
              <span className="text-base font-bold text-white">H</span>
            </div>
            <span className="hidden sm:inline text-base font-semibold tracking-tight" style={{ color: 'var(--foreground)' }}>
              Heights
            </span>
          </div>

          <div className="h-6 w-px" style={{ background: 'var(--border-subtle)' }} />

          {/* Workspace switcher buttons - Only show on workspace pages */}
          {isWorkspacePage && (
            <>
              <div className="flex items-center gap-2">
                {workspaceItems.map((ws) => {
                  const Icon = ws.icon;
                  const isActive = location.pathname === ws.path;
                  return (
                    <Link
                      key={ws.path}
                      to={ws.path}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        ws.disabled ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      style={{
                        background: isActive && !ws.disabled ? 'var(--surface-raised)' : 'transparent',
                        color: isActive && !ws.disabled ? 'var(--foreground)' : 'var(--neutral-400)',
                        border: isActive && !ws.disabled ? '1px solid var(--border)' : '1px solid transparent',
                      }}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{ws.label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="h-6 w-px" style={{ background: 'var(--border-subtle)' }} />
            </>
          )}

          {isWorkspacePage ? (
            <>
              <div className="flex-1"></div>

              <div className="hidden max-w-sm md:block">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 transition-colors" style={{ color: 'var(--neutral-400)' }} />
                  <input
                    type="text"
                    placeholder="Search subscribers, devices, events..."
                    className="h-8 w-full rounded-lg border pl-8 pr-3 text-sm transition-all"
                    style={{
                      borderColor: 'var(--border)',
                      borderRadius: 'var(--radius-control)',
                      background: 'var(--surface-raised)',
                      boxShadow: 'var(--shadow-xs)',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--primary)';
                      e.target.style.boxShadow = '0 0 0 4px var(--focus-ring)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--border)';
                      e.target.style.boxShadow = 'var(--shadow-xs)';
                    }}
                  />
                </div>
              </div>

              <div className="h-6 w-px hidden md:block" style={{ background: 'var(--border-subtle)' }} />

              <div className="flex items-center gap-1.5 text-sm">
                <ScopeSelector
                  value={currentScope}
                  onChange={handleScopeChange}
                  compact={isMobile}
                />
              </div>
            </>
          ) : (
            <div className="flex-1">
              <h1 className="text-base font-semibold tracking-tight" style={{ color: 'var(--foreground)' }}>
                {navItems.find(item => item.path === location.pathname)?.label || 'Heights'}
              </h1>
            </div>
          )}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-[color:var(--overlay-scrim)] backdrop-blur-[6px] lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        <motion.aside
          initial={false}
          animate={{
            width: isCollapsed ? '80px' : '240px',
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={`
            border-r flex flex-col z-40
            absolute lg:relative inset-y-0 left-0
            transform transition-transform duration-300
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
          style={{
            borderColor: 'var(--sidebar-border)',
            background: 'var(--sidebar)',
            boxShadow: 'var(--shadow-xs)',
          }}
          onMouseEnter={() => window.innerWidth >= 1024 && window.innerWidth < 1280 && setIsCollapsed(false)}
          onMouseLeave={() => window.innerWidth >= 1024 && window.innerWidth < 1280 && setIsCollapsed(true)}
        >
          <nav className="flex-1 space-y-1 p-2.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}>
                  <motion.div
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition-all"
                    style={{
                      background: isActive ? 'var(--sidebar-primary)' : 'transparent',
                      color: isActive ? 'var(--sidebar-primary-foreground)' : 'var(--sidebar-foreground)',
                      borderRadius: 'var(--radius-control)',
                      border: `1px solid ${isActive ? 'var(--sidebar-border)' : 'transparent'}`,
                    }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute inset-0 rounded-lg"
                        style={{
                          background: 'var(--sidebar-primary)',
                          border: '1px solid var(--sidebar-border)',
                        }}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}

                    <Icon className={`h-4.5 w-4.5 relative z-10 ${isCollapsed ? 'mx-auto' : ''}`} />

                    <AnimatePresence mode="wait">
                      {!isCollapsed && (
                        <span
                          className="relative z-10 text-[12px] font-medium tracking-[0.01em]"
                        >
                          {item.label}
                        </span>
                      )}
                    </AnimatePresence>

                    {isCollapsed && (
                      <div className="pointer-events-none absolute left-full z-50 ml-2 whitespace-nowrap rounded-lg border px-3 py-1.5 text-[12px] opacity-0 shadow-[var(--shadow-md)] transition-opacity group-hover:opacity-100"
                        style={{ background: 'var(--surface-overlay)', color: 'var(--foreground)', borderColor: 'var(--border)' }}>
                        {item.label}
                      </div>
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          <div className="border-t p-2.5" style={{ borderColor: 'var(--sidebar-border)' }}>
            <AnimatePresence mode="wait">
              {!isCollapsed ? (
                <div
                  key="full-status"
                >
                  <div className="mb-1.5 text-[11px] font-semibold" style={{ color: 'var(--neutral-500)' }}>
                    FLEET STATUS
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <FleetStatusRow label="Online" value="12,458" color="var(--success)" />
                    <FleetStatusRow label="Degraded" value="23" color="var(--warning)" />
                    <FleetStatusRow label="Offline" value="8" color="var(--critical)" />
                  </div>
                </div>
              ) : (
                <div
                  key="collapsed-status"
                  className="flex flex-col gap-1.5"
                >
                  <StatusDot value="12,458" color="var(--success)" label="Online" />
                  <StatusDot value="23" color="var(--warning)" label="Degraded" />
                  <StatusDot value="8" color="var(--critical)" label="Offline" />
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.aside>

        <main className="flex-1 overflow-auto">
          <motion.div
            key={location.pathname}
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0.01 : 0.14, ease: 'easeOut' }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>

        {rightPanel && (
          <aside
            className="hidden w-[320px] overflow-auto border-l xl:block"
            style={{ borderColor: 'var(--border)', background: 'var(--surface-base)' }}
          >
            {rightPanel}
          </aside>
        )}
      </div>
    </div>
  );
}

function FleetStatusRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <motion.div
      className="group flex cursor-pointer justify-between"
      whileHover={{ x: 2 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <span className="text-xs" style={{ color: 'var(--sidebar-foreground)' }}>{label}</span>
      <motion.span
        className="text-xs font-semibold"
        style={{ color }}
        whileHover={{ scale: 1.03 }}
      >
        {value}
      </motion.span>
    </motion.div>
  );
}

function StatusDot({ value, color, label }: { value: string; color: string; label: string }) {
  return (
    <div className="relative group flex justify-center">
      <motion.div
        className="relative flex items-center justify-center"
        whileHover={{ scale: 1.08 }}
      >
        <div className="w-2 h-2 rounded-full" style={{ background: color }} />
      </motion.div>
      <div
        className="pointer-events-none absolute left-full z-50 ml-2 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs opacity-0 shadow-[var(--shadow-md)] transition-opacity group-hover:opacity-100"
        style={{ background: 'var(--surface-overlay)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
      >
        {label}: <span className="font-semibold">{value}</span>
      </div>
    </div>
  );
}
