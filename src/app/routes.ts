import { createBrowserRouter } from "react-router";

export const router = createBrowserRouter([
  {
    path: "/",
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
