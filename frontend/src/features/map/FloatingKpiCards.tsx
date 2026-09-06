import React from "react";
import { useUiStore } from "@/stores/uiStore";
import { useVehicleStore } from "@/stores/vehicleStore";
import { useRoadStore } from "@/stores/roadStore";

export const FloatingKpiCards: React.FC = () => {
  const kpis = useUiStore((s) => s.kpis);
  const vehicles = useVehicleStore((s) => s.vehicles);
  const roads = useRoadStore((s) => s.roads);

  // Compute live values from stores if available
  const activeVehiclesCount = vehicles.length > 0 ? 148 : kpis.activeVehicles;
  const atRiskCount =
    roads.filter((r) => r.status === "at_risk" || r.status === "under_observation").length ||
    kpis.atRiskRoutes;
  const blockedCount = roads.filter((r) => r.status === "blocked").length || kpis.blockedRoutes;

  return (
    <div className="absolute top-3.5 left-4 right-4 z-20 pointer-events-none">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-5xl pointer-events-auto">
        {/* Metric 1: Active Vehicles */}
        <div className="map-floating-element bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06),0_12px_24px_rgba(0,51,86,0.06)] border border-slate-200/80 cursor-pointer">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">
              Active Vehicles
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
              Demo Data
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#003356] leading-none">
              {activeVehiclesCount}
            </span>
            <span className="text-xs text-emerald-700 flex items-center font-bold">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
              +6%
            </span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 bg-slate-50 px-2.5 py-1 rounded-xl text-[11px]">
            <span className="text-slate-600 truncate font-medium">In transit across corridors</span>
            <span className="text-slate-400 shrink-0">Live Telemetry</span>
          </div>
        </div>

        {/* Metric 2: At-Risk Routes */}
        <div className="map-floating-element bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06),0_12px_24px_rgba(0,51,86,0.06)] border border-slate-200/80 cursor-pointer">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-[11px] text-amber-800 uppercase tracking-wider font-bold">
                At-Risk Routes
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
              Demo Data
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-600 leading-none">
              {atRiskCount}
            </span>
            <span className="text-xs text-amber-700 font-semibold">Corridors flagged</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 bg-amber-50/80 px-2.5 py-1 rounded-xl text-[11px]">
            <span className="text-amber-800 truncate font-medium">Weather & gradient stress</span>
            <span className="text-amber-600 shrink-0">Updated 2m ago</span>
          </div>
        </div>

        {/* Metric 3: Blocked Routes */}
        <div className="map-floating-element bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06),0_12px_24px_rgba(0,51,86,0.06)] border border-slate-200/80 cursor-pointer">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-600" />
              <span className="text-[11px] text-rose-700 uppercase tracking-wider font-bold">
                Blocked Routes
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800">
              Demo Data
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-rose-600 leading-none">
              {blockedCount}
            </span>
            <span className="text-xs text-rose-700 font-semibold">Critical detour</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 bg-rose-50/80 px-2.5 py-1 rounded-xl text-[11px]">
            <span className="text-rose-800 truncate font-medium">Immediate detour required</span>
            <span className="text-rose-600 shrink-0">Critical Alert</span>
          </div>
        </div>

        {/* Metric 4: Active Deliveries SLA */}
        <div className="map-floating-element bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06),0_12px_24px_rgba(0,51,86,0.06)] border border-slate-200/80 cursor-pointer">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">
              Corridor Delivery SLA
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
              Demo Data
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#003356] leading-none">
              96.4%
            </span>
            <span className="text-xs text-emerald-700 font-bold">On-time SLA</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 bg-slate-50 px-2.5 py-1 rounded-xl text-[11px]">
            <span className="text-slate-600 truncate font-medium">On-time corridor schedule</span>
            <span className="text-slate-400 shrink-0">Target: 95%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
