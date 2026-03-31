import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Activity, Users, TrendingUp, ArrowRight } from 'lucide-react';
import { WORKSPACES, WORKSPACE_STARTER_TASKS } from '../lib/workspace-definitions';
import { useReducedMotion } from 'motion/react';

const WORKSPACE_ROUTES = {
  operations: '/operations',
  support: '/support',
  growth: '/growth',
} as const;

function getWorkspaceIcon(id: keyof typeof WORKSPACES) {
  switch (id) {
    case 'operations':
      return Activity;
    case 'support':
      return Users;
    case 'growth':
      return TrendingUp;
  }
}

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
            className="mb-12 text-center"
          >
            <h2 className="mb-3 text-3xl font-semibold tracking-tight lg:text-4xl" style={{ color: 'var(--foreground)' }}>
              Choose your workspace
            </h2>
            <p className="max-w-2xl mx-auto text-base" style={{ color: 'var(--neutral-400)' }}>
              Select a work mode to begin. Each workspace is tailored to a specific operational context
              with focused tools and AI assistance.
            </p>
          </motion.div>

          {/* Workspace cards */}
          <div className="grid gap-6 lg:grid-cols-3">
            {(Object.values(WORKSPACES) as const).map((workspace, index) => {
              const Icon = getWorkspaceIcon(workspace.id);
              const isImplemented = workspace.isImplemented;
              const starterTasks = WORKSPACE_STARTER_TASKS[workspace.id];

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
                    className="group relative flex h-full flex-col overflow-hidden rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer"
                    style={{
                      background: 'var(--card)',
                      borderColor: isImplemented ? 'var(--border)' : 'var(--border-subtle)',
                      opacity: isImplemented ? 1 : 0.7,
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
                      {/* Header */}
                      <div className="mb-4 flex items-start justify-between">
                        <motion.div
                          className="flex h-12 w-12 items-center justify-center rounded-xl border transition-transform duration-300 group-hover:scale-110"
                          style={{
                            background: workspace.accentColor + '20',
                            borderColor: workspace.accentColor + '40',
                            color: 'var(--primary)',
                          }}
                        >
                          <Icon className="h-6 w-6" />
                        </motion.div>
                        {!isImplemented && (
                          <span
                            className="rounded-full px-2.5 py-1 text-xs font-medium"
                            style={{
                              background: 'var(--surface-raised)',
                              color: 'var(--neutral-500)',
                            }}
                          >
                            Coming Soon
                          </span>
                        )}
                      </div>

                      {/* Title and tagline */}
                      <motion.h3
                        className="mb-1 text-xl font-semibold transition-colors duration-300 group-hover:text-[color:var(--primary)]"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {workspace.name}
                      </motion.h3>
                      <p className="mb-4 text-sm font-medium transition-opacity duration-300 group-hover:opacity-80" style={{ color: workspace.accentColor }}>
                        {workspace.tagline}
                      </p>

                      {/* Description */}
                      <p className="mb-6 flex-1 text-sm leading-relaxed" style={{ color: 'var(--neutral-400)' }}>
                        {workspace.description}
                      </p>

                      {/* Primary objects */}
                      <div className="mb-6">
                        <div className="mb-2 text-xs font-semibold tracking-[0.08em]" style={{ color: 'var(--neutral-500)' }}>
                          PRIMARY OBJECTS
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {workspace.primaryObjects.map((obj, idx) => (
                            <motion.span
                              key={obj}
                              className="rounded-md px-2 py-1 text-xs font-medium transition-all duration-200 hover:scale-105"
                              style={{
                                background: 'var(--surface-raised)',
                                color: 'var(--foreground)',
                              }}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: idx * 0.05, duration: 0.2 }}
                            >
                              {obj}
                            </motion.span>
                          ))}
                        </div>
                      </div>

                      {/* Example scenarios */}
                      <div className="mb-6 flex-1">
                        <div className="mb-2 text-xs font-semibold tracking-[0.08em]" style={{ color: 'var(--neutral-500)' }}>
                          EXAMPLE SCENARIOS
                        </div>
                        <ul className="space-y-1.5">
                          {workspace.exampleScenarios.slice(0, 3).map((scenario, idx) => (
                            <motion.li
                              key={scenario}
                              className="flex items-start gap-2 text-xs transition-all duration-200 group-hover/item:translate-x-1"
                              style={{ color: 'var(--neutral-400)' }}
                              initial={{ opacity: 0, x: -5 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05, duration: 0.2 }}
                            >
                              <span style={{ color: workspace.accentColor }}>→</span>
                              <span>{scenario}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>

                      {/* Action */}
                      {isImplemented ? (
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Link
                            to={WORKSPACE_ROUTES[workspace.id]}
                            className="group/btn flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:shadow-md"
                            style={{
                              background: 'var(--surface-raised)',
                              borderColor: 'var(--border)',
                              color: 'var(--foreground)',
                            }}
                          >
                            Enter {workspace.name}
                            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
                          </Link>
                        </motion.div>
                      ) : (
                        <div
                          className="flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium"
                          style={{
                            background: 'var(--surface-base)',
                            borderColor: 'var(--border-subtle)',
                            color: 'var(--neutral-500)',
                          }}
                        >
                          Reserved for future release
                        </div>
                      )}
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
            className="mt-12 text-center"
          >
            <p className="text-sm" style={{ color: 'var(--neutral-500)' }}>
              Your workspace selection will be remembered during this session.
              <br />
              Switch workspaces anytime using the selector in the top navigation.
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
