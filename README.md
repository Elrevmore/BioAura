# BioAura

Private engineering repository for an interactive web application that visualizes biological protein structures in 3D with webcam hand-gesture control and molecular inspection tools.

**Status:** Private — active development. Not an open-source release.

---

## Overview

BioAura loads real structures from the RCSB Protein Data Bank (default: Hemoglobin, PDB `1HHO`), renders them as cartoon ribbons with ligand spheres, and lets users manipulate the structure via hand gestures (pinch, grab-rotate, two-hand zoom). A molecular inspector supports atom/residue/chain/ligand selection, distance measurement, neighbor search, and hydrogen-bond detection.

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| UI | React 19, TypeScript 5.7, Tailwind CSS 4, Framer Motion 12 |
| Build | Vite 6, ESLint 9 |
| 3D | Three.js 0.173, React Three Fiber 9, Drei 10 |
| Vision | MediaPipe Tasks Vision 0.10.35 (Hand Landmarker, WASM) |
| Data | RCSB PDB REST API (PDB primary, mmCIF fallback) |
| Tests | Node.js built-in test runner + tsx (76 tests, 23 suites) |
| Runtime | Node.js ≥ 20 (`.nvmrc` pins 22) |

---

## Architecture

Feature-based modules with a shared configuration and type layer:

```
src/
├── app/                    # Bootstrap, providers, global styles
├── features/
│   ├── camera/             # Webcam capture (getUserMedia)
│   ├── hand-tracking/      # MediaPipe hand landmarks
│   ├── gestures/           # Rule-based gesture engine (6 detectors)
│   ├── scene/              # Three.js scene, transforms, gesture→protein bridge
│   ├── protein/            # Loading, parsing, rendering, selection, analysis
│   └── ui/                 # HUD layout and panels
└── shared/
    ├── config/             # Application constants (GESTURE_CONFIG, etc.)
    ├── types/              # Cross-feature TypeScript contracts
    ├── lib/                # AnimationLoop coordinator
    └── utils/              # Pure utilities (math, FPS)
```

**Provider chain** (`AppProviders.tsx`):

`CameraProvider → HandTrackingProvider → GestureProvider → ProteinProvider → RepresentationProvider → SelectionProvider → StructureModelProvider`

**Key design boundaries:**
- `StructureModel` — canonical protein data (Å coordinates); independent of Three.js
- `GeometryAnalysisEngine` — pure geometry (distance, neighbors); no React/GPU
- `InteractionEngine` — plugin-based interaction analysis (H-bonds implemented)
- `GestureEngine` — interprets landmarks; independent of protein rendering
- `SceneManager` — pub/sub transform store for gesture manipulation

Path aliases: `@/`, `@app/`, `@features/`, `@shared/`

---

## Implemented Features

### Visualization
- PDB / mmCIF loading from RCSB
- Cartoon rendering (helix ribbon, sheet ribbon + arrow, coil tube)
- Ligand instanced spheres (CPK colors; HOH excluded)
- Representation toggles (cartoon, ligands, polymer-atoms)
- Holographic loading placeholder

### Gesture Control
- Webcam feed (picture-in-picture overlay)
- MediaPipe hand tracking (up to 2 hands, 21 landmarks each)
- Gestures: pinch (translate), grab-rotate, two-hand zoom, grab/release/open-palm
- Gesture → protein transform via `SceneManager`

### Molecular Inspection
- Mouse picking (raycasting) — atom, residue, chain, ligand
- Multi-atom selection (up to 4; distance measurement for 2 atoms)
- Inspector panel with entity metadata
- 3D measurement overlay (dashed line between selected atoms)
- Neighbor search (default 5 Å radius)

### Scientific Analysis
- `GeometryAnalysisEngine` — distance, neighbor atoms/residues
- `InteractionEngine` — plugin architecture
- **Hydrogen bond analyzer** (donor/acceptor rules, 3.5 Å cutoff, confidence tiers)
- Seven additional interaction types defined but **not yet implemented**

### UI & Operations
- Protein search (RCSB)
- Performance monitor (dev)
- Docker, Vercel, Netlify deployment configs
- GitHub Actions CI (lint, typecheck, build)

---

## Roadmap (Not Yet Implemented)

- Gesture-based picking (SelectionManager API ready)
- Angle / dihedral measurement (4-atom queue reserved)
- Additional interaction analyzers (salt bridge, hydrophobic, etc.)
- H-bond 3D visualization overlay
- Spatial index for neighbor search on large structures
- Tests in GitHub Actions CI workflow

See `BioAura_Engineering_Notebook.ipynb` for detailed architecture, decisions, and scientific roadmap.

---

## Development Setup

**Prerequisites:** Node.js 22 (`nvm use`), npm, modern browser with WebGL2 and webcam.

```bash
nvm use
npm install
cp .env.example .env.local   # optional — MediaPipe CDN overrides
npm run dev
```

Open `http://localhost:5173`. Camera access works on localhost without HTTPS.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server (Vite HMR) |
| `npm run build` | Production build (`dist/`) |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript (`tsc -b --noEmit`) |
| `npm run test` | 76 unit tests (parsers, geometry, interactions) |
| `npm run ci` | lint + typecheck + test + build |
| `npm run docker:build` | Build Docker image |
| `npm run docker:run` | Run container on port 8080 |

> **Note:** `.github/workflows/ci.yml` currently runs lint, typecheck, and build — **not** tests. Use `npm run ci` locally for the full gate.

---

## Documentation

| Document | Purpose |
|----------|---------|
| `README.md` | Repository entry point (this file) |
| `DEPLOYMENT.md` | Production deployment (HTTPS, Docker, Vercel, Netlify) |
| `BioAura_Engineering_Notebook.ipynb` | Engineering handbook — architecture, decisions, learning material |
| `security/csp.policy` | Content-Security-Policy reference |
| `.env.example` | Optional MediaPipe asset URL overrides |

**Recommended:** Move the engineering notebook to `docs/BioAura_Engineering_Notebook.ipynb` and add `docs/diagrams/` for exported Mermaid figures.

---

## Deployment

HTTPS is required for webcam access in production (localhost is exempt).

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for platform-specific instructions.

---

## License

Private — all rights reserved. Not licensed for public use or redistribution.
