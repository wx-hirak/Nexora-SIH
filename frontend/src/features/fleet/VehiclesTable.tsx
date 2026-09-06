import React, { useState, useMemo } from "react";
import { useVehicleStore } from "@/stores/vehicleStore";

export const VehiclesTable: React.FC = () => {
  const vehicles = useVehicleStore((s) => s.vehicles);
  const selectedVehicleId = useVehicleStore((s) => s.selectedVehicleId);
  const selectVehicle = useVehicleStore((s) => s.selectVehicle);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchesSearch =
        v.id.toLowerCase().includes(search.toLowerCase()) ||
        (v.driverName && v.driverName.toLowerCase().includes(search.toLowerCase())) ||
        (v.currentCorridor && v.currentCorridor.toLowerCase().includes(search.toLowerCase()));

      const matchesType =
        typeFilter === "ALL" ||
        (typeFilter === "heavy" && v.vehicleType === "heavy") ||
        (typeFilter === "four-wheeler" && v.vehicleType === "four-wheeler") ||
        (typeFilter === "two-wheeler" && v.vehicleType === "two-wheeler");

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "moving" && v.status === "moving") ||
        (statusFilter === "delayed" && v.status === "delayed");

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [vehicles, search, typeFilter, statusFilter]);

  return (
    <div className="flex-1 min-w-0 flex flex-col gap-4">
      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-[#e5e8ee] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#72777f] text-[18px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vehicle ID, operator, corridor..."
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-[#f1f4fa] text-[#181c20] text-xs placeholder:text-[#72777f] border border-transparent focus:border-[#174a73] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-10 px-3 rounded-lg bg-[#f1f4fa] text-[#181c20] text-xs font-medium border border-[#e5e8ee] focus:outline-none"
          >
            <option value="ALL">All Types ({vehicles.length})</option>
            <option value="heavy">Heavy Commercial (Truck)</option>
            <option value="four-wheeler">Four Wheeler (Utility)</option>
            <option value="two-wheeler">Two Wheeler (Courier)</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-lg bg-[#f1f4fa] text-[#181c20] text-xs font-medium border border-[#e5e8ee] focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="moving">En Route (Moving)</option>
            <option value="delayed">Delayed / Caution</option>
          </select>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setTypeFilter("ALL");
              setStatusFilter("ALL");
            }}
            title="Reset Filters"
            className="h-10 w-10 flex items-center justify-center rounded-lg bg-[#f1f4fa] text-[#42474e] hover:bg-[#e5e8ee] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
          </button>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="bg-white rounded-xl border border-[#e5e8ee] shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f1f4fa] uppercase text-[11px] text-[#72777f] font-semibold tracking-wider">
              <tr>
                <th className="py-3 px-4">Vehicle ID</th>
                <th className="py-3 px-4">Vehicle Type</th>
                <th className="py-3 px-4">Assigned Operator</th>
                <th className="py-3 px-4">Active Corridor</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Speed</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e8ee]">
              {filteredVehicles.map((veh) => {
                const isSelected = selectedVehicleId === veh.id;
                const isDelayed = veh.status === "delayed";

                return (
                  <tr
                    key={veh.id}
                    onClick={() => selectVehicle(veh.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? "bg-[#cfe4ff]/30 font-medium" : "hover:bg-[#f8fafc]"
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            isDelayed ? "bg-[#dc2626] animate-pulse" : "bg-[#174a73]"
                          }`}
                        />
                        <span className="font-bold text-[#003356]">{veh.id}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#181c20] capitalize">
                      {veh.vehicleType.replace("-", " ")}
                    </td>
                    <td className="py-3.5 px-4 text-[#42474e]">
                      {veh.driverName || "Official Driver"}
                    </td>
                    <td className="py-3.5 px-4 text-[#003356] font-semibold">
                      {veh.currentCorridor || "Guwahati Gateway"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          isDelayed
                            ? "bg-[#ffdad6] text-[#ba1a1a]"
                            : "bg-[#e6f4ea] text-[#137333]"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span className="capitalize">{veh.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#181c20]">
                      {veh.speedKph} km/h
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        className="px-2.5 py-1 text-xs font-semibold rounded bg-[#f1f4fa] hover:bg-[#dfe3e8] text-[#003356] transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
