import React from "react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { DataSourceBadge } from "@/components/DataSourceBadge";
import { useAlertStore } from "@/stores/alertStore";
import { useUiStore } from "@/stores/uiStore";
import { useDemoScenario } from "@/hooks/useDemoScenario";

export const TopNav: React.FC = () => {
  const unreadAlerts = useAlertStore((s) => s.unreadCount);
  const activeRole = useUiStore((s) => s.activeRole);
  const searchQuery = useUiStore((s) => s.searchQuery);
  const setSearchQuery = useUiStore((s) => s.setSearchQuery);
  const { demoStatus, runRainfallScenario, resetScenario } = useDemoScenario();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-safe bg-[#ffffff]/95 backdrop-blur-md border-b border-[#e5e8ee] shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 w-full px-3 sm:px-6 flex items-center justify-between gap-3 sm:gap-6">
        {/* Brand identity matching Stitch Mobile & Desktop */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#f1f4fa] p-1 flex items-center justify-center border border-[#c2c7cf]/40 shadow-xs group-hover:scale-105 transition-transform shrink-0">
            <Logo size={24} />
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-bold text-sm sm:text-lg text-[#003356] tracking-tight truncate">
              NER Logistics
            </span>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#005148]/10 text-[#005148] shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#005148] animate-pulse" />
              <span className="text-[10px] uppercase font-bold tracking-wider">Live</span>
            </div>
          </div>
        </Link>

        {/* Global Search */}
        <div className="flex-1 max-w-xl mx-auto hidden md:block">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#72777f] text-[20px] pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search routes, vehicles, incidents, corridors..."
              className="w-full h-10 pl-10 pr-4 bg-[#f1f4fa] text-[#181c20] placeholder:text-[#72777f] text-sm rounded-lg border border-transparent focus:border-[#174a73] focus:bg-white focus:outline-none transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Quick Actions, Status, Profile */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Flagship Demo Trigger */}
          {demoStatus === "idle" ? (
            <button
              onClick={runRainfallScenario}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#fffbeb] border border-[#d97706]/40 text-[#b45309] hover:bg-[#fef3c7] text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
              title="Simulate severe monsoon rainfall on Guwahati-Shillong corridor (Flagship Demo)"
            >
              <span className="material-symbols-outlined text-[17px] text-[#d97706]">rainy</span>
              <span>Simulate Rainfall</span>
            </button>
          ) : (
            <button
              onClick={resetScenario}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#eff6ff] border border-[#27638c]/40 text-[#27638c] hover:bg-[#dbeafe] text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
              title="Reset simulation to baseline clear conditions"
            >
              <span className="material-symbols-outlined text-[17px]">restart_alt</span>
              <span>Reset Scenario</span>
            </button>
          )}

          {/* Network Live Pulse */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f1f4fa] text-[#005148] text-xs">
            <span className="w-2 h-2 rounded-full bg-[#005148] animate-pulse" />
            <span className="font-medium text-[#181c20]">Network Live</span>
          </div>

          {/* Data Source Badge (FR-19) */}
          <div className="hidden sm:inline-flex">
            <DataSourceBadge />
          </div>

          {/* Notification Button */}
          <Link
            to="/incidents-alerts"
            aria-label="Notifications"
            className="relative p-2 rounded-lg text-[#42474e] hover:bg-[#ebeef4] hover:text-[#181c20] transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            {unreadAlerts > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#ba1a1a] text-white text-[10px] font-bold">
                {unreadAlerts}
              </span>
            )}
          </Link>

          {/* User Profile */}
          <Link
            to="/login"
            className="flex items-center gap-2 pl-2 border-l border-[#e5e8ee] hover:opacity-85 transition-opacity"
            title="Click to switch role or station"
          >
            <div className="w-8 h-8 rounded-full bg-[#003356] flex items-center justify-center text-white shadow-xs">
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
            <div className="hidden xl:flex flex-col text-left leading-tight">
              <span className="text-xs font-semibold text-[#181c20]">
                {activeRole === "admin" ? "auth.admin" : activeRole === "officer" ? "officer.transit" : "op.kamrup"}
              </span>
              <span className="text-[10px] text-[#72777f]">
                {activeRole === "admin" ? "Authority Console" : activeRole === "officer" ? "Field Officer" : "Control Desk"}
              </span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};
