import React from "react";
import { StatusBadge } from "@/components/common/StatusBadge";

export interface IncidentSeverityBadgeProps {
  severity: string;
  size?: "sm" | "md";
  className?: string;
}

export const IncidentSeverityBadge: React.FC<IncidentSeverityBadgeProps> = ({
  severity,
  size = "md",
  className = ""
}) => {
  return <StatusBadge type="severity" status={severity} size={size} className={className} />;
};
