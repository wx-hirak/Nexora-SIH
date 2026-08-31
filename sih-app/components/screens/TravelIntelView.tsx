'use client';

import React from 'react';
import { useAppState } from '@/context/AppStateContext';
import { KpiCard } from '@/components/ui/KpiCard';
import { EXPLORE_KPIS } from '@/data/mockData';

export const TravelIntelView: React.FC = () => {
  const { alerts, trips, setActiveTab, setSelectedAlert, flyTo, setIsReportModalOpen } = useAppState();

  const activeAlerts = alerts.filter(a => a.status === 'Active');

  return (
    <div className="w-full">
      {/* Floating Top KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-5">
        {EXPLORE_KPIS.map(kpi => (
          <KpiCard
            key={kpi.id}
            label={kpi.label}
            value={kpi.id === 'kpi-active-alerts' ? `${activeAlerts.length}` : kpi.value}
            trend={kpi.trend}
            trendDirection={kpi.trendDirection}
            trendType={kpi.trendType}
            subtitle={kpi.subtitle}
            iconName={kpi.iconName}
            statusBorderColor={kpi.statusBorderColor}
            onClick={() => {
              if (kpi.id === 'kpi-active-alerts') setActiveTab('alerts');
              if (kpi.id === 'kpi-travelers' || kpi.id === 'kpi-popular-hubs') setActiveTab('trips');
            }}
          />
        ))}
      </div>

      {/* Floating Bottom Quick Intel Panels (Split Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Active Telemetry & Critical Corridor Hazards (Span 7) */}
        <div className="lg:col-span-7 bg-surface-container-lowest border border-border-subtle shadow-[0px_4px_12px_rgba(0,0,0,0.05)] rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle mb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">
                radar
              </span>
              <h3 className="font-headline-sm text-base font-bold text-on-surface">
                Critical Corridor Telemetry
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('alerts')}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              View All ({alerts.length}) &rarr;
            </button>
          </div>

          <div className="space-y-2.5">
            {alerts.slice(0, 3).map(alert => (
              <div
                key={alert.id}
                onClick={() => {
                  setSelectedAlert(alert);
                  setActiveTab('alerts');
                  flyTo(alert.coordinates, 11);
                }}
                className="p-3 rounded-lg border border-border-subtle/80 hover:border-primary-container/40 bg-surface/50 hover:bg-surface-container-low transition-all cursor-pointer flex items-start gap-3 relative overflow-hidden group"
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 ${
                    alert.severity === 'high'
                      ? 'bg-status-red'
                      : alert.severity === 'medium'
                      ? 'bg-status-amber'
                      : 'bg-status-green'
                  }`}
                />
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 ${
                    alert.severity === 'high'
                      ? 'bg-status-red'
                      : alert.severity === 'medium'
                      ? 'bg-status-amber'
                      : 'bg-status-green'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {alert.category === 'landslide'
                      ? 'landslide'
                      : alert.category === 'fog'
                      ? 'foggy'
                      : 'warning'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-headline-sm text-sm font-bold text-on-surface truncate">
                      {alert.title}
                    </h4>
                    <span className="text-[11px] text-on-surface-variant shrink-0 ml-2">
                      {alert.updatedTime}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant line-clamp-1 mt-0.5">
                    {alert.summary}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 text-[11px] text-on-surface-variant font-medium">
                    <span className="text-primary font-semibold">{alert.route}</span>
                    &bull;
                    <span>{alert.state}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Active Convoys Summary (Span 5) */}
        <div className="lg:col-span-5 bg-surface-container-lowest border border-border-subtle shadow-[0px_4px_12px_rgba(0,0,0,0.05)] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">
                  local_shipping
                </span>
                <h3 className="font-headline-sm text-base font-bold text-on-surface">
                  Live Fleet Convoys
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('trips')}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Manage &rarr;
              </button>
            </div>

            <div className="space-y-2.5">
              {trips.map(trip => (
                <div
                  key={trip.id}
                  onClick={() => {
                    setActiveTab('trips');
                    flyTo(trip.currentCoordinates, 11);
                  }}
                  className="p-2.5 rounded-lg border border-border-subtle bg-surface/40 hover:bg-surface-container-low transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-headline-sm text-xs font-bold text-on-surface">
                      {trip.title}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        trip.status === 'Clear'
                          ? 'bg-status-green/10 text-status-green'
                          : 'bg-status-amber/15 text-status-amber'
                      }`}
                    >
                      {trip.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-on-surface-variant mt-0.5">
                    {trip.routeFrom} &rarr; {trip.routeTo}
                  </div>
                  <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-2">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${trip.progressPercent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between">
            <span className="text-xs text-on-surface-variant">
              Terrain Engine: <b>Calm Intelligence Active</b>
            </span>
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="text-xs font-bold text-status-red hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">add_alert</span>
              Report Issue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
