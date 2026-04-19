import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { FieldCapture } from "./pages/FieldCapture";
import { WorkRequests } from "./pages/WorkRequests";
import { Backlog } from "./pages/Backlog";
import { Scheduling } from "./pages/Scheduling";
import { Planner } from "./pages/Planner";
import { ExecutiveDashboard } from "./pages/ExecutiveDashboard";
import { Hierarchy } from "./pages/Hierarchy";
import { Criticality } from "./pages/Criticality";
import { FMEAPage } from "./pages/FMEA";
import { FMECAPage } from "./pages/FMECA";
import { Strategy } from "./pages/Strategy";
import { Analytics } from "./pages/Analytics";
import { SAPReview } from "./pages/SAPReview";
import { Reliability } from "./pages/Reliability";
import { Reports } from "./pages/Reports";
import { DefectElimination } from "./pages/DefectElimination";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "field-capture", Component: FieldCapture },
      { path: "work-requests", Component: WorkRequests },
      { path: "backlog", Component: Backlog },
      { path: "scheduling", Component: Scheduling },
      { path: "planner", Component: Planner },
      { path: "executive", Component: ExecutiveDashboard },
      { path: "hierarchy", Component: Hierarchy },
      { path: "criticality", Component: Criticality },
      { path: "fmea", Component: FMEAPage },
      { path: "fmeca", Component: FMECAPage },
      { path: "strategy", Component: Strategy },
      { path: "analytics", Component: Analytics },
      { path: "sap-review", Component: SAPReview },
      { path: "reliability", Component: Reliability },
      { path: "reports", Component: Reports },
      { path: "defect-elimination", Component: DefectElimination },
    ],
  },
]);
