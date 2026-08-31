'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  TabType,
  SafetyAlert,
  RouteOption,
  ActiveTrip,
  LogisticsHub,
  IncidentReportFormData,
  AlertSeverity
} from '@/data/types';
import {
  INITIAL_ALERTS,
  INITIAL_TRIPS,
  ROUTE_OPTIONS,
  LOGISTICS_HUBS
} from '@/data/mockData';

interface AppStateContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  alerts: SafetyAlert[];
  selectedAlert: SafetyAlert | null;
  setSelectedAlert: (alert: SafetyAlert | null) => void;
  alertFilter: string;
  setAlertFilter: (filter: string) => void;
  trips: ActiveTrip[];
  selectedTrip: ActiveTrip | null;
  setSelectedTrip: (trip: ActiveTrip | null) => void;
  routeOptions: RouteOption[];
  selectedRouteId: string;
  setSelectedRouteId: (id: string) => void;
  selectedRoute: RouteOption;
  hubs: LogisticsHub[];
  selectedHub: LogisticsHub | null;
  setSelectedHub: (hub: LogisticsHub | null) => void;
  isReportModalOpen: boolean;
  setIsReportModalOpen: (open: boolean) => void;
  isMobileNavOpen: boolean;
  setIsMobileNavOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  toastMessage: { title: string; desc?: string; type?: 'success' | 'info' | 'warning' } | null;
  setToastMessage: (msg: { title: string; desc?: string; type?: 'success' | 'info' | 'warning' } | null) => void;
  mapCenter: [number, number];
  mapZoom: number;
  flyTo: (coords: [number, number], zoom?: number) => void;
  addIncidentReport: (data: IncidentReportFormData) => void;
  applyReroute: (tripId: string, newRouteId: string) => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const [activeTab, setActiveTab] = useState<TabType>('explore');
  const [alerts, setAlerts] = useState<SafetyAlert[]>(INITIAL_ALERTS);
  const [selectedAlert, setSelectedAlert] = useState<SafetyAlert | null>(INITIAL_ALERTS[0]);
  const [alertFilter, setAlertFilter] = useState<string>('all');
  const [trips, setTrips] = useState<ActiveTrip[]>(INITIAL_TRIPS);
  const [selectedTrip, setSelectedTrip] = useState<ActiveTrip | null>(INITIAL_TRIPS[0]);
  const [routeOptions] = useState<RouteOption[]>(ROUTE_OPTIONS);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route-safe-fast');
  const [hubs] = useState<LogisticsHub[]>(LOGISTICS_HUBS);
  const [selectedHub, setSelectedHub] = useState<LogisticsHub | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<{ title: string; desc?: string; type?: 'success' | 'info' | 'warning' } | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([25.8500, 92.1000]);
  const [mapZoom, setMapZoom] = useState<number>(8);

  const selectedRoute = routeOptions.find(r => r.id === selectedRouteId) || routeOptions[0];

  const flyTo = (coords: [number, number], zoom: number = 10) => {
    setMapCenter(coords);
    setMapZoom(zoom);
  };

  const addIncidentReport = (data: IncidentReportFormData) => {
    const newAlert: SafetyAlert = {
      id: `alert-${Date.now()}`,
      title: data.locationName || `${data.incidentType.toUpperCase()} Incident`,
      category: data.incidentType,
      severity: data.severity,
      route: data.routeCorridor || 'GS Mountain Road',
      state: 'Meghalaya',
      coordinates: data.coordinates,
      summary: data.notes || `Reported ${data.incidentType} hazard affecting active transit lanes.`,
      detailedDescription: data.notes ? `Citizen/Field Report: ${data.notes}` : `Field incident reported via NER Travel Connect. Sensor validation in progress.`,
      updatedTime: 'Just now',
      status: 'Active',
      reportedBy: data.reporterName || 'Citizen Field Report',
      verified: true,
      engineeringTeamDispatched: data.severity === 'high'
    };

    setAlerts(prev => [newAlert, ...prev]);
    setSelectedAlert(newAlert);
    flyTo(data.coordinates, 11);
    setToastMessage({
      title: 'Incident Reported Successfully',
      desc: 'Telemetry has been broadcasted to Regional Dispatch & active convoys.',
      type: 'success'
    });
  };

  const applyReroute = (tripId: string, newRouteId: string) => {
    const chosen = routeOptions.find(r => r.id === newRouteId);
    setTrips(prev =>
      prev.map(t => {
        if (t.id === tripId) {
          return {
            ...t,
            selectedRouteId: newRouteId,
            status: 'Rerouted',
            statusColor: 'amber',
            eta: chosen ? `${chosen.eta} (via ${chosen.name})` : t.eta
          };
        }
        return t;
      })
    );
    setSelectedRouteId(newRouteId);
    setToastMessage({
      title: 'Reroute Applied',
      desc: `Fleet convoy updated to ${chosen?.name || 'new route'}.`,
      type: 'success'
    });
  };

  return (
    <AppStateContext.Provider
      value={{
        activeTab,
        setActiveTab,
        alerts,
        selectedAlert,
        setSelectedAlert,
        alertFilter,
        setAlertFilter,
        trips,
        selectedTrip,
        setSelectedTrip,
        routeOptions,
        selectedRouteId,
        setSelectedRouteId,
        selectedRoute,
        hubs,
        selectedHub,
        setSelectedHub,
        isReportModalOpen,
        setIsReportModalOpen,
        isMobileNavOpen,
        setIsMobileNavOpen,
        searchQuery,
        setSearchQuery,
        toastMessage,
        setToastMessage,
        mapCenter,
        mapZoom,
        flyTo,
        addIncidentReport,
        applyReroute
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};
