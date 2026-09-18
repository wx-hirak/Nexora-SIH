import React, { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { DataSourceBadge } from "@/components/common/DataSourceBadge";
import { BackendConnectionModal } from "@/components/common/BackendConnectionModal";

export const SettingsPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const [isBackendModalOpen, setIsBackendModalOpen] = useState(false);
  const currentRole = user?.role || "state_logistics_director";

  // Local interactive preferences
  const [offlineSyncEnabled, setOfflineSyncEnabled] = useState(true);
  const [autoRerouteAlerts, setAutoRerouteAlerts] = useState(true);
  const [satelliteTelemetry, setSatelliteTelemetry] = useState(true);
  const [highContrastMap, setHighContrastMap] = useState(false);
  const [landslideThreshold, setLandslideThreshold] = useState(65);
  const [floodThreshold, setFloodThreshold] = useState(70);
  const [telemetryInterval, setTelemetryInterval] = useState("10");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1440px] mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 p-6 bg-white rounded-xl border border-[#e5e8ee] shadow-xs">
        <div className="flex flex-col gap-1 max-w-2xl">
          <div className="flex items-center gap-2 text-[#72777f] text-xs uppercase tracking-wider font-semibold">
            <span>NER Logistics Intelligence</span>
            <span>/</span>
            <span className="text-[#003356] font-bold">System Configuration</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#003356] tracking-tight">
            Settings & Operational Preferences
          </h1>
          <p className="text-xs sm:text-sm text-[#42474e]">
            Manage gateway connectivity, satellite telemetry ingestion, automated corridor alerts, and local field device synchronization.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <DataSourceBadge />
          <button
            type="button"
            onClick={() => setIsBackendModalOpen(true)}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#f1f4fa] hover:bg-[#e5e8ee] text-[#003356] text-xs font-semibold border border-[#e5e8ee] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">hub</span>
            <span>Configure Backend API</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 transition-all">
          <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
          <span>Configuration preferences updated and applied to local telemetry engine.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Main settings */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* User Profile & Role Info */}
          <div className="bg-white p-6 rounded-xl border border-[#e5e8ee] shadow-xs flex flex-col gap-4">
            <h2 className="text-base font-bold text-[#181c20] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#003356] text-[20px]">badge</span>
              <span>Operator Profile & Command Role</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold uppercase text-[#72777f]">Active User</span>
                <span className="text-sm font-bold text-[#181c20]">{user?.name || "Dr. M. Saikia (Senior Dispatcher)"}</span>
                <span className="text-xs text-[#72777f]">{user?.email || "dispatcher@ner-logistics.gov.in"}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold uppercase text-[#72777f]">Assigned Role</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#003356] capitalize">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {currentRole.replace("_", " ")}
                </span>
                <span className="text-[11px] text-[#72777f]">Full Dispatch & Incident Control Clearance</span>
              </div>
            </div>
          </div>

          {/* Telemetry & GIS Configuration */}
          <div className="bg-white p-6 rounded-xl border border-[#e5e8ee] shadow-xs flex flex-col gap-5">
            <h2 className="text-base font-bold text-[#181c20] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#003356] text-[20px]">satellite_alt</span>
              <span>GIS Telemetry & Corridor Ingestion</span>
            </h2>

            <div className="flex flex-col gap-4 divide-y divide-slate-100">
              <div className="flex items-center justify-between pt-2">
                <div>
                  <div className="text-xs font-bold text-[#181c20]">Real-time Satellite Telemetry</div>
                  <div className="text-[11px] text-[#72777f]">Stream continuous live GPS coordinates from active convoy vehicles.</div>
                </div>
                <input
                  type="checkbox"
                  checked={satelliteTelemetry}
                  onChange={(e) => setSatelliteTelemetry(e.target.checked)}
                  className="w-5 h-5 accent-[#003356] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <div>
                  <div className="text-xs font-bold text-[#181c20]">Automated Monsoon Rerouting</div>
                  <div className="text-[11px] text-[#72777f]">Compute alternative bypass routes when NH-6 or NH-27 report severe blockage.</div>
                </div>
                <input
                  type="checkbox"
                  checked={autoRerouteAlerts}
                  onChange={(e) => setAutoRerouteAlerts(e.target.checked)}
                  className="w-5 h-5 accent-[#003356] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <div>
                  <div className="text-xs font-bold text-[#181c20]">High Contrast Terrain Mode</div>
                  <div className="text-[11px] text-[#72777f]">Enhance visibility for rugged topographic elevations and contour lines on map.</div>
                </div>
                <input
                  type="checkbox"
                  checked={highContrastMap}
                  onChange={(e) => setHighContrastMap(e.target.checked)}
                  className="w-5 h-5 accent-[#003356] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <div>
                  <div className="text-xs font-bold text-[#181c20]">Offline Store Sync Buffer</div>
                  <div className="text-[11px] text-[#72777f]">Cache pending field incident reports locally during low satellite connectivity.</div>
                </div>
                <input
                  type="checkbox"
                  checked={offlineSyncEnabled}
                  onChange={(e) => setOfflineSyncEnabled(e.target.checked)}
                  className="w-5 h-5 accent-[#003356] cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Threshold Sliders */}
          <div className="bg-white p-6 rounded-xl border border-[#e5e8ee] shadow-xs flex flex-col gap-5">
            <h2 className="text-base font-bold text-[#181c20] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#003356] text-[20px]">warning</span>
              <span>Predictive Hazard Sensitivity Thresholds</span>
            </h2>

            <div className="flex flex-col gap-5">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-[#181c20]">Landslide Risk Alert Threshold</span>
                  <span className="font-bold text-[#ba1a1a]">{landslideThreshold}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="95"
                  value={landslideThreshold}
                  onChange={(e) => setLandslideThreshold(Number(e.target.value))}
                  className="w-full accent-[#003356] cursor-pointer"
                />
                <span className="text-[10px] text-[#72777f]">Flag corridors as 'Caution' when geological saturation probability exceeds this value.</span>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-[#181c20]">Flash Flood Warning Threshold</span>
                  <span className="font-bold text-[#0284c7]">{floodThreshold}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="95"
                  value={floodThreshold}
                  onChange={(e) => setFloodThreshold(Number(e.target.value))}
                  className="w-full accent-[#003356] cursor-pointer"
                />
                <span className="text-[10px] text-[#72777f]">Auto-notify regional dispatch units when river water basin sensors alert.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 col: System Info & Save */}
        <div className="flex flex-col gap-6">
          <div className="bg-white p-6 rounded-xl border border-[#e5e8ee] shadow-xs flex flex-col gap-4">
            <h3 className="text-sm font-bold text-[#181c20] flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#003356]">dns</span>
              <span>System & Gateway Status</span>
            </h3>

            <div className="flex flex-col gap-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-[#72777f]">Platform Version</span>
                <span className="font-semibold text-[#181c20]">NER-v2.4.0 (Production)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-[#72777f]">Data Environment</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Demo Data Active
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-[#72777f]">GIS Map Engine</span>
                <span className="font-semibold text-[#181c20]">Leaflet + OpenRouteService</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-[#72777f]">Active Corridors</span>
                <span className="font-semibold text-[#181c20]">8 North-Eastern States</span>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-[11px] font-semibold text-[#72777f] uppercase mb-1.5">
                Telemetry Refresh Rate
              </label>
              <select
                value={telemetryInterval}
                onChange={(e) => setTelemetryInterval(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-[#f1f4fa] text-[#181c20] text-xs font-medium border border-[#e5e8ee] focus:outline-none"
              >
                <option value="5">Every 5 seconds (High Frequency)</option>
                <option value="10">Every 10 seconds (Standard)</option>
                <option value="30">Every 30 seconds (Conserve Bandwidth)</option>
              </select>
            </div>

            <button
              type="submit"
              className="mt-4 w-full h-11 rounded-lg bg-[#003356] hover:bg-[#174a73] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              <span>Save Configuration</span>
            </button>
          </div>
        </div>
      </form>

      {/* Backend Connection Modal */}
      <BackendConnectionModal
        isOpen={isBackendModalOpen}
        onClose={() => setIsBackendModalOpen(false)}
      />
    </div>
  );
};
