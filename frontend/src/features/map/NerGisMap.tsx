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
import { initialRoads, initialVehicles, initialIncidents } from "@/services/mock/seedData";
import { DashboardMapControlPanel } from "./DashboardMapControlPanel";
import {
  calculateRoute,
  DEFAULT_ENDPOINTS,
  type CalculatedRoute
} from "@/services/routing/openRouteService";

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

// Minimal Floating Map Controls (+ / − zoom, my location, recenter)
function FloatingMapControlsInside({
  onCenterMyLocation,
  onRecenter,
  isMyLocationActive
}: {
  onCenterMyLocation: () => void;
  onRecenter: () => void;
  isMyLocationActive: boolean;
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

export const NerGisMap: React.FC = () => {
  const roadsFromStore = useRoadStore((s) => s.roads);
  const vehiclesFromStore = useVehicleStore((s) => s.vehicles);
  const incidentsFromStore = useIncidentStore((s) => s.incidents);
  const mapFilterChip = useUiStore((s) => s.mapFilterChip);
  const userGpsLocation = useUiStore((s) => s.userGpsLocation);

  // Fallback to initial seeds if store has not hydrated yet
  const roads = roadsFromStore.length > 0 ? roadsFromStore : initialRoads;
  const vehicles = vehiclesFromStore.length > 0 ? vehiclesFromStore : initialVehicles;
  const incidents = incidentsFromStore.length > 0 ? incidentsFromStore : initialIncidents;

  // Search state connected to DashboardMapControlPanel
  const [searchQuery, setSearchQuery] = useState("");

  // Map viewport control state (Center of NER: 26.2006° N, 92.9376° E)
  const defaultCenter: [number, number] = [26.2006, 92.9376];
  const [targetCoords, setTargetCoords] = useState<[number, number]>(defaultCenter);
  const [targetZoom, setTargetZoom] = useState(7);
  const [triggerCenter, setTriggerCenter] = useState(0);

  // OpenRouteService routing state
  const [availableRoutes, setAvailableRoutes] = useState<CalculatedRoute[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>("route-direct");
  const [isRouteCardCollapsed, setIsRouteCardCollapsed] = useState(false);

  // Fetch routes via openrouteservice (with high-precision fallback)
  useEffect(() => {
    let isCancelled = false;
    async function loadRoutes() {
      const routes = await calculateRoute(
        DEFAULT_ENDPOINTS.start,
        DEFAULT_ENDPOINTS.destination
      );
      if (!isCancelled && routes.length > 0) {
        setAvailableRoutes(routes);
        setSelectedRouteId(routes[0].id);
      }
    }
    loadRoutes();
    return () => {
      isCancelled = true;
    };
  }, []);

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
    setTargetCoords(defaultCenter);
    setTargetZoom(7);
    setTriggerCenter((c) => c + 1);
  }, [defaultCenter]);

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
      <div className="relative w-full h-[500px] sm:h-[600px] lg:h-[760px] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,51,86,0.06)] select-none">
        {/* Consolidated Unified Floating Control Panel (Active Fleet, At Risk, Blocked, SLA, Search) */}
        <DashboardMapControlPanel
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Real Leaflet Map Container */}
        <MapContainer
          center={defaultCenter}
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

          {/* Dynamic Map Controller for flyTo animation */}
          <MapController
            centerCoords={targetCoords}
            zoom={targetZoom}
            triggerCenter={triggerCenter}
          />

          {/* Minimal Floating Map Controls (+ / − zoom, location, recenter) */}
          <FloatingMapControlsInside
            onCenterMyLocation={handleCenterMyLocation}
            onRecenter={handleRecenter}
            isMyLocationActive={!!userGpsLocation?.isLive}
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

          {/* ================= 2. ACTIVE SELECTED ROUTE (OPENROUTESERVICE) ================= */}
          {activeRoute && (
            <>
              {/* Casing / Halo for active route */}
              <Polyline
                positions={activeRoute.coordinates}
                pathOptions={{
                  color: "#ffffff",
                  weight: 9,
                  opacity: 0.9,
                  lineCap: "round",
                  lineJoin: "round"
                }}
              />
              {/* Route line */}
              <Polyline
                positions={activeRoute.coordinates}
                pathOptions={{
                  color:
                    isNh6Blocked && activeRoute.id === "route-direct"
                      ? "#dc2626"
                      : "#0284c7",
                  weight: 6,
                  opacity: 0.95,
                  dashArray:
                    isNh6Blocked && activeRoute.id === "route-direct"
                      ? "6, 6"
                      : undefined,
                  lineCap: "round",
                  lineJoin: "round"
                }}
              >
                <Tooltip sticky>
                  <div className="font-sans text-xs">
                    <strong className="font-bold text-[#003356]">{activeRoute.name}</strong>
                    <div className="text-[11px] text-slate-600">
                      Distance: {activeRoute.distanceKm} km • ETA: {activeRoute.etaFormatted}
                    </div>
                  </div>
                </Tooltip>
              </Polyline>
            </>
          )}

          {/* Inactive Alternative Route Polyline (dashed gray) */}
          {availableRoutes.map((r) => {
            if (r.id === selectedRouteId) return null;
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
                  opacity: 0.65,
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

          {/* Route Start Point Marker (Guwahati Depot) */}
          <Marker
            position={[DEFAULT_ENDPOINTS.start.lat, DEFAULT_ENDPOINTS.start.lng]}
            icon={createEndpointIcon("Start: Guwahati Depot", true)}
          >
            <Popup>
              <div className="p-2.5 font-sans min-w-[200px]">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs mb-1">
                  <span className="material-symbols-outlined text-[16px]">warehouse</span>
                  <span>Origin: Guwahati Central Depot</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Fleet staging hub for Assam-Meghalaya arterial distribution.
                </p>
                <div className="text-[10px] font-mono text-slate-400 mt-1">
                  {DEFAULT_ENDPOINTS.start.lat.toFixed(4)}° N, {DEFAULT_ENDPOINTS.start.lng.toFixed(4)}° E
                </div>
              </div>
            </Popup>
          </Marker>

          {/* Route Destination Point Marker (Shillong Medical Node) */}
          <Marker
            position={[DEFAULT_ENDPOINTS.destination.lat, DEFAULT_ENDPOINTS.destination.lng]}
            icon={createEndpointIcon("Destination: Shillong", false)}
          >
            <Popup>
              <div className="p-2.5 font-sans min-w-[200px]">
                <div className="flex items-center gap-1.5 text-[#003356] font-bold text-xs mb-1">
                  <span className="material-symbols-outlined text-[16px]">local_hospital</span>
                  <span>Destination: Shillong Medical Logistics Node</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Critical medical supply consignment terminal.
                </p>
                <div className="text-[10px] font-mono text-slate-400 mt-1">
                  {DEFAULT_ENDPOINTS.destination.lat.toFixed(4)}° N, {DEFAULT_ENDPOINTS.destination.lng.toFixed(4)}° E
                </div>
              </div>
            </Popup>
          </Marker>

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

        {/* ================= 6. FLOATING ROUTE SELECTION & ETA OVERLAY CARD ================= */}
        {activeRoute && (
          <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 z-[1000] pointer-events-auto max-w-sm sm:max-w-md w-[calc(100%-1.5rem)] sm:w-auto">
            <div className="map-floating-element bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_4px_20px_rgba(0,51,86,0.12)] border border-slate-200/80 overflow-hidden select-none transition-all duration-200">
              {/* Header Bar with Minimize/Expand Toggle */}
              <div className="px-3.5 py-2.5 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="p-1 rounded-lg bg-[#0284c7]/10 text-[#0284c7] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px]">alt_route</span>
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-[#003356] truncate">
                      Guwahati ➔ Shillong Dispatch
                    </span>
                    <span className="text-[10px] text-slate-500 truncate">
                      OpenRouteService Active Geometry
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsRouteCardCollapsed(!isRouteCardCollapsed)}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer shrink-0"
                  title={isRouteCardCollapsed ? "Expand route panel" : "Collapse route panel"}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isRouteCardCollapsed ? "expand_less" : "expand_more"}
                  </span>
                </button>
              </div>

              {/* Body */}
              {!isRouteCardCollapsed && (
                <div className="p-3 flex flex-col gap-2.5">
                  {/* Route Selection Tabs (Route A vs Alternative Route B) */}
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100/90 rounded-xl">
                    {availableRoutes.map((r) => {
                      const isSelected = r.id === selectedRouteId;
                      const isFlooded = isNh6Blocked && r.id === "route-direct";

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
                            <span className="text-[11px] font-bold truncate">
                              {r.id === "route-direct" ? "Route A (Direct)" : "Route B (Bypass)"}
                            </span>
                            {isFlooded ? (
                              <span className="px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-800 text-[9px] font-bold shrink-0">
                                Cutoff
                              </span>
                            ) : isSelected ? (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#0284c7] shrink-0" />
                            ) : null}
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {r.distanceKm} km • {r.etaFormatted}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Route Specs Ribbon */}
                  <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <span className="material-symbols-outlined text-[16px] text-slate-400">straighten</span>
                      <span>Distance: <strong className="font-semibold text-slate-900">{activeRoute.distanceKm} km</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <span className="material-symbols-outlined text-[16px] text-slate-400">schedule</span>
                      <span>ETA: <strong className="font-semibold text-slate-900">{activeRoute.etaFormatted}</strong></span>
                    </div>
                  </div>

                  {/* Weather / Risk Advisory Banner */}
                  {isNh6Blocked ? (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2">
                      <span className="material-symbols-outlined text-[17px] text-rose-600 shrink-0 mt-0.5">flood</span>
                      <div className="flex-1 text-[11px] leading-tight">
                        <strong>NH-6 Inundated at KM 48 Nongpoh.</strong> Direct route cut. Route B (Jowai Bypass) recommended (+45 min).
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 rounded-xl bg-emerald-50/80 border border-emerald-200/70 text-emerald-900 text-[11px] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
                      <span>Corridor cleared. Optimal transit via NH-6 4-lane expressway.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
