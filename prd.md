# Product Requirements Document (PRD)
## NER Logistics & Accessibility Intelligence Platform — Web Frontend

**Scope of this document:** the **web frontend only**, built with React + Vite in Antigravity. It is written to brief an autonomous coding agent working on this piece in isolation from the backend, mobile app, and AI/ML services, which are being built separately by other team members.

Companion documents: `architecture.md`, `rules.md`, `phase.md`. Read all four before writing any code — this PRD says *what* to build, the others say *how*. If an instruction elsewhere ever conflicts with this PRD's scope, treat this PRD as authoritative and flag the conflict instead of silently picking a side.

---

## 1. Project Context

### 1.1 Competition & problem statement
- **Event:** Smart India Hackathon (SIH) 2026
- **Problem statement:** SIH26002 — *AI-Based Smart Logistics & Accessibility Intelligence Platform for the North Eastern Region (NER)*
- **Issuing ministry:** Ministry of Development of North Eastern Region (MDoNER)
- **Core problem:** the NER's mountainous terrain, heavy rainfall, landslides, floods, and limited connectivity mean a road that is usable today can become inaccessible tomorrow. Essential goods — medicines, food, agricultural produce, construction materials — get delayed or stranded because no single platform combines real-time accessibility, disruption prediction, and route optimization.

### 1.2 What the full team is building
The complete system follows one loop:

> **Know the condition of the route → Predict possible disruption → Find the best route → Track the vehicle → Alert the concerned people.**

It combines GIS + GPS + weather data + field reports + AI/ML + route optimization, split across:

| Piece | Owner | Stack |
|---|---|---|
| **Web dashboard** (this PRD) | You, in Antigravity | React + Vite |
| Mobile app (field officers) | Separate teammate | React Native + Expo |
| Backend / API | Team leader | Node.js + Express + TypeScript |
| Database / spatial layer | Team leader | PostgreSQL + PostGIS |
| AI/ML (disruption risk, ETA) | Separate teammate | Python service, consumed via API |

Your frontend never builds the AI model, the database, or the mobile app — it **displays** whatever risk score, route option, or accessibility status the API (or, for now, a mock standing in for the API) provides, and lets a human act on it.

### 1.3 What this document covers
A single-page React app that visualizes the live state of NER's logistics network, surfaces AI-generated risk and disruption predictions, lets operators act on them (reroute, alert), and gives administrators a command-center view. Build it against mock data first; it must be swappable to the real backend later with no component rewrites (see `architecture.md` §5–7).

---

## 2. Product Vision

> "Turn scattered road, weather, GPS, and field data into a single live picture of whether the Northeast's logistics network can move — and what to do when it can't."

This should not feel like a generic map app. Every screen answers one of four questions:
1. Where are goods/vehicles right now?
2. Can they reach their destination?
3. What could disrupt the route?
4. What should the operator do about it?

**Positioning:** the product complements PM GatiShakti (infrastructure/GIS planning) and ULIP (logistics data integration) — it does not replace them, and the UI never implies live access to a restricted government system the team doesn't actually have (see `rules.md` §5).

---

## 3. Users & Personas

| Persona | Primary screen | Needs |
|---|---|---|
| **NER Logistics Authority / Admin** | Command Center | Region-wide situational awareness: KPIs, live map, active incidents, at-risk/blocked roads |
| **Logistics Operator / Dispatcher** | Operator Dashboard | Per-shipment visibility: ETA, route risk, alternate routes, reroute actions |
| **Field Officer** *(secondary — primary surface is the mobile app)* | Field Reporting (web fallback) | Submit an incident report quickly, even on a bad connection |
| **SIH judges / demo viewer** | All screens, via a scripted demo | See the OBSERVE → PREDICT → DECIDE → ACT loop happen live in under two minutes |

Field Reporting is lower priority in this build than the other two — the mobile app (built separately) is the team's primary field surface. Build the web version, but after the Command Center and Operator Dashboard are solid (see `phase.md`).

No persona needs a login wall to *view* the demo dashboard, but a lightweight role selector (admin / operator / field officer) gates the write actions (reroute, submit report) for demo clarity — this is a stub, not real auth (see §5.5 and `phase.md` Phase 10).

---

## 4. Core Features (MVP)

These map directly to the seven components already committed to in the SIH interim round — don't add an eighth without checking `phase.md` first:

1. **GIS Command Dashboard** — interactive NER map showing roads (colored by accessibility), vehicles, incidents, and risk overlays.
2. **Vehicle tracking** — simulated/live GPS positions, per-vehicle status, speed, ETA.
3. **Field reporting** — geo-tagged incident submission (type, severity, description, photo).
4. **Route optimization display** — compare candidate routes on distance/time/risk; recommend the safer one; let the operator reroute.
5. **Weather integration (display)** — surface the weather conditions that feed into risk, per region/route.
6. **AI risk prediction (display)** — show disruption probability / accessibility score per road and route, with a confidence value.
7. **Alerts & notifications** — live feed of flood/landslide/blocked-road/delay alerts.

Supporting features:

8. **KPI summary** — active vehicles, active incidents, at-risk routes, blocked routes, high-priority shipments.
9. **Role selector** (lightweight, not full auth) — switch between Admin / Operator / Field views for demo purposes.
10. **Demo Mode trigger** — a one-click way to run the flagship scenario reliably in front of judges.

### 4.1 The flagship demo scenario — design every screen to support this
A medical-supply truck travels Guwahati → Shillong. Heavy rainfall is simulated. Flood risk on the current road rises, the road turns from green to red, the affected vehicle is flagged, an alert fires, the route engine proposes a lower-risk alternate (longer but safer), the operator clicks **Reroute**, and the map/ETA/alert update live — no page reload. This exact flow must work end-to-end and be repeatable on demand, since it's what gets demonstrated to judges.

---

## 5. Functional Requirements

### 5.1 Command Center
- **FR-1** Display an NER-centered map (Leaflet) with pan/zoom.
- **FR-2** Render road segments colored by accessibility status — green (accessible), amber (at risk), red (blocked) — and never rely on color alone; pair it with an icon or label.
- **FR-3** Render vehicle markers with heading/status; clicking one opens a detail panel (speed, ETA, current shipment).
- **FR-4** Render incident markers (flood, landslide, road blocked, accident, bridge damage, traffic, other) styled by severity.
- **FR-5** Show KPI cards (active vehicles, active incidents, at-risk routes, blocked routes, high-priority shipments) derived from live store state, never hardcoded.
- **FR-6** Show a live alert feed with a severity filter (info / warning / critical).
- **FR-7** Show a legend explaining the color scheme, and a visible data-source indicator (mock vs. live).

### 5.2 Logistics Operator Dashboard
- **FR-8** List active shipments: origin, destination, progress %, ETA, priority (1–3), current route risk.
- **FR-9** Clicking a shipment shows a route comparison — current vs. recommended alternate — on distance, time, risk %, and disruption probability (e.g. "Route B — +45 min, 70% lower disruption probability").
- **FR-10** Provide per-shipment actions: **Accept Route**, **Switch Route**, **Contact Driver** (stub), **Report Issue** (links to Field Reporting).
- **FR-11** Rerouting updates the shipment's ETA, the route geometry on the map, and produces a confirmation alert.
- **FR-12** Sort/filter shipments by priority and status (on-time / at-risk / delayed / delivered).

### 5.3 Field Reporting (secondary priority)
- **FR-13** A short form: incident type, severity, description, location (map-click, or a "use current location" stub), photo (file picker; store as a local object URL — no real upload backend needed for MVP).
- **FR-14** A submitted report shows a "pending sync" indicator if offline (simulated), then "synced" once back online — mirrors the real offline-first requirement from the problem statement without needing full IndexedDB storage for this web fallback (exact scope in `phase.md` Phase 6). Full offline durability is the mobile app's job.
- **FR-15** A list of the current session's submitted reports with status.

### 5.4 Weather & risk
- **FR-16** A weather summary widget (rainfall, temperature, warning level) per region, from mock/live weather snapshots.
- **FR-17** A **"Simulate Heavy Rainfall"** demo control that raises flood-risk values in the store and cascades to road color, risk scores, and alerts — this is what powers the flagship demo.
- **FR-18** Show a risk score (0–100 accessibility score, or 0–100% disruption probability) with a confidence value wherever a road or route appears — never a bare number with no provenance.

### 5.5 Cross-cutting
- **FR-19** A visible **"Mock Data" / "Live Data"** badge sourced from the active data provider. The UI must never claim live government data (ULIP, PM GatiShakti, IMD, etc.) unless a real backend connection is confirmed — see `rules.md` §5.
- **FR-20** The app must run and demo fully with zero backend present, and must be swappable to a live API by changing one environment variable with no component code changes.
- **FR-21** A lightweight role selector (admin / operator / field officer) controls which write actions are enabled; this is a UI stub, not real authentication or authorization.

---

## 6. Non-Functional Requirements

- **Performance:** initial route render under 3s locally; the map should smoothly handle ~50 simulated vehicles and ~100 road segments.
- **Responsiveness:** desktop-first — this is a control-room dashboard — but must not break below tablet width (≥768px). Phone support isn't required; that's the separate React Native app's job.
- **Accessibility:** status is never color-only; sufficient contrast; keyboard-navigable forms.
- **Resilience:** if the data feed stalls, show a clear "stale" or "disconnected" state rather than freezing silently.
- **Honesty about data provenance:** every externally-sourced value (weather, government data, AI prediction) is traceable to a source or explicitly marked mock — this is a hard constraint, not a style preference (see `rules.md` §5).
- **Internationalization:** scaffold only for MVP. English is required; Assamese and Hindi string files can be placeholders. Full multilingual UI is explicitly *future scope* in the team's own research paper, not MVP-critical — don't spend early phases on it.
- **Browser support:** latest Chrome/Edge/Firefox.

---

## 7. Out of Scope for This Build

Owned by other teammates or later phases — do not build these here:
- Backend services, database, PostGIS, real authentication logic
- Mobile app (React Native/Expo)
- Real AI/ML model training or inference — the frontend only *displays* whatever score the API/mock returns
- Live integration with ULIP, PM GatiShakti, IMD, CWC, ASDMA, or any other government system — mock data only, clearly labeled
- Real-time server infrastructure (Kafka, Redis, a real WebSocket/Socket.IO server) — assume the interface exists and mock it locally until the backend is ready
- Graph Neural Networks or any deep-learning routing/prediction model
- Payments, billing, or any commercial features

---

## 8. Assumptions & Dependencies

- The web app is React + Vite (already decided). `architecture.md` recommends the rest of the stack (TypeScript, Tailwind CSS, Zustand + TanStack Query, Leaflet) to keep the build consistent — flag it if you want to change one.
- No backend will exist for most of the build. All data comes from a **mock data provider** (built in Phase 0–1) that simulates GPS movement, weather changes, and incidents on a timer.
- The data contract in `architecture.md` §6 (TypeScript interfaces) is the assumed shape of the real backend API. If the backend team's actual schema differs once ready, adjust the adapter layer only — not every component.
- Map tiles: OpenStreetMap via Leaflet — free, no API key, and consistent with "don't claim access we don't have."
- Team has existing web development experience — this plan does not start from HTML/CSS basics (see `phase.md` Phase 0).

---

## 9. Reference Demo Scenario

The concrete script the MVP must be able to perform live; `phase.md`'s exit criteria are written to make this possible:

1. A medical supply truck (`TRUCK-001`) is shown traveling Guwahati → Shillong. Dashboard shows: live position, current route (Route A), ETA ~2h15m, risk LOW.
2. A heavy-rainfall weather event is injected via the **"Simulate Heavy Rainfall"** demo control — not by hand-editing data mid-demo.
3. Flood probability rises on the Guwahati–Shillong corridor; the road segment flips from accessible (green) to at-risk (amber) to blocked (red) on the map.
4. A field officer report (flood, high severity, photo, GPS) corroborates the disruption and appears on the dashboard.
5. Route engine proposes Route B: "+45 min, 70% lower disruption probability."
6. Operator clicks **Reroute**. The vehicle's route, ETA, and map path update live. An alert is logged: "Vehicle TRUCK-001 rerouted due to flood risk on NH-X."
7. Command Center KPI cards (active incidents, at-risk routes) update to reflect the new state.

This single scenario demonstrates mapping, tracking, weather ingestion, risk scoring, field reporting, route optimization, alerts, and dashboard cohesion together — it is the acceptance test for the whole MVP, not just one phase.

---

## 10. Open Questions for the Team

Not for the agent to silently guess on — flag these and pick a clearly-labeled placeholder until answered:
- Final product/team name for the public-facing UI (currently using the SIH26002 official title).
- Will the backend team expose a raw WebSocket, Socket.IO, Server-Sent Events, or just polling? The `LiveApiProvider` (see `architecture.md` §7) isolates this, but someone needs to confirm it before Phase 10.
- Auth token pattern once real auth exists (JWT in an `Authorization` header vs. an httpOnly cookie) — affects `LiveApiProvider` only, not the rest of the app, but needs a decision before Phase 10.
- Which weather source will actually back the "live" mode (OpenWeatherMap, IMD, or mock-only through judging day)?
- Hosting target for the live demo link (Vercel vs. Netlify vs. GitHub Pages) — needs a decision before the final round.
