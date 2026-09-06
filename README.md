# NER Logistics Intelligence & Crisis Routing Portal (Nexora SIH)

An intelligent, climate-resilient logistics monitoring, GIS command, and emergency rerouting portal designed for India's North Eastern Region (NER). Built for the Smart India Hackathon (SIH).

---

## 🚀 Quick Start

The client web application is located in the [`frontend/`](./frontend/) directory.

```bash
# Navigate to the frontend workspace
cd frontend

# Install dependencies
npm install

# Start the local development server
npm run dev
```

The application will be accessible at `http://localhost:5173/` (or `http://localhost:5174/`).

### Production Build & Linting

```bash
cd frontend

# Run TypeScript typecheck and production build
npm run build

# Run ESLint validation
npm run lint
```

---

## 📁 Repository Structure

```
.
├── frontend/                     # React + Vite + TypeScript web application
│   ├── src/
│   │   ├── app/                  # App shell, routing, layout & providers
│   │   ├── components/           # Reusable UI (Live Camera, Badges, Brand Logo)
│   │   ├── features/
│   │   │   ├── fleet/            # Fleet telemetry & consignment route comparisons
│   │   │   ├── incidents/        # Incident submission modal & verified dossiers
│   │   │   └── map/              # Vector GIS cartography, floating controls & telemetry
│   │   ├── hooks/                # Custom hooks (GPS live location, demo scenario)
│   │   ├── pages/                # Command Center, Fleet, Incidents, Analytics, Field
│   │   ├── services/             # DataProvider abstraction & mock simulation engine
│   │   ├── stores/               # Zustand domain stores (roads, vehicles, alerts, etc.)
│   │   └── styles/               # Design tokens, Google Maps-inspired elevation
│   ├── public/                   # Static assets & brand vectors
│   ├── package.json
│   └── vite.config.ts
├── architecture.md               # System architecture & DataProvider specifications
├── prd.md                        # Product requirements & flagship demo flow
├── phase.md                      # Milestone & phase tracking
└── rules.md                      # Engineering, tech stack & aesthetic constraints
```

---

## 🌟 Key Features

1. **Regional GIS Command Center**: High-resolution vector cartography mapping all 8 North Eastern States (Assam, Meghalaya, Arunachal Pradesh, Nagaland, Manipur, Mizoram, Tripura, Sikkim) and the Brahmaputra river artery.
2. **Google Maps-Inspired Cartographic Usability**: Dual-stroke highway casings, recognized highway shields (`[NH-6]`, `[NH-27]`, `[NH-29]`, etc.), floating search pill, and clean vertical control stacks.
3. **Live Camera Photo Incident Reporting**: WebRTC device camera stream (`getUserMedia`) with real-time target framing, telemetry watermark stamps, and a dedicated **Retake / Use Photo** workflow.
4. **Continuous Live GPS Location Sharing**: Real-time `watchPosition` updates, accuracy metrics, sector lookup, and animated radar pulse beacon on the regional map.
5. **Flagship Demo Climate Disruption Cascade (PRD §4.1)**:
   - One-click trigger: "Simulate Heavy Rainfall" on NH-6 (Guwahati – Shillong).
   - NH-6 dynamically shifts from Accessible (Green) $\to$ At Risk (Amber) $\to$ Blocked (Red).
   - Live flash-flood alert triggers automated route optimization: Route A (Compromised) vs. Route B via Jowai (Recommended, 70% lower vulnerability).
   - Operator executes live reroute in real time without page reload.
