import React from "react";
import { StatusBadge } from "@/components/common/StatusBadge";

export interface VehicleStatusBadgeProps {
  status: string;
  size?: "sm" | "md";
  className?: string;
}

export const VehicleStatusBadge: React.FC<VehicleStatusBadgeProps> = ({
  status,
  size = "md",
  className = ""
}) => {
  return <StatusBadge type="vehicle" status={status} size={size} className={className} />;
};
