import React from "react";
import type { Alert } from "@/types/domain";
import { AlertBadge } from "@/components/alerts/AlertBadge";

export interface ActiveAlertsListProps {
  alerts: Alert[];
  onAcknowledge?: (alertId: string) => void;
  className?: string;
}

export const ActiveAlertsList: React.FC<ActiveAlertsListProps> = ({
  alerts,
  onAcknowledge,
  className = ""
}) => {
  if (alerts.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-[#e5e8ee] text-[#72777f] text-xs font-medium">
        No active hazard alerts across the North Eastern network.
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="p-4 rounded-xl bg-white border border-[#e5e8ee] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex items-start gap-3 min-w-0">
            <span className="material-symbols-outlined text-rose-600 text-[22px] shrink-0 mt-0.5">
              warning
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-[#181c20]">{alert.title}</span>
                <AlertBadge severity={alert.severity} size="sm" />
              </div>
              <p className="text-xs text-[#42474e] mt-1 leading-relaxed">{alert.message}</p>
              <span className="text-[10px] text-[#72777f] mt-1 block">
                Corridor: {alert.relatedRoadId || "Regional Network"} • Category: {alert.category}
              </span>
            </div>
          </div>

          {onAcknowledge && (
            <button
              type="button"
              onClick={() => onAcknowledge(alert.id)}
              className="px-3 py-1.5 rounded-lg bg-[#f1f4fa] hover:bg-[#e5e8ee] text-[#003356] text-xs font-semibold shrink-0 transition-colors cursor-pointer"
            >
              Acknowledge
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
