import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

/**
 * Route guard that requires the user to be logged in and to have
 * completed role/vehicle profile selection.
 * Unauthenticated users are redirected to /login.
 * Logged-in users who haven't completed selection are redirected to /role-selection.
 */
export const ProtectedRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasSelectedProfile = useAuthStore((s) => s.hasSelectedProfile);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!hasSelectedProfile) {
    return <Navigate to="/role-selection" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

/**
 * Route guard for public-only screens like /login.
 * If already logged in and configured, redirects to the dashboard (/).
 * If logged in without configured profile, redirects to /role-selection.
 */
export const PublicOnlyRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasSelectedProfile = useAuthStore((s) => s.hasSelectedProfile);

  if (isAuthenticated && hasSelectedProfile) {
    return <Navigate to="/" replace />;
  }

  if (isAuthenticated && !hasSelectedProfile) {
    return <Navigate to="/role-selection" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

/**
 * Route guard for /role-selection.
 * Requires user to be authenticated first.
 */
export const RoleSelectionRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
