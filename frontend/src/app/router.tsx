import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "./layout/AppShell";
import { CommandCenterPage } from "@/pages/CommandCenterPage";
import { FleetPage } from "@/pages/FleetPage";
import { IncidentsAlertsPage } from "@/pages/IncidentsAlertsPage";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { FieldReportingPage } from "@/pages/FieldReportingPage";
import { LoginPage } from "@/pages/LoginPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <CommandCenterPage />
      },
      {
        path: "command-center",
        element: <CommandCenterPage />
      },
      {
        path: "fleet",
        element: <FleetPage />
      },
      {
        path: "operations",
        element: <FleetPage />
      },
      {
        path: "incidents-alerts",
        element: <IncidentsAlertsPage />
      },
      {
        path: "analytics",
        element: <AnalyticsPage />
      },
      {
        path: "field",
        element: <FieldReportingPage />
      },
      {
        path: "login",
        element: <LoginPage />
      },
      {
        path: "settings",
        element: <LoginPage />
      },
      {
        path: "*",
        element: <Navigate to="/" replace />
      }
    ]
  }
]);
