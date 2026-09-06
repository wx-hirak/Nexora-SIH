import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { useAuthStore } from "@/stores/authStore";
import { useUiStore } from "@/stores/uiStore";
import type { UserRole } from "@/types/domain";

export const RoleVehicleSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const authUser = useAuthStore((s) => s.user);
  const selectProfile = useAuthStore((s) => s.selectProfile);
  const logout = useAuthStore((s) => s.logout);

  const initialRole = authUser?.role || useUiStore.getState().activeRole || "operator";
  const initialVehicle = authUser?.vehicleType || useUiStore.getState().selectedVehicleType || "four-wheeler";

  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [selectedVehicle, setSelectedVehicle] = useState<"heavy" | "four-wheeler" | "two-wheeler">(initialVehicle);

  const handleConfirm = () => {
    selectProfile(selectedRole, selectedVehicle);
    navigate("/");
  };

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  const roles = [
    {
      id: "operator" as UserRole,
      title: "Control Desk Operator",
      badge: "Active Dispatch",
      icon: "headset_mic",
      description: "Manage live corridor telemetry, reroute freight convoys, and handle dispatch operations.",
      features: ["Active fleet tracking", "Dynamic rerouting", "Consignment management"]
    },
    {
      id: "admin" as UserRole,
      title: "Regional Authority",
      badge: "HQ Command",
      icon: "admin_panel_settings",
      description: "High-level oversight across 8 North East states, corridor clearance orders, and SLA governance.",
      features: ["State-wide analytics", "BRO coordination", "Inter-agency directives"]
    },
    {
      id: "officer" as UserRole,
      title: "Field Transit Officer",
      badge: "Transit Post",
      icon: "shield_person",
      description: "On-the-ground checkpoint operations, photo hazard telemetry verification, and incident logging.",
      features: ["Offline store-and-forward", "Geo-tagged photo verification", "Checkpoint clearance"]
    }
  ];

  const vehicles = [
    {
      id: "two-wheeler" as const,
      name: "Two Wheeler",
      badge: "Agile Transit",
      icon: "two_wheeler",
      color: "bg-[#27638c]",
      description: "Specialized for narrow rural hill tracks, steep gradient slope corridors, and express emergency parcel dispatches.",
      specs: "Payload: < 60kg • Max Slope: 28° • Bypass capability: High"
    },
    {
      id: "four-wheeler" as const,
      name: "Four Wheeler (Utility / 4x4)",
      badge: "Standard Fleet",
      icon: "directions_car",
      color: "bg-[#005148]",
      description: "Utility pickups, emergency 4x4 response vehicles, and multi-district transit across regional arteries.",
      specs: "Payload: < 2.5 Tons • All-Weather 4WD • Medium Corridors"
    },
    {
      id: "heavy" as const,
      name: "Heavy Commercial Freight",
      badge: "Cargo / Convoy",
      icon: "local_shipping",
      color: "bg-[#003356]",
      description: "Multi-axle container trucks, refrigerated pharmaceutical carriers, and essential supply convoys on NH corridors.",
      specs: "Payload: 15-40 Tons • Height restrictions enforced • NH Arterials"
    }
  ];

  return (
    <div className="min-h-screen w-full bg-[#f7f9ff] text-[#181c20] flex flex-col items-center justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <header className="w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-[#e5e8ee]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1.5 shadow-xs border border-[#e5e8ee]">
            <Logo size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-[#003356] tracking-tight">
                NER Logistics Platform
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#cfe4ff] text-[#001d34] text-[10px] font-bold">
                Step 2 of 2
              </span>
            </div>
            <p className="text-xs text-[#72777f]">
              Logged in as: <strong className="text-[#181c20]">{authUser?.email || "operator@ner-transport.gov.in"}</strong>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="text-xs font-semibold text-[#ba1a1a] hover:text-[#93000a] flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#ffdad6] hover:bg-[#ffdad6]/20 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">logout</span>
          <span>Sign in as different user</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-5xl py-6 flex flex-col gap-8">
        {/* Title Banner */}
        <div className="flex flex-col gap-1 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#003356] tracking-tight">
            Operational Role & Vehicle Profile Setup
          </h1>
          <p className="text-xs sm:text-sm text-[#42474e]">
            Tailor the Command Center algorithms, telematics views, and route clearance calculations to your current assignment.
          </p>
        </div>

        {/* Section 1: Role Selection */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#003356] uppercase tracking-wider">
              1. Choose Operational Responsibility
            </h2>
            <span className="text-xs text-[#72777f]">Select one role</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roles.map((r) => {
              const active = selectedRole === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedRole(r.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                    active
                      ? "bg-[#cfe4ff]/25 border-[#174a73] shadow-md ring-2 ring-[#003356]/20"
                      : "bg-white border-[#e5e8ee] hover:bg-[#f8fafc] hover:border-[#c2c7cf]"
                  }`}
                >
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                          active ? "bg-[#003356] text-white" : "bg-[#ebeef4] text-[#42474e]"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">{r.icon}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          active
                            ? "bg-[#005148] text-white"
                            : "bg-[#ebeef4] text-[#42474e]"
                        }`}
                      >
                        {r.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-[#181c20]">{r.title}</h3>
                      <p className="text-xs text-[#72777f] mt-1 leading-relaxed">
                        {r.description}
                      </p>
                    </div>

                    <ul className="text-[11px] text-[#42474e] flex flex-col gap-1 pt-2 border-t border-[#e5e8ee]/80">
                      {r.features.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[14px] text-[#005148]">
                            check_circle
                          </span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#e5e8ee]/60">
                    <span className="text-[11px] font-semibold text-[#003356]">
                      {active ? "Active Selection" : "Select Role"}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        active ? "border-[#003356] bg-[#003356]" : "border-[#c2c7cf]"
                      }`}
                    >
                      {active && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Vehicle Profile Selection */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#003356] uppercase tracking-wider">
              2. Select Primary Vehicle Class
            </h2>
            <span className="text-xs text-[#72777f]">
              Determines clearance alerts, weight limits, and alternate detour recommendations
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {vehicles.map((v) => {
              const active = selectedVehicle === v.id;
              return (
                <div
                  key={v.id}
                  onClick={() => setSelectedVehicle(v.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                    active
                      ? "bg-[#cfe4ff]/25 border-[#174a73] shadow-md ring-2 ring-[#003356]/20"
                      : "bg-white border-[#e5e8ee] hover:bg-[#f8fafc] hover:border-[#c2c7cf]"
                  }`}
                >
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center text-white ${v.color}`}
                      >
                        <span className="material-symbols-outlined text-[22px]">{v.icon}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ebeef4] text-[#42474e]">
                        {v.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-[#181c20]">{v.name}</h3>
                      <p className="text-xs text-[#72777f] mt-1 leading-relaxed">
                        {v.description}
                      </p>
                    </div>

                    <div className="p-2 rounded-lg bg-[#f1f4fa] text-[10px] text-[#42474e] font-mono">
                      {v.specs}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#e5e8ee]/60">
                    <span className="text-[11px] font-semibold text-[#003356]">
                      {active ? "Class Configured" : "Select Class"}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        active ? "border-[#003356] bg-[#003356]" : "border-[#c2c7cf]"
                      }`}
                    >
                      {active && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Telemetry & Confirm Action */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#e5e8ee] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#005148] opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#005148]" />
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#181c20]">
                Arterial Corridor Telemetry Synchronized
              </span>
              <span className="text-[11px] text-[#72777f]">
                NH-27, NH-6 & Guwahati-Shillong corridor live feeds active.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleConfirm}
              className="w-full sm:w-auto h-11 px-8 rounded-xl bg-[#003356] hover:bg-[#174a73] text-white font-semibold text-xs transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Confirm & Launch Dashboard</span>
              <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl text-center text-[11px] text-[#72777f] pt-4 border-t border-[#e5e8ee]/80">
        Ministry of Development of North Eastern Region (MDoNER) • NER Logistics Intelligence Portal
      </footer>
    </div>
  );
};
