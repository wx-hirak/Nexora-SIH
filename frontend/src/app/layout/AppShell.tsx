import React from "react";
import { Outlet } from "react-router-dom";
import { TopNav } from "./TopNav";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "@/components/BottomNav";
import { ReportIncidentModal } from "@/features/incidents/ReportIncidentModal";
import { useLiveUpdates } from "@/hooks/useLiveUpdates";
import { useDemoScenario } from "@/hooks/useDemoScenario";
import { useUiStore } from "@/stores/uiStore";

export const AppShell: React.FC = () => {
  // Activate live updates stream
  const { error } = useLiveUpdates();
  const { toastMessage, dismissToast } = useDemoScenario();
  const setIsReportModalOpen = useUiStore((s) => s.setIsReportModalOpen);

  return (
    <div className="min-h-screen bg-[#f7f9ff] text-[#181c20] flex flex-col">
      {/* Fixed Top Navigation Bar */}
      <TopNav />

      {/* Fixed Sidebar (Hidden on Mobile, Visible on Tablet & Desktop) */}
      <Sidebar />

      {/* Report Incident Modal */}
      <ReportIncidentModal />

      {/* Main Content Area: Zero offset on Mobile, Offsets on Tablet/Desktop */}
      <div className="pl-0 md:pl-[260px] lg:pl-[280px] xl:pl-[310px] w-full transition-all duration-200">
        <main className="pt-16 min-h-screen w-full px-3 sm:px-6 xl:px-8 py-4 sm:py-6 pb-28 md:pb-8">
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
            <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm sm:max-w-md p-4 rounded-xl bg-[#003356] text-white shadow-2xl border border-[#cfe4ff]/20 flex items-start justify-between gap-3">
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

      {/* Mobile Floating 'Report Incident' Button (Stitch Mobile pattern) */}
      <div className="fixed bottom-20 right-4 z-40 md:hidden">
        <button
          type="button"
          onClick={() => setIsReportModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#ba1a1a] text-white rounded-full shadow-[0_8px_20px_rgba(186,26,26,0.35)] hover:bg-[#93000a] active:scale-95 transition-all cursor-pointer"
          aria-label="Report Incident"
        >
          <span className="material-symbols-outlined text-[20px]">add_alert</span>
          <span className="text-xs font-bold uppercase tracking-wide">Report Incident</span>
        </button>
      </div>

      {/* Fixed Bottom Navigation Bar on Mobile */}
      <BottomNav />
    </div>
  );
};

