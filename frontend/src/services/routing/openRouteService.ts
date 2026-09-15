import axios from "axios";
import { routeAlternativesApi } from "@/services/api/apiClient";

export interface CalculatedRoute {
  id: string;
  name: string;
  isAlternative: boolean;
  distanceKm: number;
  durationMinutes: number;
  etaFormatted: string;
  coordinates: [number, number][]; // [lat, lng] for Leaflet
  via: string;
  summary: string;
  isFlooded?: boolean;
}

export interface RouteEndpoints {
  start: {
    name: string;
    lat: number;
    lng: number;
  };
  destination: {
    name: string;
    lat: number;
    lng: number;
  };
}

export const DEFAULT_ENDPOINTS: RouteEndpoints = {
  start: {
    name: "Guwahati Central Depot [GAU-01]",
    lat: 26.1445,
    lng: 91.7362
  },
  destination: {
    name: "Itanagar Logistics Terminal",
    lat: 27.0844,
    lng: 93.6167
  }
};

// Fallback high-fidelity route geometries for Guwahati-Shillong corridor
const FALLBACK_ROUTES: CalculatedRoute[] = [
  {
    id: "route-direct",
    name: "Route A — Direct Corridor",
    isAlternative: false,
    distanceKm: 294.7,
    durationMinutes: 225,
    etaFormatted: "3h 45m",
    via: "Guwahati ➔ Tezpur ➔ Gohpur ➔ Itanagar",
    summary: "Primary arterial corridor via NH-27 / NH-15",
    coordinates: [
      [26.1445, 91.7362],
      [26.2500, 92.1000],
      [26.6300, 92.8000],
      [26.8500, 93.2000],
      [27.0844, 93.6167]
    ]
  },
  {
    id: "route-bypass",
    name: "Route B — Alternate Lowland Bypass",
    isAlternative: true,
    distanceKm: 320.0,
    durationMinutes: 260,
    etaFormatted: "4h 20m",
    via: "Guwahati ➔ Nagaon ➔ Jorhat Bypass ➔ Itanagar",
    summary: "Weather-safe detour avoiding active flood zones",
    coordinates: [
      [26.1445, 91.7362],
      [26.3500, 92.6800],
      [26.7500, 93.5000],
      [27.0000, 93.7000],
      [27.0844, 93.6167]
    ]
  }
];

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/**
 * Fetch directions from live backend POST /routes/alternatives API using Axios,
 * or fall back gracefully if the network call fails.
 */
export async function calculateRoute(
  start: { lat: number; lng: number } = DEFAULT_ENDPOINTS.start,
  destination: { lat: number; lng: number } = DEFAULT_ENDPOINTS.destination
): Promise<CalculatedRoute[]> {
  try {
    // Primary: Call live backend POST /routes/alternatives with GeoJSON [lng, lat]
    const backendRoutes = await routeAlternativesApi.fetchParsedAlternatives({
      origin: {
        type: "Point",
        coordinates: [start.lng, start.lat]
      },
      destination: {
        type: "Point",
        coordinates: [destination.lng, destination.lat]
      }
    });

    if (backendRoutes && backendRoutes.length > 0) {
      return backendRoutes;
    }
  } catch (err) {
    console.warn("Live backend route alternatives API unavailable, trying fallback:", err);
  }

  const apiKey = import.meta.env.VITE_OPENROUTESERVICE_API_KEY?.trim();

  // If no API key configured, use high-fidelity fallback routes
  if (!apiKey) {
    return FALLBACK_ROUTES;
  }

  try {
    const response = await axios.post<{
      features?: Array<{
        geometry: { coordinates: [number, number][] };
        properties: { summary?: { distance: number; duration: number } };
      }>;
    }>(
      "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
      {
        coordinates: [
          [start.lng, start.lat],
          [destination.lng, destination.lat]
        ],
        alternative_routes: {
          target_count: 2,
          weight_factor: 1.4
        },
        units: "km"
      },
      {
        timeout: 6000,
        headers: {
          Accept: "application/json, application/geo+json",
          Authorization: apiKey,
          "Content-Type": "application/json"
        }
      }
    );

    const data = response.data;
    if (!data.features || !Array.isArray(data.features) || data.features.length === 0) {
      return FALLBACK_ROUTES;
    }

    // Parse features into CalculatedRoute format
    const routes: CalculatedRoute[] = data.features.map(
      (feature: {
        geometry: { coordinates: [number, number][] };
        properties: { summary?: { distance: number; duration: number } };
      }, index: number) => {
        // ORS coordinates are [lng, lat] or [lng, lat, alt] -> map to [lat, lng]
        const leafCoords: [number, number][] = feature.geometry.coordinates.map(
          (pt: [number, number]) => [pt[1], pt[0]]
        );

        const summary = feature.properties?.summary;
        const distKm = summary?.distance
          ? Math.round(summary.distance)
          : index === 0
          ? 98
          : 134;
        const durSec = summary?.duration || (index === 0 ? 8100 : 10800);
        const durMin = Math.round(durSec / 60);

        const isAlt = index > 0;
        return {
          id: isAlt ? "route-bypass" : "route-direct",
          name: isAlt
            ? "Route B — Safe Lowland Bypass (Via Jowai)"
            : "Route A — Direct NH-6 Expressway",
          isAlternative: isAlt,
          distanceKm: distKm,
          durationMinutes: durMin,
          etaFormatted: formatDuration(durMin),
          via: isAlt
            ? "Guwahati ➔ Jagiroad ➔ Jowai ➔ Shillong"
            : "Guwahati ➔ Nongpoh ➔ Umiam ➔ Shillong",
          summary: isAlt
            ? "Alternative routing via eastern lowlands"
            : "Direct high-speed corridor via NH-6",
          coordinates: leafCoords
        };
      }
    );

    // If only 1 route was returned by ORS, append fallback alternative
    if (routes.length === 1) {
      routes.push(FALLBACK_ROUTES[1]);
    }

    return routes;
  } catch (err) {
    console.warn("Failed to query OpenRouteService directions:", err);
    return FALLBACK_ROUTES;
  }
}
