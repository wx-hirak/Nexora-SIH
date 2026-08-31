'use client';

import React, { useState } from 'react';
import { useAppState } from '@/context/AppStateContext';

export const TopNavBar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    alerts,
    setSelectedAlert,
    setIsReportModalOpen,
    setIsMobileNavOpen,
    flyTo
  } = useAppState();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const activeAlertsCount = alerts.filter(a => a.status === 'Active').length;

  const filteredAlerts = searchQuery
    ? alerts.filter(
        a =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.state.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-4 md:px-6 h-16 bg-surface-container-lowest shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-border-subtle rounded-xl mx-3 md:mx-6 mt-4">
      {/* Left: Brand & Search */}
      <div className="flex items-center gap-4 md:gap-8 flex-1">
        {/* Mobile menu trigger */}
        <button
          onClick={() => setIsMobileNavOpen(true)}
          className="md:hidden p-2 text-on-surface-variant hover:bg-surface-container-low rounded-lg"
          aria-label="Open menu"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        {/* Brand */}
        <div
          onClick={() => setActiveTab('explore')}
          className="flex items-center gap-2.5 cursor-pointer active:scale-95 transition-transform"
        >
          <div className="w-9 h-9 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold text-sm tracking-tighter shadow-sm">
            NER
          </div>
          <div>
            <div className="font-headline-sm text-base md:text-lg font-bold text-primary tracking-tight leading-none">
              NER Travel Connect
            </div>
            <div className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest hidden sm:block">
              Logistics Intelligence Platform
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-72 md:w-96 max-w-full hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-on-surface-variant text-lg">
              search
            </span>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 250)}
            placeholder="Search corridors, routes, or alerts (e.g. NH-6, Shillong)..."
            className="w-full pl-10 pr-8 py-2 bg-surface-container-low border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-container font-body-md text-sm text-on-surface placeholder:text-on-surface-variant/70 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface text-xs"
            >
              ✕
            </button>
          )}

          {/* Search dropdown results */}
          {isSearchFocused && searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container-lowest border border-border-subtle rounded-xl shadow-xl z-50 p-2 max-h-72 overflow-y-auto">
              <div className="px-3 py-1 text-xs font-label-caps text-on-surface-variant uppercase">
                Matching Corridors & Alerts ({filteredAlerts.length})
              </div>
              {filteredAlerts.length === 0 ? (
                <div className="p-3 text-sm text-on-surface-variant">
                  No alerts found matching &ldquo;{searchQuery}&rdquo;
                </div>
              ) : (
                filteredAlerts.map(alert => (
                  <div
                    key={alert.id}
                    onClick={() => {
                      setSelectedAlert(alert);
                      setActiveTab('alerts');
                      flyTo(alert.coordinates, 12);
                    }}
                    className="p-2.5 rounded-lg hover:bg-surface-container-low cursor-pointer transition-colors flex items-start gap-2.5"
                  >
                    <span
                      className={`material-symbols-outlined text-sm mt-0.5 ${
                        alert.severity === 'high'
                          ? 'text-status-red'
                          : alert.severity === 'medium'
                          ? 'text-status-amber'
                          : 'text-status-green'
                      }`}
                    >
                      warning
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-on-surface">
                        {alert.title}
                      </div>
                      <div className="text-xs text-on-surface-variant">
                        {alert.route} &bull; {alert.state}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Quick Report Button */}
        <button
          onClick={() => setIsReportModalOpen(true)}
          className="bg-primary text-on-primary hover:bg-primary-container px-3.5 py-1.5 rounded-lg font-headline-sm text-xs font-semibold shadow-sm transition-all duration-200 active:scale-95 flex items-center gap-1.5 cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">report</span>
          <span className="hidden md:inline">Report Incident</span>
        </button>

        {/* Notifications Icon with active badge */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full cursor-pointer relative active:scale-95 transition-all"
            aria-label="Notifications"
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            {activeAlertsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-status-red rounded-full ring-2 ring-surface-container-lowest animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-surface-container-lowest border border-border-subtle rounded-xl shadow-xl z-50 p-3">
              <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
                <span className="font-headline-sm text-xs font-bold text-on-surface uppercase tracking-wider">
                  Live Dispatch Feed
                </span>
                <span className="bg-error-container/40 text-status-red text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {activeAlertsCount} Active
                </span>
              </div>
              <div className="divide-y divide-border-subtle/50 max-h-64 overflow-y-auto custom-scrollbar">
                {alerts.slice(0, 4).map(alert => (
                  <div
                    key={alert.id}
                    onClick={() => {
                      setSelectedAlert(alert);
                      setActiveTab('alerts');
                      setIsNotifOpen(false);
                      flyTo(alert.coordinates, 12);
                    }}
                    className="py-2.5 px-1 hover:bg-surface-container-low rounded cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold ${
                          alert.severity === 'high'
                            ? 'text-status-red'
                            : alert.severity === 'medium'
                            ? 'text-status-amber'
                            : 'text-status-green'
                        }`}
                      >
                        {alert.title}
                      </span>
                      <span className="text-[10px] text-on-surface-variant">
                        {alert.updatedTime}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant line-clamp-1 mt-0.5">
                      {alert.summary}
                    </p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  setActiveTab('alerts');
                  setIsNotifOpen(false);
                }}
                className="w-full mt-2 pt-2 border-t border-border-subtle text-center text-xs font-semibold text-primary hover:underline"
              >
                View Safety Alerts Center &rarr;
              </button>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-border-subtle">
          <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-xs shadow-sm">
            TI
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-bold text-on-surface leading-tight">
              Concierge Ops
            </div>
            <div className="text-[10px] text-on-surface-variant leading-none">
              NER Intelligence
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
