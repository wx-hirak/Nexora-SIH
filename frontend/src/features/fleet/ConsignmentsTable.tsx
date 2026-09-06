import React, { useState, useMemo } from "react";
import { useShipmentStore } from "@/stores/shipmentStore";

export const ConsignmentsTable: React.FC = () => {
  const shipments = useShipmentStore((s) => s.shipments);
  const selectedShipmentId = useShipmentStore((s) => s.selectedShipmentId);
  const selectShipment = useShipmentStore((s) => s.selectShipment);

  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredShipments = useMemo(() => {
    return shipments.filter((s) => {
      const matchesSearch =
        s.id.toLowerCase().includes(search.toLowerCase()) ||
        s.commodity.toLowerCase().includes(search.toLowerCase()) ||
        s.origin.toLowerCase().includes(search.toLowerCase()) ||
        s.destination.toLowerCase().includes(search.toLowerCase());

      const matchesPriority =
        priorityFilter === "ALL" || s.priority.toString() === priorityFilter;

      const matchesStatus =
        statusFilter === "ALL" || s.status === statusFilter;

      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [shipments, search, priorityFilter, statusFilter]);

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
            placeholder="Search consignment, commodity, city..."
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-[#f1f4fa] text-[#181c20] text-xs placeholder:text-[#72777f] border border-transparent focus:border-[#174a73] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="h-10 px-3 rounded-lg bg-[#f1f4fa] text-[#181c20] text-xs font-medium border border-[#e5e8ee] focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="1">Priority 1 (Critical Medical/Vaccines)</option>
            <option value="2">Priority 2 (Food / Grid Infrastructure)</option>
            <option value="3">Priority 3 (General Commercial)</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-lg bg-[#f1f4fa] text-[#181c20] text-xs font-medium border border-[#e5e8ee] focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="on_time">On-Time</option>
            <option value="at_risk">At Risk</option>
            <option value="delayed">Delayed</option>
          </select>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setPriorityFilter("ALL");
              setStatusFilter("ALL");
            }}
            title="Reset Filters"
            className="h-10 w-10 flex items-center justify-center rounded-lg bg-[#f1f4fa] text-[#42474e] hover:bg-[#e5e8ee] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
          </button>
        </div>
      </div>

      {/* Consignments Data Table */}
      <div className="bg-white rounded-xl border border-[#e5e8ee] shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f1f4fa] uppercase text-[11px] text-[#72777f] font-semibold tracking-wider">
              <tr>
                <th className="py-3 px-4">Consignment ID</th>
                <th className="py-3 px-4">Commodity & Route</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Progress</th>
                <th className="py-3 px-4">Route Risk</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Route Compare</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e8ee]">
              {filteredShipments.map((shp) => {
                const isSelected = selectedShipmentId === shp.id;
                const isAtRisk = shp.status === "at_risk" || shp.status === "delayed";

                return (
                  <tr
                    key={shp.id}
                    onClick={() => selectShipment(shp.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? "bg-[#cfe4ff]/30 font-medium" : "hover:bg-[#f8fafc]"
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#003356]">{shp.id}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#181c20]">{shp.commodity}</div>
                      <div className="text-[11px] text-[#72777f]">
                        {shp.origin} ➔ {shp.destination}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          shp.priority === 1
                            ? "bg-[#ffdad6] text-[#ba1a1a]"
                            : "bg-[#cfe4ff] text-[#001d34]"
                        }`}
                      >
                        P{shp.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-[#e5e8ee] overflow-hidden">
                          <div
                            className="h-full bg-[#174a73]"
                            style={{ width: `${shp.progressPercent}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-[#42474e]">
                          {shp.progressPercent}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-bold ${
                          shp.riskScore > 0.5 ? "text-[#ba1a1a]" : "text-[#15803D]"
                        }`}
                      >
                        {Math.round(shp.riskScore * 100)}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                          isAtRisk
                            ? "bg-[#ffdad6] text-[#ba1a1a]"
                            : "bg-[#e6f4ea] text-[#137333]"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>{shp.status.replace("_", " ")}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        className="px-2.5 py-1 text-xs font-semibold rounded bg-[#174a73] hover:bg-[#003356] text-white transition-colors cursor-pointer"
                      >
                        Compare
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
