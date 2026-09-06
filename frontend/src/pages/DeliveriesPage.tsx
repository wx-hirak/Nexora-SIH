import React from "react";
import { ConsignmentsTable } from "@/features/fleet/ConsignmentsTable";
import { RouteComparisonPanel } from "@/features/fleet/RouteComparisonPanel";
import { useShipmentStore } from "@/stores/shipmentStore";

export const DeliveriesPage: React.FC = () => {
  const shipments = useShipmentStore((s) => s.shipments);

  const atRiskCount = shipments.filter((s) => s.status === "at_risk").length;
  const onTimeCount = shipments.filter((s) => s.status === "on_time").length;
  const deliveredCount = shipments.filter((s) => s.status === "delivered").length;
  const highPriorityCount = shipments.filter((s) => s.priority === 1).length;

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1440px] mx-auto pb-12">
      {/* Page Header & Metrics Summary */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-[#cfe4ff] text-[#001d34] text-[11px] font-semibold uppercase tracking-wider">
                Freight & Consignments
              </span>
              <span className="text-[#72777f] text-xs">•</span>
              <span className="text-xs text-[#72777f]">
                <span className="sm:hidden">Corridor Dispatches</span>
                <span className="hidden sm:inline">North East Arterial Corridors (Assam, Meghalaya, Arunachal)</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#003356] tracking-tight">
              Deliveries & Consignment Operations
            </h1>
            <p className="text-xs sm:text-sm text-[#42474e] max-w-3xl">
              Track multi-modal shipments, monitor high-priority medical and relief consignments, and inspect dynamic route detour recommendations.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#e5e8ee] shadow-xs">
              <span className="material-symbols-outlined text-[18px] text-[#27638c]">
                inventory_2
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-bold text-[#181c20]">{shipments.length}</span>
                <span className="text-[11px] text-[#72777f]">Total</span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#e5e8ee] shadow-xs">
              <span className="material-symbols-outlined text-[18px] text-[#005148]">
                check_circle
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-bold text-[#005148]">{onTimeCount}</span>
                <span className="text-[11px] text-[#72777f]">On Schedule</span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#e5e8ee] shadow-xs">
              <span className="material-symbols-outlined text-[18px] text-[#ba1a1a]">
                warning
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-bold text-[#ba1a1a]">{atRiskCount}</span>
                <span className="text-[11px] text-[#93000a]">At Risk</span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#e5e8ee] shadow-xs">
              <span className="material-symbols-outlined text-[18px] text-[#d97706]">
                emergency
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-bold text-[#181c20]">{highPriorityCount}</span>
                <span className="text-[11px] text-[#72777f]">Priority 1</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Corridor Status Indicator */}
        <div className="flex items-center justify-between bg-[#f1f4fa] px-4 py-2 rounded-xl border border-[#e5e8ee] text-xs text-[#42474e]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#005148] animate-pulse" />
            <span className="font-semibold text-[#181c20]">Dynamic Route Re-calculation:</span>
            <span>Real-time ETA adjustments active for weather and road clearance events</span>
          </div>
          <span className="hidden sm:inline text-[11px] text-[#72777f]">
            {deliveredCount} completed deliveries this shift
          </span>
        </div>
      </div>

      {/* Main Split Layout: Consignments Table + Route Comparison */}
      <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
        <ConsignmentsTable />
        <RouteComparisonPanel />
      </div>
    </div>
  );
};
