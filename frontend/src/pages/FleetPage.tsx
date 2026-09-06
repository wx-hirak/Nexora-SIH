import React, { useState } from "react";
import { VehiclesTable } from "@/features/fleet/VehiclesTable";
import { VehicleDetailPanel } from "@/features/fleet/VehicleDetailPanel";
import { ConsignmentsTable } from "@/features/fleet/ConsignmentsTable";
import { RouteComparisonPanel } from "@/features/fleet/RouteComparisonPanel";
import { useVehicleStore } from "@/stores/vehicleStore";
import { useShipmentStore } from "@/stores/shipmentStore";

export const FleetPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"vehicles" | "deliveries">("vehicles");
  const vehicles = useVehicleStore((s) => s.vehicles);
  const shipments = useShipmentStore((s) => s.shipments);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Page Header & Metrics Summary Bar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-[#cfe4ff] text-[#001d34] text-[11px] font-semibold uppercase tracking-wider">
                Fleet & Telematics
              </span>
              <span className="text-[#72777f] text-xs">•</span>
              <span className="text-xs text-[#72777f]">Sector 4 (Arunachal & Upper Assam)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#003356] tracking-tight">
              Fleet & Consignment Management
            </h1>
            <p className="text-xs sm:text-sm text-[#42474e] max-w-3xl">
              Unified telemetry, vehicle diagnostics, and consignment tracking across North Eastern transit corridors.
            </p>
          </div>

          {/* Quick Summary Metric Pills */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#e5e8ee] shadow-xs">
              <span className="material-symbols-outlined text-[18px] text-[#003356]">
                local_shipping
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-bold text-[#181c20]">{vehicles.length || 148}</span>
                <span className="text-[11px] text-[#72777f]">Units</span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#e5e8ee] shadow-xs">
              <span className="material-symbols-outlined text-[18px] text-[#27638c]">
                inventory_2
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-bold text-[#181c20]">{shipments.length || 86}</span>
                <span className="text-[11px] text-[#72777f]">Consignments</span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#e5e8ee] shadow-xs">
              <span className="material-symbols-outlined text-[18px] text-[#ba1a1a]">
                warning
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-bold text-[#ba1a1a]">4</span>
                <span className="text-[11px] text-[#93000a]">At-Risk</span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#e5e8ee] shadow-xs">
              <span className="material-symbols-outlined text-[18px] text-[#72777f]">
                wifi_off
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-bold text-[#42474e]">2</span>
                <span className="text-[11px] text-[#72777f]">Radio Offline</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dual Tab Selector */}
        <div className="flex items-center justify-between bg-[#f1f4fa] p-1 rounded-xl border border-[#e5e8ee]">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("vehicles")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "vehicles"
                  ? "bg-[#003356] text-white shadow-xs"
                  : "text-[#42474e] hover:bg-[#ebeef4] hover:text-[#181c20]"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">commute</span>
              <span>Vehicles</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === "vehicles" ? "bg-white text-[#003356]" : "bg-[#ebeef4] text-[#72777f]"
                }`}
              >
                {vehicles.length || 148}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("deliveries")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "deliveries"
                  ? "bg-[#003356] text-white shadow-xs"
                  : "text-[#42474e] hover:bg-[#ebeef4] hover:text-[#181c20]"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">local_mall</span>
              <span>Deliveries (Consignments)</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === "deliveries" ? "bg-white text-[#003356]" : "bg-[#ebeef4] text-[#72777f]"
                }`}
              >
                {shipments.length || 86}
              </span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[#42474e] text-xs pr-3">
            <span className="w-2 h-2 rounded-full bg-[#005148] animate-ping" />
            <span>Telemetry Polling: 3.5s live cycle</span>
          </div>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
        {activeTab === "vehicles" ? (
          <>
            <VehiclesTable />
            <VehicleDetailPanel />
          </>
        ) : (
          <>
            <ConsignmentsTable />
            <RouteComparisonPanel />
          </>
        )}
      </div>
    </div>
  );
};
