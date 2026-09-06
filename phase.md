# Development Phases
## NER Logistics & Accessibility Intelligence Platform — Web Frontend

**Scope:** the **web frontend only**, built entirely against a mock data provider until Phase 10. Every phase must leave the app in a runnable, demoable state — no half-built handoffs (see `rules.md` §4).

Read `prd.md`, `architecture.md`, and `rules.md` before starting Phase 0. Check off each phase's exit criteria in this file as they're completed — this file should always reflect real status.

---

## Phase 0 — Project Setup & Foundations

**Goal:** a blank app running locally with the full routing shell, no features yet.

**Tasks:**
- Scaffold with Vite (`react-ts` template), configure Tailwind, ESLint, Prettier.
- Set up the folder structure from `architecture.md` §9.
- Configure the `@/` import alias.
- Add `react-router-dom` with the four routes from `architecture.md` §8 (each a placeholder page).
- Write `src/types/domain.ts` with the full type set from `architecture.md` §5.
- Write `src/services/dataProvider.ts` (the interface only, no implementation yet).
- Add `.env.example` with the variables from `architecture.md` §11; wire `DataProviderContext` to read `VITE_DATA_SOURCE` (mock/live) even though only a stub exists so far.
- Build the `AppShell`/`TopNav`/`Sidebar` layout and the `DataSourceBadge` component (shows "Mock Data" — FR-19).

**Exit criteria:**
- [ ] `npm run dev` shows a shell with working navigation between four empty pages.
- [ ] TypeScript, ESLint, and Prettier all pass with zero errors.
- [ ] The "Mock Data" badge is visible somewhere on every page.

**Do NOT yet:** touch the map, write any real data, or start on any feature page's content.

---

## Phase 1 — Mock Data Provider & NER Base Map

**Goal:** an interactive map of the NER with static seed data — no live movement yet.

**Tasks:**
- Write `seedData.ts`: node anchors for Guwahati, Shillong, Imphal, Aizawl, Kohima, Agartala, Itanagar, Gangtok; a handful of road segments connecting them (e.g. Guwahati–Shillong, Guwahati–Imphal) with realistic-looking `geometry`.
- Implement `MockDataProvider.connect()` returning this seed as a `DataSnapshot` (no simulation tick yet — `subscribe()` can be a no-op for now).
- Build `NerMap.tsx` with react-leaflet, centered per `VITE_MAP_DEFAULT_CENTER_LAT/LNG/ZOOM`.
- Build `RoadLayer.tsx` rendering roads colored by `status` (green/amber/red) with a paired icon/label (never color-only, per `rules.md`).
- Add city markers for all eight anchor nodes and a `MapLegend.tsx`.

**Exit criteria:**
- [ ] The Command Center page shows a map centered on NER with roads colored by status and eight city markers.
- [ ] Legend correctly explains the color scheme.
- [ ] No vehicles or incidents yet — that's Phases 2–3.

---

## Phase 2 — KPIs, Incidents & Road Detail

**Goal:** the Command Center becomes a real situational-awareness screen, still on static mock data.

**Tasks:**
- Add a few seeded `Incident` records to `seedData.ts`; build `IncidentLayer.tsx` (severity-styled markers) and `IncidentList.tsx`.
- Build `KpiCards.tsx` (FR-5) — computed live from store state (active vehicles will be 0 until Phase 3; that's fine, wire the computation now).
- Build `RoadDetailPanel.tsx` — clicking a road shows its accessibility score, confidence, source, and last-updated time (never a bare number, per `rules.md` §5).
- Set up the six Zustand domain stores and route the seed snapshot into them (this replaces any local component state used in Phase 1).

**Exit criteria:**
- [ ] KPI cards render real counts derived from store state.
- [ ] Clicking any road or incident opens a detail panel with full provenance fields.
- [ ] All map/dashboard data now flows through Zustand stores, not local component state.

---

## Phase 3 — Vehicle Tracking & Simulated Live Movement

**Goal:** vehicles visibly move on the map without a page refresh.

**Tasks:**
- Add seeded `Vehicle` and `Shipment` records.
- Implement `simulationEngine.ts`: a `setInterval` tick (~3–5s) that advances each vehicle along its route's `geometry` and updates `speedKph`/`headingDeg`/`lastUpdated`.
- Wire `MockDataProvider.subscribe()` to emit `DataPatch` objects on each tick.
- Implement `useLiveUpdates()` and connect it in `AppShell` so every page picks up patches.
- Build `VehicleLayer.tsx` (marker + heading), `VehicleList.tsx`, `VehicleDetailPanel.tsx` (speed, ETA, current shipment).

**Exit criteria:**
- [ ] At least one truck visibly moves along a route on the map every few seconds, with no manual refresh.
- [ ] Clicking a vehicle shows live-updating speed and ETA.
- [ ] Disconnecting/reconnecting the mock subscription (e.g. via a dev toggle) shows the "stale/disconnected" state from `rules.md` §3, not a frozen silent UI.

---

## Phase 4 — Logistics Operator Dashboard

**Goal:** an operator can review shipments and simulate a reroute decision.

**Tasks:**
- Build `ShipmentTable.tsx` (FR-8): origin, destination, progress %, ETA, priority, current route risk; sortable/filterable by priority and status (FR-12).
- Build `ShipmentDetailPanel.tsx` and `RouteComparisonPanel.tsx` (FR-9): current route vs. a recommended alternate, showing distance/time/risk/disruption probability side by side.
- Add seeded `RouteOption` alternates for at least one shipment so the comparison has real data to show.
- Wire the four actions (FR-10): Accept Route, Switch Route, Contact Driver (stub — just a toast), Report Issue (navigates to `/field`).
- Implement `MockDataProvider.requestReroute()`: updates the shipment's `currentRouteId`, `etaIso`, and status, and pushes a confirmation alert (FR-11).

**Exit criteria:**
- [ ] Selecting a shipment shows a route comparison with a clear "+X min, Y% lower risk" framing.
- [ ] Clicking Switch Route updates the map path, ETA, and shipment status live, and logs a confirmation alert.
- [ ] Sorting/filtering the shipment table works correctly.

---

## Phase 5 — Alerts & Notifications

**Goal:** alerts feel alive, not like a static list.

**Tasks:**
- Build `AlertFeed.tsx` (FR-6): reverse-chronological list with a severity filter (info/warning/critical).
- Build `AlertToast.tsx`: a transient toast fires whenever a new `Alert` patch arrives, in addition to it appearing in the feed.
- Confirm alerts are already firing correctly from Phase 3 (vehicle delay) and Phase 4 (reroute confirmation); this phase is about the *display*, not new alert-generating logic.

**Exit criteria:**
- [ ] New alerts appear both as a toast and in the feed without a refresh.
- [ ] Severity filter correctly narrows the feed.
- [ ] Acknowledging an alert updates its state and reflects in the KPI count.

---

## Phase 6 — Field Reporting (secondary priority)

**Goal:** a mock incident can be submitted and shows up back on the Command Center map. Keep this simple — the mobile app (built separately) is the real field-officer surface; this is a fallback and an API-contract test.

**Tasks:**
- Build `IncidentReportForm.tsx` (FR-13): type, severity, description, location (map-click or a "use current location" stub), photo (file picker → local object URL).
- Validate with Zod before submit; show inline errors (`rules.md` §3).
- Implement `MockDataProvider.submitIncident()`: creates the `Incident`, pushes it into `incidentStore` directly, and — for the offline simulation (FR-14) — if a dev-toggle "offline" flag is on, mark it `pending_sync` and flip to `synced` a few seconds later instead of resolving immediately.
- Build `IncidentList.tsx` for the current session's submissions with status.

**Exit criteria:**
- [ ] A submitted report appears on the Command Center map and incident list without a refresh.
- [ ] The "pending sync → synced" state is visibly demonstrable via the offline-simulation toggle.
- [ ] Form rejects an incomplete submission with clear inline errors.

---

## Phase 7 — Weather & Risk Visualization

**Goal:** the rainfall-driven risk mechanic that the whole demo hinges on.

**Tasks:**
- Build `WeatherWidget.tsx` (FR-16): rainfall, temperature, warning level per region, from seeded `WeatherSnapshot` data.
- Implement `triggerDemoEvent("heavy_rainfall")` in `simulationEngine.ts` (see `architecture.md` §6): deterministically raises flood risk on the Guwahati–Shillong corridor over a few ticks, cascades to the road's `status` and `accessibilityScore`, generates a matching incident and alert, and computes a safer `RouteOption` alternate.
- Add the **"Simulate Heavy Rainfall"** demo control (FR-17) to the Command Center, plus a **Reset** control that calls `triggerDemoEvent("reset")`.
- Show risk score + confidence (FR-18) consistently wherever a road or route appears — reuse `RoadDetailPanel` and `RouteComparisonPanel`, don't build a third display pattern.

**Exit criteria:**
- [ ] Clicking "Simulate Heavy Rainfall" visibly raises risk, flips the Guwahati–Shillong road green → amber → red over a few seconds, and produces a matching incident + alert.
- [ ] The Operator Dashboard's route comparison for the affected shipment now shows the safer alternate.
- [ ] Reset restores the seed state so the scenario can run again.

---

## Phase 8 — End-to-End Demo Scenario Wiring

**Goal:** the exact script in `prd.md` §9 runs reliably, start to finish, on demand.

**Tasks:**
- Add `useDemoScenario.ts`: a small state machine that can optionally auto-advance through the scenario steps (rainfall → risk rise → alert → route comparison → reroute) for a hands-off walkthrough, while still allowing manual clicking through the same UI.
- Add a single "Run Demo" entry point (e.g. in the Command Center header) that resets state and starts the scenario cleanly.
- Rehearse the full script end-to-end at least twice in a row (judges may ask for a repeat) to confirm the Reset from Phase 7 actually returns to a clean state every time.

**Exit criteria:**
- [ ] The full script from `prd.md` §9 runs start to finish without manual data edits.
- [ ] It can be run a second time immediately after Reset with identical behavior.
- [ ] Every screen touched by the scenario (map, KPIs, alerts, operator dashboard) updates correctly and in a sensible order.

---

## Phase 9 — Polish, Responsiveness, Accessibility, i18n Scaffold

**Goal:** presentable and resilient for judging — not a rewrite of anything above.

**Tasks:**
- Responsive pass down to 768px width; verify the Command Center's map/data-rail split and the Operator Dashboard's table don't break.
- Color-blind check: every status indicator has a non-color cue (icon/label), per `rules.md`.
- Audit loading and empty states across all panels (what does the Alert Feed look like with zero alerts? the Shipment Table with zero shipments?).
- Add `i18n/en.json`, `as.json`, `hi.json` scaffolding with `react-i18next`; English fully populated, Assamese/Hindi can be placeholder translations — this is explicitly *not* an MVP-blocking feature (`prd.md` §6), just don't hardcode strings in a way that would make adding them later a rewrite.
- Final visual pass against the design direction in `architecture.md` §10.

**Exit criteria:**
- [ ] No layout breakage between 768px and typical laptop widths.
- [ ] Every empty/loading/error state has been deliberately designed, not left blank.
- [ ] Switching the language selector (even with placeholder translations) doesn't break layout.

---

## Phase 10 — Backend Integration Swap-In (once the backend exists)

**Goal:** the same UI, running against the real API, with zero component changes — this is the test of whether the adapter architecture actually worked.

**Tasks:**
- Confirm the open questions in `prd.md` §10 with the backend teammate (realtime transport, auth token pattern, actual field names) and update `architecture.md` §4 accordingly.
- Implement `LiveApiProvider` fully against the confirmed contract.
- Flip `VITE_DATA_SOURCE=live` in a local `.env` and smoke-test every page.
- Wire the real auth pattern into `LoginPage` once confirmed, replacing the role-selector stub.
- Fix any schema drift by adjusting `LiveApiProvider`'s mapping — not the components or stores.

**Exit criteria:**
- [ ] Every page from Phases 1–9 works identically against the live backend as it did against the mock.
- [ ] No component, store, or page needed a code change to make the swap — only `services/live/liveApiProvider.ts` (and, if needed, `types/domain.ts` for genuinely new fields).
- [ ] The flagship demo scenario (`prd.md` §9) either still works via `triggerDemoEvent`, or a documented manual equivalent exists if the real backend doesn't implement that endpoint.
