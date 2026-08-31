'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAppState } from '@/context/AppStateContext';

export const InteractiveMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const polylineLayerRef = useRef<L.Polyline | null>(null);
  const hazardPolygonsLayerRef = useRef<L.LayerGroup | null>(null);

  const {
    alerts,
    selectedAlert,
    setSelectedAlert,
    setActiveTab,
    selectedRoute,
    trips,
    hubs,
    selectedHub,
    setSelectedHub,
    mapCenter,
    mapZoom
  } = useAppState();

  const [activeFilter, setActiveFilter] = useState<'all' | 'hazards' | 'fleet' | 'hubs'>('all');
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);

  // Initialize Map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current || leafletMapRef.current) {
      return;
    }

    let isMounted = true;

    import('leaflet').then(L => {
      if (!isMounted || !mapContainerRef.current) return;

      // Fix default leaflet icons in next.js
      delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapContainerRef.current, {
        center: mapCenter,
        zoom: mapZoom,
        zoomControl: false,
        attributionControl: false
      });

      // CartoDB Positron Light Tile Layer (Minimalist clean Paper & Ink style)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 18,
        subdomains: 'abcd',
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
      }).addTo(map);

      // Attribution control in bottom right
      L.control.attribution({ position: 'bottomright' }).addTo(map);

      // Zoom control in bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      const hazardPolygonsGroup = L.layerGroup().addTo(map);

      markersLayerRef.current = markersGroup;
      hazardPolygonsLayerRef.current = hazardPolygonsGroup;
      leafletMapRef.current = map;
      setMapLoaded(true);
    });

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Update center when mapCenter/mapZoom changes
  useEffect(() => {
    if (leafletMapRef.current && mapLoaded) {
      leafletMapRef.current.flyTo(mapCenter, mapZoom, {
        duration: 1.2,
        easeLinearity: 0.25
      });
    }
  }, [mapCenter, mapZoom, mapLoaded]);

  // Render Markers, Polylines, and Hazard Zones
  useEffect(() => {
    if (!leafletMapRef.current || !mapLoaded || !markersLayerRef.current || !hazardPolygonsLayerRef.current) {
      return;
    }

    import('leaflet').then(L => {
      const markersGroup = markersLayerRef.current!;
      const hazardGroup = hazardPolygonsLayerRef.current!;
      markersGroup.clearLayers();
      hazardGroup.clearLayers();

      // 1. Hazard Polygons & Threat Zones
      if (activeFilter === 'all' || activeFilter === 'hazards') {
        // Severe landslide risk zone near Sonapur (NH-6)
        const sonapurZone = L.polygon(
          [
            [25.14, 92.30],
            [25.16, 92.42],
            [25.06, 92.40],
            [25.04, 92.28]
          ],
          {
            color: '#B14A4A',
            fillColor: '#B14A4A',
            fillOpacity: 0.18,
            weight: 1.5,
            dashArray: '4, 4'
          }
        ).addTo(hazardGroup);

        sonapurZone.bindTooltip('High Hazard Zone: Sonapur Landslide Corridor', {
          direction: 'top',
          className: 'font-label-caps text-xs'
        });

        // Heavy rainfall flood warning zone in Brahmaputra Valley
        const valleyZone = L.polygon(
          [
            [26.65, 92.80],
            [26.75, 93.40],
            [26.45, 93.30],
            [26.50, 92.75]
          ],
          {
            color: '#C48B3D',
            fillColor: '#C48B3D',
            fillOpacity: 0.15,
            weight: 1.5,
            dashArray: '4, 4'
          }
        ).addTo(hazardGroup);

        valleyZone.bindTooltip('Weather Advisory Zone: Brahmaputra Basin Rain Warning', {
          direction: 'top',
          className: 'font-label-caps text-xs'
        });
      }

      // 2. Hazard Alert Markers
      if (activeFilter === 'all' || activeFilter === 'hazards') {
        alerts.forEach(alert => {
          const isHigh = alert.severity === 'high';
          const isMed = alert.severity === 'medium';
          const bgColor = isHigh ? '#B14A4A' : isMed ? '#C48B3D' : '#4D845D';
          const pulseClass = isHigh ? 'map-marker-pulse' : isMed ? 'map-marker-amber' : '';

          const iconHtml = `
            <div class="relative flex items-center justify-center cursor-pointer transition-transform hover:scale-110">
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md ${pulseClass}" style="background-color: ${bgColor};">
                <span class="material-symbols-outlined text-[16px]">
                  ${alert.category === 'landslide' ? 'landslide' : alert.category === 'fog' ? 'foggy' : 'warning'}
                </span>
              </div>
            </div>
          `;

          const customIcon = L.divIcon({
            html: iconHtml,
            className: 'custom-hazard-icon',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          });

          const marker = L.marker(alert.coordinates, { icon: customIcon }).addTo(markersGroup);

          marker.on('click', () => {
            setSelectedAlert(alert);
            setActiveTab('alerts');
          });

          marker.bindTooltip(`<b>${alert.title}</b><br/><span style="color:#72777f;">${alert.route}</span>`, {
            direction: 'top',
            offset: [0, -12]
          });
        });
      }

      // 3. Active Fleet / Trip Convoys
      if (activeFilter === 'all' || activeFilter === 'fleet') {
        trips.forEach(trip => {
          const iconHtml = `
            <div class="relative flex items-center justify-center cursor-pointer transition-transform hover:scale-110">
              <div class="w-8 h-8 rounded-full bg-primary-container text-white shadow-md flex items-center justify-center border-2 border-white ring-2 ring-primary/20">
                <span class="material-symbols-outlined text-[15px]">directions_bus</span>
              </div>
              <div class="absolute -top-2 -right-2 w-3.5 h-3.5 rounded-full ${
                trip.statusColor === 'green' ? 'bg-status-green' : 'bg-status-amber'
              } border-2 border-white"></div>
            </div>
          `;

          const customIcon = L.divIcon({
            html: iconHtml,
            className: 'custom-fleet-icon',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          });

          const marker = L.marker(trip.currentCoordinates, { icon: customIcon }).addTo(markersGroup);

          marker.bindTooltip(
            `<b>${trip.title}</b> (${trip.vehicleReg})<br/>Status: <b>${trip.status}</b> &bull; ${trip.eta}`,
            { direction: 'top', offset: [0, -14] }
          );

          marker.on('click', () => {
            setActiveTab('trips');
          });
        });
      }

      // 4. Logistics Hubs
      if (activeFilter === 'all' || activeFilter === 'hubs') {
        hubs.forEach(hub => {
          const iconHtml = `
            <div class="relative flex items-center justify-center cursor-pointer transition-transform hover:scale-110">
              <div class="w-7 h-7 rounded-md bg-white border-2 border-primary text-primary shadow-md flex items-center justify-center font-bold text-xs">
                <span class="material-symbols-outlined text-[15px]">domain</span>
              </div>
            </div>
          `;

          const customIcon = L.divIcon({
            html: iconHtml,
            className: 'custom-hub-icon',
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          });

          const marker = L.marker(hub.coordinates, { icon: customIcon }).addTo(markersGroup);

          marker.bindTooltip(
            `<b>${hub.name}</b><br/>Active Convoys: <b>${hub.activeConvoys}</b> | Weather: ${hub.weather.temp}, ${hub.weather.condition}`,
            { direction: 'top', offset: [0, -12] }
          );

          marker.on('click', () => {
            setSelectedHub(hub);
          });
        });
      }

      // 5. Route Polyline
      if (polylineLayerRef.current) {
        polylineLayerRef.current.remove();
        polylineLayerRef.current = null;
      }

      if (selectedRoute && selectedRoute.waypoints.length > 1) {
        const polyline = L.polyline(selectedRoute.waypoints, {
          color: selectedRoute.color || '#2563a8',
          weight: 4,
          opacity: 0.85,
          dashArray: selectedRoute.id === 'route-safe-fast' ? undefined : '6, 6',
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(leafletMapRef.current!);

        polylineLayerRef.current = polyline;

        // Start Node Marker
        const startPoint = selectedRoute.waypoints[0];
        const endPoint = selectedRoute.waypoints[selectedRoute.waypoints.length - 1];

        const startIcon = L.divIcon({
          html: `<div class="w-4 h-4 rounded-full bg-white border-3 border-primary shadow-sm"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });

        const endIcon = L.divIcon({
          html: `<div class="w-4 h-4 rounded-full bg-primary text-white border-2 border-white shadow-sm flex items-center justify-center"><span class="w-1.5 h-1.5 rounded-full bg-white"></span></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });

        L.marker(startPoint, { icon: startIcon }).addTo(markersGroup).bindTooltip('Origin: Guwahati Terminal', { direction: 'top' });
        L.marker(endPoint, { icon: endIcon }).addTo(markersGroup).bindTooltip('Destination: Shillong Depot', { direction: 'top' });
      }
    });
  }, [alerts, trips, hubs, selectedRoute, activeFilter, mapLoaded, setSelectedAlert, setActiveTab, setSelectedHub]);

  return (
    <div className="fixed inset-0 z-0 bg-surface-dim overflow-hidden">
      {/* Real Interactive Map Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Top Right Floating Map Layer Switcher & Filter Chips */}
      <div className="fixed top-24 right-4 md:right-6 z-30 flex flex-col items-end gap-2 pointer-events-auto">
        <div className="bg-surface-container-lowest/90 backdrop-blur-md border border-border-subtle shadow-md rounded-xl p-1.5 flex items-center gap-1">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 text-xs font-label-caps uppercase rounded-lg transition-all ${
              activeFilter === 'all'
                ? 'bg-primary text-on-primary font-bold shadow-xs'
                : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            All Layers
          </button>
          <button
            onClick={() => setActiveFilter('hazards')}
            className={`px-3 py-1 text-xs font-label-caps uppercase rounded-lg transition-all flex items-center gap-1 ${
              activeFilter === 'hazards'
                ? 'bg-status-red text-white font-bold shadow-xs'
                : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-status-red" />
            Hazards ({alerts.length})
          </button>
          <button
            onClick={() => setActiveFilter('fleet')}
            className={`px-3 py-1 text-xs font-label-caps uppercase rounded-lg transition-all flex items-center gap-1 ${
              activeFilter === 'fleet'
                ? 'bg-primary-container text-white font-bold shadow-xs'
                : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
            Fleet ({trips.length})
          </button>
          <button
            onClick={() => setActiveFilter('hubs')}
            className={`px-3 py-1 text-xs font-label-caps uppercase rounded-lg transition-all ${
              activeFilter === 'hubs'
                ? 'bg-secondary text-white font-bold shadow-xs'
                : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            Hubs ({hubs.length})
          </button>
        </div>

        {/* Selected Hub Quick Card */}
        {selectedHub && (
          <div className="bg-surface-container-lowest border border-border-subtle rounded-xl shadow-lg p-3.5 w-72 animate-in fade-in slide-in-from-top-2">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-headline-sm text-sm font-bold text-on-surface">
                  {selectedHub.name}
                </h4>
                <p className="text-xs text-on-surface-variant">{selectedHub.state}</p>
              </div>
              <button
                onClick={() => setSelectedHub(null)}
                className="text-on-surface-variant hover:text-on-surface text-xs"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-border-subtle text-xs">
              <div>
                <span className="text-on-surface-variant block text-[10px] uppercase">Convoys</span>
                <span className="font-bold text-primary">{selectedHub.activeConvoys} Active</span>
              </div>
              <div>
                <span className="text-on-surface-variant block text-[10px] uppercase">Weather</span>
                <span className="font-bold text-on-surface">{selectedHub.weather.temp}, {selectedHub.weather.condition}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
