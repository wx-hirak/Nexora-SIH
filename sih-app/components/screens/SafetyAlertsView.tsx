'use client';

import React from 'react';
import { useAppState } from '@/context/AppStateContext';
import { Badge } from '@/components/ui/Badge';
import { SafetyAlert } from '@/data/types';

export const SafetyAlertsView: React.FC = () => {
  const {
    alerts,
    selectedAlert,
    setSelectedAlert,
    alertFilter,
    setAlertFilter,
    flyTo,
    setIsReportModalOpen
  } = useAppState();

  const filteredAlerts = alerts.filter(a => {
    if (alertFilter === 'all') return true;
    return a.severity === alertFilter;
  });

  const highRiskCount = alerts.filter(a => a.severity === 'high').length;
  const medRiskCount = alerts.filter(a => a.severity === 'medium').length;
  const activeCount = alerts.filter(a => a.status === 'Active').length;

  const currentAlert: SafetyAlert = selectedAlert || alerts[0];

  return (
    <div className="w-full space-y-4">
      {/* Top Floating KPI Summary Bar */}
      <div className="bg-surface-container-lowest border border-border-subtle shadow-[0px_4px_12px_rgba(0,0,0,0.05)] rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6 divide-x divide-border-subtle/80">
          <div className="flex flex-col pr-4">
            <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider mb-0.5">
              Total Active Alerts
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-display-kpi text-2xl font-bold text-primary">
                {activeCount}
              </span>
              <span className="material-symbols-outlined text-status-amber text-base">
                warning
              </span>
            </div>
          </div>

          <div className="flex flex-col pl-6 pr-4">
            <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider mb-0.5">
              Severe Blockages
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-display-kpi text-2xl font-bold text-status-red">
                {highRiskCount}
              </span>
              <span className="material-symbols-outlined text-status-red text-base">
                block
              </span>
            </div>
          </div>

          <div className="flex flex-col pl-6">
            <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider mb-0.5">
              Weather Advisories
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-display-kpi text-2xl font-bold text-primary">
                {medRiskCount}
              </span>
              <span className="material-symbols-outlined text-primary text-base">
                cloud
              </span>
            </div>
          </div>
        </div>

        {/* Action Button & Filter Pills */}
        <div className="flex items-center gap-2">
          <div className="flex bg-surface-container-low rounded-lg p-1 border border-border-subtle">
            <button
              onClick={() => setAlertFilter('all')}
              className={`px-3 py-1 rounded-md text-xs font-label-caps uppercase transition-all ${
                alertFilter === 'all'
                  ? 'bg-surface shadow-xs font-bold text-primary border border-border-subtle'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              All ({alerts.length})
            </button>
            <button
              onClick={() => setAlertFilter('high')}
              className={`px-3 py-1 rounded-md text-xs font-label-caps uppercase transition-all ${
                alertFilter === 'high'
                  ? 'bg-status-red text-white font-bold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              High ({highRiskCount})
            </button>
            <button
              onClick={() => setAlertFilter('medium')}
              className={`px-3 py-1 rounded-md text-xs font-label-caps uppercase transition-all ${
                alertFilter === 'medium'
                  ? 'bg-status-amber text-white font-bold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Med ({medRiskCount})
            </button>
          </div>

          <button
            onClick={() => setIsReportModalOpen(true)}
            className="bg-primary text-on-primary px-3.5 py-2 rounded-lg font-headline-sm text-xs font-bold shadow-sm hover:brightness-110 flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">add_alert</span>
            Report Hazard
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout (Alerts Feed on Left + Detailed Telemetry on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Active Safety Alerts List (Col span 5) */}
        <div className="lg:col-span-5 bg-surface-container-lowest border border-border-subtle shadow-[0px_4px_12px_rgba(0,0,0,0.05)] rounded-xl flex flex-col overflow-hidden max-h-[640px]">
          <div className="p-4 border-b border-border-subtle bg-surface-container-low/40 flex justify-between items-center">
            <div>
              <h3 className="font-headline-sm text-base font-bold text-primary">
                Active Safety Alerts
              </h3>
              <p className="font-label-caps text-[11px] text-on-surface-variant">
                Northeast Transit Corridors
              </p>
            </div>
            <span className="font-label-caps text-xs text-on-surface-variant">
              Live Feed
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border-subtle/70 custom-scrollbar">
            {filteredAlerts.map(alert => {
              const isSelected = currentAlert?.id === alert.id;
              return (
                <div
                  key={alert.id}
                  onClick={() => {
                    setSelectedAlert(alert);
                    flyTo(alert.coordinates, 12);
                  }}
                  className={`p-4 transition-all cursor-pointer relative group ${
                    isSelected
                      ? 'bg-primary-container/5'
                      : 'hover:bg-surface-container-low bg-surface/30'
                  }`}
                >
                  {/* Status indicator line */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 group-hover:w-1.5 transition-all ${
                      alert.severity === 'high'
                        ? 'bg-status-red'
                        : alert.severity === 'medium'
                        ? 'bg-status-amber'
                        : 'bg-status-green'
                    }`}
                  />

                  <div className="flex justify-between items-start mb-2 pl-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded flex items-center justify-center text-white text-xs ${
                          alert.severity === 'high'
                            ? 'bg-status-red'
                            : alert.severity === 'medium'
                            ? 'bg-status-amber'
                            : 'bg-status-green'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">
                          {alert.category === 'landslide'
                            ? 'landslide'
                            : alert.category === 'fog'
                            ? 'foggy'
                            : 'warning'}
                        </span>
                      </div>
                      <Badge
                        variant={
                          alert.severity === 'high'
                            ? 'red'
                            : alert.severity === 'medium'
                            ? 'amber'
                            : 'green'
                        }
                        size="sm"
                      >
                        {alert.severity} RISK
                      </Badge>
                    </div>
                    <span className="font-label-sm text-xs text-on-surface-variant">
                      {alert.updatedTime}
                    </span>
                  </div>

                  <h4 className="font-headline-sm text-sm font-bold text-on-surface pl-2 mb-1">
                    {alert.title}
                  </h4>
                  <p className="font-body-md text-xs text-on-surface-variant pl-2 line-clamp-2">
                    {alert.summary}
                  </p>
                  <div className="pl-2 mt-2 text-[11px] text-primary font-semibold">
                    {alert.route}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Incident Telemetry & Action Center (Col span 7) */}
        {currentAlert && (
          <div className="lg:col-span-7 bg-surface-container-lowest border border-border-subtle shadow-[0px_4px_12px_rgba(0,0,0,0.05)] rounded-xl p-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-border-subtle">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant={
                        currentAlert.severity === 'high'
                          ? 'red'
                          : currentAlert.severity === 'medium'
                          ? 'amber'
                          : 'green'
                      }
                      size="md"
                      pulse={currentAlert.severity === 'high'}
                    >
                      {currentAlert.severity} RISK HAZARD
                    </Badge>
                    <span className="text-xs text-on-surface-variant">
                      Updated {currentAlert.updatedTime}
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-lg font-bold text-on-surface">
                    {currentAlert.title}
                  </h3>
                  <p className="text-xs font-semibold text-primary">
                    {currentAlert.route} &bull; {currentAlert.state}
                  </p>
                </div>

                <button
                  onClick={() => flyTo(currentAlert.coordinates, 13)}
                  className="bg-surface-container-low hover:bg-surface-container-high text-primary px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">my_location</span>
                  Focus Map
                </button>
              </div>

              {/* Summary and In-Depth Telemetry */}
              <div className="bg-surface p-4 rounded-xl border border-border-subtle">
                <h5 className="font-label-caps text-xs text-on-surface-variant uppercase mb-1">
                  Incident Intelligence Assessment
                </h5>
                <p className="font-body-md text-sm text-on-surface leading-relaxed">
                  {currentAlert.detailedDescription}
                </p>
              </div>

              {/* Status metrics grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-surface p-3 rounded-lg border border-border-subtle">
                  <span className="text-[10px] font-label-caps text-on-surface-variant uppercase block">
                    Affected Span
                  </span>
                  <span className="font-headline-sm text-sm font-bold text-on-surface">
                    {currentAlert.affectedDistanceKm || 5.0} km corridor
                  </span>
                </div>
                <div className="bg-surface p-3 rounded-lg border border-border-subtle">
                  <span className="text-[10px] font-label-caps text-on-surface-variant uppercase block">
                    Engineering Dispatch
                  </span>
                  <span
                    className={`font-headline-sm text-sm font-bold ${
                      currentAlert.engineeringTeamDispatched
                        ? 'text-status-green'
                        : 'text-on-surface-variant'
                    }`}
                  >
                    {currentAlert.engineeringTeamDispatched ? 'Deployed (BRO)' : 'Standby'}
                  </span>
                </div>
                <div className="bg-surface p-3 rounded-lg border border-border-subtle">
                  <span className="text-[10px] font-label-caps text-on-surface-variant uppercase block">
                    Reporter Source
                  </span>
                  <span className="font-headline-sm text-sm font-bold text-primary truncate block">
                    {currentAlert.reportedBy || 'Patrol Unit'}
                  </span>
                </div>
              </div>

              {/* Recommended Detour / Alternate Route */}
              {currentAlert.alternateRoute && (
                <div className="p-3.5 bg-primary-container/10 border border-primary-container/30 rounded-xl flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-xl mt-0.5">
                    alt_route
                  </span>
                  <div>
                    <h5 className="font-headline-sm text-xs font-bold text-primary uppercase">
                      Recommended Alternate Bypass
                    </h5>
                    <p className="font-body-md text-xs text-on-surface mt-0.5 font-medium">
                      {currentAlert.alternateRoute}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="mt-5 pt-4 border-t border-border-subtle flex items-center justify-between">
              <div className="text-xs text-on-surface-variant">
                Coordinates: <b>{currentAlert.coordinates.join(', ')}</b>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="px-4 py-2 border border-border-subtle rounded-lg text-xs font-bold text-on-surface hover:bg-surface-container-low transition-colors"
                >
                  Update Status
                </button>
                <button
                  onClick={() => alert(`Broadcasted advisory for ${currentAlert.title} to all active GPS units.`)}
                  className="px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-bold shadow-xs hover:brightness-110 transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">campaign</span>
                  Broadcast Advisory
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
