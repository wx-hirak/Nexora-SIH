'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useAppState } from '@/context/AppStateContext';
import { TopNavBar } from '@/components/layout/TopNavBar';
import { SideNavBar } from '@/components/layout/SideNavBar';
import { MobileNavDrawer } from '@/components/layout/MobileNavDrawer';
import { TravelIntelView } from '@/components/screens/TravelIntelView';
import { TripPlannerView } from '@/components/screens/TripPlannerView';
import { SafetyAlertsView } from '@/components/screens/SafetyAlertsView';
import { AnalyticsView } from '@/components/screens/AnalyticsView';
import { ReportAlertModal } from '@/components/screens/ReportAlertModal';
import { Toast } from '@/components/ui/Toast';

// Dynamically load Leaflet Map with SSR disabled
const InteractiveMap = dynamic(
  () => import('@/components/map/InteractiveMap').then(mod => mod.InteractiveMap),
  { ssr: false }
);

export default function Home() {
  const { activeTab, setActiveTab } = useAppState();

  return (
    <div className="relative min-h-screen w-screen overflow-x-hidden bg-surface">
      {/* 1. Base Layer: Real Interactive Topographic & Cartographic Map */}
      <InteractiveMap />

      {/* 2. Top Navigation Bar */}
      <TopNavBar />

      {/* 3. Side Navigation Bar (Desktop) */}
      <SideNavBar />

      {/* 4. Mobile Bottom Navigation Drawer */}
      <MobileNavDrawer />

      {/* 5. Main Floating Content Area */}
      <main className="relative z-20 pt-24 pb-12 px-4 sm:px-6 md:ml-[calc(360px+48px)] mr-3 md:mr-6 min-h-[calc(100vh-100px)] pointer-events-none [&>*]:pointer-events-auto">
        {/* Navigation Breadcrumb / View Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="bg-surface-container-lowest/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-border-subtle shadow-xs inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-status-green animate-pulse" />
            <span className="font-headline-sm text-xs font-bold text-primary uppercase tracking-wider">
              {activeTab === 'explore' && 'Travel Intelligence Center'}
              {activeTab === 'trips' && 'Trip Planner & Reroute Engine'}
              {activeTab === 'alerts' && 'Safety Alerts & Hazard Center'}
              {activeTab === 'analytics' && 'Regional Analytics Dashboard'}
              {activeTab === 'settings' && 'System Configuration & Dispatch Settings'}
            </span>
          </div>

          {/* Quick tab switchers on tablet */}
          <div className="hidden sm:flex md:hidden bg-surface-container-lowest border border-border-subtle rounded-xl p-1 shadow-xs">
            <button
              onClick={() => setActiveTab('explore')}
              className={`px-2.5 py-1 text-xs rounded-lg ${
                activeTab === 'explore' ? 'bg-primary text-white font-bold' : 'text-on-surface-variant'
              }`}
            >
              Explore
            </button>
            <button
              onClick={() => setActiveTab('trips')}
              className={`px-2.5 py-1 text-xs rounded-lg ${
                activeTab === 'trips' ? 'bg-primary text-white font-bold' : 'text-on-surface-variant'
              }`}
            >
              Trips
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`px-2.5 py-1 text-xs rounded-lg ${
                activeTab === 'alerts' ? 'bg-primary text-white font-bold' : 'text-on-surface-variant'
              }`}
            >
              Alerts
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-2.5 py-1 text-xs rounded-lg ${
                activeTab === 'analytics' ? 'bg-primary text-white font-bold' : 'text-on-surface-variant'
              }`}
            >
              Analytics
            </button>
          </div>
        </div>

        {/* Dynamic View Panels */}
        {activeTab === 'explore' && <TravelIntelView />}
        {activeTab === 'trips' && <TripPlannerView />}
        {activeTab === 'alerts' && <SafetyAlertsView />}
        {activeTab === 'analytics' && <AnalyticsView />}

        {activeTab === 'settings' && (
          <div className="bg-surface-container-lowest border border-border-subtle shadow-md rounded-2xl p-6 max-w-3xl">
            <h3 className="font-headline-sm text-lg font-bold text-on-surface mb-2">
              System Settings & GIS Configuration
            </h3>
            <p className="font-body-md text-sm text-on-surface-variant mb-6">
              Manage terrain sensor telemetry streams, auto-reroute sensitivity thresholds, and notifications for Northeast transit corridors.
            </p>

            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between p-3.5 bg-surface rounded-xl border border-border-subtle">
                <div>
                  <div className="font-bold text-on-surface">Auto-Reroute Optimization</div>
                  <div className="text-xs text-on-surface-variant">Automatically alert drivers when a landslide hazard appears on the active corridor.</div>
                </div>
                <input type="checkbox" defaultChecked className="rounded text-primary h-5 w-5" />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-surface rounded-xl border border-border-subtle">
                <div>
                  <div className="font-bold text-on-surface">BRO Engineering Dispatch Integration</div>
                  <div className="text-xs text-on-surface-variant">Forward high-severity road washouts to Border Roads Organisation rescue units.</div>
                </div>
                <input type="checkbox" defaultChecked className="rounded text-primary h-5 w-5" />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-surface rounded-xl border border-border-subtle">
                <div>
                  <div className="font-bold text-on-surface">High-Precision Satellite Topography Tile Layer</div>
                  <div className="text-xs text-on-surface-variant">Calm intelligence Paper & Ink vector base layer.</div>
                </div>
                <input type="checkbox" defaultChecked className="rounded text-primary h-5 w-5" />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 6. Incident Reporting Modal */}
      <ReportAlertModal />

      {/* 7. Toast Notifications */}
      <Toast />
    </div>
  );
}
