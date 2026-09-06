import React from "react";
import { useDataProvider } from "@/app/providers/DataProviderContext";

export const DataSourceBadge: React.FC = () => {
  const { sourceType } = useDataProvider();

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide border transition-all cursor-default"
      style={{
        backgroundColor: sourceType === "live" ? "#e6f4ea" : "#f1f4fa",
        borderColor: sourceType === "live" ? "#34a853" : "#c2c7cf",
        color: sourceType === "live" ? "#137333" : "#42474e"
      }}
      title={
        sourceType === "live"
          ? "Connected to Live Telemetry & Spatial API"
          : "Operating on Synthetic / Mock NER Simulation Data (FR-19)"
      }
    >
      <span
        className="w-2 h-2 rounded-full animate-pulse"
        style={{
          backgroundColor: sourceType === "live" ? "#137333" : "#72777f"
        }}
      />
      <span>{sourceType === "live" ? "Live Data" : "Mock Data"}</span>
    </div>
  );
};
