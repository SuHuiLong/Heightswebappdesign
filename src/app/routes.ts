import { createBrowserRouter } from "react-router";

export const router = createBrowserRouter([
  // Welcome / Workspace Selection (New Entry Point)
  {
    path: "/",
    lazy: async () => ({
      Component: (await import("./pages/workspace-welcome")).WorkspaceWelcome,
    }),
  },
  // Fleet Overview Dashboard
  {
    path: "/fleet",
    lazy: async () => ({
      Component: (await import("./pages/fleet-overview")).FleetOverview,
    }),
  },
  // Fleet Intelligence Workspace
  {
    path: "/fleet-intelligence",
    lazy: async () => ({
      Component: (await import("./pages/workspace-operations")).OperationsWorkspace,
    }),
  },
  // Support Workspace
  {
    path: "/support",
    lazy: async () => ({
      Component: (await import("./pages/workspace-support")).SupportWorkspace,
    }),
  },
  // Growth Workspace
  {
    path: "/growth",
    lazy: async () => ({
      Component: (await import("./pages/workspace-growth")).GrowthWorkspace,
    }),
  },
  // Legacy Command Center (kept for reference)
  {
    path: "/command-center",
    lazy: async () => ({
      Component: (await import("./pages/command-center")).CommandCenter,
    }),
  },
  {
    path: "/audit",
    lazy: async () => ({
      Component: (await import("./pages/audit-timeline")).AuditTimeline,
    }),
  },
  {
    path: "/settings",
    lazy: async () => ({
      Component: (await import("./pages/settings")).Settings,
    }),
  },
  {
    path: "/demo",
    lazy: async () => ({
      Component: (await import("./pages/state-pack-demo")).StatePackDemo,
    }),
  },
  {
    path: "*",
    lazy: async () => ({
      Component: (await import("./pages/not-found")).NotFound,
    }),
  },
], {
  basename: "/Heightswebappdesign",
});
