'use client';

import React from 'react';
import { useAppState } from '@/context/AppStateContext';
import { TabType } from '@/data/types';

export const MobileNavDrawer: React.FC = () => {
  const {
    isMobileNavOpen,
    setIsMobileNavOpen,
    activeTab,
    setActiveTab,
    alerts,
    setIsReportModalOpen
  } = useAppState();

  if (!isMobileNavOpen) return null;

  const activeAlertsCount = alerts.filter(a => a.status === 'Active').length;

  const navItems: { id: TabType; label: string; icon: string; count?: number }[] = [
    { id: 'explore', label: 'Explore', icon: 'explore' },
    { id: 'trips', label: 'My Trips', icon: 'map' },
    { id: 'alerts', label: 'Safety Alerts', icon: 'warning', count: activeAlertsCount },
    { id: 'analytics', label: 'Analytics', icon: 'leaderboard' },
    { id: 'settings', label: 'Settings', icon: 'settings' }
  ];

  return (
    <div className="fixed inset-0 z-[80] md:hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsMobileNavOpen(false)}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface-container-lowest rounded-t-2xl shadow-2xl p-5 border-t border-border-subtle max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300">
        <div className="w-12 h-1.5 bg-border-subtle rounded-full mx-auto mb-4" />

        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold text-sm">
              NER
            </div>
            <div>
              <div className="font-headline-sm text-base font-bold text-primary">
                NER Travel Connect
              </div>
              <div className="font-label-sm text-[11px] text-on-surface-variant">
                Logistics Intelligence
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsMobileNavOpen(false)}
            className="p-1.5 text-on-surface-variant hover:text-on-surface"
          >
            ✕
          </button>
        </div>

        {/* Navigation items */}
        <div className="py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileNavOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl text-left transition-colors ${
                  isActive
                    ? 'bg-primary-container/10 text-primary font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className="material-symbols-outlined text-2xl"
                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    {item.icon}
                  </span>
                  <span className="font-headline-sm text-sm">{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span className="bg-error-container/60 text-status-red text-xs font-bold px-2.5 py-0.5 rounded-full">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Report Alert Button */}
        <div className="pt-2 border-t border-border-subtle">
          <button
            onClick={() => {
              setIsMobileNavOpen(false);
              setIsReportModalOpen(true);
            }}
            className="w-full bg-primary text-on-primary py-3.5 rounded-xl font-headline-sm text-sm font-bold flex items-center justify-center gap-2 shadow-sm active:scale-98"
          >
            <span className="material-symbols-outlined text-lg">report</span>
            Report Incident / Road Hazard
          </button>
        </div>
      </div>
    </div>
  );
};
