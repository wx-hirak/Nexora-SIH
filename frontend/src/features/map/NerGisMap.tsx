import React, { useState, useRef, useCallback } from "react";
import { useRoadStore } from "@/stores/roadStore";
import { useUiStore } from "@/stores/uiStore";
import { FloatingKpiCards } from "./FloatingKpiCards";
import { FloatingAlertPanel } from "./FloatingAlertPanel";
import { FloatingMapControls } from "./FloatingMapControls";

interface TooltipData {
  title: string;
  subtitle: string;
  detail1: string;
  detail2: string;
  x: number;
  y: number;
}

export const NerGisMap: React.FC = () => {
  const roads = useRoadStore((s) => s.roads);
  const mapLayerMode = useUiStore((s) => s.mapLayerMode);
  const mapFilterChip = useUiStore((s) => s.mapFilterChip);
  const setMapFilterChip = useUiStore((s) => s.setMapFilterChip);
  const userGpsLocation = useUiStore((s) => s.userGpsLocation);

  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Mouse pan state
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Map Road id to status
  const getRoadStatus = (id: string) => {
    const road = roads.find((r) => r.id === id);
    return road?.status || "accessible";
  };

  const nh6Status = getRoadStatus("NH-6");

  const handleZoomIn = () => setZoomLevel((z) => Math.min(1.8, +(z + 0.2).toFixed(2)));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(0.8, +(z - 0.2).toFixed(2)));
  const handleRecenter = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Center on user's live GPS coordinates
  const handleCenterMyLocation = useCallback(() => {
    setZoomLevel(1.35);
    // User GPS location at Nongpoh (450, 325) -> center on (590, 380)
    setPanOffset({ x: 100, y: 30 });
  }, []);

  // Mouse Drag to Pan Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag with left click and not clicking directly on controls
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...panOffset };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = (e.clientX - dragStartRef.current.x) / zoomLevel;
    const dy = (e.clientY - dragStartRef.current.y) / zoomLevel;
    setPanOffset({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Filter visibility helpers
  const isCorridorVisible = (status: string) => {
    if (mapFilterChip === "all") return true;
    if (mapFilterChip === "blocked") return status === "blocked";
    if (mapFilterChip === "at_risk") return status === "at_risk" || status === "under_observation";
    return true;
  };

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {/* Mobile & Tablet (< lg): 2x2 KPI grid above map like Stitch Mobile */}
      <div className="lg:hidden w-full">
        <FloatingKpiCards isInline />
      </div>

      {/* Primary Map Viewport with responsive height */}
      <div className="relative w-full h-[380px] sm:h-[480px] md:h-[580px] lg:h-[760px] rounded-2xl overflow-hidden bg-slate-50 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,51,86,0.06)] select-none">
        {/* Desktop (lg+): Floating KPI Metric Cards over map */}
        <div className="hidden lg:block">
          <FloatingKpiCards />
        </div>

        {/* OVERLAY 2: Google Maps-Style Clean Floating Search & Filter Pill Bar */}
        <div className="absolute top-3 sm:top-3 lg:top-28 left-3 sm:left-4 z-20 pointer-events-none">
        {!isSearchOpen && !searchQuery ? (
          /* Hidden by default: Compact sleek search trigger */
          <button
            type="button"
            onClick={() => {
              setIsSearchOpen(true);
              setTimeout(() => searchInputRef.current?.focus(), 50);
            }}
            className="map-floating-element pointer-events-auto flex items-center gap-2 px-3.5 py-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08),0_12px_24px_rgba(0,51,86,0.06)] border border-slate-200/80 text-xs font-semibold text-slate-700 hover:text-[#003356] hover:bg-white transition-all cursor-pointer group"
            title="Search map corridors, fleet, and nodes"
          >
            <span className="material-symbols-outlined text-[18px] text-[#003356] group-hover:scale-110 transition-transform">
              search
            </span>
            <span>
              <span className="sm:hidden">Search</span>
              <span className="hidden sm:inline">Search Corridors</span>
            </span>
            {mapFilterChip !== "all" && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-sky-100 text-[#003356] text-[10px] font-bold">
                Filtered
              </span>
            )}
          </button>
        ) : (
          /* Revealed when user uses it */
          <div className="map-floating-element pointer-events-auto flex items-center flex-wrap gap-2 p-1.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08),0_12px_24px_rgba(0,51,86,0.06)] border border-slate-200/80 max-w-xl transition-all">
            {/* Search Input Box */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100/80 rounded-xl flex-1 min-w-[200px]">
              <span className="material-symbols-outlined text-[18px] text-slate-500">search</span>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    if (searchQuery) setSearchQuery("");
                    else setIsSearchOpen(false);
                  }
                }}
                placeholder="Search highways, vehicles, nodes..."
                className="w-full bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-slate-400 hover:text-slate-600"
                  title="Clear search"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>

            {/* Quick Filter Chips (Google Maps Style) */}
            <div className="flex items-center gap-1 overflow-x-auto py-0.5">
              {[
                { id: "all", label: "All Corridors", count: 10 },
                { id: "blocked", label: "Blocked", count: 1 },
                { id: "at_risk", label: "At Risk", count: 3 },
                { id: "active_fleet", label: "Active Fleet", count: 5 }
              ].map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setMapFilterChip(chip.id as "all" | "blocked" | "at_risk" | "active_fleet")}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                    mapFilterChip === chip.id
                      ? "bg-[#003356] text-white shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  <span>{chip.label}</span>
                  <span
                    className={`text-[9px] px-1 rounded-full ${
                      mapFilterChip === chip.id
                        ? "bg-white/20 text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {chip.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Close / Hide Search Bar Button */}
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setIsSearchOpen(false);
              }}
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Hide search bar (Esc)"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        )}
      </div>

      {/* OVERLAY 3: Floating Priority Alert Panel */}
      <FloatingAlertPanel />

      {/* OVERLAY 4: Floating Map Controls & Clean Vertical Pill Stack */}
      <FloatingMapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onRecenter={handleRecenter}
        onCenterMyLocation={handleCenterMyLocation}
        isMyLocationActive={userGpsLocation?.isLive}
      />

      {/* Interactive GIS SVG Cartography Canvas */}
      <div
        className={`w-full h-full overflow-hidden relative ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        } ${mapLayerMode === "satellite" ? "bg-[#111827]" : "bg-[#f8fafc]"}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setIsDragging(false);
          setTooltip(null);
        }}
      >
        <svg
          id="ner-gis-canvas"
          viewBox="0 0 1180 760"
          className="w-full h-full transition-transform duration-100 ease-out"
          style={{
            transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
            filter: mapLayerMode === "satellite" ? "contrast(115%) brightness(95%)" : "none"
          }}
        >
          <defs>
            {/* Terrain grid pattern */}
            <pattern id="terrain-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.65" />
              <circle cx="20" cy="20" r="0.6" fill="#cbd5e1" />
            </pattern>
            {/* Mountain Ridge Hatching */}
            <pattern
              id="himalaya-hatch"
              width="16"
              height="16"
              patternTransform="rotate(45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <line x1="0" y1="0" x2="0" y2="16" stroke="#cbd5e1" strokeWidth="1.2" opacity="0.3" />
            </pattern>
            {/* Gradients */}
            <linearGradient id="plain-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#edf2f7" />
            </linearGradient>
            <linearGradient id="brahmaputra-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#bae6fd" />
              <stop offset="100%" stopColor="#7dd3fc" />
            </linearGradient>
            {/* Shadow for highway shields */}
            <filter id="shield-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#0f172a" floodOpacity="0.15" />
            </filter>
            {/* Shadow for vehicle pins */}
            <filter id="marker-shadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#0f172a" floodOpacity="0.2" />
            </filter>
          </defs>

          {/* Background Canvas */}
          <rect width="1180" height="760" fill={mapLayerMode === "satellite" ? "#1e293b" : "#f8fafc"} />
          <rect width="1180" height="760" fill="url(#terrain-grid)" />

          {/* Himalayan / High Ridge Contours */}
          <path d="M 120,30 Q 180,60 210,130 L 170,160 Q 140,80 110,60 Z" fill="url(#himalaya-hatch)" />
          <path
            d="M 420,40 Q 640,30 920,90 Q 990,140 1020,240 L 910,250 Q 860,180 720,130 Q 560,110 420,40 Z"
            fill="url(#himalaya-hatch)"
          />
          <path
            d="M 890,320 Q 980,360 920,540 Q 860,650 780,720 L 730,680 Q 820,580 840,430 Z"
            fill="url(#himalaya-hatch)"
          />

          {/* State Boundary Polygons (North East Eight Sister States + Sikkim) */}
          {/* Sikkim */}
          <path d="M 130,40 L 195,50 L 190,145 L 140,150 L 125,95 Z" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="3,3" />
          <text x="142" y="90" className="text-[10px] fill-slate-500 font-semibold tracking-wider">SIKKIM</text>

          {/* Arunachal Pradesh */}
          <path
            d="M 430,45 L 720,60 L 980,120 L 1050,230 L 990,290 L 890,245 L 790,195 L 610,170 L 460,130 L 380,150 Z"
            fill="#f8fafc"
            stroke="#cbd5e1"
            strokeWidth="1.2"
            strokeDasharray="3,3"
          />
          <text x="710" y="115" className="text-[11px] fill-slate-400 font-bold tracking-widest">ARUNACHAL PRADESH</text>

          {/* Assam Brahmaputra Valley */}
          <path
            d="M 330,175 L 470,140 L 630,180 L 820,205 L 940,255 L 890,310 L 740,300 L 670,270 L 530,290 L 410,285 L 340,330 L 290,280 L 330,205 Z"
            fill="url(#plain-grad)"
            stroke="#cbd5e1"
            strokeWidth="1.2"
            strokeDasharray="3,3"
          />
          <text x="560" y="235" className="text-[12px] fill-[#27638c] font-bold tracking-widest opacity-60">ASSAM</text>

          {/* Meghalaya Plateau */}
          <path d="M 350,335 L 560,330 L 610,380 L 550,425 L 370,420 L 340,370 Z" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="3,3" />
          <text x="430" y="380" className="text-[10px] fill-slate-500 font-semibold tracking-wider">MEGHALAYA</text>

          {/* Nagaland */}
          <path d="M 850,270 L 930,300 L 910,400 L 830,370 L 820,310 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="3,3" />
          <text x="845" y="340" className="text-[10px] fill-slate-500 font-semibold tracking-wider">NAGALAND</text>

          {/* Manipur */}
          <path d="M 825,385 L 900,410 L 880,520 L 805,490 L 815,420 Z" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="3,3" />
          <text x="828" y="455" className="text-[10px] fill-slate-500 font-semibold tracking-wider">MANIPUR</text>

          {/* Mizoram */}
          <path d="M 720,490 L 795,500 L 775,690 L 700,640 L 710,540 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="3,3" />
          <text x="726" y="585" className="text-[10px] fill-slate-500 font-semibold tracking-wider">MIZORAM</text>

          {/* Tripura */}
          <path d="M 605,450 L 685,465 L 680,560 L 620,550 L 595,490 Z" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="3,3" />
          <text x="618" y="505" className="text-[10px] fill-slate-500 font-semibold tracking-wider">TRIPURA</text>

          {/* Major Hydrological Artery: Brahmaputra River */}
          <path
            d="M 960,240 C 860,225 780,210 680,220 C 580,230 490,200 420,220 C 370,235 320,290 310,340"
            fill="none"
            stroke="url(#brahmaputra-grad)"
            strokeWidth="7"
            strokeLinecap="round"
            opacity="0.85"
          />
          <text x="590" y="205" className="text-[9px] fill-[#0284c7] font-medium tracking-wide italic">
            Brahmaputra River Corridor
          </text>

          {/* ================= GOOGLE MAPS-STYLE HIGHWAY ARTERIALS (DUAL-STROKE & SHIELDS) ================= */}

          {/* 1. NH-27 (Guwahati to Nagaon / Lumding) - Primary Spine */}
          {isCorridorVisible("accessible") && (
            <g
              className="cursor-pointer group"
              onMouseEnter={(e) =>
                setTooltip({
                  title: "NH-27 (Assam Central Spine)",
                  subtitle: "Status: Accessible (100% Clearance)",
                  detail1: "Speed: 64 km/h • Traffic: Normal Flow",
                  detail2: "Primary 4-Lane East-West Arterial Corridor",
                  x: e.clientX,
                  y: e.clientY
                })
              }
            >
              {/* Casing (Google Maps road outline) */}
              <path d="M 410,285 L 490,270 L 590,280 L 690,320" fill="none" stroke="#ffffff" strokeWidth="10" strokeLinecap="round" />
              {/* Road Fill */}
              <path d="M 410,285 L 490,270 L 590,280 L 690,320" fill="none" stroke="#15803d" strokeWidth="6" strokeLinecap="round" />
              {/* Google Maps-Style Highway Shield */}
              <g transform="translate(535, 275)" filter="url(#shield-shadow)">
                <rect x="-18" y="-9" width="36" height="18" rx="5" fill="#ffffff" stroke="#15803d" strokeWidth="1.5" />
                <text x="0" y="3.5" textAnchor="middle" className="text-[9px] fill-[#15803d] font-bold font-mono">
                  NH-27
                </text>
              </g>
            </g>
          )}

          {/* 2. NH-6 (Guwahati - Shillong Expressway) - Flagship Dynamic Corridor */}
          {isCorridorVisible(nh6Status) && (
            <g
              className="cursor-pointer group"
              onMouseEnter={(e) =>
                setTooltip({
                  title: "NH-6 (Guwahati-Shillong Corridor)",
                  subtitle: `Status: ${nh6Status === "blocked" ? "CRITICAL BLOCKED" : nh6Status === "at_risk" ? "AT RISK" : "Accessible"}`,
                  detail1: nh6Status === "blocked" ? "Cutoff at KM 48 Nongpoh (Severe Flooding)" : "Clearance: 98% • Speed: 58 km/h",
                  detail2: "Primary Meghalaya Gateway • Alternative: Route B via Jowai",
                  x: e.clientX,
                  y: e.clientY
                })
              }
            >
              {/* Casing */}
              <path d="M 410,285 L 450,325 L 470,360" fill="none" stroke="#ffffff" strokeWidth="10" strokeLinecap="round" />
              {/* Road Fill */}
              <path
                d="M 410,285 L 450,325 L 470,360"
                fill="none"
                stroke={nh6Status === "blocked" ? "#dc2626" : nh6Status === "at_risk" ? "#d97706" : "#15803d"}
                strokeWidth="6"
                strokeDasharray={nh6Status === "blocked" ? "5,4" : nh6Status === "at_risk" ? "7,4" : "none"}
                strokeLinecap="round"
              />
              {/* Highway Shield */}
              <g transform="translate(436, 318)" filter="url(#shield-shadow)">
                <rect
                  x="-16"
                  y="-9"
                  width="32"
                  height="18"
                  rx="5"
                  fill="#ffffff"
                  stroke={nh6Status === "blocked" ? "#dc2626" : nh6Status === "at_risk" ? "#d97706" : "#15803d"}
                  strokeWidth="1.5"
                />
                <text
                  x="0"
                  y="3.5"
                  textAnchor="middle"
                  className={`text-[9px] font-bold font-mono ${
                    nh6Status === "blocked" ? "fill-[#dc2626]" : nh6Status === "at_risk" ? "fill-[#d97706]" : "fill-[#15803d]"
                  }`}
                >
                  NH-6
                </text>
              </g>
            </g>
          )}

          {/* 3. NH-29 (Dimapur to Kohima Hill Pass) */}
          {isCorridorVisible("at_risk") && (
            <g
              className="cursor-pointer group"
              onMouseEnter={(e) =>
                setTooltip({
                  title: "NH-29 (Dimapur-Kohima Pass)",
                  subtitle: "Status: At Risk (65% Clearance)",
                  detail1: "Heavy rainfall & slope runoff advisory",
                  detail2: "Speed restricted to 26 km/h",
                  x: e.clientX,
                  y: e.clientY
                })
              }
            >
              <path d="M 720,330 L 805,335 L 850,375" fill="none" stroke="#ffffff" strokeWidth="9" strokeLinecap="round" />
              <path d="M 720,330 L 805,335 L 850,375" fill="none" stroke="#d97706" strokeWidth="5" strokeDasharray="7,5" strokeLinecap="round" />
              <g transform="translate(775, 335)" filter="url(#shield-shadow)">
                <rect x="-17" y="-9" width="34" height="18" rx="5" fill="#ffffff" stroke="#d97706" strokeWidth="1.5" />
                <text x="0" y="3.5" textAnchor="middle" className="text-[9px] fill-[#d97706] font-bold font-mono">
                  NH-29
                </text>
              </g>
            </g>
          )}

          {/* 4. NH-10 (Siliguri - Gangtok) */}
          {isCorridorVisible("at_risk") && (
            <g
              className="cursor-pointer group"
              onMouseEnter={(e) =>
                setTooltip({
                  title: "NH-10 (Sevoke-Gangtok)",
                  subtitle: "Status: At Risk (70% Clearance)",
                  detail1: "Teesta Gorge saturation warning",
                  detail2: "Speed: 31 km/h",
                  x: e.clientX,
                  y: e.clientY
                })
              }
            >
              <path d="M 120,220 L 155,160 L 165,115" fill="none" stroke="#ffffff" strokeWidth="9" strokeLinecap="round" />
              <path d="M 120,220 L 155,160 L 165,115" fill="none" stroke="#d97706" strokeWidth="5" strokeDasharray="6,4" strokeLinecap="round" />
              <g transform="translate(142, 180)" filter="url(#shield-shadow)">
                <rect x="-16" y="-9" width="32" height="18" rx="5" fill="#ffffff" stroke="#d97706" strokeWidth="1.5" />
                <text x="0" y="3.5" textAnchor="middle" className="text-[9px] fill-[#d97706] font-bold font-mono">
                  NH-10
                </text>
              </g>
            </g>
          )}

          {/* 5. NH-13 (Trans-Arunachal Bomdila-Tawang) */}
          {isCorridorVisible("blocked") && (
            <g
              className="cursor-pointer group"
              onMouseEnter={(e) =>
                setTooltip({
                  title: "NH-13 (Bomdila Sector)",
                  subtitle: "Status: BLOCKED (0% Clearance)",
                  detail1: "Severe mudslide KM 48. Both lanes cut.",
                  detail2: "Project Vartak clearing in progress",
                  x: e.clientX,
                  y: e.clientY
                })
              }
            >
              <path d="M 440,210 L 400,165 L 360,110" fill="none" stroke="#ffffff" strokeWidth="10" strokeLinecap="round" />
              <path d="M 440,210 L 400,165 L 360,110" fill="none" stroke="#dc2626" strokeWidth="6" strokeDasharray="5,4" strokeLinecap="round" />
              <g transform="translate(415, 185)" filter="url(#shield-shadow)">
                <rect x="-16" y="-9" width="32" height="18" rx="5" fill="#ffffff" stroke="#dc2626" strokeWidth="1.5" />
                <text x="0" y="3.5" textAnchor="middle" className="text-[9px] fill-[#dc2626] font-bold font-mono">
                  NH-13
                </text>
              </g>
            </g>
          )}

          {/* 6. NH-37 (Upper Assam) */}
          {isCorridorVisible("accessible") && (
            <g className="cursor-pointer group">
              <path d="M 590,280 L 730,250 L 830,225 L 895,220" fill="none" stroke="#ffffff" strokeWidth="9" strokeLinecap="round" />
              <path d="M 590,280 L 730,250 L 830,225 L 895,220" fill="none" stroke="#15803d" strokeWidth="5" strokeLinecap="round" />
              <g transform="translate(740, 248)" filter="url(#shield-shadow)">
                <rect x="-17" y="-9" width="34" height="18" rx="5" fill="#ffffff" stroke="#15803d" strokeWidth="1.5" />
                <text x="0" y="3.5" textAnchor="middle" className="text-[9px] fill-[#15803d] font-bold font-mono">
                  NH-37
                </text>
              </g>
            </g>
          )}

          {/* 7. NH-8 (Tripura Spine) */}
          {isCorridorVisible("accessible") && (
            <g className="cursor-pointer group">
              <path d="M 710,430 L 670,450 L 640,490 L 625,540" fill="none" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" />
              <path d="M 710,430 L 670,450 L 640,490 L 625,540" fill="none" stroke="#15803d" strokeWidth="4.5" strokeLinecap="round" />
              <g transform="translate(648, 480)" filter="url(#shield-shadow)">
                <rect x="-15" y="-8" width="30" height="16" rx="4" fill="#ffffff" stroke="#15803d" strokeWidth="1.5" />
                <text x="0" y="3.5" textAnchor="middle" className="text-[8px] fill-[#15803d] font-bold font-mono">
                  NH-8
                </text>
              </g>
            </g>
          )}

          {/* ================= REGIONAL LOGISTICS HUBS (GOOGLE MAPS PIN STYLING) ================= */}
          {/* Guwahati Gateway Hub */}
          <g
            className="cursor-pointer"
            transform="translate(410, 285)"
            filter="url(#marker-shadow)"
            onMouseEnter={(e) =>
              setTooltip({
                title: "Guwahati Gateway Hub [GAU-01]",
                subtitle: "Assam Multi-modal Hub",
                detail1: "Active Transponders: 48 units",
                detail2: "Major ICD & Rail Head Depot",
                x: e.clientX,
                y: e.clientY
              })
            }
          >
            <circle r="12" fill="#003356" opacity="0.15" />
            <circle r="7" fill="#003356" stroke="#ffffff" strokeWidth="2.5" />
            <rect x="10" y="-18" width="118" height="22" rx="6" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <text x="16" y="-3.5" className="text-[11px] fill-[#003356] font-bold">Guwahati [GAU-01]</text>
          </g>

          {/* Shillong */}
          <g
            className="cursor-pointer"
            transform="translate(470, 360)"
            filter="url(#marker-shadow)"
            onMouseEnter={(e) =>
              setTooltip({
                title: "Shillong Logistics Node",
                subtitle: "Meghalaya State Hub",
                detail1: "Destination for Medical Supply FW-18",
                detail2: "Elevation: 1,525m",
                x: e.clientX,
                y: e.clientY
              })
            }
          >
            <circle r="9" fill="#005148" opacity="0.15" />
            <circle r="6" fill="#005148" stroke="#ffffff" strokeWidth="2" />
            <rect x="10" y="-12" width="76" height="20" rx="6" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <text x="16" y="2" className="text-[10px] fill-[#005148] font-bold">Shillong Node</text>
          </g>

          {/* Dibrugarh */}
          <g className="cursor-pointer" transform="translate(895, 220)">
            <circle r="6" fill="#003356" stroke="#ffffff" strokeWidth="2" />
            <rect x="-86" y="-11" width="78" height="19" rx="5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <text x="-80" y="2.5" className="text-[10px] fill-[#003356] font-bold">Dibrugarh Hub</text>
          </g>

          {/* Silchar */}
          <g className="cursor-pointer" transform="translate(710, 430)">
            <circle r="6" fill="#003356" stroke="#ffffff" strokeWidth="2" />
            <rect x="10" y="-10" width="58" height="18" rx="5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <text x="16" y="2.5" className="text-[10px] fill-slate-800 font-bold">Silchar</text>
          </g>

          {/* Kohima */}
          <g className="cursor-pointer" transform="translate(850, 375)">
            <circle r="6" fill="#d97706" stroke="#ffffff" strokeWidth="2" />
            <rect x="10" y="-10" width="60" height="18" rx="5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <text x="16" y="2.5" className="text-[10px] fill-slate-800 font-bold">Kohima</text>
          </g>

          {/* Imphal */}
          <g className="cursor-pointer" transform="translate(840, 460)">
            <circle r="6" fill="#003356" stroke="#ffffff" strokeWidth="2" />
            <rect x="10" y="-10" width="56" height="18" rx="5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <text x="16" y="2.5" className="text-[10px] fill-slate-800 font-bold">Imphal</text>
          </g>

          {/* Aizawl */}
          <g className="cursor-pointer" transform="translate(740, 560)">
            <circle r="6" fill="#003356" stroke="#ffffff" strokeWidth="2" />
            <rect x="10" y="-10" width="56" height="18" rx="5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <text x="16" y="2.5" className="text-[10px] fill-slate-800 font-bold">Aizawl</text>
          </g>

          {/* Agartala */}
          <g className="cursor-pointer" transform="translate(625, 540)">
            <circle r="6" fill="#003356" stroke="#ffffff" strokeWidth="2" />
            <rect x="-80" y="-10" width="72" height="18" rx="5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <text x="-74" y="2.5" className="text-[10px] fill-slate-800 font-bold">Agartala</text>
          </g>

          {/* ================= HAZARD MARKERS (CLEAN HIGHWAY ALERT PINS) ================= */}
          {/* Landslide at Bomdila NH-13 */}
          <g
            className="cursor-pointer"
            transform="translate(385, 145)"
            filter="url(#marker-shadow)"
            onMouseEnter={(e) =>
              setTooltip({
                title: "LANDSLIDE: NH-13 Bomdila Sector",
                subtitle: "Status: High Severity Blockade",
                detail1: "Carriageway cutoff 65m • BRO Patrol on site",
                detail2: "Clearance ETA: 4–6 Hours",
                x: e.clientX,
                y: e.clientY
              })
            }
          >
            <circle r="14" fill="#fee2e2" opacity="0.85" />
            <circle r="8" fill="#dc2626" stroke="#ffffff" strokeWidth="1.5" />
            <path d="M -3,-3 L 3,3 M 3,-3 L -3,3" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            <rect x="14" y="-12" width="130" height="22" rx="6" fill="#991b1b" />
            <text x="20" y="2.5" className="text-[9px] fill-[#ffffff] font-bold tracking-tight">
              LANDSLIDE: NH-13 CUT
            </text>
          </g>

          {/* Weather Alert at Kohima Pass NH-29 */}
          <g
            className="cursor-pointer"
            transform="translate(825, 355)"
            filter="url(#marker-shadow)"
            onMouseEnter={(e) =>
              setTooltip({
                title: "WEATHER WARNING: NH-29 Kohima",
                subtitle: "Slope Runoff & Culvert Overtopping",
                detail1: "Speed restricted to 20 km/h",
                detail2: "Nagaland SDRF stream gauge monitoring",
                x: e.clientX,
                y: e.clientY
              })
            }
          >
            <circle r="13" fill="#fef3c7" opacity="0.9" />
            <polygon points="0,-7 7,5 -7,5" fill="#d97706" stroke="#ffffff" strokeWidth="1" />
            <text x="-1.5" y="4" className="text-[8px] fill-[#ffffff] font-bold">!</text>
            <rect x="12" y="-10" width="105" height="19" rx="5" fill="#ffffff" stroke="#d97706" strokeWidth="1.5" />
            <text x="18" y="2.5" className="text-[9px] fill-[#b45309] font-bold">NH-29 Rain Alert</text>
          </g>

          {/* Flash Flood marker on NH-6 if flooded */}
          {nh6Status === "blocked" && (
            <g
              className="cursor-pointer animate-bounce"
              transform="translate(442, 335)"
              filter="url(#marker-shadow)"
              onMouseEnter={(e) =>
                setTooltip({
                  title: "CRITICAL FLASH FLOOD: NH-6 KM 48",
                  subtitle: "Inundation depth: 1.5m",
                  detail1: "FW-18 Medical Truck halted",
                  detail2: "Reroute to Route B (Jowai) recommended",
                  x: e.clientX,
                  y: e.clientY
                })
              }
            >
              <circle r="17" fill="#fee2e2" opacity="0.9" />
              <circle r="9" fill="#dc2626" stroke="#ffffff" strokeWidth="2" />
              <path d="M -4,-4 L 4,4 M 4,-4 L -4,4" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
              <rect x="16" y="-12" width="140" height="24" rx="6" fill="#dc2626" />
              <text x="22" y="3.5" className="text-[9px] fill-[#ffffff] font-bold">
                FLASH FLOOD: NH-6 BLOCKED
              </text>
            </g>
          )}

          {/* ================= GOOGLE MAPS-STYLE "MY LOCATION" BLUE GPS DOT ================= */}
          {userGpsLocation && (
            <g
              className="cursor-pointer group"
              transform="translate(450, 325)"
              filter="url(#marker-shadow)"
              onMouseEnter={(e) =>
                setTooltip({
                  title: "You (Field Officer Ground Terminal)",
                  subtitle: `Status: ${userGpsLocation.isLive ? "Live GPS Streaming" : "Last Known Location"}`,
                  detail1: `Coordinates: ${userGpsLocation.lat.toFixed(4)}°N, ${userGpsLocation.lng.toFixed(4)}°E (±${userGpsLocation.accuracy}m)`,
                  detail2: userGpsLocation.readableLocation || "Nongpoh Sector (KM 48)",
                  x: e.clientX,
                  y: e.clientY
                })
              }
            >
              {/* Outer pulsing ring */}
              <circle r="20" fill="#38bdf8" opacity="0.3" className="animate-ping" />
              {/* White border halo */}
              <circle r="8.5" fill="#ffffff" />
              {/* Vibrant Google-Blue Center Dot */}
              <circle r="6" fill="#0284c7" />

              {/* Callout Badge */}
              <rect x="12" y="-11" width="108" height="21" rx="6" fill="#0284c7" />
              <text x="18" y="3" className="text-[9px] fill-[#ffffff] font-bold">
                ● You (Live Unit)
              </text>
            </g>
          )}

          {/* ================= LIVE FLEET VEHICLE PINS ================= */}
          {/* Vehicle 1: HV-09 on NH-27 */}
          <g
            className="cursor-pointer transition-transform hover:scale-110"
            transform="translate(520, 274)"
            filter="url(#marker-shadow)"
            onMouseEnter={(e) =>
              setTooltip({
                title: "HV-09 (Heavy Commercial Carrier)",
                subtitle: "Operator: R. Boro • Speed: 64 km/h",
                detail1: "Cargo: Pharma & Cold Storage Vaccines",
                detail2: "Corridor: NH-27 (Assam Central)",
                x: e.clientX,
                y: e.clientY
              })
            }
          >
            <circle r="10" fill="#15803d" opacity="0.25" className="animate-ping" />
            <rect x="-24" y="-10" width="48" height="20" rx="10" fill="#174a73" stroke="#ffffff" strokeWidth="2" />
            <text x="-17" y="3.5" className="text-[9px] fill-[#ffffff] font-bold font-mono">HV-09</text>
          </g>

          {/* Vehicle 2: FW-18 (Flagship Medical Unit) on NH-6 */}
          <g
            className="cursor-pointer transition-transform hover:scale-110"
            transform="translate(442, 318)"
            filter="url(#marker-shadow)"
            onMouseEnter={(e) =>
              setTooltip({
                title: "FW-18 (Flagship Medical Unit)",
                subtitle: `Operator: T. Sangma • ${nh6Status === "blocked" ? "HALTED (Delayed)" : "Speed: 54 km/h"}`,
                detail1: "Consignment: High-Value Critical Medical Supplies",
                detail2: `Current Route: ${nh6Status === "blocked" ? "Route A (Flooded, Switch advised)" : "Route A (Direct NH-6)"}`,
                x: e.clientX,
                y: e.clientY
              })
            }
          >
            {nh6Status === "blocked" && (
              <circle r="13" fill="#dc2626" opacity="0.35" className="animate-ping" />
            )}
            <rect
              x="-22"
              y="-10"
              width="44"
              height="20"
              rx="10"
              fill={nh6Status === "blocked" ? "#ba1a1a" : "#005148"}
              stroke="#ffffff"
              strokeWidth="2"
            />
            <text x="-16" y="3.5" className="text-[9px] fill-[#ffffff] font-bold font-mono">FW-18</text>
          </g>

          {/* Vehicle 3: TW-04 near Tezpur */}
          <g
            className="cursor-pointer transition-transform hover:scale-110"
            transform="translate(615, 275)"
            filter="url(#marker-shadow)"
            onMouseEnter={(e) =>
              setTooltip({
                title: "TW-04 (Express 2W Courier)",
                subtitle: "Operator: K. Das • Speed: 48 km/h",
                detail1: "Cargo: Medical Diagnostics Specimen",
                detail2: "Corridor: NH-27 Bypass",
                x: e.clientX,
                y: e.clientY
              })
            }
          >
            <rect x="-20" y="-9" width="40" height="18" rx="9" fill="#27638c" stroke="#ffffff" strokeWidth="1.5" />
            <text x="-14" y="3.5" className="text-[8px] fill-[#ffffff] font-bold font-mono">TW-04</text>
          </g>

          {/* Vehicle 4: HV-31 on NH-37 */}
          <g
            className="cursor-pointer transition-transform hover:scale-110"
            transform="translate(760, 244)"
            filter="url(#marker-shadow)"
            onMouseEnter={(e) =>
              setTooltip({
                title: "HV-31 (Heavy Container Carrier)",
                subtitle: "Operator: P. Gogoi • Speed: 58 km/h",
                detail1: "Cargo: Agricultural Machinery & Grid Spares",
                detail2: "Corridor: NH-37 (Upper Assam)",
                x: e.clientX,
                y: e.clientY
              })
            }
          >
            <rect x="-24" y="-10" width="48" height="20" rx="10" fill="#174a73" stroke="#ffffff" strokeWidth="2" />
            <text x="-17" y="3.5" className="text-[9px] fill-[#ffffff] font-bold font-mono">HV-31</text>
          </g>

          {/* Vehicle 5: FW-07 on NH-8 */}
          <g
            className="cursor-pointer transition-transform hover:scale-110"
            transform="translate(650, 475)"
            filter="url(#marker-shadow)"
            onMouseEnter={(e) =>
              setTooltip({
                title: "FW-07 (Light Cargo Utility)",
                subtitle: "Operator: B. Debbarma • Speed: 46 km/h",
                detail1: "Cargo: Packaged Essential Provisions",
                detail2: "Corridor: NH-8 (South Silchar)",
                x: e.clientX,
                y: e.clientY
              })
            }
          >
            <rect x="-22" y="-10" width="44" height="20" rx="10" fill="#005148" stroke="#ffffff" strokeWidth="2" />
            <text x="-16" y="3.5" className="text-[9px] fill-[#ffffff] font-bold font-mono">FW-07</text>
          </g>
        </svg>

        {/* Clean Google Maps-Style Tooltip Box */}
        {tooltip && (
          <div
            className="absolute z-30 pointer-events-none p-3.5 bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl max-w-xs border border-slate-700/60 transition-opacity"
            style={{
              left: Math.min(window.innerWidth - 320, tooltip.x - 20),
              top: tooltip.y - 120
            }}
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <strong className="font-bold text-xs text-white tracking-tight">{tooltip.title}</strong>
            </div>
            <p className="text-[11px] text-teal-300 font-semibold leading-tight">{tooltip.subtitle}</p>
            <p className="text-[11px] text-slate-200 mt-1 leading-snug">{tooltip.detail1}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{tooltip.detail2}</p>
          </div>
        )}
      </div>
    </div>
  </div>
  );
};
