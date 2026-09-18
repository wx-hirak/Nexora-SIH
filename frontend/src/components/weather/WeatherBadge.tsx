import React from "react";

export interface WeatherBadgeProps {
  condition: string;
  rainfallMm?: number;
  className?: string;
}

export const WeatherBadge: React.FC<WeatherBadgeProps> = ({
  condition,
  rainfallMm,
  className = ""
}) => {
  const isHighRain = (rainfallMm && rainfallMm > 50) || condition.toLowerCase().includes("heavy");

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
        isHighRain
          ? "bg-sky-100 text-sky-800 border border-sky-300"
          : "bg-slate-100 text-slate-700"
      } ${className}`}
    >
      <span className="material-symbols-outlined text-[16px]">
        {isHighRain ? "rainy" : "wb_cloudy"}
      </span>
      <span>{condition}</span>
      {rainfallMm !== undefined && <span className="opacity-80">({rainfallMm} mm)</span>}
    </span>
  );
};
