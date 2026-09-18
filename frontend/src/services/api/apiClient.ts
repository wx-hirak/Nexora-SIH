import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosError } from "axios";
import { getApiConfig, type PingResult } from "../apiConfig";
import type {
  DataSnapshot,
  Incident,
  NewIncidentInput,
  Shipment,
  Vehicle,
  RoadSegment,
  RouteOption,
  Alert,
  WeatherSnapshot,
  KpiSummary
} from "@/types/domain";
import { reverseGeocodeCoordinates } from "@/services/mock/driversData";

/**
 * Centralized Axios instance for all NER Logistics API requests.
 */
export const apiClient: AxiosInstance = axios.create({
  timeout: 8000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json"
  }
});

// Dynamic BaseURL & Auth Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    // When running in the browser on the Vite dev server (port 3000),
    // route requests through the local dev server proxy to completely eliminate CORS OPTIONS preflight requests!
    if (!config.baseURL) {
      if (typeof window !== "undefined" && (window.location.port === "3000" || window.location.hostname === "localhost")) {
        config.baseURL = "";
      } else {
        config.baseURL = getApiConfig().httpUrl;
      }
    }

    // Do NOT inject auth tokens on auth routes (/auth/signin, /auth/signup) to keep requests lightweight
    const isAuthRoute = typeof config.url === "string" && config.url.includes("/auth");
    if (!isAuthRoute) {
      const token = localStorage.getItem("ner_auth_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
        config.headers["x-access-token"] = token;
        config.headers.token = token;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for Logging and Pre-formatting
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Log structured error for debugging
    if (error.response) {
      console.warn(
        `[API] ${error.config?.method?.toUpperCase()} ${error.config?.url} failed with status ${error.response.status}:`,
        error.response.data
      );
    } else if (error.request) {
      console.warn(
        `[API] No response received from server for ${error.config?.method?.toUpperCase()} ${error.config?.url}`
      );
    }
    return Promise.reject(error);
  }
);

/**
 * Adaptive HTTP request helpers supporting routes both with and without /api/ prefix
 */
async function getAdaptive<T>(primaryPath: string, fallbackPath: string, config?: AxiosRequestConfig): Promise<T> {
  try {
    const res = await apiClient.get<T>(primaryPath, config);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      const res = await apiClient.get<T>(fallbackPath, config);
      return res.data;
    }
    throw err;
  }
}

async function postAdaptive<T>(primaryPath: string, fallbackPath: string, body: unknown, config?: AxiosRequestConfig): Promise<T> {
  try {
    const res = await apiClient.post<T>(primaryPath, body, config);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      const res = await apiClient.post<T>(fallbackPath, body, config);
      return res.data;
    }
    throw err;
  }
}

/**
 * Robust error message extractor for Axios errors
 */
export function formatAxiosError(err: unknown, fallbackMessage = "API request failed"): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    if (typeof data === "string" && data.trim()) {
      return data;
    }
    if (data && typeof data === "object") {
      const record = data as Record<string, unknown>;
      if (typeof record.message === "string") return record.message;
      if (typeof record.error === "string") return record.error;
      if (typeof record.detail === "string") return record.detail;
    }
    if (err.code === "ECONNABORTED") {
      return "Request timed out. The backend server took too long to reply.";
    }
    if (!err.response) {
      return "Unable to connect to the backend server. Server may be offline or unreachable.";
    }
    return `Server returned error (${err.response.status}): ${err.response.statusText}`;
  }

  if (err instanceof Error) {
    return err.message;
  }

  return fallbackMessage;
}

/* =======================================================================
   SEPARATED MODULAR API CALLS (Kept strictly outside UI components)
   ======================================================================= */

/**
 * Health & Ping API
 */
export const healthApi = {
  async ping(customBaseUrl?: string, timeoutMs = 4500): Promise<PingResult> {
    const baseURL = customBaseUrl ? customBaseUrl : getApiConfig().httpUrl;
    const startTime = performance.now();

    const testEndpoints = ["/snapshot", "/api/snapshot", "/health", "/api/health", "/vehicles", "/"];

    for (const ep of testEndpoints) {
      try {
        const res = await axios.get(`${baseURL}${ep}`, {
          timeout: timeoutMs,
          headers: { Accept: "application/json, text/plain, */*" }
        });

        return {
          reachable: true,
          latencyMs: Math.round(performance.now() - startTime),
          status: res.status,
          endpointTested: ep || "/"
        };
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response) {
          // A response with status code (even 401, 403, 404) proves server is reachable!
          return {
            reachable: true,
            latencyMs: Math.round(performance.now() - startTime),
            status: err.response.status,
            endpointTested: ep || "/"
          };
        }
      }
    }

    return {
      reachable: false,
      latencyMs: Math.round(performance.now() - startTime),
      error: `Could not reach ${baseURL}. Check network connection, firewall, and server status.`
    };
  }
};

/**
 * Snapshot API (consolidated state)
 */
export const snapshotApi = {
  async getSnapshot(config?: AxiosRequestConfig): Promise<DataSnapshot> {
    const data = await getAdaptive<DataSnapshot | { data: DataSnapshot }>("/snapshot", "/api/snapshot", config);
    if (data && typeof data === "object" && "data" in data) {
      return (data as { data: DataSnapshot }).data;
    }
    return data as DataSnapshot;
  }
};

/**
 * Incidents API
 */
export const incidentApi = {
  async getAll(config?: AxiosRequestConfig): Promise<Incident[]> {
    const d = await getAdaptive<Incident[] | { data: Incident[] }>("/incidents", "/api/incidents", config);
    return (Array.isArray(d) ? d : (d as { data: Incident[] })?.data || []) as Incident[];
  },

  async create(input: NewIncidentInput, config?: AxiosRequestConfig): Promise<Incident> {
    const d = await postAdaptive<Incident | { data: Incident } | { incident: Incident }>(
      "/incidents",
      "/api/incidents",
      input,
      config
    );
    if (d && typeof d === "object") {
      if ("data" in d) return (d as { data: Incident }).data;
      if ("incident" in d) return (d as { incident: Incident }).incident;
    }
    return d as Incident;
  }
};

export interface BackendShipmentItem {
  _id?: string;
  id?: string;
  trackingNumber?: string;
  origin?: {
    type?: string;
    coordinates?: [number, number]; // [lng, lat]
  } | string;
  destination?: {
    type?: string;
    coordinates?: [number, number]; // [lng, lat]
  } | string;
  weightKg?: number;
  priority?: "HIGH" | "MEDIUM" | "LOW" | number;
  status?: string;
  loadType?: string;
  commodity?: string;
  vehicleId?: string;
  driverId?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface CreateShipmentInput {
  origin: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  destination: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  weightKg?: number;
  priority?: 1 | 2 | 3 | "HIGH" | "MEDIUM" | "LOW";
  loadType?: string;
  commodity?: string;
  vehicleId?: string;
  driverId?: string;
  routeId?: string;
  driverName?: string;
  driverPhone?: string;
  driverPhotoUrl?: string;
  vehicleNumber?: string;
  vehicleType?: string;
  pickupTimeIso?: string;
  expectedDeliveryIso?: string;
  receiverContact?: string;
  specialInstructions?: string;
  image?: Blob | File;
  route?: {
    distanceKm: number;
    durationMinutes: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export function transformBackendShipment(raw: BackendShipmentItem, index = 0): Shipment {
  const rawId = raw._id || raw.id || raw.trackingNumber || `SHP-LIVE-${index + 1}`;
  const trackingNumber = raw.trackingNumber || `NXR-${rawId.slice(-8).toUpperCase()}`;

  let originName = "Guwahati";
  let originCoords: [number, number] | undefined = undefined;
  if (raw.origin && typeof raw.origin === "object" && Array.isArray(raw.origin.coordinates)) {
    originCoords = [Number(raw.origin.coordinates[0]), Number(raw.origin.coordinates[1])];
    originName = reverseGeocodeCoordinates(originCoords[0], originCoords[1]);
  } else if (typeof raw.origin === "string") {
    originName = raw.origin;
  }

  let destName = "Shillong";
  let destCoords: [number, number] | undefined = undefined;
  if (raw.destination && typeof raw.destination === "object" && Array.isArray(raw.destination.coordinates)) {
    destCoords = [Number(raw.destination.coordinates[0]), Number(raw.destination.coordinates[1])];
    destName = reverseGeocodeCoordinates(destCoords[0], destCoords[1]);
  } else if (typeof raw.destination === "string") {
    destName = raw.destination;
  }

  const priorityNum: 1 | 2 | 3 =
    raw.priority === "HIGH" || raw.priority === 1
      ? 1
      : raw.priority === "MEDIUM" || raw.priority === 2
      ? 2
      : 3;

  const statusMap: Record<string, "on_time" | "at_risk" | "delayed" | "delivered"> = {
    PENDING: "on_time",
    IN_TRANSIT: "on_time",
    ON_TIME: "on_time",
    AT_RISK: "at_risk",
    DELAYED: "delayed",
    DELIVERED: "delivered"
  };
  const normalizedStatus = (raw.status ? statusMap[raw.status.toUpperCase()] : "on_time") || "on_time";

  return {
    id: rawId,
    rawBackendId: raw._id,
    trackingNumber,
    origin: originName,
    destination: destName,
    originCoordinates: originCoords,
    destinationCoordinates: destCoords,
    vehicleId: (raw.vehicleId as string) || "FW-18",
    priority: priorityNum,
    commodity: raw.loadType || raw.commodity || "Critical Medical Supplies",
    progressPercent: normalizedStatus === "delivered" ? 100 : 18,
    etaIso: raw.createdAt
      ? new Date(new Date(raw.createdAt).getTime() + 4 * 3600 * 1000).toISOString()
      : new Date().toISOString(),
    status: normalizedStatus,
    currentRouteId: `ROUTE-${rawId}`,
    riskScore: priorityNum === 1 ? 0.08 : 0.16,
    driverId: (raw.driverId as string) || "DRV-002",
    driverName: "T. Sangma",
    driverPhone: "+91 94361 78921",
    driverPhotoUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80",
    vehicleNumber: "ML-05-D-2218",
    vehicleType: "Medical Utility 4x4",
    weightKg: typeof raw.weightKg === "number" ? raw.weightKg : 1200
  };
}

/**
 * Shipments & Routes API
 */
export const shipmentApi = {
  /**
   * Fetches shipments from live backend GET /shipments/list (with adaptive fallbacks)
   */
  async getAll(config?: AxiosRequestConfig): Promise<Shipment[]> {
    let rawList: BackendShipmentItem[] = [];

    try {
      const res = await apiClient.get<
        { shipments?: BackendShipmentItem[]; data?: BackendShipmentItem[] } | BackendShipmentItem[]
      >("/shipments/list", config);

      if (Array.isArray(res.data)) {
        rawList = res.data;
      } else if (res.data?.shipments && Array.isArray(res.data.shipments)) {
        rawList = res.data.shipments;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        rawList = res.data.data;
      }
    } catch {
      try {
        const fallback = await getAdaptive<
          BackendShipmentItem[] | { shipments?: BackendShipmentItem[]; data?: BackendShipmentItem[] }
        >("/shipments", "/api/shipments/list", config);

        if (Array.isArray(fallback)) {
          rawList = fallback;
        } else if (fallback && typeof fallback === "object") {
          rawList = fallback.shipments || fallback.data || [];
        }
      } catch (err) {
        console.warn("[ShipmentAPI] Could not fetch live shipments list from backend:", err);
      }
    }

    if (rawList.length > 0) {
      return rawList.map((item, idx) => transformBackendShipment(item, idx));
    }

    return [];
  },

  /**
   * Creates a new shipment via POST /shipments/create (with fallback to /shipments/creat)
   * Sends all required fields expected by req.body:
   * loadType, vehicleId, driverId, routeId, weightKg, priority, route, image, origin, destination
   */
  async create(input: CreateShipmentInput, config?: AxiosRequestConfig): Promise<Shipment> {
    const originGeoJson: GeoJsonPoint = {
      type: "Point",
      coordinates: [Number(input.origin.coordinates[0]), Number(input.origin.coordinates[1])]
    };
    const destinationGeoJson: GeoJsonPoint = {
      type: "Point",
      coordinates: [Number(input.destination.coordinates[0]), Number(input.destination.coordinates[1])]
    };

    // 1. Fetch ORS calculated route from backend alternatives endpoint if not already computed
    let routeSummary = input.route;
    if (!routeSummary) {
      try {
        const altRes = await routeAlternativesApi.fetchParsedAlternatives({
          origin: originGeoJson,
          destination: destinationGeoJson
        });
        if (altRes && altRes.length > 0) {
          routeSummary = {
            distanceKm: altRes[0].distanceKm,
            durationMinutes: altRes[0].durationMinutes
          };
        }
      } catch (err) {
        console.warn("[ShipmentAPI] Pre-fetching ORS route alternatives failed, using distance estimation:", err);
        const distApprox = Math.round(
          Math.hypot(
            destinationGeoJson.coordinates[0] - originGeoJson.coordinates[0],
            destinationGeoJson.coordinates[1] - originGeoJson.coordinates[1]
          ) * 111 * 1.3
        );
        routeSummary = {
          distanceKm: distApprox,
          durationMinutes: Math.round((distApprox / 45) * 60)
        };
      }
    }

    const priorityLabel =
      input.priority === 1 || input.priority === "HIGH"
        ? "HIGH"
        : input.priority === 2 || input.priority === "MEDIUM"
        ? "MEDIUM"
        : "LOW";

    const routeId = input.routeId || `ROUTE-${Date.now()}`;

    // 2. Prepare FormData payload with image file / blob (required <= 45 KB)
    const formData = new FormData();

    if (input.image && input.image instanceof Blob) {
      const fileName = (input.image as File).name || "consignment.jpg";
      formData.append("image", input.image, fileName);
    } else {
      // 1x1 transparent pixel fallback if no image attached
      const transparentPixel =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAA=";
      try {
        const pixelBlob = await fetch(transparentPixel).then((r) => r.blob());
        formData.append("image", pixelBlob, "consignment.png");
      } catch {
        // Fallback
      }
    }

    // Required fields per backend specifications
    formData.append("loadType", input.loadType || input.commodity || "Critical Medical Supplies");
    formData.append("weightKg", String(input.weightKg || 1200));
    formData.append("priority", priorityLabel);
    formData.append("routeId", routeId);
    formData.append("origin", JSON.stringify(originGeoJson));
    formData.append("destination", JSON.stringify(destinationGeoJson));

    if (routeSummary) {
      formData.append("route", JSON.stringify(routeSummary));
    }
    if (input.vehicleId) {
      formData.append("vehicleId", input.vehicleId);
    }
    if (input.driverId) {
      formData.append("driverId", input.driverId);
    }

    // 3. Dispatch to POST /shipments/create (with adaptive fallback to /shipments/creat and /api/shipments/create)
    let createdRaw: unknown = null;
    const postEndpoints = ["/shipments/create", "/shipments/creat", "/api/shipments/create"];
    let lastError: unknown = null;

    for (const ep of postEndpoints) {
      try {
        const res = await apiClient.post(ep, formData, {
          ...config,
          headers: {
            ...config?.headers,
            "Content-Type": "multipart/form-data"
          }
        });
        createdRaw = res.data;
        break;
      } catch (err: unknown) {
        lastError = err;
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          continue; // Try next endpoint spelling if 404
        }
        // If server rejected with 400 or other validation status, rethrow immediately
        throw err;
      }
    }

    if (!createdRaw && lastError) {
      throw lastError;
    }

    // 4. Return transformed shipment from backend response
    const rawObj = (createdRaw && typeof createdRaw === "object" && "shipment" in createdRaw
      ? (createdRaw as { shipment: BackendShipmentItem }).shipment
      : createdRaw && typeof createdRaw === "object" && "data" in createdRaw
      ? (createdRaw as { data: BackendShipmentItem }).data
      : createdRaw) as BackendShipmentItem;

    if (rawObj && typeof rawObj === "object") {
      const transformed = transformBackendShipment(rawObj);
      if (input.driverName) transformed.driverName = input.driverName;
      if (input.driverPhone) transformed.driverPhone = input.driverPhone;
      if (input.vehicleNumber) transformed.vehicleNumber = input.vehicleNumber;
      if (input.vehicleType) transformed.vehicleType = input.vehicleType;
      if (input.specialInstructions) transformed.specialInstructions = input.specialInstructions;
      return transformed;
    }

    // Resilient fallback shipment with reverse geocoding
    const originName = reverseGeocodeCoordinates(originGeoJson.coordinates[0], originGeoJson.coordinates[1]);
    const destName = reverseGeocodeCoordinates(destinationGeoJson.coordinates[0], destinationGeoJson.coordinates[1]);
    return {
      id: `SHP-LIVE-${Date.now().toString().slice(-4)}`,
      origin: originName,
      destination: destName,
      originCoordinates: originGeoJson.coordinates,
      destinationCoordinates: destinationGeoJson.coordinates,
      vehicleId: input.vehicleId || "FW-18",
      priority: (input.priority as 1 | 2 | 3) || 1,
      commodity: input.commodity || "Critical Medical Supplies",
      progressPercent: 0,
      etaIso: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
      status: "on_time",
      currentRouteId: `ROUTE-${Date.now()}`,
      riskScore: 0.08,
      driverId: input.driverId || "DRV-002",
      driverName: input.driverName || "T. Sangma",
      driverPhone: input.driverPhone || "+91 94361 78921",
      driverPhotoUrl:
        input.driverPhotoUrl ||
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80",
      vehicleNumber: input.vehicleNumber || "ML-05-D-2218",
      vehicleType: input.vehicleType || "Medical Utility 4x4",
      specialInstructions: input.specialInstructions
    };
  },

  async reroute(shipmentId: string, routeId: string, config?: AxiosRequestConfig): Promise<Shipment> {
    const d = await postAdaptive<Shipment | { data: Shipment } | { shipment: Shipment }>(
      `/shipments/${shipmentId}/reroute`,
      `/api/shipments/${shipmentId}/reroute`,
      { routeId },
      config
    );
    if (d && typeof d === "object") {
      if ("data" in d) return (d as { data: Shipment }).data;
      if ("shipment" in d) return (d as { shipment: Shipment }).shipment;
    }
    return d as Shipment;
  }
};

/**
 * Vehicles API
 */
export const vehicleApi = {
  async getAll(config?: AxiosRequestConfig): Promise<Vehicle[]> {
    try {
      const res = await apiClient.get<{ vehicles?: unknown[]; data?: unknown[] } | unknown[]>("/vehicle/list", config);
      const list = Array.isArray(res.data) ? res.data : (res.data as { vehicles?: unknown[] })?.vehicles || [];
      if (list && list.length > 0) {
        return list.map((rawItem: unknown, index: number) => {
          const v = (rawItem || {}) as Record<string, unknown>;
          const location = v.currentLocation as { coordinates?: [number, number] } | undefined;
          const coords = location?.coordinates || [91.7362, 26.1445];
          const capacity = typeof v.capacityKg === "number" ? v.capacityKg : 0;
          return {
            id: (v.registrationNumber as string) || (v._id as string) || `VEH-${index + 1}`,
            name: `${(v.model as string) || "Freight Unit"} (${(v.registrationNumber as string) || "NER-TRUCK"})`,
            cargoType: "medical",
            vehicleType: capacity > 10000 ? "heavy" : "four-wheeler",
            lat: coords[1],
            lng: coords[0],
            speedKph: v.status === "AVAILABLE" ? 0 : 54,
            headingDeg: 60,
            status: v.status === "AVAILABLE" ? "idle" : "moving",
            lastUpdated: (v.updatedAt as string) || new Date().toISOString()
          } as Vehicle;
        });
      }
    } catch {
      // Fall back to adaptive get
    }

    const d = await getAdaptive<Vehicle[] | { data: Vehicle[] }>("/vehicles", "/api/vehicles", config).catch(() => []);
    return (Array.isArray(d) ? d : (d as { data: Vehicle[] })?.data || []) as Vehicle[];
  }
};

/**
 * Drivers API
 */
export const driverApi = {
  async getAll(config?: AxiosRequestConfig): Promise<unknown[]> {
    try {
      const res = await apiClient.get<{ drivers?: unknown[]; data?: unknown[] } | unknown[]>("/driver/list", config);
      return Array.isArray(res.data) ? res.data : (res.data as { drivers?: unknown[] })?.drivers || [];
    } catch {
      return [];
    }
  }
};

/**
 * Roads API
 */
export const roadApi = {
  async getAll(config?: AxiosRequestConfig): Promise<RoadSegment[]> {
    const d = await getAdaptive<RoadSegment[] | { data: RoadSegment[] }>("/roads", "/api/roads", config);
    return (Array.isArray(d) ? d : (d as { data: RoadSegment[] })?.data || []) as RoadSegment[];
  }
};

export interface GeoJsonPoint {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

export interface RouteAlternativesRequestBody {
  origin: GeoJsonPoint;
  destination: GeoJsonPoint;
}

export const DEFAULT_ROUTE_COORDINATES: RouteAlternativesRequestBody = {
  origin: {
    type: "Point",
    coordinates: [91.7362, 26.1445] // Guwahati (lng, lat)
  },
  destination: {
    type: "Point",
    coordinates: [93.6167, 27.0844] // Itanagar (lng, lat)
  }
};

export interface ApiRawRouteItem {
  id?: string;
  distanceKm?: number;
  durationMinutes?: number;
  coordinates?: [number, number][]; // [longitude, latitude]
  geometry?: {
    type?: string;
    coordinates?: [number, number][]; // [longitude, latitude]
  };
  name?: string;
  summary?: string;
  via?: string;
  [key: string]: unknown;
}

export interface RouteAlternativesApiResponse {
  routes?: ApiRawRouteItem[];
  data?: {
    routes?: ApiRawRouteItem[];
  };
  [key: string]: unknown;
}

export interface ParsedAlternativeRoute {
  id: string;
  name: string;
  isAlternative: boolean;
  distanceKm: number;
  durationMinutes: number;
  etaFormatted: string;
  coordinates: [number, number][]; // [latitude, longitude] for Leaflet
  rawGeoJsonCoordinates: [number, number][]; // [longitude, latitude]
  summary: string;
  via: string;
  isFlooded?: boolean;
}

/**
 * Format minutes into "Xh Ym"
 */
export function formatMinutesToEta(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m} min`;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/**
 * Robust extractor for coordinates from API responses.
 * Adapts to:
 * - route.coordinates ([ [lng, lat], ... ])
 * - route.geometry.coordinates ([ [lng, lat], ... ])
 * Converts GeoJSON [longitude, latitude] to Leaflet [latitude, longitude].
 */
export function extractLeafletCoordinates(route: ApiRawRouteItem): [number, number][] {
  let rawList: [number, number][] | undefined = undefined;

  if (Array.isArray(route.coordinates) && route.coordinates.length > 0) {
    rawList = route.coordinates;
  } else if (
    route.geometry &&
    Array.isArray(route.geometry.coordinates) &&
    route.geometry.coordinates.length > 0
  ) {
    rawList = route.geometry.coordinates;
  }

  if (!rawList || rawList.length === 0) {
    return [];
  }

  // Convert GeoJSON [longitude, latitude] to Leaflet [latitude, longitude]
  return rawList
    .map((pt) => {
      if (Array.isArray(pt) && pt.length >= 2) {
        const lng = Number(pt[0]);
        const lat = Number(pt[1]);
        if (!isNaN(lat) && !isNaN(lng)) {
          return [lat, lng] as [number, number];
        }
      }
      return null;
    })
    .filter((pt): pt is [number, number] => pt !== null);
}

/**
 * Parses raw API response into a standardized list of ParsedAlternativeRoute objects
 */
export function parseRouteAlternativesResponse(
  rawResponse: RouteAlternativesApiResponse | ApiRawRouteItem[]
): ParsedAlternativeRoute[] {
  let list: ApiRawRouteItem[] = [];

  if (Array.isArray(rawResponse)) {
    list = rawResponse;
  } else if (rawResponse && typeof rawResponse === "object") {
    if (Array.isArray(rawResponse.routes)) {
      list = rawResponse.routes;
    } else if (rawResponse.data && Array.isArray(rawResponse.data.routes)) {
      list = rawResponse.data.routes;
    }
  }

  if (!list || list.length === 0) {
    return [];
  }

  return list.map((item, index) => {
    const leafletCoords = extractLeafletCoordinates(item);
    const rawGeoCoords = (item.coordinates || item.geometry?.coordinates || []) as [number, number][];
    const dist = typeof item.distanceKm === "number" ? Math.round(item.distanceKm * 10) / 10 : 0;
    const dur = typeof item.durationMinutes === "number" ? Math.round(item.durationMinutes) : 0;
    const letter = String.fromCharCode(65 + index); // A, B, C...

    return {
      id: (item.id as string) || `route-${letter.toLowerCase()}-${index}`,
      name: (item.name as string) || `Route ${letter} ${index === 0 ? "(Primary Arterial)" : `(Alternative ${index})`}`,
      isAlternative: index > 0,
      distanceKm: dist,
      durationMinutes: dur,
      etaFormatted: formatMinutesToEta(dur),
      coordinates: leafletCoords,
      rawGeoJsonCoordinates: rawGeoCoords,
      summary: (item.summary as string) || `${dist} km corridor connecting origin and destination`,
      via: (item.via as string) || (index === 0 ? "Guwahati ➔ Tezpur ➔ Itanagar" : `Bypass Corridor ${letter}`)
    };
  });
}

/**
 * Route Alternatives API (POST /routes/alternatives)
 */
export const routeAlternativesApi = {
  /**
   * Raw POST request via Axios
   */
  async getAlternatives(
    body: RouteAlternativesRequestBody = DEFAULT_ROUTE_COORDINATES,
    config?: AxiosRequestConfig
  ): Promise<RouteAlternativesApiResponse> {
    return postAdaptive<RouteAlternativesApiResponse>(
      "/routes/alternatives",
      "/api/routes/alternatives",
      body,
      config
    );
  },

  /**
   * Fetches alternatives and parses coordinates into Leaflet format
   */
  async fetchParsedAlternatives(
    body: RouteAlternativesRequestBody = DEFAULT_ROUTE_COORDINATES,
    config?: AxiosRequestConfig
  ): Promise<ParsedAlternativeRoute[]> {
    const rawData = await this.getAlternatives(body, config);
    return parseRouteAlternativesResponse(rawData);
  }
};

/**
 * Alternate Routes API
 */
export const routeApi = {
  async getAll(config?: AxiosRequestConfig): Promise<RouteOption[]> {
    const d = await getAdaptive<RouteOption[] | { data: RouteOption[] }>("/routes", "/api/routes", config);
    return (Array.isArray(d) ? d : (d as { data: RouteOption[] })?.data || []) as RouteOption[];
  },
  // Export routeAlternativesApi inside routeApi as well for backwards-compatibility
  alternatives: routeAlternativesApi
};

/**
 * Alerts API
 */
export const alertApi = {
  async getAll(config?: AxiosRequestConfig): Promise<Alert[]> {
    const d = await getAdaptive<Alert[] | { data: Alert[] }>("/alerts", "/api/alerts", config);
    return (Array.isArray(d) ? d : (d as { data: Alert[] })?.data || []) as Alert[];
  }
};

/**
 * Weather API
 */
export const weatherApi = {
  async getAll(config?: AxiosRequestConfig): Promise<WeatherSnapshot[]> {
    const d = await getAdaptive<WeatherSnapshot[] | { data: WeatherSnapshot[] }>("/weather", "/api/weather", config);
    return (Array.isArray(d) ? d : (d as { data: WeatherSnapshot[] })?.data || []) as WeatherSnapshot[];
  }
};

/**
 * KPIs API
 */
export const kpiApi = {
  async getKpis(config?: AxiosRequestConfig): Promise<KpiSummary> {
    const d = await getAdaptive<KpiSummary | { data: KpiSummary }>("/kpis", "/api/kpis", config);
    if (d && typeof d === "object" && "data" in d) {
      return (d as { data: KpiSummary }).data;
    }
    return d as KpiSummary;
  }
};

/**
 * Flagship Scenario Demo API
 */
export const demoApi = {
  async triggerEvent(event: "heavy_rainfall" | "reset"): Promise<void> {
    await postAdaptive("/demo/trigger", "/api/demo/trigger", { event }).catch((err) => {
      console.warn("Backend demo trigger was not processed:", err);
    });
  }
};

export interface AuthCredentials {
  email: string;
  password?: string;
  username?: string;
  role?: string;
}

export interface RegisterUserData {
  name: string;
  email: string;
  password?: string;
  role?: string;
  phone?: string;
  username?: string;
}

export interface AuthSuccessPayload {
  token?: string;
  accessToken?: string;
  jwt?: string;
  user?: unknown;
  message?: string;
  [key: string]: unknown;
}

/**
 * Authentication API
 */
export const authApi = {
  /**
   * Primary sign-in method: sends POST to /auth/signin (with adaptive fallback to /auth/login)
   */
  async signin(credentials: AuthCredentials): Promise<AuthSuccessPayload> {
    // Strictly send only email and password as expected by backend route
    const payload = {
      email: credentials.email,
      password: credentials.password
    };

    // Primary target: /auth/signin, fallback: /auth/login if route does not exist
    let rawResponse: unknown;
    try {
      const res = await apiClient.post<AuthSuccessPayload>("/auth/signin", payload);
      rawResponse = res.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        // If route does not exist (404 with HTML / Cannot POST), attempt /auth/login
        const isRouteNotFound =
          err.response?.status === 404 &&
          typeof err.response?.data === "string" &&
          err.response.data.includes("Cannot POST");

        if (isRouteNotFound) {
          const fallbackRes = await apiClient.post<AuthSuccessPayload>("/auth/login", payload);
          rawResponse = fallbackRes.data;
        } else {
          throw err;
        }
      } else {
        throw err;
      }
    }

    // Extract token from various standard backend response structures
    const data = (rawResponse && typeof rawResponse === "object" && "data" in rawResponse
      ? (rawResponse as { data: AuthSuccessPayload }).data
      : rawResponse) as AuthSuccessPayload;

    const token =
      data?.token ||
      data?.accessToken ||
      data?.jwt ||
      (typeof data?.data === "object" && data?.data && "token" in data.data
        ? (data.data as { token?: string }).token
        : undefined);

    if (token && typeof token === "string") {
      localStorage.setItem("ner_auth_token", token);
    }

    return data;
  },

  /**
   * Alias for signin
   */
  async login(credentials: AuthCredentials): Promise<AuthSuccessPayload> {
    return this.signin(credentials);
  },

  /**
   * Sign-up / Register user: sends POST to /auth/signup (with adaptive fallback to /auth/register)
   */
  async signup(data: RegisterUserData): Promise<unknown> {
    try {
      const res = await apiClient.post("/auth/signup", data);
      return res.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const isRouteNotFound =
          err.response?.status === 404 &&
          typeof err.response?.data === "string" &&
          err.response.data.includes("Cannot POST");

        if (isRouteNotFound) {
          const res = await apiClient.post("/auth/register", data);
          return res.data;
        }
      }
      throw err;
    }
  },

  /**
   * Terminate active backend session and delete local JWT
   */
  async logout(): Promise<void> {
    localStorage.removeItem("ner_auth_token");
    try {
      await apiClient.post("/auth/logout", {});
    } catch {
      // Best-effort logout notification
    }
  },

  /**
   * Read stored token
   */
  getToken(): string | null {
    return localStorage.getItem("ner_auth_token");
  },

  /**
   * Check if token is present
   */
  hasToken(): boolean {
    return !!localStorage.getItem("ner_auth_token");
  }
};
