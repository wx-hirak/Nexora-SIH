import React from "react";
import { StatusBadge } from "@/components/common/StatusBadge";

export interface RouteStatusBadgeProps {
  status: string;
  size?: "sm" | "md";
  className?: string;
}

export const RouteStatusBadge: React.FC<RouteStatusBadgeProps> = ({
  status,
  size = "md",
  className = ""
}) => {
  return <StatusBadge type="road" status={status} size={size} className={className} />;
};
