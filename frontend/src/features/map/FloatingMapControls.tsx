import React, { useState } from "react";
import { useUiStore } from "@/stores/uiStore";

interface FloatingMapControlsProps {
  onRecenter?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onCenterMyLocation?: () => void;
  isMyLocationActive?: boolean;
}

export const FloatingMapControls: React.FC<FloatingMapControlsProps> = ({
  onRecenter,
  onZoomIn,
  onZoomOut,
  onCenterMyLocation,
  isMyLocationActive = false
}) => {
  const mapLayerMode = useUiStore((s) => s.mapLayerMode);
  const setMapLayerMode = useUiStore((s) => s.setMapLayerMode);
  const [isLegendOpen, setIsLegendOpen] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 1024 : false
  );

  return (
    <div className="absolute bottom-3 sm:bottom-5 right-3 sm:right-5 z-20 flex flex-col items-end gap-2 sm:gap-3 pointer-events-none">
      {/* Interactive Clean Map Legend (Collapsible) */}
      <div className="map-floating-element bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08),0_12px_24px_rgba(0,51,86,0.06)] border border-slate-200/80 pointer-events-auto max-w-xs transition-all">
        <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#003356]">layers</span>
            <span className="text-[11px] uppercase tracking-wider text-[#003356] font-bold">
              Corridor Status
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsLegendOpen(!isLegendOpen)}
            className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
            title={isLegendOpen ? "Minimize Legend" : "Expand Legend"}
          >
            <span className="material-symbols-outlined text-[16px]">
              {isLegendOpen ? "expand_less" : "expand_more"}
            </span>
          </button>
        </div>

        {isLegendOpen && (
          <div className="pt-2">
            {/* Status Colors */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs mb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-1.5 bg-[#15803d] rounded-full shadow-xs" />
                <span className="text-slate-800 text-[11px] font-medium">Accessible</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-1.5 bg-[#d97706] rounded-full shadow-xs" />
                <span className="text-slate-800 text-[11px] font-medium">At Risk</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-1.5 bg-[#dc2626] rounded-full shadow-xs" />
                <span className="text-slate-800 text-[11px] font-medium">Blocked</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#0284c7] border-2 border-white shadow-xs" />
                <span className="text-slate-800 text-[11px] font-medium">Live GPS Unit</span>
              </div>
            </div>

            {/* Vehicle Type Badges */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1 text-[10px] text-slate-600">
              <span className="flex items-center gap-1 font-semibold text-[#003356]">
                <span className="w-2 h-2 rounded-full bg-[#174a73]" /> HV Truck
              </span>
              <span className="flex items-center gap-1 font-semibold text-[#005148]">
                <span className="w-2 h-2 rounded-full bg-[#005148]" /> FW Utility
              </span>
              <span className="flex items-center gap-1 font-semibold text-[#27638c]">
                <span className="w-2 h-2 rounded-full bg-[#27638c]" /> TW Courier
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Google Maps-Style Clean Floating Control Stack */}
      <div className="flex flex-col items-center gap-2 pointer-events-auto">
        {/* Layer Mode Switcher Pill */}
        <div className="map-floating-element flex items-center bg-white/95 backdrop-blur-md p-1 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08),0_12px_24px_rgba(0,51,86,0.06)] border border-slate-200/80">
          {(["terrain", "corridors", "satellite"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setMapLayerMode(mode)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all capitalize cursor-pointer ${
                mapLayerMode === mode
                  ? "bg-[#003356] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Vertical Action Stack (Zoom, Center My Location, Recenter) */}
        <div className="map-floating-element flex flex-col bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08),0_12px_24px_rgba(0,51,86,0.06)] border border-slate-200/80 overflow-hidden divide-y divide-slate-100">
          {/* Zoom In */}
          <button
            type="button"
            onClick={onZoomIn}
            title="Zoom In"
            className="p-3 text-slate-700 hover:bg-slate-100 hover:text-[#003356] transition-colors cursor-pointer flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
          </button>

          {/* Zoom Out */}
          <button
            type="button"
            onClick={onZoomOut}
            title="Zoom Out"
            className="p-3 text-slate-700 hover:bg-slate-100 hover:text-[#003356] transition-colors cursor-pointer flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[20px]">remove</span>
          </button>

          {/* My Location (Google Maps crosshair locator) */}
          <button
            type="button"
            onClick={onCenterMyLocation}
            title="Center on My Location (Live GPS)"
            className={`p-3 transition-colors cursor-pointer flex items-center justify-center ${
              isMyLocationActive
                ? "bg-sky-50 text-[#0284c7] font-bold"
                : "text-slate-700 hover:bg-slate-100 hover:text-[#0284c7]"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">my_location</span>
          </button>

          {/* Recenter Full Region */}
          <button
            type="button"
            onClick={onRecenter}
            title="Recenter North East Region"
            className="p-3 text-slate-700 hover:bg-slate-100 hover:text-[#003356] transition-colors cursor-pointer flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[20px]">filter_center_focus</span>
          </button>
        </div>
      </div>
    </div>
  );
};
