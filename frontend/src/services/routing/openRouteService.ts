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
    name: "Shillong Medical Logistics Node",
    lat: 25.5788,
    lng: 91.8933
  }
};

// Fallback high-fidelity route geometries for Guwahati-Shillong corridor
const FALLBACK_ROUTES: CalculatedRoute[] = [
  {
    id: "route-direct",
    name: "Route A — Direct NH-6 Expressway",
    isAlternative: false,
    distanceKm: 98,
    durationMinutes: 135,
    etaFormatted: "2h 15m",
    via: "Guwahati ➔ Khanapara ➔ Nongpoh ➔ Umiam ➔ Shillong",
    summary: "Shortest direct arterial route via NH-6 4-lane corridor",
    coordinates: [
      [26.1445, 91.7362],
      [26.1100, 91.7800],
      [26.0200, 91.8300],
      [25.9000, 91.8800],
      [25.7200, 91.8700],
      [25.6500, 91.8800],
      [25.6100, 91.8900],
      [25.5788, 91.8933]
    ]
  },
  {
    id: "route-bypass",
    name: "Route B — Safe Lowland Bypass (Via Jowai)",
    isAlternative: true,
    distanceKm: 134,
    durationMinutes: 180,
    etaFormatted: "3h 00m",
    via: "Guwahati ➔ Jagiroad ➔ Umsning East ➔ Jowai ➔ Shillong",
    summary: "Weather-safe detour avoiding active flood zones on NH-6 KM 48",
    coordinates: [
      [26.1445, 91.7362],
      [26.1200, 92.0500],
      [26.0800, 92.2000],
      [25.8000, 92.1500],
      [25.5100, 92.2100],
      [25.5300, 92.0500],
      [25.5788, 91.8933]
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
 * Fetch directions from OpenRouteService API or fall back gracefully
 * if no API key is provided or the network call fails.
 */
export async function calculateRoute(
  start: { lat: number; lng: number } = DEFAULT_ENDPOINTS.start,
  destination: { lat: number; lng: number } = DEFAULT_ENDPOINTS.destination
): Promise<CalculatedRoute[]> {
  const apiKey = import.meta.env.VITE_OPENROUTESERVICE_API_KEY?.trim();

  // If no API key configured, use high-fidelity fallback routes
  if (!apiKey) {
    return FALLBACK_ROUTES;
  }

  try {
    const response = await fetch(
      "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
      {
        method: "POST",
        headers: {
          Accept: "application/json, application/geo+json",
          Authorization: apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          coordinates: [
            [start.lng, start.lat],
            [destination.lng, destination.lat]
          ],
          alternative_routes: {
            target_count: 2,
            weight_factor: 1.4
          },
          units: "km"
        })
      }
    );

    if (!response.ok) {
      console.warn(
        `OpenRouteService returned status ${response.status}. Using fallback routes.`
      );
      return FALLBACK_ROUTES;
    }

    const data = await response.json();
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
