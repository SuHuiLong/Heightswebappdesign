import { createBrowserRouter } from "react-router";
import { CommandCenter } from "./pages/command-center";
import { AuditTimeline } from "./pages/audit-timeline";
import { Settings } from "./pages/settings";
import { StatePackDemo } from "./pages/state-pack-demo";
import { NotFound } from "./pages/not-found";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: CommandCenter,
  },
  {
    path: "/audit",
    Component: AuditTimeline,
  },
  {
    path: "/settings",
    Component: Settings,
  },
  {
    path: "/demo",
    Component: StatePackDemo,
  },
  {
    path: "*",
    Component: NotFound,
  },
]);