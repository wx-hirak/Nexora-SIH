# Architecture Document
## NER Logistics & Accessibility Intelligence Platform — Web Frontend

**Scope:** this document describes **one repository: the React + Vite web frontend**, built standalone in Antigravity. It does not design the backend, mobile app, or AI/ML service — those are separate tracks owned by teammates. Where the frontend needs to assume something about them (an endpoint, a field name, a real-time mechanism), that assumption is called out explicitly and isolated behind a single adapter file so it can change without touching the rest of the app.

Read alongside `prd.md` (what/why) and `rules.md` (constraints). If code needs to deviate from this doc, update this doc in the same change — don't let it drift silently.

---

## 1. Reconciling the source material

Three prior documents fed into this project and don't fully agree on backend language:

| Source | Backend stack it describes |
|---|---|
| Internal brainstorm notes (`NER_Logistics_Digital_Twin_Complete_Notes.txt`) | Python + FastAPI + PostgreSQL/PostGIS |
| SIH26002 interim-round presentation script (what was actually told to judges) | React/Next.js web + React Native/Expo mobile, **Node.js + Express**, PostgreSQL + Prisma + PostGIS |
| Supporting research paper draft | **TypeScript + Node.js + Express.js**, PostgreSQL + PostGIS |

The team's actual submitted position is Node.js + Express + TypeScript (two of three sources, and the two the team put in front of judges). **This matters to the frontend only in a few narrow ways:** it suggests the API will likely use `camelCase` JSON fields (TypeScript convention) rather than `snake_case` (a Python/FastAPI convention), and that a Node backend is more likely to offer a plain WebSocket or Socket.IO than, say, an ASGI-native solution. Everything else is isolated behind the adapter layer (§7) — if the assumption turns out wrong, one file changes.

**Also note:** the interim slide mentions "React/Next.js" for the web dashboard. Because the user has directly instructed **React + Vite**, this document treats the web app as a Vite-built SPA, not a Next.js app. There's no server-side-rendering requirement for a dashboard behind a role selector, so this is a safe, deliberate deviation, not an oversight.

---

## 2. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework / build | React 18 + Vite | Direct instruction; fast dev loop; no SSR needed for a dashboard app |
| Language | TypeScript | End-to-end type safety for a data-model-heavy app; matches the backend's own TypeScript choice, so shared types translate cleanly later. (If the team prefers plain JS, drop the type annotations — the structure below doesn't change.) |
| Routing | react-router-dom | Standard, minimal, well understood |
| Realtime/domain state | Zustand | Small, explicit store for data that arrives via push (vehicles, roads, incidents, alerts, weather) |
| Request/response state | TanStack Query | Handles the initial snapshot fetch and user-triggered actions (submit report, reroute) with built-in loading/error/retry states — satisfies the error-handling requirements in `rules.md` §3 with little custom code |
| Map | Leaflet + react-leaflet | Lightweight, well-documented, no API key required (OpenStreetMap tiles) |
| Styling | Tailwind CSS | Fast to build a distinctive, non-templated dashboard UI — see §8 for the specific direction |
| Icons | lucide-react | Consistent, tree-shakeable icon set |
| Charts | Recharts | For any KPI/trend visuals (e.g. risk-over-time on a road detail panel) |
| Forms/validation | Zod (client-side only) | Validate the incident-report form before submit; also useful for parsing/typing mock or live API responses defensively |
| i18n | i18next + react-i18next | en/as/hi scaffold, extensible |
| Testing | Vitest + React Testing Library | Fast, Vite-native |
| Tooling | ESLint + Prettier, strict TS config | See `rules.md` for exact conventions |

**Explicitly not used** (see `rules.md` §1 for the full list and rationale): Next.js/Remix, Redux/Redux Toolkit, GraphQL, Kafka/message brokers, GNNs or any ML framework, Mapbox/Google Maps (avoid needing a paid API key), Bootstrap/Material UI or other heavy prebuilt component kits.

---

## 3. High-Level Architecture

```
                    NER LOGISTICS WEB FRONTEND (React + Vite SPA)
                                      |
        +-----------------------------+-----------------------------+
        |                             |                             |
        v                             v                             v
   COMMAND CENTER               OPERATOR DASHBOARD            FIELD REPORTING
   Map + KPIs + Alerts          Shipments + Route compare      Incident form
        |                             |                             |
        +-----------------------------+-----------------------------+
                                      |
                          ZUSTAND DOMAIN STORES
              (vehicles, roads, incidents, shipments, alerts, weather)
                                      |
                    +-----------------+-----------------+
                    |                                   |
              TanStack Query                     useLiveUpdates()
        (initial snapshot, mutations)         (push-based patches)
                    |                                   |
                    v                                   v
                          DATA PROVIDER  (single interface)
                    +-----------------+-----------------+
                    |                                   |
             MockDataProvider                    LiveApiProvider
        (setInterval simulation,               (REST + WebSocket to
         seeded NER data, no                    the real backend, once
         network calls at all)                   it exists)
```

Only the box at the bottom right (`LiveApiProvider`) knows anything about the real backend. Every component, store, and page above it only ever talks to the `DataProvider` interface.

### Request/data flow

```
App start
  -> DataProviderContext picks Mock or Live based on VITE_DATA_SOURCE
  -> TanStack Query calls provider.connect() for the initial snapshot
  -> snapshot seeds each Zustand store
  -> useLiveUpdates() calls provider.subscribe(patch => storesApplyPatch(patch))
  -> UI renders from stores; map/KPIs/alerts re-render as patches arrive

User action (e.g. submit incident report)
  -> TanStack Query mutation calls provider.submitIncident(input)
  -> on success, the new Incident is pushed into incidentStore directly
     (don't wait for a round-trip patch — see rules.md §3 for why)
```

---

## 4. Assumed API Contract (for `LiveApiProvider`, confirm with backend teammate)

This is what the frontend *assumes* the real backend will expose. It is a guess made explicit so it can be corrected in one file. See `prd.md` §10 for the open questions this depends on.

**REST:**
```
GET  /api/snapshot                        -> DataSnapshot (full initial state)
GET  /api/vehicles | /roads | /incidents | /shipments | /alerts | /weather
POST /api/incidents                       { NewIncidentInput }  -> Incident
POST /api/shipments/:id/reroute           { routeId: string }   -> Shipment
POST /api/demo/trigger                    { event: "heavy_rainfall" | "reset" }  (demo helper; optional on the real backend — MockDataProvider always supports it)
POST /api/auth/login                      { role: string }      (stub; real auth design is the backend's call)
```

**Realtime (transport unconfirmed — see `prd.md` §10):**
```
Connect: ws://<host>/ws   (placeholder; swap to socket.io-client here if the backend uses Socket.IO)
Server -> client messages:
  { "type": "vehicle:update",      "payload": Partial<Vehicle> & { id: string } }
  { "type": "road:statusChange",   "payload": Partial<RoadSegment> & { id: string } }
  { "type": "incident:new",        "payload": Incident }
  { "type": "shipment:update",     "payload": Partial<Shipment> & { id: string } }
  { "type": "alert:new",           "payload": Alert }
  { "type": "weather:update",      "payload": WeatherSnapshot }
```
If this turns out wrong, only `src/services/live/liveApiProvider.ts` should need to change.

---

## 5. Domain Data Model (canonical TypeScript types)

Lives in `src/types/domain.ts`. Both `MockDataProvider` and `LiveApiProvider` must produce data shaped exactly like this — it is the one contract every component is written against.

```ts
export type AccessibilityStatus = "accessible" | "at_risk" | "blocked" | "under_observation";
export type Severity = "low" | "medium" | "high";
export type AlertSeverity = "info" | "warning" | "critical";

export interface RoadSegment {
  id: string;
  name: string;
  geometry: [number, number][];       // [lat, lng] polyline points
  roadType: "national_highway" | "state_highway" | "district_road" | "railway" | "waterway";
  status: AccessibilityStatus;
  accessibilityScore: number;         // 0-100
  floodRisk: number;                  // 0-1
  landslideRisk: number;              // 0-1
  trafficLevel: "low" | "medium" | "high";
  lastUpdated: string;                // ISO timestamp
  confidence: number;                 // 0-1
  source: string;                     // "weather" | "field_report" | "seed" | "mock" | ...
}

export interface Vehicle {
  id: string;
  name: string;
  cargoType: "medical" | "food" | "construction" | "general";
  lat: number;
  lng: number;
  speedKph: number;
  headingDeg: number;
  status: "moving" | "idle" | "delayed" | "stopped";
  currentRouteId?: string;
  shipmentId?: string;
  etaIso?: string;
  riskScore?: number;                 // 0-1
  lastUpdated: string;
}

export interface Incident {
  id: string;
  type: "flood" | "landslide" | "road_blocked" | "accident" | "bridge_damage" | "traffic" | "other";
  severity: Severity;
  lat: number;
  lng: number;
  affectedRoadId?: string;
  description: string;
  photoUrl?: string;
  reportedBy?: string;
  createdAt: string;
  status: "pending" | "verified" | "resolved";
  syncStatus?: "synced" | "pending_sync";   // for the simulated offline flow, FR-14
}

export type NewIncidentInput = Omit<Incident, "id" | "createdAt" | "status" | "syncStatus">;

export interface Shipment {
  id: string;
  origin: string;
  destination: string;
  vehicleId: string;
  priority: 1 | 2 | 3;                // 1 = highest, e.g. medicine
  commodity: string;
  progressPercent: number;
  etaIso: string;
  status: "on_time" | "at_risk" | "delayed" | "delivered";
  currentRouteId: string;
}

export interface RouteOption {
  id: string;
  shipmentId?: string;
  distanceKm: number;
  estimatedMinutes: number;
  riskScore: number;                  // 0-1
  disruptionProbability: number;      // 0-1
  geometry: [number, number][];
  recommended: boolean;
}

export interface Alert {
  id: string;
  type: "flood_risk" | "road_blocked" | "delivery_delay" | "landslide" | "congestion" | "other";
  severity: AlertSeverity;
  message: string;
  relatedRoadId?: string;
  relatedVehicleId?: string;
  createdAt: string;
  acknowledged: boolean;
}

export interface WeatherSnapshot {
  location: string;
  lat: number;
  lng: number;
  rainfallMm: number;
  temperatureC: number;
  windKph: number;
  warningLevel: "none" | "watch" | "warning" | "severe";
  forecastSummary: string;
  timestamp: string;
}

export interface KpiSummary {
  activeVehicles: number;
  activeIncidents: number;
  atRiskRoutes: number;
  blockedRoutes: number;
  highPriorityShipments: number;
}

export interface DataSnapshot {
  vehicles: Vehicle[];
  roads: RoadSegment[];
  incidents: Incident[];
  shipments: Shipment[];
  alerts: Alert[];
  weather: WeatherSnapshot[];
}

export type DataPatch = Partial<DataSnapshot>;
```

### Accessibility score — v1 formula (for the mock engine; display-only in this frontend)
The score shown on any road/route should be explainable to a judge on request, matching the team's own positioning against black-box claims:

| Factor | Weight |
|---|---|
| Travel reliability | 30% |
| Flood safety | 20% |
| Landslide safety | 20% |
| Congestion | 15% |
| Road condition | 10% |
| Historical reliability | 5% |

Score bands: 80–100 → accessible (green) · 50–79 → at risk (amber) · 0–49 → blocked (red). The real score always comes from the backend/AI service once integrated; the mock engine in `simulationEngine.ts` implements this same formula so demo numbers are defensible, not random.

---

## 6. Data Provider Interface

```ts
// src/services/dataProvider.ts
export interface DataProvider {
  connect(): Promise<DataSnapshot>;
  subscribe(onPatch: (patch: DataPatch) => void): () => void;   // returns unsubscribe
  submitIncident(input: NewIncidentInput): Promise<Incident>;
  requestReroute(shipmentId: string, routeId: string): Promise<Shipment>;
  triggerDemoEvent(event: "heavy_rainfall" | "reset"): Promise<void>;
  disconnect(): void;
}
```

**`MockDataProvider`** (`src/services/mock/mockDataProvider.ts`):
- Seeds from `src/services/mock/seedData.ts` — a curated set of NER cities/roads/vehicles/shipments (Guwahati, Shillong, Imphal, Aizawl, Kohima, Agartala, Itanagar, Gangtok as node anchors; a handful of NH corridors between them).
- `simulationEngine.ts` runs a `setInterval` (~3–5s tick) that nudges vehicle coordinates along their route, occasionally emits a random low-severity incident, and recomputes affected KPIs.
- `triggerDemoEvent("heavy_rainfall")` deterministically raises `floodRisk` on the Guwahati–Shillong corridor, flips its status green → amber → red over a few ticks, generates a matching `Incident` and `Alert`, and computes a `RouteOption` alternate — this is what makes the flagship demo (`prd.md` §9) reliable and repeatable, not left to random chance.
- `triggerDemoEvent("reset")` restores the seed state, so the demo can be re-run for a second judge without a page reload.

**`LiveApiProvider`** (`src/services/live/liveApiProvider.ts`):
- `connect()` → `GET /api/snapshot`.
- `subscribe()` → opens the realtime connection from §4 and maps incoming messages to `DataPatch`.
- `submitIncident()` → `POST /api/incidents`.
- `requestReroute()` → `POST /api/shipments/:id/reroute`.
- `triggerDemoEvent()` → `POST /api/demo/trigger` if the backend implements it; otherwise a documented no-op.
- This is the **only** file that should ever contain a `fetch()` call, a WebSocket URL, or an auth header — see `rules.md` §1.

Which provider is active is decided once, in `src/app/providers/DataProviderContext.tsx`, from `import.meta.env.VITE_DATA_SOURCE`.

---

## 7. State Management

- **Zustand** — one store per domain entity (`vehicleStore`, `roadStore`, `incidentStore`, `shipmentStore`, `alertStore`, `weatherStore`), each exposing the entity list keyed by id and an `applyPatch()` action. These are the only stores that hold server-shaped data. A separate `uiStore` holds ephemeral UI state (selected vehicle id, active role, active language, demo-mode step) — never duplicate server data into it.
- **TanStack Query** — the initial `connect()` snapshot, `submitIncident`, and `requestReroute` all go through `useQuery`/`useMutation` so loading/error/retry states come for free (required by `rules.md` §3).
- **`useLiveUpdates()`** hook — on mount, subscribes to the active `DataProvider` and routes each patch to the right store's `applyPatch()`. This is the one place push data enters the app.

Don't reach for Redux or prop-drill state more than two levels — either lift to `uiStore` or read directly from the relevant domain store with a selector hook.

---

## 8. Routing / Pages

```
/                → redirect to /command-center
/command-center  → CommandCenterPage        (FR-1–FR-7)
/operations      → OperatorDashboardPage    (FR-8–FR-12)
/field           → FieldReportingPage       (FR-13–FR-15, secondary priority)
/login           → LoginPage                (role selector stub, FR-21)
```

---

## 9. Folder Structure

```
├─ public/
├─ src/
│  ├─ main.tsx
│  ├─ App.tsx
│  ├─ app/
│  │  ├─ router.tsx
│  │  ├─ layout/
│  │  │  ├─ AppShell.tsx
│  │  │  ├─ TopNav.tsx
│  │  │  └─ Sidebar.tsx
│  │  └─ providers/
│  │     └─ DataProviderContext.tsx
│  ├─ pages/
│  │  ├─ CommandCenterPage.tsx
│  │  ├─ OperatorDashboardPage.tsx
│  │  ├─ FieldReportingPage.tsx
│  │  └─ LoginPage.tsx
│  ├─ features/
│  │  ├─ map/
│  │  │  ├─ NerMap.tsx
│  │  │  ├─ RoadLayer.tsx
│  │  │  ├─ VehicleLayer.tsx
│  │  │  ├─ IncidentLayer.tsx
│  │  │  └─ MapLegend.tsx
│  │  ├─ vehicles/
│  │  │  ├─ VehicleList.tsx
│  │  │  └─ VehicleDetailPanel.tsx
│  │  ├─ roads/
│  │  │  └─ RoadDetailPanel.tsx
│  │  ├─ incidents/
│  │  │  ├─ IncidentReportForm.tsx
│  │  │  └─ IncidentList.tsx
│  │  ├─ shipments/
│  │  │  ├─ ShipmentTable.tsx
│  │  │  ├─ ShipmentDetailPanel.tsx
│  │  │  └─ RouteComparisonPanel.tsx
│  │  ├─ alerts/
│  │  │  ├─ AlertFeed.tsx
│  │  │  └─ AlertToast.tsx
│  │  ├─ weather/
│  │  │  └─ WeatherWidget.tsx
│  │  └─ kpi/
│  │     └─ KpiCards.tsx
│  ├─ components/
│  │  ├─ ui/                     # Card, Badge, Button, Modal, Table, StatusPill — small custom primitives, not a UI-kit import
│  │  └─ DataSourceBadge.tsx      # the "Mock Data" / "Live Data" indicator, FR-19
│  ├─ services/
│  │  ├─ dataProvider.ts          # the DataProvider interface (§6)
│  │  ├─ mock/
│  │  │  ├─ mockDataProvider.ts
│  │  │  ├─ seedData.ts
│  │  │  └─ simulationEngine.ts
│  │  └─ live/
│  │     └─ liveApiProvider.ts
│  ├─ stores/
│  │  ├─ vehicleStore.ts
│  │  ├─ roadStore.ts
│  │  ├─ incidentStore.ts
│  │  ├─ shipmentStore.ts
│  │  ├─ alertStore.ts
│  │  ├─ weatherStore.ts
│  │  └─ uiStore.ts
│  ├─ types/
│  │  └─ domain.ts                # §5 above
│  ├─ hooks/
│  │  ├─ useLiveUpdates.ts
│  │  └─ useDemoScenario.ts
│  ├─ i18n/
│  │  ├─ en.json
│  │  ├─ as.json
│  │  └─ hi.json
│  ├─ utils/
│  │  ├─ formatters.ts
│  │  └─ geo.ts
│  └─ styles/
│     └─ index.css
├─ .env.example
├─ index.html
├─ package.json
├─ tailwind.config.js
├─ tsconfig.json
└─ vite.config.ts
```

Folder boundaries are load-bearing: a component never imports from `services/mock/` or `services/live/` directly — only through `dataProvider.ts` via context, and only `LiveApiProvider` ever touches `fetch`/WebSocket/auth headers.

---

## 10. Visual Identity / Design Direction

The subject is a logistics **control tower** for a monsoon-prone, mountainous region — not a generic SaaS product. Apply this as a starting brief, then run the plan → review → build → critique process from the frontend-design guidance during actual implementation; treat these tokens as a considered starting point, not a rigid final spec.

**Color** (named tokens, defined once in `tailwind.config.js` / CSS variables):

| Token | Hex | Use |
|---|---|---|
| `ink-950` | `#0E141B` | App background — a cool slate-charcoal (a monsoon night sky over the map), not a generic pure-black dark mode |
| `ink-900` | `#16202B` | Panel/surface background |
| `ink-border` | `#29394A` | Hairline borders, dividers |
| `text-primary` | `#E7EDF3` | Primary text |
| `text-muted` | `#8CA0B3` | Secondary/meta text |
| `accent-river` | `#3E8FB0` | Primary interactive accent — links, active states, primary buttons |
| `accent-ochre` | `#D8A339` | Secondary accent, used sparingly (demo-trigger control, priority-1 tags) — doubles as the at-risk status color |
| `status-accessible` | `#4E9A63` | Road/route accessible |
| `status-at-risk` | `#D8A339` | Road/route at risk |
| `status-blocked` | `#C1554B` | Road/route blocked; also used for critical alerts |

Color is functional throughout — the only two "brand" accents are also interactive/attention colors, not decoration layered on top.

**Typography:** two families.
- **IBM Plex Sans** for all UI text and headings — a technical, infrastructural character distinct from the ubiquitous Inter/system-ui default.
- **IBM Plex Mono** *only* for numeric telemetry — coordinates, ETAs, timestamps, vehicle/road IDs, and the big KPI numbers — because this content genuinely is a control-room readout, not because monospace looks technical. Everything else stays in Plex Sans.
- Scale: 28px/1.2 page titles · 16px/1.3 panel headings (sentence case, never ALL CAPS) · 14px/1.5 body/UI text · 12px/1.4 muted meta text · telemetry numerals 13–32px depending on context.

**Layout:** a control-tower split, not a card grid.
```
┌──────────────────────────────────────────────────┬───────────────┐
│  NER Logistics · Command Center   [Mock Data ▾]   │  KPI  KPI     │
├──────────────────────────────────────────────────┤  KPI  KPI     │
│                                                    ├───────────────┤
│                                                    │  Alerts        │
│              [ Map — roads, vehicles,             │  ⚠ Flood risk  │
│                incidents, risk layers ]           │  ⚠ Delayed     │
│                                                    ├───────────────┤
│  Legend: ● Accessible ▲ At risk ■ Blocked         │  Weather       │
└──────────────────────────────────────────────────┴───────────────┘
```
Map dominant (~68% width) with a fixed data rail (~32%) for KPIs/alerts/weather. The Operator Dashboard mirrors this with the shipment table dominant and a route-comparison/map inset in the rail.

**Principles:**
1. Color encodes real status — never decorative. Flat panels, 1px hairline borders, small 4px radius, no drop shadows; hierarchy comes from spacing and type weight, not card chrome.
2. The mono/sans split is the one deliberate typographic device — used because the content is numeric telemetry, not as a decorative label font.
3. Plain sentence case, active voice, no tracked-out ALL-CAPS eyebrows, no arrow-suffixed buttons ("Reroute now," not "Reroute →"), no middle-dot-joined meta strings.
4. Spend visual boldness in one place — the risk/status color system — and keep everything else quiet enough to stare at for an hour without fatigue.

---

## 11. Environment Variables

```
VITE_DATA_SOURCE=mock                 # "mock" | "live"
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws
VITE_MAP_DEFAULT_CENTER_LAT=26.2006
VITE_MAP_DEFAULT_CENTER_LNG=92.9376
VITE_MAP_DEFAULT_ZOOM=6
```
Documented in `.env.example`; `.env` itself is never committed (see `rules.md` §6).

---

## 12. Build & Deploy (frontend only)

- Local dev: `npm run dev` (Vite dev server).
- Production build: `npm run build` → static `dist/`.
- Deploy target for the demo: Vercel or Netlify (either is free-tier friendly and needs zero backend to host a mock-data build) — final pick is an open question in `prd.md` §10.
- No server-side rendering, no Node server needed to host this app — it's a static SPA.

---

## 13. What's Fixed vs. What May Evolve

**Fixed for this build** (changing needs an explicit decision, not a silent agent choice): React + Vite, the folder structure in §9, the `DataProvider` interface in §6, the domain types in §5.

**Expected to evolve:** the exact realtime transport in `LiveApiProvider` (§4), the auth token pattern once real auth exists, mock → live data source once the backend ships, number of supported languages beyond en/as/hi, whether TypeScript strict mode stays on for the whole app or is relaxed for speed.
