import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { useAuthStore } from "@/stores/authStore";
import type { UserRole } from "@/types/domain";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const [selectedRole, setSelectedRole] = useState<UserRole>("operator");
  const [username, setUsername] = useState("op.kamrup@ner-transport.gov.in");
  const [password, setPassword] = useState("GuwahatiHub2025!");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const rolePresets: Record<UserRole, { label: string; email: string; badge: string; description: string; idType: string }> = {
    operator: {
      label: "Control Desk Operator",
      email: "op.kamrup@ner-transport.gov.in",
      badge: "Dispatch Unit",
      description: "Corridor management, telemetry monitoring & rerouting",
      idType: "Govt / Agency ID"
    },
    admin: {
      label: "Regional Authority",
      email: "auth.admin@ner-transport.gov.in",
      badge: "HQ Command",
      description: "Inter-state oversight, corridor clearances & SLA policies",
      idType: "Officer ID / Badge #"
    },
    officer: {
      label: "Field Transit Officer",
      email: "officer.transit@ner-transport.gov.in",
      badge: "Transit Post",
      description: "On-site checkpoint reports, hazard telemetry & verification",
      idType: "Station / Unit ID"
    }
  };

  const handleSelectRolePreset = (role: UserRole) => {
    setSelectedRole(role);
    setUsername(rolePresets[role].email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(username, selectedRole);
    navigate("/role-selection");
  };

  return (
    <div className="min-h-screen w-full bg-[#f7f9ff] text-[#181c20] flex flex-col items-center justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header / Brand Pill */}
      <div className="w-full max-w-lg flex flex-col items-center text-center pt-4 sm:pt-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#ebeef4] text-[#42474e] text-xs font-semibold mb-4 border border-[#c2c7cf]/40 shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#005148] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#005148]" />
          </span>
          <span>Regional Logistics Gateway • North East India</span>
        </div>

        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center p-2 shadow-sm border border-[#e5e8ee]">
            <Logo size={36} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#003356] tracking-tight">
            NER Logistics Intelligence
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-[#42474e] max-w-md">
          Predict disruptions. Optimize routes. Track critical supplies across challenging terrain corridors.
        </p>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,51,86,0.06)] border border-[#e5e8ee] p-6 sm:p-8 my-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#003356]">Sign In to Dispatch Portal</h2>
            <span className="px-2 py-0.5 rounded-full bg-[#e6f4ea] text-[#005148] text-[11px] font-semibold">
              Step 1 of 2
            </span>
          </div>
          <p className="text-xs text-[#72777f] mt-1">
            Authenticate to access live telemetry and route intelligence.
          </p>
        </div>

        {/* Quick Role Presets */}
        <div className="flex flex-col gap-1.5 mb-5">
          <label className="text-xs font-bold text-[#181c20]">Select Identity Preset</label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#f1f4fa] rounded-xl border border-[#e5e8ee]">
            {(["operator", "admin", "officer"] as UserRole[]).map((r) => {
              const active = selectedRole === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleSelectRolePreset(r)}
                  className={`py-2 px-1 text-xs font-semibold rounded-lg transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                    active
                      ? "bg-[#003356] text-white shadow-xs"
                      : "text-[#42474e] hover:bg-[#ebeef4] hover:text-[#181c20]"
                  }`}
                >
                  <span className="capitalize">{r === "admin" ? "Authority" : r === "operator" ? "Operator" : "Officer"}</span>
                  <span
                    className={`text-[9px] font-normal ${
                      active ? "text-[#cfe4ff]" : "text-[#72777f]"
                    }`}
                  >
                    {r === "admin" ? "HQ Desk" : r === "operator" ? "Control" : "Field"}
                  </span>
                </button>
              );
            })}
          </div>
          <span className="text-[11px] text-[#72777f] mt-0.5">
            {rolePresets[selectedRole].description}
          </span>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#181c20]">
                Official Email / Identifier
              </label>
              <span className="text-[10px] text-[#72777f]">
                {rolePresets[selectedRole].idType}
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
                placeholder="Enter official email or badge ID"
                className="w-full h-11 pl-9 pr-3 rounded-lg bg-[#f1f4fa] text-xs text-[#181c20] border border-[#e5e8ee] focus:border-[#174a73] focus:bg-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#181c20]">Password</label>
              <span className="text-[10px] text-[#72777f]">Encrypted Transit Token</span>
            </div>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[#72777f] text-[18px]">
                lock
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 pl-9 pr-10 rounded-lg bg-[#f1f4fa] text-xs text-[#181c20] border border-[#e5e8ee] focus:border-[#174a73] focus:bg-white focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 p-1.5 text-[#72777f] hover:text-[#181c20] cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
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
              <span>Remember this session</span>
            </label>
            <a
              href="#reset"
              onClick={(e) => {
                e.preventDefault();
                alert("Password reset protocol routed to Ministry IT Operations desk.");
              }}
              className="text-[#27638c] hover:underline"
            >
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full h-11 mt-2 rounded-xl bg-[#003356] hover:bg-[#174a73] text-white font-semibold text-xs transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Sign In & Continue</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </form>

        {/* Demo Notification Note */}
        <div className="mt-5 p-3 rounded-xl bg-[#eff6ff] border border-[#cfe4ff] text-xs text-[#1e40af] flex items-start gap-2">
          <span className="material-symbols-outlined text-[18px] text-[#27638c] shrink-0 mt-0.5">
            info
          </span>
          <p className="text-[11px] leading-relaxed">
            <strong>Demonstration Mode:</strong> Select any identity preset above or click <em>Sign In & Continue</em> to proceed directly to Role & Vehicle configuration.
          </p>
        </div>
      </div>

      {/* Trust & Security Footnote */}
      <footer className="w-full max-w-lg text-center text-[11px] text-[#72777f] flex flex-col items-center gap-1.5 pb-4">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[15px] text-[#005148]">verified_user</span>
          <span>Encrypted 256-bit Secure Transit Session • National Gateway</span>
        </div>
        <p>Ministry of Development of North Eastern Region (MDoNER) • SIH26002</p>
      </footer>
    </div>
  );
};
