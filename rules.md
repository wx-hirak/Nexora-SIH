# Development Rules
## NER Logistics & Accessibility Intelligence Platform — Web Frontend

**Scope:** these rules govern the **web frontend repository only**. They apply to any agent (or person) working in this Antigravity workspace.

> These are constraints, not suggestions. If a task seems to require breaking one of these, stop and flag it rather than quietly working around it. Read alongside `architecture.md` for the reasoning behind each choice.

---

## 1. Technology Allow-List / Avoid-List

**Use:**
- React 18 + Vite + TypeScript
- react-router-dom (routing)
- Zustand (domain/realtime state)
- TanStack Query (request/response data — snapshot fetch, mutations)
- Leaflet + react-leaflet (map)
- Tailwind CSS (styling)
- lucide-react (icons)
- Recharts (charts, where genuinely useful)
- Zod (client-side form validation, defensive response typing)
- i18next + react-i18next (i18n scaffold)
- Vitest + React Testing Library (testing)
- ESLint + Prettier (tooling)

**Do not introduce without flagging it and updating `architecture.md` first:**
- Next.js, Remix, or any SSR framework — this is a Vite SPA by direct instruction; there's no login-gated SSR requirement to justify one.
- Redux / Redux Toolkit — Zustand + TanStack Query cover MVP state needs; don't add a second state paradigm.
- Axios or another HTTP client — a small `fetch` wrapper is enough; don't add a dependency to save five lines.
- Moment.js — use native `Date`/`Intl`, or `date-fns` if formatting gets genuinely complex.
- CSS-in-JS runtime libraries (styled-components, emotion) — Tailwind is the one styling system.
- Bootstrap, Material UI, Ant Design, or any heavy prebuilt component kit — build small custom primitives in `components/ui/` per the visual-identity direction in `architecture.md` §10. A prebuilt kit is exactly what makes a dashboard look templated.
- Mapbox GL JS, Google Maps — OpenStreetMap via Leaflet needs no API key and avoids implying an integration/paid access the team doesn't have.
- Any deep-learning framework (PyTorch/TensorFlow, `@tensorflow/tfjs`) or GNN library — not a frontend concern at all; the frontend only ever *displays* a score it's given.
- Socket.IO client — **only** once confirmed the backend actually uses Socket.IO (see `architecture.md` §4); default to the native `WebSocket` API in `liveApiProvider.ts` until then.

---

## 2. Coding Conventions

- **TypeScript strict mode** (`"strict": true` in `tsconfig.json`). No `any` without a `// TODO(reason):` comment explaining why it's temporary.
- **Naming:** `camelCase` for variables/functions, `PascalCase` for components/types/interfaces, `PascalCase.tsx` for component files, `camelCase.ts` for everything else (hooks, stores, utils).
- **One component per file.** Feature folders (`features/map/`, `features/shipments/`, …) own their own components; `components/` is for genuinely shared, feature-agnostic primitives only.
- **Folder boundaries from `architecture.md` §9 are load-bearing.** A page composes feature components; a feature component reads from a store or a query hook; only `services/dataProvider.ts` and its two implementations know about mock simulation or network calls. Don't reach into `services/mock/` or `services/live/` directly from a component.
- **Absolute imports** via a `@/` alias (configured in `vite.config.ts` / `tsconfig.json`) instead of long `../../../` chains.
- **Props typed via explicit interfaces**, not inline object types, for anything with more than two props.
- **Functional components + hooks only** — no class components.
- **Comment the non-obvious, not the obvious.** The mock simulation's demo-scenario logic (`simulationEngine.ts`) especially needs comments explaining *why* a value changes the way it does, since it stands in for real AI/backend logic a judge might ask about.
- **Lint/format** (ESLint + Prettier) must pass before a phase is marked done. No inline-disabling a lint rule without a one-line comment saying why.
- **Commits:** small, one logical change each. Reference the phase where relevant (e.g. `phase3: add vehicle GPS simulation tick`).

---

## 3. Error Handling Requirements

- Every async data call (snapshot fetch, mutation) goes through TanStack Query so loading/error states are explicit — no bare `useEffect` + `fetch` with unhandled rejections.
- Wrap the map and each dashboard panel in a React error boundary so one broken widget doesn't blank the whole Command Center — this matters most during a live demo.
- A failed action (submit report, reroute) shows a visible, human-readable message (toast/banner) — never a silent console error the operator can't see.
- `useLiveUpdates()` must handle a dropped connection or a malformed patch by logging and skipping, not crashing the subscribing component; surface a "disconnected / stale data" indicator (FR from `prd.md` §6) rather than freezing the last-known state silently.
- When a mutation succeeds, apply the result to the relevant store directly (don't wait for a round-trip realtime patch just to reflect the operator's own action) — this keeps the UI responsive even if the mock/live realtime tick is slow.
- Form validation (Field Reporting) happens client-side with Zod before submit; show inline field errors, don't let an incomplete report reach the provider.

---

## 4. Development Process / Scope Discipline

- Follow `phase.md` in order. Don't start Phase N+1 while Phase N's exit checklist has unchecked items, unless explicitly told to reprioritize.
- After finishing a phase, check its boxes in `phase.md` in the same change — that file must always reflect real status, not aspirational status.
- Don't add features not listed in `prd.md` §4–5 without flagging it first as a suggestion — scope creep on a hackathon timeline is the fastest way to end up with several half-built things instead of one working demo.
- Prefer the smallest working version: mock provider before live integration, a curated seed dataset before a full NER road graph, a formula-based mock risk score before anything fancier — none of that fanciness is this repo's job anyway (it's the AI/ML teammate's).
- Every phase should leave the app in a runnable, demoable state — no "doesn't build" handoffs between phases.
- Write at least a minimal test for logic the demo's credibility depends on (the simulation engine's rainfall-trigger cascade, the route-comparison display logic) — pure UI layout doesn't need the same rigor.

---

## 5. AI & Data-Integrity Boundaries

These come directly from the project's own positioning to judges and are non-negotiable, not a judgment call to make case by case:

- **Never imply live government API access that doesn't exist.** Whenever the active data source is mock (`VITE_DATA_SOURCE=mock`), the UI must show a visible "Mock Data" indicator (FR-19). Don't write copy, tooltips, or demo narration that implies live ULIP/PM GatiShakti/IMD connectivity unless a real backend connection is actually wired in.
- **Every AI-derived number needs provenance.** Accessibility scores, disruption probabilities, and ETAs always render with their `source`, `confidence`, and `lastUpdated` fields visible or accessible on demand — never a bare number with no explanation.
- **The mock risk formula must stay explainable.** Use the documented weighted formula in `architecture.md` §5, not an arbitrary random number — the team needs to be able to explain the number to judges on request.
- **Label synthetic/demo data as synthetic** wherever it could otherwise be mistaken for something real, in both code comments and, if it's ever visible, the UI.
- **Do not scrape or attempt to bypass a restricted government system**, and do not fabricate a real-looking API response for one — a hard stop, not a style preference.
- **This repo has no AI model to build.** If a request implies training, fine-tuning, or embedding an ML model directly in the frontend, that's out of scope — flag it; it belongs to the AI/ML teammate's service, consumed via the API contract.

---

## 6. Security Basics (frontend-appropriate)

- No secrets in the frontend bundle — anything shipped to the browser is public. If a real weather API key is ever needed, it must be called from a backend proxy, never embedded directly in this app's `.env`/build.
- `.env` is never committed; `.env.example` documents every required variable with a placeholder value (see `architecture.md` §11).
- Once real auth exists, store the token the way the backend team's chosen pattern requires (httpOnly cookie vs. `Authorization` header) — this is an open question (`prd.md` §10); until then, the role selector is a client-only stub with no security value and must not be presented as real access control anywhere in the UI copy.
- File input (incident photo) is validated for type/size client-side before use, purely for UX — real validation is the backend's job once uploads go through a real API.

---

## 7. What "Done" Means for Any Task

A piece of work is not done until:
1. It builds and runs (`npm run dev` / `npm run build` both succeed).
2. Lint and type-check pass.
3. Any new logic the demo depends on (simulation engine, route comparison, risk display) has at least one test.
4. It matches the folder/module boundaries in `architecture.md` §9.
5. If it touches an AI-derived value or a data-source claim, §5 above is satisfied.
6. The relevant checklist item in `phase.md` is checked off in the same change.
