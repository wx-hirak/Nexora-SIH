import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { useUiStore } from "@/stores/uiStore";
import type { UserRole } from "@/types/domain";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const activeRole = useUiStore((s) => s.activeRole);
  const setActiveRole = useUiStore((s) => s.setActiveRole);
  const selectedVehicleType = useUiStore((s) => s.selectedVehicleType);
  const setSelectedVehicleType = useUiStore((s) => s.setSelectedVehicleType);

  const [username, setUsername] = useState(
    activeRole === "admin"
      ? "auth.admin@ner-transport.gov.in"
      : activeRole === "officer"
      ? "officer.transit@ner-transport.gov.in"
      : "op.kamrup@ner-transport.gov.in"
  );
  const [password, setPassword] = useState("GuwahatiHub2025!");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const roleMeta: Record<UserRole, { placeholder: string; badge: string; idType: string }> = {
    admin: {
      placeholder: "auth.admin@ner-transport.gov.in",
      badge: "Admin Console Access",
      idType: "Officer ID / Badge #"
    },
    operator: {
      placeholder: "op.kamrup@ner-transport.gov.in",
      badge: "Demo Mode Active",
      idType: "Govt / Agency ID"
    },
    officer: {
      placeholder: "officer.transit@ner-transport.gov.in",
      badge: "Field Station Mode",
      idType: "Station / Unit ID"
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setActiveRole(role);
    setUsername(roleMeta[role].placeholder);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/");
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center py-6 px-4">
      {/* Top Brand Pill */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#ebeef4] text-[#42474e] text-xs font-semibold mb-3 border border-[#c2c7cf]/40">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#005148] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#005148]" />
          </span>
          <span>Regional Logistics Gateway • North East India</span>
        </div>

        <div className="flex items-center justify-center gap-3 mb-1">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center p-2 shadow-xs border border-[#e5e8ee]">
            <Logo size={36} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#003356] tracking-tight">
            NER Logistics Intelligence
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-[#42474e] max-w-xl">
          Predict disruptions. Optimize routes. Track deliveries across challenging terrain corridors.
        </p>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-sm border border-[#e5e8ee] p-6 sm:p-8 flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Role & Credentials */}
          <div className="flex flex-col gap-4 lg:pr-6 lg:border-r lg:border-[#e5e8ee]">
            {/* Operational Role Selector */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between">
                <label className="text-xs font-bold text-[#181c20]">Operational Role</label>
                <span className="text-[11px] text-[#005148] font-semibold bg-[#e6f4ea] px-2 py-0.5 rounded-full">
                  {roleMeta[activeRole].badge}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1 p-1 bg-[#f1f4fa] rounded-lg border border-[#e5e8ee]">
                {(["admin", "operator", "officer"] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRoleChange(r)}
                    className={`py-2 px-1 text-xs font-semibold rounded-md transition-all capitalize cursor-pointer ${
                      activeRole === r
                        ? "bg-[#003356] text-white shadow-xs"
                        : "text-[#42474e] hover:bg-[#ebeef4]"
                    }`}
                  >
                    {r === "admin" ? "Authority" : r === "operator" ? "Operator" : "Officer"}
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-1">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#181c20]">
                    Official Identifier / Email
                  </label>
                  <span className="text-[10px] text-[#72777f]">
                    {roleMeta[activeRole].idType}
                  </span>
                </div>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-[#72777f] text-[18px]">
                    badge
                  </span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full h-11 pl-9 pr-3 rounded-lg bg-[#f1f4fa] text-xs text-[#181c20] border border-[#e5e8ee] focus:border-[#174a73] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#181c20]">Password</label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-[#72777f] text-[18px]">
                    lock
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 pl-9 pr-10 rounded-lg bg-[#f1f4fa] text-xs text-[#181c20] border border-[#e5e8ee] focus:border-[#174a73] focus:bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 p-1 text-[#72777f] hover:text-[#181c20] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-[#42474e]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-[#003356] rounded border-gray-300"
                  />
                  <span>Remember this terminal</span>
                </label>
                <a href="#reset" onClick={(e) => { e.preventDefault(); alert("Password reset protocol routed to ministry IT desk."); }} className="text-[#27638c] hover:underline">
                  Forgot password?
                </a>
              </div>
            </form>
          </div>

          {/* Right Column: Vehicle Profile Selection */}
          <div className="flex flex-col gap-2">
            <div>
              <h2 className="text-sm font-bold text-[#003356]">Select Vehicle Profile</h2>
              <p className="text-xs text-[#72777f] mt-0.5">
                Choose the vehicle class you are dispatching or managing. Route algorithms factor weight and terrain grade.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 mt-2">
              {/* Two Wheeler */}
              <div
                onClick={() => setSelectedVehicleType("two-wheeler")}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  selectedVehicleType === "two-wheeler"
                    ? "bg-[#cfe4ff]/30 border-[#174a73] shadow-xs"
                    : "bg-[#f8fafc] border-[#e5e8ee] hover:bg-white"
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-[#ebeef4] text-[#27638c] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">two_wheeler</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#181c20]">Two Wheeler</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-[#ebeef4] text-[#72777f]">
                      Agile
                    </span>
                  </div>
                  <p className="text-[11px] text-[#72777f] mt-0.5">
                    Quick transit for narrow rural hill tracks, steep slopes, and express parcel dispatches.
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center mt-1 ${
                    selectedVehicleType === "two-wheeler"
                      ? "border-[#003356] bg-[#003356]"
                      : "border-[#c2c7cf]"
                  }`}
                >
                  {selectedVehicleType === "two-wheeler" && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </div>

              {/* Four Wheeler */}
              <div
                onClick={() => setSelectedVehicleType("four-wheeler")}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  selectedVehicleType === "four-wheeler"
                    ? "bg-[#cfe4ff]/30 border-[#174a73] shadow-xs"
                    : "bg-[#f8fafc] border-[#e5e8ee] hover:bg-white"
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-[#005148] text-white flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">directions_car</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#181c20]">Four Wheeler</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-[#005148]/15 text-[#005148]">
                      Standard
                    </span>
                  </div>
                  <p className="text-[11px] text-[#72777f] mt-0.5">
                    Utility SUVs, 4x4 pickups, and multi-passenger transit across inter-district corridors.
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center mt-1 ${
                    selectedVehicleType === "four-wheeler"
                      ? "border-[#003356] bg-[#003356]"
                      : "border-[#c2c7cf]"
                  }`}
                >
                  {selectedVehicleType === "four-wheeler" && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </div>

              {/* Heavy Commercial */}
              <div
                onClick={() => setSelectedVehicleType("heavy")}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  selectedVehicleType === "heavy"
                    ? "bg-[#cfe4ff]/30 border-[#174a73] shadow-xs"
                    : "bg-[#f8fafc] border-[#e5e8ee] hover:bg-white"
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-[#003356] text-white flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">local_shipping</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#181c20]">Heavy Commercial</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-[#ebeef4] text-[#72777f]">
                      Freight
                    </span>
                  </div>
                  <p className="text-[11px] text-[#72777f] mt-0.5">
                    Multi-axle cargo transports, refrigerated carriers, and convoys on national highways.
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center mt-1 ${
                    selectedVehicleType === "heavy"
                      ? "border-[#003356] bg-[#003356]"
                      : "border-[#c2c7cf]"
                  }`}
                >
                  {selectedVehicleType === "heavy" && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Telemetry & Enter CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#e5e8ee]">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#f1f4fa] text-xs text-[#42474e] border border-[#e5e8ee] w-full sm:w-auto">
            <span className="w-2.5 h-2.5 rounded-full bg-[#005148] animate-pulse" />
            <span className="font-semibold text-[#181c20]">Corridor Telemetry:</span>
            <span>NH-27 & GS Road Active • 99.4% Online</span>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className="w-full sm:w-auto h-11 px-8 rounded-lg bg-[#003356] hover:bg-[#174a73] text-white font-semibold text-xs transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Initialize Dispatch Console</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Trust & Security Footnote */}
      <footer className="mt-6 text-center text-[11px] text-[#72777f] flex flex-col items-center gap-1">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[15px]">lock</span>
          <span>Encrypted 256-bit Secure Transit Session • Role Selector Prototype</span>
        </div>
        <p>Ministry of Development of North Eastern Region (MDoNER) • SIH26002</p>
      </footer>
    </div>
  );
};
