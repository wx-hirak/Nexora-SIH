import type { DataProvider } from "../dataProvider";
import type {
  DataSnapshot,
  DataPatch,
  Incident,
  NewIncidentInput,
  Shipment
} from "@/types/domain";

/**
 * LiveApiProvider:
 * Connects to the backend REST + WebSocket API once deployed.
 * Swappable with zero component code changes via VITE_DATA_SOURCE=live.
 */
export class LiveApiProvider implements DataProvider {
  private baseUrl: string;
  private wsUrl: string;
  private ws: WebSocket | null = null;
  private subscribers: Set<(patch: DataPatch) => void> = new Set();

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    this.wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:8000/ws";
  }

  public async connect(): Promise<DataSnapshot> {
    try {
      const res = await fetch(`${this.baseUrl}/api/snapshot`);
      if (!res.ok) throw new Error(`Failed to fetch snapshot: ${res.statusText}`);
      return await res.json();
    } catch (err) {
      console.warn("LiveApiProvider connect failed, check backend availability:", err);
      throw err;
    }
  }

  public subscribe(onPatch: (patch: DataPatch) => void): () => void {
    this.subscribers.add(onPatch);

    if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
      try {
        this.ws = new WebSocket(this.wsUrl);
        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.subscribers.forEach((cb) => cb(data));
          } catch (e) {
            console.error("Malformed realtime patch:", e);
          }
        };
      } catch (e) {
        console.warn("WebSocket connection failed:", e);
      }
    }

    return () => {
      this.subscribers.delete(onPatch);
    };
  }

  public async submitIncident(input: NewIncidentInput): Promise<Incident> {
    const res = await fetch(`${this.baseUrl}/api/incidents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });
    if (!res.ok) throw new Error("Incident submission failed");
    return res.json();
  }

  public async requestReroute(shipmentId: string, routeId: string): Promise<Shipment> {
    const res = await fetch(`${this.baseUrl}/api/shipments/${shipmentId}/reroute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ routeId })
    });
    if (!res.ok) throw new Error("Reroute request failed");
    return res.json();
  }

  public async triggerDemoEvent(event: "heavy_rainfall" | "reset"): Promise<void> {
    await fetch(`${this.baseUrl}/api/demo/trigger`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event })
    }).catch(() => {});
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscribers.clear();
  }
}

export const liveApiProvider = new LiveApiProvider();
