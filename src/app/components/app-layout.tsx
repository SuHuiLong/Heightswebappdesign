import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { ChevronDown, Activity, FileText, Settings as SettingsIcon, Search, Menu, X } from 'lucide-react';
import { ThemeToggle } from '../components/theme-toggle';
import { Button } from '../components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { ScopeSelector, ScopeSelection } from './scope-selector';
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
}

export function AppLayout({ children, rightPanel, showTopBar = true, scopeIndicator, onScopeChange }: LayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentScope, setCurrentScope] = useState<ScopeSelection>({
    level: 'all',
  });

  const handleScopeChange = (scope: ScopeSelection) => {
    setCurrentScope(scope);
    if (onScopeChange) {
      onScopeChange(scope);
    }
  };

  const navItems = [
    { path: '/', label: 'Command Center', icon: Activity },
    { path: '/audit', label: 'Audit', icon: FileText },
    { path: '/settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      {/* Top Bar with glow effect */}
      {showTopBar && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="h-14 border-b flex items-center px-4 gap-4 relative"
          style={{ 
            borderColor: 'var(--border)',
            background: 'var(--surface-base)',
          }}
        >
          {/* Animated gradient bar */}
          <motion.div
            className="absolute inset-x-0 bottom-0 h-[1px]"
            style={{
              background: 'linear-gradient(90deg, transparent, var(--primary), transparent)',
            }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden h-9 w-9 p-0"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <motion.div 
            className="flex items-center gap-2 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <ScopeSelector
              value={currentScope}
              onChange={handleScopeChange}
            />
          </motion.div>

          {/* Global Search with focus effect */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors" style={{ color: 'var(--neutral-400)' }} />
              <input
                type="text"
                placeholder="Search subscribers, devices, events..."
                className="w-full h-9 pl-9 pr-3 rounded-lg border bg-transparent transition-all"
                style={{
                  borderColor: 'var(--border)',
                  borderRadius: 'var(--radius-control)',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary)';
                  e.target.style.boxShadow = '0 0 0 1px var(--primary)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
          </div>
        </motion.div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Sidebar Backdrop */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Left Sidebar - Responsive width */}
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
          style={{ borderColor: 'var(--border)', background: 'var(--sidebar)' }}
          onMouseEnter={() => window.innerWidth >= 1024 && window.innerWidth < 1280 && setIsCollapsed(false)}
          onMouseLeave={() => window.innerWidth >= 1024 && window.innerWidth < 1280 && setIsCollapsed(true)}
        >
          {/* Logo/Brand with pulse effect */}
          <div className="h-16 px-4 flex items-center border-b relative overflow-hidden" style={{ borderColor: 'var(--sidebar-border)' }}>
            <motion.div
              className="absolute inset-0 opacity-5"
              style={{ background: 'var(--primary)' }}
              animate={{
                opacity: [0.05, 0.15, 0.05],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <AnimatePresence mode="wait">
              {!isCollapsed ? (
                <motion.h2
                  key="full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-lg font-semibold"
                  style={{ color: 'var(--sidebar-foreground)' }}
                >
                  Heights
                </motion.h2>
              ) : (
                <motion.div
                  key="short"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-lg font-bold mx-auto"
                  style={{ color: 'var(--primary)' }}
                >
                  H
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Tenant Switcher */}
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-3 border-b"
              style={{ borderColor: 'var(--sidebar-border)' }}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    style={{
                      background: 'var(--sidebar-accent)',
                      borderColor: 'var(--sidebar-border)',
                    }}
                  >
                    <span className="font-medium">Acme ISP</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuItem>Acme ISP</DropdownMenuItem>
                  <DropdownMenuItem>TechNet Co.</DropdownMenuItem>
                  <DropdownMenuItem>FastFiber Inc.</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          )}

          {/* Navigation with hover tooltips */}
          <nav className="flex-1 p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <motion.div
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all relative group"
                    style={{
                      background: isActive ? 'var(--sidebar-primary)' : 'transparent',
                      color: isActive ? 'var(--sidebar-primary-foreground)' : 'var(--sidebar-foreground)',
                      borderRadius: 'var(--radius-control)',
                    }}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute inset-0 rounded-lg"
                        style={{ 
                          background: 'var(--sidebar-primary)',
                          boxShadow: '0 0 20px var(--primary)',
                        }}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    
                    <Icon className={`h-5 w-5 relative z-10 ${isCollapsed ? 'mx-auto' : ''}`} />
                    
                    <AnimatePresence mode="wait">
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          className="font-medium relative z-10"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-3 py-1.5 bg-black/90 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                        {item.label}
                      </div>
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* Quick Fleet Status with animated numbers */}
          <div className="p-3 border-t" style={{ borderColor: 'var(--sidebar-border)' }}>
            <AnimatePresence mode="wait">
              {!isCollapsed ? (
                <motion.div
                  key="full-status"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="text-xs font-semibold mb-2" style={{ color: 'var(--neutral-500)' }}>
                    FLEET STATUS
                  </div>
                  <div className="space-y-2 text-sm">
                    <FleetStatusRow label="Online" value="12,458" color="var(--success)" />
                    <FleetStatusRow label="Degraded" value="23" color="var(--warning)" />
                    <FleetStatusRow label="Offline" value="8" color="var(--critical)" />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="collapsed-status"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-2"
                >
                  <StatusDot value="12,458" color="var(--success)" label="Online" />
                  <StatusDot value="23" color="var(--warning)" label="Degraded" />
                  <StatusDot value="8" color="var(--critical)" label="Offline" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.aside>

        {/* Center Content - Flexible */}
        <main className="flex-1 overflow-auto">{children}</main>

        {/* Right Panel - 360px (conditional, hidden on mobile) */}
        {rightPanel && (
          <motion.aside
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="w-[360px] border-l overflow-auto hidden xl:block"
            style={{ borderColor: 'var(--border)', background: 'var(--surface-base)' }}
          >
            {rightPanel}
          </motion.aside>
        )}
      </div>
    </div>
  );
}

// Fleet Status Row Component with animation
function FleetStatusRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <motion.div
      className="flex justify-between group cursor-pointer"
      whileHover={{ x: 4 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <span style={{ color: 'var(--sidebar-foreground)' }}>{label}</span>
      <motion.span
        className="font-semibold"
        style={{ color }}
        whileHover={{ scale: 1.1 }}
      >
        {value}
      </motion.span>
    </motion.div>
  );
}

// Status Dot for collapsed view with tooltip
function StatusDot({ value, color, label }: { value: string; color: string; label: string }) {
  return (
    <div className="relative group flex justify-center">
      <motion.div
        className="relative flex items-center justify-center"
        whileHover={{ scale: 1.2 }}
      >
        <motion.div
          className="w-2 h-2 rounded-full"
          style={{ background: color }}
          animate={{
            boxShadow: [
              `0 0 0px ${color}`,
              `0 0 8px ${color}`,
              `0 0 0px ${color}`,
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>
      {/* Tooltip */}
      <div className="absolute left-full ml-2 px-3 py-1.5 bg-black/90 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
        {label}: <span className="font-semibold">{value}</span>
      </div>
    </div>
  );
}