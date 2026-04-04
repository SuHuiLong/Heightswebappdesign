import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Activity, Users, TrendingUp, ArrowRight, ChevronRight, Sparkles } from 'lucide-react';
import { WORKSPACES, getWorkspaceContext } from '../lib/workspace-definitions';
import { useReducedMotion } from 'motion/react';

const WORKSPACE_CONFIG = {
  operations: { route: '/operations', icon: Activity },
  support: { route: '/support', icon: Users },
  growth: { route: '/growth', icon: TrendingUp },
} as const;

export function WorkspaceWelcome() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: 'var(--background)' }}>
      {/* Ambient background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.035),_transparent_38%)]" />
        <div
          className="ambient-drift absolute -left-[10%] top-[-10%] h-[28rem] w-[28rem] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, var(--ambient-blue) 0%, transparent 68%)',
          }}
        />
        <div
          className="ambient-float absolute right-[-8%] top-[12%] h-[24rem] w-[24rem] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, var(--ambient-cyan) 0%, transparent 70%)',
          }}
        />
        <div
          className="ambient-drift absolute bottom-[-18%] left-[24%] h-[22rem] w-[22rem] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, var(--ambient-violet) 0%, transparent 72%)',
            animationDelay: '-6s',
          }}
        />
        <div
          className="ambient-float absolute bottom-[-10%] right-[8%] h-[18rem] w-[18rem] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, var(--ambient-warm) 0%, transparent 72%)',
            animationDelay: '-9s',
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b px-6 py-4" style={{ borderColor: 'var(--border)', background: 'var(--surface-base)' }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight" style={{ color: 'var(--foreground)' }}>
              Heights
            </h1>
            <p className="text-sm" style={{ color: 'var(--neutral-500)' }}>
              Network Operations Platform
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--neutral-400)' }}>
            <span>Logged in as <span style={{ color: 'var(--foreground)' }}>ops-admin@acme.com</span></span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 px-6 py-12">
        <div className="mx-auto max-w-6xl">
          {/* Hero section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0.01 : 0.4 }}
            className="mb-10 text-center"
          >
            <div className="mb-3 flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5" style={{ color: 'var(--primary)' }} />
              <h2 className="text-3xl font-semibold tracking-tight lg:text-4xl" style={{ color: 'var(--foreground)' }}>
                Where do you want to start?
              </h2>
            </div>
            <p className="max-w-2xl mx-auto text-base" style={{ color: 'var(--neutral-400)' }}>
              Each workspace is focused on a specific type of work. Ask a question and the system will organize results around it.
            </p>
          </motion.div>

          {/* Workspace cards */}
          <div className="grid gap-6 lg:grid-cols-3">
            {(Object.values(WORKSPACES) as const).map((workspace, index) => {
              const { icon: Icon, route } = WORKSPACE_CONFIG[workspace.id];
              const capabilities = getWorkspaceContext(workspace.id).capabilities;

              return (
                <motion.div
                  key={workspace.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: shouldReduceMotion ? 0.01 : 0.3,
                    delay: shouldReduceMotion ? 0 : index * 0.1,
                  }}
                  whileHover={{ scale: shouldReduceMotion ? 1 : 1.02 }}
                  whileTap={{ scale: shouldReduceMotion ? 1 : 0.98 }}
                >
                  <div
                    className="group relative flex h-full flex-col overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-lg"
                    style={{
                      background: 'var(--card)',
                      borderColor: 'var(--border)',
                    }}
                  >
                    {/* Card gradient overlay */}
                    <div
                      className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{
                        background: `radial-gradient(circle at top, ${workspace.accentColor}18, transparent 60%)`,
                      }}
                    />

                    {/* Border highlight on hover */}
                    <div
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                      style={{
                        boxShadow: `inset 0 0 0 2px ${workspace.accentColor}40`,
                      }}
                    />

                    {/* Card content */}
                    <div className="relative flex h-full flex-col p-6">
                      {/* Icon + Title + Tagline */}
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-xl border transition-transform duration-300 group-hover:scale-110"
                            style={{
                              background: workspace.accentColor + '20',
                              borderColor: workspace.accentColor + '40',
                              color: 'var(--primary)',
                            }}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold transition-colors duration-300 group-hover:text-[color:var(--primary)]" style={{ color: 'var(--foreground)' }}>
                              {workspace.name}
                            </h3>
                            <p className="text-xs font-medium" style={{ color: workspace.accentColor }}>
                              {workspace.tagline}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* What you work with */}
                      <div className="mb-4">
                        <div className="mb-2 text-[10px] font-semibold tracking-[0.1em] uppercase" style={{ color: 'var(--neutral-500)' }}>
                          What you work with
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {workspace.primaryObjects.map((obj) => (
                            <span
                              key={obj}
                              className="rounded-md px-2 py-0.5 text-xs font-medium"
                              style={{
                                background: 'var(--surface-raised)',
                                color: 'var(--foreground)',
                              }}
                            >
                              {obj}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Capabilities */}
                      <div className="mb-5 flex-1">
                        <div className="mb-2 text-[10px] font-semibold tracking-[0.1em] uppercase" style={{ color: 'var(--neutral-500)' }}>
                          Capabilities
                        </div>
                        <ul className="space-y-2">
                          {capabilities.map((cap, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-xs leading-relaxed rounded-lg px-2.5 py-2 transition-colors duration-200"
                              style={{
                                color: 'var(--neutral-400)',
                                background: 'var(--surface-base)',
                              }}
                            >
                              <ChevronRight className="h-3 w-3 shrink-0 mt-0.5" style={{ color: workspace.accentColor }} />
                              <span>{cap}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Enter button */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Link
                          to={route}
                          className="group/btn flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:shadow-md"
                          style={{
                            background: 'var(--surface-raised)',
                            borderColor: 'var(--border)',
                            color: 'var(--foreground)',
                          }}
                        >
                          Start {workspace.name}
                          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footer hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 text-center"
          >
            <p className="text-sm" style={{ color: 'var(--neutral-500)' }}>
              Switch workspaces anytime using the selector in the top navigation bar.
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
