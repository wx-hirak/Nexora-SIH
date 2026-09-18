import React from "react";
import { KpiCard } from "@/components/common/KpiCard";

export interface RiskScoreCardProps {
  label: string;
  score: number;
  sector?: string;
  trend?: "stable" | "increasing" | "decreasing";
  className?: string;
}

export const RiskScoreCard: React.FC<RiskScoreCardProps> = ({
  label,
  score,
  sector,
  trend = "stable",
  className = ""
}) => {
  const variant = score > 70 ? "danger" : score > 40 ? "warning" : "success";

  return (
    <KpiCard
      label={label}
      value={`${score}%`}
      badgeText={variant === "danger" ? "Critical Risk" : variant === "warning" ? "Elevated" : "Normal"}
      badgeVariant={variant}
      subtitle={sector}
      footerIcon={trend === "increasing" ? "trending_up" : "trending_flat"}
      footerText={`Risk trend: ${trend}`}
      footerIconColor={variant === "danger" ? "text-rose-600" : "text-slate-500"}
      className={className}
    />
  );
};
