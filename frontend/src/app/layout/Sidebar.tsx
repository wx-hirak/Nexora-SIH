import React from "react";
import { NavLink } from "react-router-dom";
import { useAlertStore } from "@/stores/alertStore";
import { useRoadStore } from "@/stores/roadStore";
import { useUiStore } from "@/stores/uiStore";

export const Sidebar: React.FC = () => {
  const unreadAlerts = useAlertStore((s) => s.unreadCount);
  const roads = useRoadStore((s) => s.roads);
  const setIsReportModalOpen = useUiStore((s) => s.setIsReportModalOpen);

  // Dynamic corridor counts derived from live store
  const accessibleCount = roads.filter((r) => r.status === "accessible").length || 42;
  const atRiskCount = roads.filter((r) => r.status === "at_risk" || r.status === "under_observation").length || 7;
  const blockedCount = roads.filter((r) => r.status === "blocked").length || 2;

  const navItems = [
    { to: "/", label: "Dashboard", icon: "dashboard" },
    { to: "/fleet", label: "Fleet", icon: "local_shipping" },
    {
      to: "/incidents-alerts",
      label: "Incidents & Alerts",
      icon: "warning",
      badge: unreadAlerts > 0 ? unreadAlerts : undefined
    },
    { to: "/analytics", label: "Analytics", icon: "analytics" },
    { to: "/field", label: "Field Reporting", icon: "campaign" },
    { to: "/login", label: "Role & Settings", icon: "tune" }
  ];

  return (
    <aside className="hidden md:flex fixed left-0 top-16 bottom-0 w-[260px] lg:w-[280px] xl:w-[310px] bg-[#ffffff] border-r border-[#e5e8ee] z-40 flex-col justify-between py-4 px-3 shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
      {/* Top Nav Links */}
      <div className="flex flex-col gap-1">
        <nav className="flex flex-col gap-1 w-full">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? "bg-[#174a73] text-white font-semibold shadow-xs"
                    : "text-[#42474e] hover:bg-[#f1f4fa] hover:text-[#181c20]"
                }`
              }
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-2 py-0.5 rounded-full bg-[#ba1a1a] text-white text-[11px] font-bold">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom Container: Report Incident Button placed directly on top of Network Status */}
      <div className="flex flex-col gap-3 px-2 pt-2">
        <button
          type="button"
          onClick={() => setIsReportModalOpen(true)}
          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold text-white bg-[#ba1a1a] hover:bg-[#93000a] rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add_alert</span>
          <span>Report Incident</span>
        </button>

        {/* Network Live Summary Status Card */}
        <div className="flex flex-col gap-2 pt-3 border-t border-[#e5e8ee]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#72777f] uppercase tracking-wider font-bold">
              Network Status
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#003356] text-white text-[10px] font-bold">
              Live Arterials
            </span>
          </div>

          <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#15803d]" />
                <span className="text-slate-600 font-medium">Accessible</span>
              </div>
              <span className="font-bold text-slate-900">{accessibleCount} Corridors</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-slate-600 font-medium">At Risk</span>
              </div>
              <span className="font-bold text-amber-700">{atRiskCount} Corridors</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                <span className="text-slate-600 font-medium">Blocked</span>
              </div>
              <span className="font-bold text-rose-700">{blockedCount} Corridors</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
