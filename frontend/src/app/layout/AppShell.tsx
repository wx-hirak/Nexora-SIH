import React from "react";
import { Outlet } from "react-router-dom";
import { TopNav } from "./TopNav";
import { Sidebar } from "./Sidebar";
import { ReportIncidentModal } from "@/features/incidents/ReportIncidentModal";
import { useLiveUpdates } from "@/hooks/useLiveUpdates";
import { useDemoScenario } from "@/hooks/useDemoScenario";

export const AppShell: React.FC = () => {
  // Activate live updates stream
  const { error } = useLiveUpdates();
  const { toastMessage, dismissToast } = useDemoScenario();

  return (
    <div className="min-h-screen bg-[#f7f9ff] text-[#181c20]">
      {/* Fixed Top Navigation Bar */}
      <TopNav />

      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Report Incident Modal */}
      <ReportIncidentModal />

      {/* Main Content Area */}
      <div className="pl-[280px] xl:pl-[310px]">
        <main className="pt-16 min-h-screen w-full px-4 sm:px-6 xl:px-8 py-6">
          {/* Connection Error or Stale State Banner (rules.md §3) */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-[#ffdad6] border border-[#ba1a1a]/30 text-[#93000a] text-xs font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">wifi_off</span>
                <span>Connection Stale: {error}. Falling back to cached local simulation state.</span>
              </div>
            </div>
          )}

          {/* Transient Scenario Toast */}
          {toastMessage && (
            <div className="fixed top-20 right-6 z-50 max-w-md p-4 rounded-xl bg-[#003356] text-white shadow-2xl border border-[#cfe4ff]/20 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[20px] text-[#77d7c8] shrink-0">
                  info
                </span>
                <span className="text-xs leading-relaxed font-medium">{toastMessage}</span>
              </div>
              <button
                type="button"
                onClick={dismissToast}
                className="text-white/60 hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          )}

          <Outlet />
        </main>
      </div>
    </div>
  );
};
