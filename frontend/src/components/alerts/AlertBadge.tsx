import React from "react";
import { StatusBadge } from "@/components/common/StatusBadge";

export interface AlertBadgeProps {
  severity: string;
  size?: "sm" | "md";
  className?: string;
}

export const AlertBadge: React.FC<AlertBadgeProps> = ({
  severity,
  size = "md",
  className = ""
}) => {
  return <StatusBadge type="severity" status={severity} size={size} className={className} />;
};
