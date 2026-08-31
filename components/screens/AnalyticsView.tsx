'use client';

import React, { useState } from 'react';
import { ANALYTICS_DATA } from '@/data/mockData';
import { KpiCard } from '@/components/ui/KpiCard';

export const AnalyticsView: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly'>('weekly');
  const [hoveredDataPoint, setHoveredDataPoint] = useState<{
    label: string;
    travelers: number;
    safetyScore: number;
  } | null>(null);

  const trendData =
    timeframe === 'weekly' ? ANALYTICS_DATA.weeklyTrends : ANALYTICS_DATA.monthlyTrends;

  const maxTravelers = Math.max(...trendData.map(d => d.travelers));

  return (
    <div className="w-full space-y-5 pb-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ANALYTICS_DATA.kpis.map(kpi => (
          <KpiCard
            key={kpi.id}
            label={kpi.label}
            value={kpi.value}
            trend={kpi.trend ? `+${kpi.trend} vs previous period` : undefined}
            trendDirection={kpi.trendDirection}
            subtitle={kpi.subtitle}
            iconName={kpi.iconName}
            statusBorderColor={kpi.statusBorderColor}
          />
        ))}
      </div>

      {/* Main Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Traveler Trends Interactive Chart (Col span 8) */}
        <div className="lg:col-span-8 bg-surface-container-lowest border border-border-subtle shadow-[0px_4px_12px_rgba(0,0,0,0.05)] rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle mb-4">
            <div>
              <h3 className="font-headline-sm text-base font-bold text-on-surface">
                Traveler & Logistics Flow Trends
              </h3>
              <p className="font-label-sm text-xs text-on-surface-variant">
                Aggregate corridor traffic volume across Northeast India
              </p>
            </div>

            {/* Weekly / Monthly Switcher */}
            <div className="flex bg-surface-container-low rounded-lg p-1 border border-border-subtle">
              <button
                onClick={() => setTimeframe('weekly')}
                className={`px-3 py-1 rounded-md text-xs font-label-caps uppercase transition-all ${
                  timeframe === 'weekly'
                    ? 'bg-surface shadow-xs font-bold text-primary border border-border-subtle'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setTimeframe('monthly')}
                className={`px-3 py-1 rounded-md text-xs font-label-caps uppercase transition-all ${
                  timeframe === 'monthly'
                    ? 'bg-surface shadow-xs font-bold text-primary border border-border-subtle'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          {/* Interactive Chart Canvas */}
          <div className="relative h-64 w-full flex items-end justify-between pt-8 pb-6 px-4">
            {/* Horizontal Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
              <div className="border-b border-dashed border-border-subtle/80 w-full" />
              <div className="border-b border-dashed border-border-subtle/80 w-full" />
              <div className="border-b border-dashed border-border-subtle/80 w-full" />
              <div className="border-b border-border-subtle w-full" />
            </div>

            {/* Bars with smooth curves */}
            {trendData.map(item => {
              const heightPercent = (item.travelers / maxTravelers) * 85;
              const isHovered = hoveredDataPoint?.label === item.label;

              return (
                <div
                  key={item.label}
                  onMouseEnter={() => setHoveredDataPoint(item)}
                  onMouseLeave={() => setHoveredDataPoint(null)}
                  className="flex flex-col items-center flex-1 z-10 cursor-pointer group"
                >
                  {/* Tooltip on hover */}
                  {isHovered && (
                    <div className="absolute -top-3 bg-surface-slate text-white text-[11px] py-1 px-2.5 rounded-lg shadow-xl pointer-events-none animate-in fade-in zoom-in-95">
                      <div className="font-bold">{item.travelers.toLocaleString()} travelers</div>
                      <div className="text-[10px] text-gray-300">Safety Index: {item.safetyScore}%</div>
                    </div>
                  )}

                  <div className="w-full flex justify-center h-48 items-end">
                    <div
                      className={`w-9 sm:w-12 rounded-t-lg transition-all duration-300 ${
                        isHovered
                          ? 'bg-primary-container brightness-110 shadow-md'
                          : 'bg-primary/80 hover:bg-primary-container'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>

                  <span className="font-label-caps text-xs text-on-surface-variant mt-2">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border-subtle text-xs text-on-surface-variant">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-primary" />
              Logistics Convoys & Registered Vehicles
            </span>
            <span className="font-medium">Average Corridor Reliability: 94.6%</span>
          </div>
        </div>

        {/* Incident Breakdown by Category (Col span 4) */}
        <div className="lg:col-span-4 bg-surface-container-lowest border border-border-subtle shadow-[0px_4px_12px_rgba(0,0,0,0.05)] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-border-subtle mb-4">
              <h3 className="font-headline-sm text-base font-bold text-on-surface">
                Hazard Incident Share
              </h3>
              <p className="font-label-sm text-xs text-on-surface-variant">
                Breakdown by hazard taxonomy
              </p>
            </div>

            <div className="space-y-3.5">
              {ANALYTICS_DATA.incidentCategories.map(cat => (
                <div key={cat.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-on-surface">{cat.name}</span>
                    <span className="text-on-surface-variant">{cat.percentage}% ({cat.count})</span>
                  </div>
                  <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor: cat.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border-subtle text-center text-xs text-on-surface-variant">
            Top disruption vector: <b>Monsoon Precipitation (38%)</b>
          </div>
        </div>
      </div>

      {/* Corridor Safety Scorecard & NER State Weather Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Corridor Safety Table (Col span 7) */}
        <div className="lg:col-span-7 bg-surface-container-lowest border border-border-subtle shadow-[0px_4px_12px_rgba(0,0,0,0.05)] rounded-xl p-5">
          <div className="pb-3 border-b border-border-subtle mb-3 flex items-center justify-between">
            <div>
              <h3 className="font-headline-sm text-base font-bold text-on-surface">
                Corridor Safety & Throughput
              </h3>
              <p className="font-label-sm text-xs text-on-surface-variant">
                Live operational indices for main national highways
              </p>
            </div>
            <span className="font-label-caps text-xs text-status-green bg-status-green/10 px-2 py-0.5 rounded font-bold">
              LIVE TELEMETRY
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border-subtle font-label-caps text-on-surface-variant uppercase">
                  <th className="py-2.5 px-2">Highway Corridor</th>
                  <th className="py-2.5 px-2 text-center">Safety Score</th>
                  <th className="py-2.5 px-2">Throughput</th>
                  <th className="py-2.5 px-2">Avg Speed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/60 font-medium">
                {ANALYTICS_DATA.corridorSafety.map(c => (
                  <tr key={c.corridor} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-3 px-2 font-bold text-on-surface max-w-[220px] truncate">
                      {c.corridor}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span
                        className={`px-2 py-0.5 rounded font-bold ${
                          c.score >= 90
                            ? 'bg-status-green/10 text-status-green'
                            : c.score >= 80
                            ? 'bg-status-amber/15 text-status-amber'
                            : 'bg-error-container/40 text-status-red'
                        }`}
                      >
                        {c.score}%
                      </span>
                    </td>
                    <td className="py-3 px-2 text-on-surface-variant">{c.throughput}</td>
                    <td className="py-3 px-2 text-on-surface">{c.avgSpeed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* State Weather Matrix (Col span 5) */}
        <div className="lg:col-span-5 bg-surface-container-lowest border border-border-subtle shadow-[0px_4px_12px_rgba(0,0,0,0.05)] rounded-xl p-5">
          <div className="pb-3 border-b border-border-subtle mb-3">
            <h3 className="font-headline-sm text-base font-bold text-on-surface">
              Northeast States Meteorological Matrix
            </h3>
            <p className="font-label-sm text-xs text-on-surface-variant">
              Regional risk indices & weather warnings
            </p>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
            {ANALYTICS_DATA.stateWeatherStatus.map(s => (
              <div
                key={s.state}
                className="flex items-center justify-between p-2.5 rounded-lg border border-border-subtle bg-surface/50 hover:bg-surface-container-low transition-colors"
              >
                <div>
                  <span className="font-headline-sm text-xs font-bold text-on-surface block">
                    {s.state}
                  </span>
                  <span className="text-[11px] text-on-surface-variant">
                    {s.condition} &bull; {s.temp}
                  </span>
                </div>
                <div className="text-right">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      s.risk === 'High'
                        ? 'bg-error-container/50 text-status-red'
                        : s.risk === 'Medium'
                        ? 'bg-status-amber/15 text-status-amber'
                        : 'bg-status-green/10 text-status-green'
                    }`}
                  >
                    {s.risk} Risk
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
