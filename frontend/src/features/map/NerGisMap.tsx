import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  Tooltip,
  useMap
} from "react-leaflet";
import L from "leaflet";
import { useRoadStore } from "@/stores/roadStore";
import { useVehicleStore } from "@/stores/vehicleStore";
import { useIncidentStore } from "@/stores/incidentStore";
import { useUiStore } from "@/stores/uiStore";
import { useShipmentStore } from "@/stores/shipmentStore";
import { initialRoads, initialVehicles, initialIncidents } from "@/services/mock/seedData";
import { DashboardMapControlPanel } from "./DashboardMapControlPanel";
import {
  routeAlternativesApi,
  type ParsedAlternativeRoute,
  formatAxiosError
} from "@/services/api/apiClient";

// Helper component to automatically fit map bounds to the active route polyline
function RouteBoundsFitter({
  routeCoordinates,
  activeRouteId
}: {
  routeCoordinates: [number, number][];
  activeRouteId?: string;
}) {
  const map = useMap();
  const prevIdRef = React.useRef<string | undefined>(undefined);

  useEffect(() => {
    if (routeCoordinates && routeCoordinates.length > 0 && prevIdRef.current !== activeRouteId) {
      prevIdRef.current = activeRouteId;
      const latLngs = routeCoordinates.map(([lat, lng]) => L.latLng(lat, lng));
      const bounds = L.latLngBounds(latLngs);
      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 13,
          animate: true,
          duration: 0.8
        });
      }
    }
  }, [routeCoordinates, activeRouteId, map]);

  return null;
}

// Helper component to control map panning and zooming from inside MapContainer
function MapController({
  centerCoords,
  zoom,
  triggerCenter
}: {
  centerCoords: [number, number];
  zoom: number;
  triggerCenter: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (triggerCenter > 0) {
      map.flyTo(centerCoords, zoom, {
        duration: 0.8,
        easeLinearity: 0.25
      });
    }
  }, [triggerCenter, centerCoords, zoom, map]);

  return null;
}

// Helper component to trigger map.invalidateSize() on fullscreen transition
function MapResizer({ isFullscreen }: { isFullscreen: boolean }) {
  const map = useMap();

  useEffect(() => {
    const timer1 = setTimeout(() => map.invalidateSize({ animate: false }), 50);
    const timer2 = setTimeout(() => map.invalidateSize({ animate: false }), 200);
    const timer3 = setTimeout(() => map.invalidateSize({ animate: true }), 450);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isFullscreen, map]);

  return null;
}

// Minimal Floating Map Controls (+ / − zoom, my location, recenter, fullscreen)
function FloatingMapControlsInside({
  onCenterMyLocation,
  onRecenter,
  isMyLocationActive,
  onToggleFullscreen,
  isFullscreen
}: {
  onCenterMyLocation: () => void;
  onRecenter: () => void;
  isMyLocationActive: boolean;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
}) {
  const map = useMap();

  return (
    <div className="absolute bottom-4 right-4 z-[1000] flex flex-col items-end gap-2 pointer-events-auto">
      <div className="map-floating-element flex flex-col bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_4px_16px_rgba(0,51,86,0.12)] border border-slate-200/80 overflow-hidden divide-y divide-slate-100">
        <button
          type="button"
          onClick={() => map.zoomIn()}
          className="p-2.5 sm:p-3 text-slate-700 hover:bg-slate-100 hover:text-[#003356] transition-colors cursor-pointer flex items-center justify-center"
          title="Zoom In (+)"
          aria-label="Zoom In"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
        </button>
        <button
          type="button"
          onClick={() => map.zoomOut()}
          className="p-2.5 sm:p-3 text-slate-700 hover:bg-slate-100 hover:text-[#003356] transition-colors cursor-pointer flex items-center justify-center"
          title="Zoom Out (−)"
          aria-label="Zoom Out"
        >
          <span className="material-symbols-outlined text-[20px]">remove</span>
        </button>
        <button
          type="button"
          onClick={onCenterMyLocation}
          className={`p-2.5 sm:p-3 transition-colors cursor-pointer flex items-center justify-center ${
            isMyLocationActive
              ? "bg-sky-50 text-[#0284c7] font-bold"
              : "text-slate-700 hover:bg-slate-100 hover:text-[#0284c7]"
          }`}
          title="Center on My Location (Live GPS)"
          aria-label="My Location"
        >
          <span className="material-symbols-outlined text-[20px]">my_location</span>
        </button>
        <button
          type="button"
          onClick={onRecenter}
          className="p-2.5 sm:p-3 text-slate-700 hover:bg-slate-100 hover:text-[#003356] transition-colors cursor-pointer flex items-center justify-center"
          title="Recenter North East Region"
          aria-label="Recenter Map"
        >
          <span className="material-symbols-outlined text-[20px]">filter_center_focus</span>
        </button>
        <button
          type="button"
          onClick={onToggleFullscreen}
          className={`p-2.5 sm:p-3 transition-colors cursor-pointer flex items-center justify-center ${
            isFullscreen
              ? "bg-[#003356] text-white hover:bg-[#174a73]"
              : "text-slate-700 hover:bg-slate-100 hover:text-[#003356]"
          }`}
          title={isFullscreen ? "Exit Fullscreen (Esc)" : "Expand Map Fullscreen"}
          aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          <span className="material-symbols-outlined text-[20px]">
            {isFullscreen ? "fullscreen_exit" : "fullscreen"}
          </span>
        </button>
      </div>
    </div>
  );
}

// Marker Icon Generators using Leaflet DivIcon
const createVehicleIcon = (id: string, isBlocked?: boolean) => {
  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div class="relative flex items-center justify-center cursor-pointer group" style="transform: translate(-50%, -50%);">
        ${
          isBlocked
            ? '<span class="absolute w-8 h-8 rounded-full bg-rose-500/40 animate-ping"></span>'
            : '<span class="absolute w-7 h-7 rounded-full bg-emerald-500/25 animate-ping"></span>'
        }
        <div class="flex items-center gap-1 px-2.5 py-1 rounded-full text-white text-[10px] font-bold shadow-md border-2 border-white transition-transform group-hover:scale-110 select-none ${
          isBlocked ? "bg-[#ba1a1a]" : "bg-[#003356]"
        }">
          <span class="material-symbols-outlined text-[13px]">local_shipping</span>
          <span class="font-mono">${id}</span>
        </div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
};

const createIncidentIcon = (severity: "high" | "medium" | "low", type: string) => {
  const bg = severity === "high" ? "#dc2626" : severity === "medium" ? "#d97706" : "#2563eb";
  const icon = type === "landslide" ? "landslide" : type === "flood" ? "water_damage" : "warning";
  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div class="relative flex items-center justify-center cursor-pointer group" style="transform: translate(-50%, -50%);">
        <span class="absolute w-8 h-8 rounded-full ${
          severity === "high" ? "bg-rose-500/40 animate-ping" : "bg-amber-500/30"
        }"></span>
        <div class="w-7 h-7 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white transition-transform group-hover:scale-110 select-none" style="background-color: ${bg};">
          <span class="material-symbols-outlined text-[15px]">${icon}</span>
        </div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
};

const createEndpointIcon = (label: string, isOrigin: boolean) => {
  const bg = isOrigin ? "#15803d" : "#003356";
  const icon = isOrigin ? "warehouse" : "local_hospital";
  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div class="relative flex items-center justify-center cursor-pointer group" style="transform: translate(-50%, -50%);">
        <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-white text-[10px] font-bold shadow-lg border-2 border-white transition-transform group-hover:scale-105 select-none" style="background-color: ${bg};">
          <span class="material-symbols-outlined text-[14px]">${icon}</span>
          <span>${label}</span>
        </div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
};

const createLiveUserGpsIcon = () => {
  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div class="relative flex items-center justify-center cursor-pointer group" style="transform: translate(-50%, -50%);">
        <span class="absolute w-8 h-8 rounded-full bg-sky-400/40 animate-ping"></span>
        <div class="w-4 h-4 rounded-full bg-[#0284c7] border-2 border-white shadow-md"></div>
        <div class="absolute top-5 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-full bg-[#0284c7] text-white text-[9px] font-bold shadow-sm">
          ● You (Live)
        </div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
};

const DEFAULT_MAP_CENTER: [number, number] = [26.2006, 92.9376];

export const NerGisMap: React.FC = () => {
  const roadsFromStore = useRoadStore((s) => s.roads);
  const vehiclesFromStore = useVehicleStore((s) => s.vehicles);
  const incidentsFromStore = useIncidentStore((s) => s.incidents);
  const mapFilterChip = useUiStore((s) => s.mapFilterChip);
  const userGpsLocation = useUiStore((s) => s.userGpsLocation);

  // Sync with shipmentStore
  const shipments = useShipmentStore((s) => s.shipments);
  const selectedShipmentId = useShipmentStore((s) => s.selectedShipmentId);
  const storeRoutes = useShipmentStore((s) => s.routes);

  const activeShipment = useMemo(() => {
    return shipments.find((s) => s.id === selectedShipmentId) || shipments[0] || null;
  }, [shipments, selectedShipmentId]);

  // Fallback to initial seeds if store has not hydrated yet
  const roads = roadsFromStore.length > 0 ? roadsFromStore : initialRoads;
  const vehicles = vehiclesFromStore.length > 0 ? vehiclesFromStore : initialVehicles;
  const incidents = incidentsFromStore.length > 0 ? incidentsFromStore : initialIncidents;

  // Search state connected to DashboardMapControlPanel
  const [searchQuery, setSearchQuery] = useState("");

  // Fullscreen viewport state with Browser API + in-app overlay fallback
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapWrapperRef = React.useRef<HTMLDivElement | null>(null);

  const toggleFullscreen = useCallback(async () => {
    if (!isFullscreen) {
      if (mapWrapperRef.current?.requestFullscreen) {
        try {
          await mapWrapperRef.current.requestFullscreen();
        } catch {
          // Browser Fullscreen API denied or unsupported; in-app state handles it
        }
      }
      setIsFullscreen(true);
    } else {
      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen();
        } catch {
          // Ignore
        }
      }
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isDocFs = !!document.fullscreenElement;
      if (!isDocFs && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        toggleFullscreen();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreen, toggleFullscreen]);

  // Map viewport control state (Center of NER: 26.2006° N, 92.9376° E)
  const [targetCoords, setTargetCoords] = useState<[number, number]>(DEFAULT_MAP_CENTER);
  const [targetZoom, setTargetZoom] = useState(7);
  const [triggerCenter, setTriggerCenter] = useState(0);

  // Route Alternatives state (POST /routes/alternatives)
  const [availableRoutes, setAvailableRoutes] = useState<ParsedAlternativeRoute[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>("");
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(true);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [isRouteCardCollapsed, setIsRouteCardCollapsed] = useState(false);

  // Derive origin and destination coordinates for the active shipment
  const activeOriginCoordinates: [number, number] = useMemo(() => {
    if (activeShipment?.originCoordinates && activeShipment.originCoordinates.length === 2) {
      return activeShipment.originCoordinates;
    }
    return [91.7362, 26.1445]; // Default: Guwahati [lng, lat]
  }, [activeShipment]);

  const activeDestinationCoordinates: [number, number] = useMemo(() => {
    if (activeShipment?.destinationCoordinates && activeShipment.destinationCoordinates.length === 2) {
      return activeShipment.destinationCoordinates;
    }
    return [91.8933, 25.5788]; // Default: Shillong [lng, lat]
  }, [activeShipment]);

  // Manual refresh / retry handler for user interaction
  const fetchRouteAlternatives = useCallback(async () => {
    setIsLoadingRoutes(true);
    setRouteError(null);
    try {
      const routes = await routeAlternativesApi.fetchParsedAlternatives({
        origin: { type: "Point", coordinates: activeOriginCoordinates },
        destination: { type: "Point", coordinates: activeDestinationCoordinates }
      });
      if (routes && routes.length > 0) {
        setAvailableRoutes(routes);
        setSelectedRouteId((current) => {
          return routes.some((r) => r.id === current) ? current : routes[0].id;
        });
      } else {
        setRouteError("API returned no alternative routes.");
      }
    } catch (err: unknown) {
      console.error("Failed to load route alternatives:", err);
      const msg = formatAxiosError(err, "Failed to load route alternatives from backend.");
      setRouteError(msg);
    } finally {
      setIsLoadingRoutes(false);
    }
  }, [activeOriginCoordinates, activeDestinationCoordinates]);

  // Dynamically load calculated route for active shipment via backend OpenRouteService
  useEffect(() => {
    let isCancelled = false;

    // 1. Check if shipmentStore already has a cached route geometry for this shipment
    const cachedStoreRoute = storeRoutes.find(
      (r) =>
        (activeShipment && r.shipmentId === activeShipment.id) ||
        (activeShipment && r.id === activeShipment.currentRouteId)
    );

    if (cachedStoreRoute && cachedStoreRoute.geometry && cachedStoreRoute.geometry.length > 0) {
      const parsed: ParsedAlternativeRoute = {
        id: cachedStoreRoute.id,
        name: cachedStoreRoute.name,
        isAlternative: false,
        distanceKm: cachedStoreRoute.distanceKm,
        durationMinutes: cachedStoreRoute.estimatedMinutes,
        etaFormatted: `${Math.floor(cachedStoreRoute.estimatedMinutes / 60)}h ${Math.round(cachedStoreRoute.estimatedMinutes % 60)}m`,
        coordinates: cachedStoreRoute.geometry,
        rawGeoJsonCoordinates: cachedStoreRoute.geometry.map(([lat, lng]) => [lng, lat]),
        summary: `${cachedStoreRoute.distanceKm} km corridor connecting ${activeShipment?.origin || "origin"} and ${activeShipment?.destination || "destination"}`,
        via: cachedStoreRoute.via || `${activeShipment?.origin || "origin"} ➔ ${activeShipment?.destination || "destination"}`
      };
      const cacheTimeoutId = setTimeout(() => {
        if (!isCancelled) {
          setAvailableRoutes([parsed]);
          setSelectedRouteId(parsed.id);
        }
      }, 0);
      return () => {
        isCancelled = true;
        clearTimeout(cacheTimeoutId);
      };
    }

    // 2. Query backend OpenRouteService alternatives endpoint with GeoJSON [lng, lat]
    const timeoutId = setTimeout(() => {
      if (!isCancelled) {
        setIsLoadingRoutes(true);
      }
    }, 0);

    routeAlternativesApi
      .fetchParsedAlternatives({
        origin: { type: "Point", coordinates: activeOriginCoordinates },
        destination: { type: "Point", coordinates: activeDestinationCoordinates }
      })
      .then((routes) => {
        if (!isCancelled && routes && routes.length > 0) {
          setAvailableRoutes(routes);
          setSelectedRouteId(routes[0].id);
        }
      })
      .catch((err: unknown) => {
        if (!isCancelled) {
          console.error("Failed to load route alternatives:", err);
          setRouteError(formatAxiosError(err, "Failed to load route alternatives from backend."));
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoadingRoutes(false);
        }
      });

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [
    activeShipment,
    activeOriginCoordinates,
    activeDestinationCoordinates,
    storeRoutes
  ]);

  // Check if NH-6 is currently blocked in simulation
  const nh6Road = roads.find((r) => r.id === "NH-6");
  const isNh6Blocked = nh6Road?.status === "blocked";

  // Active selected route object
  const activeRoute = useMemo(() => {
    return (
      availableRoutes.find((r) => r.id === selectedRouteId) ||
      availableRoutes[0] ||
      null
    );
  }, [availableRoutes, selectedRouteId]);

  // Recenter map handlers
  const handleRecenter = useCallback(() => {
    setTargetCoords(DEFAULT_MAP_CENTER);
    setTargetZoom(7);
    setTriggerCenter((c) => c + 1);
  }, []);

  const handleCenterMyLocation = useCallback(() => {
    setTargetCoords([25.7200, 91.8700]);
    setTargetZoom(11);
    setTriggerCenter((c) => c + 1);
  }, []);

  // Filter visibility helpers for roads and vehicles
  const isCorridorVisible = (status: string, corridorId?: string) => {
    if (mapFilterChip === "blocked" && status !== "blocked") return false;
    if (mapFilterChip === "at_risk" && status !== "at_risk" && status !== "under_observation") return false;
    if (searchQuery.trim() && corridorId) {
      const q = searchQuery.toLowerCase().trim();
      return corridorId.toLowerCase().includes(q) || status.toLowerCase().includes(q);
    }
    return true;
  };

  const isVehicleVisible = (vehicleId: string, vehicleName: string) => {
    if (mapFilterChip === "blocked") return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        vehicleId.toLowerCase().includes(q) ||
        vehicleName.toLowerCase().includes(q) ||
        q === "fleet" ||
        q === "vehicle"
      );
    }
    return true;
  };

  // Road styling by condition status
  const getRoadStyle = (status: string) => {
    switch (status) {
      case "blocked":
        return { color: "#dc2626", weight: 6, dashArray: "6, 6" };
      case "at_risk":
      case "under_observation":
        return { color: "#d97706", weight: 5, dashArray: "8, 6" };
      default:
        return { color: "#15803d", weight: 5 };
    }
  };

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {/* Primary Map Viewport with OpenStreetMap and Leaflet engine */}
      <div
        ref={mapWrapperRef}
        className={`transition-all duration-300 bg-slate-100 select-none overflow-hidden ${
          isFullscreen
            ? "fixed inset-0 z-[9999] w-screen h-screen rounded-none border-0 shadow-2xl"
            : "relative w-full h-[500px] sm:h-[600px] lg:h-[760px] rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,51,86,0.06)]"
        }`}
      >
        {/* Floating Exit Fullscreen Button in Fullscreen Mode */}
        {isFullscreen && (
          <div className="absolute top-3.5 right-3.5 z-[1001] pointer-events-auto animate-in fade-in">
            <button
              type="button"
              onClick={toggleFullscreen}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/95 backdrop-blur-md text-[#003356] hover:bg-white hover:text-rose-700 font-bold text-xs shadow-[0_4px_16px_rgba(0,51,86,0.18)] border border-slate-200 transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">fullscreen_exit</span>
              <span>Exit Fullscreen</span>
              <span className="text-[10px] text-slate-500 font-mono px-1.5 py-0.5 bg-slate-100 rounded">
                Esc
              </span>
            </button>
          </div>
        )}

        {/* Consolidated Unified Floating Control Panel (Active Fleet, At Risk, Blocked, SLA, Search) */}
        <DashboardMapControlPanel
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Real Leaflet Map Container */}
        <MapContainer
          center={DEFAULT_MAP_CENTER}
          zoom={7}
          minZoom={6}
          maxZoom={18}
          zoomControl={false}
          scrollWheelZoom={true}
          doubleClickZoom={true}
          touchZoom={true}
          dragging={true}
          className="w-full h-full"
        >
          {/* OpenStreetMap Standard Tiles with proper attribution */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
            maxZoom={19}
          />

          {/* Dynamic Map Resizer on fullscreen transitions */}
          <MapResizer isFullscreen={isFullscreen} />

          {/* Dynamic Map Controller for flyTo animation */}
          <MapController
            centerCoords={targetCoords}
            zoom={targetZoom}
            triggerCenter={triggerCenter}
          />

          {/* Minimal Floating Map Controls (+ / − zoom, location, recenter, fullscreen) */}
          <FloatingMapControlsInside
            onCenterMyLocation={handleCenterMyLocation}
            onRecenter={handleRecenter}
            isMyLocationActive={!!userGpsLocation?.isLive}
            onToggleFullscreen={toggleFullscreen}
            isFullscreen={isFullscreen}
          />

          {/* ================= 1. NER ARTERIAL CORRIDORS (POLYLINES) ================= */}
          {roads.map((road) => {
            if (!isCorridorVisible(road.status, road.id)) return null;
            const style = getRoadStyle(road.status);

            return (
              <React.Fragment key={road.id}>
                {/* Road Casing (White Halo for visual clarity) */}
                <Polyline
                  positions={road.geometry}
                  pathOptions={{
                    color: "#ffffff",
                    weight: style.weight + 4,
                    lineCap: "round",
                    lineJoin: "round",
                    opacity: 0.9
                  }}
                />
                {/* Primary Road Line */}
                <Polyline
                  positions={road.geometry}
                  pathOptions={{
                    ...style,
                    lineCap: "round",
                    lineJoin: "round"
                  }}
                >
                  <Tooltip sticky>
                    <div className="font-sans text-xs">
                      <strong className="font-bold text-[#003356]">{road.name}</strong>
                      <div className="text-[11px] text-slate-600">
                        Status: <span className="font-bold capitalize">{road.status.replace("_", " ")}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Speed: {road.speedKph} km/h • Clearance: {road.clearancePercent}
                      </div>
                    </div>
                  </Tooltip>
                  <Popup>
                    <div className="p-3 font-sans min-w-[220px]">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-bold text-xs text-[#003356]">{road.id}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full capitalize ${
                            road.status === "blocked"
                              ? "bg-rose-100 text-rose-800"
                              : road.status === "at_risk"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {road.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800">{road.name}</p>
                      <p className="text-[11px] text-slate-600 mt-1">{road.description}</p>
                      <div className="mt-2 pt-2 border-t border-slate-100 grid grid-cols-2 gap-1 text-[10px] text-slate-500">
                        <div>Clearance: <strong className="text-slate-700">{road.clearancePercent}</strong></div>
                        <div>Speed: <strong className="text-slate-700">{road.speedKph} km/h</strong></div>
                      </div>
                    </div>
                  </Popup>
                </Polyline>
              </React.Fragment>
            );
          })}

          {/* ================= 2. ACTIVE SELECTED ROUTE & ALTERNATIVES (FROM BACKEND API) ================= */}
          {/* Automatic Bounds Fitter for complete route visibility */}
          {activeRoute && activeRoute.coordinates.length > 0 && (
            <RouteBoundsFitter
              routeCoordinates={activeRoute.coordinates}
              activeRouteId={activeRoute.id}
            />
          )}

          {/* Active Route Polyline */}
          {activeRoute && activeRoute.coordinates.length > 0 && (
            <>
              {/* Casing / Halo for active route */}
              <Polyline
                positions={activeRoute.coordinates}
                pathOptions={{
                  color: "#ffffff",
                  weight: 9,
                  opacity: 0.95,
                  lineCap: "round",
                  lineJoin: "round"
                }}
              />
              {/* Active Route Colored Line */}
              <Polyline
                positions={activeRoute.coordinates}
                pathOptions={{
                  color: "#005148",
                  weight: 6,
                  opacity: 0.95,
                  lineCap: "round",
                  lineJoin: "round"
                }}
              >
                <Tooltip sticky>
                  <div className="font-sans text-xs">
                    <strong className="font-bold text-[#003356]">{activeRoute.name}</strong>
                    <div className="text-[11px] text-slate-600">
                      Distance: {activeRoute.distanceKm} km • Duration: {activeRoute.etaFormatted}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {activeRoute.coordinates.length} waypoints (GeoJSON converted to Leaflet)
                    </div>
                  </div>
                </Tooltip>
                <Popup>
                  <div className="p-3 font-sans min-w-[220px]">
                    <span className="text-xs font-bold text-[#003356]">{activeRoute.name}</span>
                    <p className="text-[11px] text-slate-600 mt-1">{activeRoute.summary}</p>
                    <div className="mt-2 pt-2 border-t border-slate-100 grid grid-cols-2 gap-1 text-[11px]">
                      <div>Distance: <strong>{activeRoute.distanceKm} km</strong></div>
                      <div>Duration: <strong>{activeRoute.etaFormatted}</strong></div>
                    </div>
                  </div>
                </Popup>
              </Polyline>
            </>
          )}

          {/* Inactive Alternative Route Polylines (Dashed lines, click to select) */}
          {availableRoutes.map((r) => {
            if (r.id === selectedRouteId || r.coordinates.length === 0) return null;
            return (
              <Polyline
                key={`alt-${r.id}`}
                positions={r.coordinates}
                eventHandlers={{
                  click: () => setSelectedRouteId(r.id)
                }}
                pathOptions={{
                  color: "#64748b",
                  weight: 4,
                  dashArray: "8, 6",
                  opacity: 0.75,
                  lineCap: "round"
                }}
              >
                <Tooltip sticky>
                  <div className="font-sans text-xs">
                    <strong className="font-semibold text-slate-700">{r.name} (Click to select)</strong>
                    <div className="text-[10px] text-slate-500">
                      {r.distanceKm} km • {r.etaFormatted}
                    </div>
                  </div>
                </Tooltip>
              </Polyline>
            );
          })}

          {/* Dynamic Origin Marker */}
          <Marker
            position={
              activeRoute && activeRoute.coordinates.length > 0
                ? activeRoute.coordinates[0]
                : [activeOriginCoordinates[1], activeOriginCoordinates[0]]
            }
            icon={createEndpointIcon(`Origin: ${activeShipment?.origin || "Guwahati"}`, true)}
          >
            <Popup>
              <div className="p-2.5 font-sans min-w-[220px]">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs mb-1">
                  <span className="material-symbols-outlined text-[16px]">warehouse</span>
                  <span>Origin: {activeShipment?.origin || "Guwahati Central Depot"}</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Consignment departure node at [{activeOriginCoordinates[0].toFixed(4)}, {activeOriginCoordinates[1].toFixed(4)}].
                </p>
                {activeShipment && (
                  <div className="mt-2 pt-1.5 border-t border-slate-100 flex flex-col gap-0.5 text-[10px] text-slate-500">
                    <div>Consignment: <strong className="font-mono text-slate-700">{activeShipment.id}</strong></div>
                    <div>Driver: <strong className="text-slate-700">{activeShipment.driverName || "Official Driver"}</strong></div>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>

          {/* Dynamic Destination Marker */}
          <Marker
            position={
              activeRoute && activeRoute.coordinates.length > 0
                ? activeRoute.coordinates[activeRoute.coordinates.length - 1]
                : [activeDestinationCoordinates[1], activeDestinationCoordinates[0]]
            }
            icon={createEndpointIcon(`Destination: ${activeShipment?.destination || "Shillong"}`, false)}
          >
            <Popup>
              <div className="p-2.5 font-sans min-w-[220px]">
                <div className="flex items-center gap-1.5 text-[#003356] font-bold text-xs mb-1">
                  <span className="material-symbols-outlined text-[16px]">pin_drop</span>
                  <span>Destination: {activeShipment?.destination || "Shillong Terminal"}</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Consignment terminal at [{activeDestinationCoordinates[0].toFixed(4)}, {activeDestinationCoordinates[1].toFixed(4)}].
                </p>
                {activeRoute && (
                  <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-semibold">
                    <span>Distance: {activeRoute.distanceKm} km</span>
                    <span>ETA: {activeRoute.etaFormatted}</span>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>

          {/* Assigned Driver / Vehicle on Route Marker */}
          {activeShipment && activeShipment.driverName && (
            <Marker
              position={
                activeRoute && activeRoute.coordinates.length > 2
                  ? activeRoute.coordinates[Math.floor(activeRoute.coordinates.length * 0.25)]
                  : [activeOriginCoordinates[1], activeOriginCoordinates[0]]
              }
              icon={createVehicleIcon(activeShipment.vehicleNumber || activeShipment.vehicleId || "FW-18", false)}
            >
              <Popup>
                <div className="p-3 font-sans min-w-[230px]">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-bold text-xs text-[#003356] font-mono">
                      {activeShipment.vehicleNumber || activeShipment.vehicleId}
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                      Assigned Driver
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 my-2">
                    {activeShipment.driverPhotoUrl ? (
                      <img
                        src={activeShipment.driverPhotoUrl}
                        alt={activeShipment.driverName}
                        className="w-10 h-10 rounded-full object-cover border-2 border-[#003356]"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#003356] text-white flex items-center justify-center font-bold text-xs">
                        {activeShipment.driverName[0]}
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-bold text-slate-800">{activeShipment.driverName}</div>
                      <div className="text-[11px] text-[#174a73] font-semibold">{activeShipment.driverPhone || "+91 94361 78921"}</div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex flex-col gap-1 text-[11px] text-slate-600">
                    <div>Consignment: <strong className="text-slate-800">{activeShipment.id}</strong></div>
                    <div>Corridor: <strong>{activeShipment.origin} ➔ {activeShipment.destination}</strong></div>
                    {activeRoute && (
                      <div className="text-emerald-700 font-semibold">
                        Distance: {activeRoute.distanceKm} km • ETA: {activeRoute.etaFormatted}
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          )}

          {/* ================= 3. VEHICLE MARKERS ================= */}
          {vehicles.map((v) => {
            if (!isVehicleVisible(v.id, v.name)) return null;
            const isBlocked = isNh6Blocked && v.id === "FW-18";

            return (
              <Marker
                key={v.id}
                position={[v.lat, v.lng]}
                icon={createVehicleIcon(v.id, isBlocked)}
              >
                <Popup>
                  <div className="p-3 font-sans min-w-[220px]">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-bold text-xs text-[#003356] font-mono">{v.id}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full capitalize ${
                          isBlocked
                            ? "bg-rose-100 text-rose-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {isBlocked ? "Halted (Cutoff)" : v.status}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800">{v.name}</p>
                    <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-1 text-[11px] text-slate-600">
                      <div>Operator: <strong className="text-slate-800">{v.driverName || "Official Driver"}</strong></div>
                      <div>Speed: <strong className="text-slate-800">{v.speedKph} km/h</strong></div>
                      <div>Corridor: <span className="text-slate-700 font-medium">{v.currentCorridor || "Assam Arterial"}</span></div>
                      <div>Cargo: <span className="text-slate-700 capitalize">{v.cargoType} payload</span></div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* ================= 4. INCIDENT MARKERS ================= */}
          {incidents.map((inc) => (
            <Marker
              key={inc.id}
              position={[inc.lat, inc.lng]}
              icon={createIncidentIcon(inc.severity, inc.type)}
            >
              <Popup>
                <div className="p-3 font-sans min-w-[240px] max-w-xs">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-bold text-xs text-[#003356]">{inc.id}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ${
                        inc.severity === "high"
                          ? "bg-rose-100 text-rose-800"
                          : inc.severity === "medium"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {inc.severity} severity
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">{inc.title}</h4>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{inc.description}</p>
                  <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-0.5 text-[10px] text-slate-500">
                    <div>Agency: <strong className="text-slate-700">{inc.agency}</strong></div>
                    <div>Corridor: <strong className="text-slate-700">{inc.corridorName}</strong></div>
                    {inc.impact && <div className="text-rose-700 font-medium">{inc.impact}</div>}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* ================= 5. LIVE USER GPS MARKER ================= */}
          {userGpsLocation && (
            <Marker
              position={[userGpsLocation.lat, userGpsLocation.lng]}
              icon={createLiveUserGpsIcon()}
            >
              <Popup>
                <div className="p-2.5 font-sans min-w-[200px]">
                  <strong className="text-xs text-[#003356] font-bold">You (Field Officer Terminal)</strong>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {userGpsLocation.readableLocation || "Nongpoh Sector (KM 48)"}
                  </p>
                  <div className="text-[10px] font-mono text-slate-400 mt-1">
                    {userGpsLocation.lat.toFixed(4)}° N, {userGpsLocation.lng.toFixed(4)}° E (±{userGpsLocation.accuracy}m)
                  </div>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>

        {/* Loading State Pill */}
        {isLoadingRoutes && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-slate-200/80 flex items-center gap-2 text-xs font-semibold text-[#003356] pointer-events-none animate-in fade-in duration-150">
            <span className="w-3.5 h-3.5 border-2 border-[#003356] border-t-transparent rounded-full animate-spin" />
            <span>Calculating Route Alternatives...</span>
          </div>
        )}

        {/* Error State Banner */}
        {routeError && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[1000] max-w-md w-[calc(100%-2rem)] bg-rose-50/95 backdrop-blur-md border border-rose-200 text-rose-900 px-3.5 py-2.5 rounded-xl shadow-lg flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-[18px] text-rose-600 shrink-0">error</span>
              <span className="truncate">{routeError}</span>
            </div>
            <button
              type="button"
              onClick={fetchRouteAlternatives}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold shrink-0 transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* ================= 6. FLOATING ROUTE SELECTION & ALTERNATIVES OVERLAY CARD ================= */}
        {activeRoute && (
          <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 z-[1000] pointer-events-auto max-w-sm sm:max-w-md w-[calc(100%-1.5rem)] sm:w-auto">
            <div className="map-floating-element bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_4px_20px_rgba(0,51,86,0.12)] border border-slate-200/80 overflow-hidden select-none transition-all duration-200">
              {/* Header Bar with Minimize/Expand Toggle & Refresh Button */}
              <div className="px-3.5 py-2.5 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="p-1 rounded-lg bg-[#005148]/10 text-[#005148] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px]">alt_route</span>
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-[#003356] truncate">
                      Guwahati ➔ Itanagar Corridor
                    </span>
                    <span className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                      <span>Dynamic Route Engine</span>
                      <span>•</span>
                      <span className="font-mono text-emerald-700 font-semibold">{activeRoute.coordinates.length} waypoints</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={fetchRouteAlternatives}
                    disabled={isLoadingRoutes}
                    className="p-1 text-slate-400 hover:text-[#003356] hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    title="Refresh route alternatives from API"
                  >
                    <span className={`material-symbols-outlined text-[17px] ${isLoadingRoutes ? "animate-spin" : ""}`}>
                      refresh
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsRouteCardCollapsed(!isRouteCardCollapsed)}
                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                    title={isRouteCardCollapsed ? "Expand route panel" : "Collapse route panel"}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isRouteCardCollapsed ? "expand_less" : "expand_more"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Body */}
              {!isRouteCardCollapsed && (
                <div className="p-3 flex flex-col gap-2.5">
                  {/* Route Selection Tabs / Alternatives (Requirement 6) */}
                  {availableRoutes.length > 1 ? (
                    <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100/90 rounded-xl">
                      {availableRoutes.map((r) => {
                        const isSelected = r.id === selectedRouteId;
                        return (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => setSelectedRouteId(r.id)}
                            className={`px-2.5 py-2 rounded-lg text-left transition-all cursor-pointer flex flex-col gap-0.5 ${
                              isSelected
                                ? "bg-white text-[#003356] shadow-xs font-semibold ring-1 ring-slate-200/80"
                                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[11px] font-bold truncate">{r.name}</span>
                              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#005148] shrink-0" />}
                            </div>
                            <span className="text-[10px] text-slate-500 font-medium">
                              {r.distanceKm} km • {r.etaFormatted}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-2 bg-emerald-50/80 border border-emerald-200/70 rounded-xl flex items-center justify-between text-xs">
                      <span className="font-semibold text-emerald-900">{activeRoute.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                        Active Route
                      </span>
                    </div>
                  )}

                  {/* Active Route Specs Ribbon */}
                  <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <span className="material-symbols-outlined text-[16px] text-slate-400">straighten</span>
                      <span>Distance: <strong className="font-semibold text-slate-900">{activeRoute.distanceKm} km</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <span className="material-symbols-outlined text-[16px] text-slate-400">schedule</span>
                      <span>Duration: <strong className="font-semibold text-slate-900">{activeRoute.etaFormatted}</strong></span>
                    </div>
                  </div>

                  {/* Route Origin & Destination Geocodes (Requirement 15 ready) */}
                  <div className="text-[11px] text-slate-600 flex flex-col gap-1 px-1 pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                      <span className="font-semibold text-slate-800">Origin:</span>
                      <span className="text-slate-600 truncate">Guwahati [91.7362, 26.1445]</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#003356] shrink-0" />
                      <span className="font-semibold text-slate-800">Destination:</span>
                      <span className="text-slate-600 truncate">Itanagar [93.6167, 27.0844]</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
