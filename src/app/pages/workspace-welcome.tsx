import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Activity, TrendingUp, ArrowRight, ChevronRight, Sparkles, Users } from 'lucide-react';
import { WORKSPACES } from '../lib/workspace-definitions';
import { useReducedMotion } from 'motion/react';

const SUGGESTED_INVESTIGATIONS: Record<keyof typeof WORKSPACES, string[]> = {
  fleet: [
    'What anomaly patterns has AI detected this week that I have not seen yet?',
    'Predict which cohorts will hit memory pressure in the next 7 days',
  ],
  support: [
    'Show cases AI resolved without human intervention this week',
    'Which open cases have AI-generated root cause with high confidence?',
  ],
  growth: [
    'Which subscribers will likely churn in the next 30 days?',
    'Predict upsell conversion rate for bandwidth-constrained households',
  ],
};

const WORKSPACE_CONFIG = {
  fleet: { route: '/fleet-intelligence', icon: Activity, iconShellClassName: 'rounded-2xl text-white shadow-lg' },
  support: { route: '/support', icon: Users, iconShellClassName: 'rounded-2xl text-white shadow-lg' },
  growth: { route: '/growth', icon: TrendingUp, iconShellClassName: 'rounded-2xl text-white shadow-lg' },
} as const;

export function WorkspaceWelcome() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.04),_transparent_34%)]" />
        <div
          className="ambient-drift absolute -left-[8%] top-[-8%] h-[26rem] w-[26rem] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, var(--ambient-blue) 0%, transparent 68%)',
            opacity: 0.18,
          }}
        />
        <div
          className="ambient-float absolute right-[-6%] top-[10%] h-[22rem] w-[22rem] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, var(--ambient-cyan) 0%, transparent 70%)',
            opacity: 0.16,
          }}
        />
        <div
          className="ambient-drift absolute bottom-[-16%] left-[24%] h-[20rem] w-[20rem] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, var(--ambient-violet) 0%, transparent 72%)',
            animationDelay: '-6s',
            opacity: 0.12,
          }}
        />
        <div
          className="ambient-float absolute bottom-[-10%] right-[10%] h-[16rem] w-[16rem] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, var(--ambient-warm) 0%, transparent 72%)',
            animationDelay: '-9s',
            opacity: 0.12,
          }}
        />
      </div>

      <header className="relative z-10 border-b border-border/80 bg-surface-base/80 px-6 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Heights</h1>
            <p className="text-sm text-muted-foreground">AI Network Workspace Platform</p>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              Logged in as <span className="text-foreground">ops-admin@acme.com</span>
            </span>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex min-h-[calc(100vh-81px)] items-center px-6 py-10">
        <div className="mx-auto w-full max-w-6xl space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0.01 : 0.4 }}
            className="space-y-4 text-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldReduceMotion ? 0.01 : 0.35 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-primary"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI-Native Platform</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: shouldReduceMotion ? 0 : 0.08, duration: shouldReduceMotion ? 0.01 : 0.38 }}
              className="text-4xl font-bold tracking-tight text-foreground md:text-5xl"
            >
              Where do you want to <span className="text-primary">start?</span>
            </motion.h2>
            <p className="mx-auto max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
              Select a workspace to begin your investigation. Each one opens with AI-generated priorities and lets you drill deeper with natural language.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {(Object.values(WORKSPACES) as const).map((workspace, index) => {
              const { icon: Icon, route, iconShellClassName } = WORKSPACE_CONFIG[workspace.id];
              const investigations = SUGGESTED_INVESTIGATIONS[workspace.id].slice(0, 2);
              const primaryObjects = workspace.primaryObjects;

              return (
                <motion.div
                  key={workspace.id}
                  initial={{ opacity: 0, scale: 0.94, y: 18 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    duration: shouldReduceMotion ? 0.01 : 0.35,
                    delay: shouldReduceMotion ? 0 : 0.18 + index * 0.08,
                  }}
                  whileHover={shouldReduceMotion ? undefined : { scale: 1.02, y: -6 }}
                  className="group relative"
                >
                  <div
                    className="absolute inset-0 rounded-3xl opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-20"
                    style={{ backgroundColor: workspace.accentColor }}
                  >
                  </div>

                  <article className="relative flex h-full flex-col gap-6 rounded-3xl border border-border bg-surface-base/80 p-8 backdrop-blur-sm transition-colors duration-300 group-hover:border-primary/50">
                    <div className="flex items-center justify-between gap-3">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center ${iconShellClassName}`}
                        style={{ backgroundColor: workspace.accentColor }}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex flex-wrap justify-end gap-1">
                        {primaryObjects.map((obj) => (
                          <span
                            key={obj}
                            className="rounded-md bg-surface-raised px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground"
                          >
                            {obj}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold tracking-tight text-foreground">
                        {workspace.name}
                      </h3>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {workspace.tagline}
                      </p>
                    </div>

                    <div className="flex-1 space-y-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                        Suggested Investigations
                      </p>
                      <div className="space-y-2">
                        {investigations.map((question) => (
                          <div
                            key={question}
                            className="rounded-lg border border-border/60 bg-surface-raised/50 p-3 text-xs leading-relaxed text-muted-foreground transition-colors duration-300 group-hover:border-primary/20"
                          >
                            <div className="flex items-start gap-2">
                              <ChevronRight className="mt-0.5 h-3 w-3 shrink-0" style={{ color: workspace.accentColor }} />
                              <span>{question}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Link
                      to={route}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface-raised py-3 text-sm font-bold text-foreground transition-all duration-200 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground"
                    >
                      Start {workspace.name}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </article>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: shouldReduceMotion ? 0.01 : 0.45, delay: shouldReduceMotion ? 0 : 0.45 }}
            className="text-center text-sm text-muted-foreground"
          >
            Switch workspaces anytime using the selector in the top navigation bar.
          </motion.div>
        </div>
      </main>
    </div>
  );
}
