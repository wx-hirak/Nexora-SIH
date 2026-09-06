import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "./layout/AppShell";
import { ProtectedRoute, PublicOnlyRoute, RoleSelectionRoute } from "./router/RouteGuards";
import { CommandCenterPage } from "@/pages/CommandCenterPage";
import { FleetPage } from "@/pages/FleetPage";
import { DeliveriesPage } from "@/pages/DeliveriesPage";
import { IncidentsAlertsPage } from "@/pages/IncidentsAlertsPage";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { FieldReportingPage } from "@/pages/FieldReportingPage";
import { LoginPage } from "@/pages/LoginPage";
import { RoleVehicleSelectionPage } from "@/pages/RoleVehicleSelectionPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <PublicOnlyRoute>
        <LoginPage />
      </PublicOnlyRoute>
    )
  },
  {
    path: "/role-selection",
    element: (
      <RoleSelectionRoute>
        <RoleVehicleSelectionPage />
      </RoleSelectionRoute>
    )
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <CommandCenterPage />
      },
      {
        path: "dashboard",
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
        path: "deliveries",
        element: <DeliveriesPage />
      },
      {
        path: "incidents",
        element: <IncidentsAlertsPage initialTab="incidents" key="incidents-screen" />
      },
      {
        path: "alerts",
        element: <IncidentsAlertsPage initialTab="alerts" key="alerts-screen" />
      },
      {
        path: "incidents-alerts",
        element: <IncidentsAlertsPage key="incidents-alerts-screen" />
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
        path: "report-incident",
        element: <FieldReportingPage />
      },
      {
        path: "settings",
        element: <Navigate to="/role-selection" replace />
      },
      {
        path: "*",
        element: <Navigate to="/" replace />
      }
    ]
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />
  }
]);
