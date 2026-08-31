'use client';

import React from 'react';
import { useAppState } from '@/context/AppStateContext';
import { TabType } from '@/data/types';

export const SideNavBar: React.FC = () => {
  const { activeTab, setActiveTab, alerts, setIsReportModalOpen } = useAppState();

  const activeAlertsCount = alerts.filter(a => a.status === 'Active').length;

  const navItems: { id: TabType; label: string; icon: string; count?: number }[] = [
    { id: 'explore', label: 'Explore', icon: 'explore' },
    { id: 'trips', label: 'My Trips', icon: 'map' },
    { id: 'alerts', label: 'Safety Alerts', icon: 'warning', count: activeAlertsCount },
    { id: 'analytics', label: 'Analytics', icon: 'leaderboard' }
  ];

  return (
    <aside className="fixed left-0 top-20 bottom-4 w-[360px] z-40 flex flex-col p-4 bg-surface-container-lowest shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-border-subtle rounded-xl ml-6 my-4 hidden md:flex">
      {/* Header Profile / Platform Title */}
      <div className="flex items-center gap-3.5 p-3.5 border-b border-border-subtle bg-surface-container-low/60 rounded-lg">
        <div className="w-11 h-11 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-primary-container/20">
          TI
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-headline-sm text-base font-bold text-primary truncate">
            Travel Intelligence
          </div>
          <div className="font-label-sm text-xs text-on-surface-variant truncate">
            Northeast Regional Concierge
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1.5 custom-scrollbar">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 active:translate-x-1 w-full text-left ${
                isActive
                  ? 'bg-primary-container/10 text-primary font-bold shadow-xs'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className="material-symbols-outlined text-xl"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {item.icon}
                </span>
                <span className="font-label-caps text-xs tracking-wider uppercase">
                  {item.label}
                </span>
              </div>

              {item.count !== undefined && item.count > 0 && (
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-primary text-on-primary'
                      : 'bg-error-container/50 text-status-red'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Quick Report CTA */}
      <div className="my-2">
        <button
          onClick={() => setIsReportModalOpen(true)}
          className="w-full bg-primary text-on-primary font-headline-sm text-sm font-semibold py-3 rounded-lg shadow-sm hover:brightness-110 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">report</span>
          Report Incident / Hazard
        </button>
      </div>

      {/* Footer Navigation Links */}
      <div className="pt-3 border-t border-border-subtle flex flex-col gap-1">
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-3 p-2.5 rounded-lg text-xs font-label-caps uppercase transition-colors text-left ${
            activeTab === 'settings'
              ? 'bg-primary-container/10 text-primary font-bold'
              : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-lg">settings</span>
          <span>System Settings</span>
        </button>
        <a
          href="https://sih.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-2.5 text-on-surface-variant hover:bg-surface-container-low hover:text-primary rounded-lg text-xs font-label-caps uppercase transition-colors"
        >
          <span className="material-symbols-outlined text-lg">help</span>
          <span>Support & Guidelines</span>
        </a>
      </div>
    </aside>
  );
};
