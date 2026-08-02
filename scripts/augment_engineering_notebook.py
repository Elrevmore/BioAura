#!/usr/bin/env python3
"""Augment BioAura_Engineering_Notebook.ipynb without removing existing content."""
import json
from pathlib import Path

NOTEBOOK = Path(__file__).resolve().parent.parent / "BioAura_Engineering_Notebook.ipynb"


def md(text: str) -> dict:
    return {
        "cell_type": "markdown",
        "metadata": {},
        "source": [line + "\n" for line in text.strip().split("\n")],
    }


def living(chapter: str, status: str, todos: str, questions: str, research: str) -> dict:
    return md(f"""
### Living Notebook — {chapter}

| Field | Content |
|-------|---------|
| **Current Status** | {status} |
| **Future TODO** | {todos} |
| **Open Questions** | {questions} |
| **Research Ideas** | {research} |
""")


def reflection(chapter: str, taught: str, good: str, tradeoffs: str, change: str, avoided: str, remember: str) -> dict:
    return md(f"""
## Engineering Reflection — {chapter}

**What did this chapter teach me?**
{taught}

**Why is this architecture good?**
{good}

**What tradeoffs exist?**
{tradeoffs}

**If I built this today, what would I change?**
{change}

**What mistakes did we avoid?**
{avoided}

**What should future me remember?**
{remember}
""")


def reverse(chapter: str, exercises: str) -> dict:
    return md(f"""
## Reverse Engineering — {chapter}

_Active learning: try these before reading the hints._

{exercises}
""")


def evolution(title: str, story: str) -> dict:
    return md(f"""
## Evolution Story — {title}

{story}
""")


def math_section(content: str) -> dict:
    return md(f"""
## Mathematics Behind It

{content}
""")


def callout(kind: str, text: str) -> str:
    icons = {
        "Important": "🔵",
        "Warning": "🟡",
        "Engineering Insight": "💡",
        "Research Note": "📚",
        "Future Work": "🔮",
    }
    icon = icons.get(kind, "•")
    return f"> **{icon} {kind}:** {text}"


# --- New front matter ---
LEARNING_ROADMAP = md("""
# Learning Roadmap

_Read BioAura in this order. Each step unlocks the next._

```mermaid
flowchart TD
  A[Architecture] --> B[React Providers]
  B --> C[Three.js Scene]
  C --> D[Protein Loading]
  D --> E[MediaPipe Hand Tracking]
  E --> F[Gesture Engine]
  F --> G[Protein Rendering]
  G --> H[Selection & Raycasting]
  H --> I[Interaction Engine]
  I --> J[Scientific Analysis]
```

| Step | Topic | Why this order? |
|------|-------|-----------------|
| 1 | **Architecture** | Understand boundaries before diving into code |
| 2 | **React** | Providers wire every subsystem together |
| 3 | **Three.js** | You need a viewport before loading structures |
| 4 | **Protein Loading** | StructureModel is the data foundation for everything scientific |
| 5 | **MediaPipe** | Landmarks feed gestures — independent of protein |
| 6 | **Gesture Engine** | Semantic gestures sit on top of raw landmarks |
| 7 | **Rendering** | Turn StructureModel into visible cartoon ribbons |
| 8 | **Selection** | Picking connects mouse/gesture input to structure data |
| 9 | **Interaction Engine** | Scientific analysis requires selection + geometry |
| 10 | **Scientific Analysis** | H-bonds, neighbors, distances — the research layer |

> **💡 Engineering Insight:** BioAura was built bottom-up (scene → camera → gestures → protein) but is **understood** top-down (architecture → data → rendering → interaction). Learn in the top-down order; build in the bottom-up order.
""")

BUILD_AGAIN = md("""
---
# If I Had To Build BioAura Again

_Imagine the repository vanished. This is the optimal rebuild schedule._

```mermaid
gantt
    title Ideal BioAura Rebuild (10 days)
    dateFormat X
    axisFormat %d

    section Foundation
    React + Vite scaffold           :a1, 0, 1
    Three.js scene + SceneManager   :a2, 1, 1

    section Data
    StructureModel + PDB parser     :b1, 2, 1
    Cartoon rendering pipeline      :b2, 3, 1

    section Vision
    Camera + MediaPipe              :c1, 4, 1
    Gesture Engine                  :c2, 5, 1
    Gesture → protein control       :c3, 6, 1

    section Science
    Selection + raycasting          :d1, 7, 1
    Geometry analysis               :d2, 8, 1
    Interaction engine + H-bonds    :d3, 9, 1

    section Polish
    UI + deployment + tests in CI   :e1, 10, 1
```

| Day | Task | Why this day? |
|-----|------|---------------|
| **1** | React foundation, feature folders, path aliases | Everything else mounts on this scaffold |
| **2** | Three.js scene, SceneManager, dev orbit controls | Visual feedback before any ML |
| **3** | Protein loading, StructureModel, PDB parser | Real data validates rendering early |
| **4** | Cartoon geometry (coil tube first, then helix/sheet) | Hardest rendering — tackle while fresh |
| **5** | Camera + MediaPipe hand tracking | Independent pipeline; can parallelize with Day 4 |
| **6** | Gesture Engine (pinch first, then grab/rotate/zoom) | One detector at a time with tests |
| **7** | GestureProteinController + ProteinTransformGroup | Connects vision to scene |
| **8** | SelectionManager + ProteinPicker + Inspector | Enables scientific interaction |
| **9** | GeometryAnalysisEngine + InteractionEngine + H-bonds | Pure functions — fast to test |
| **10** | UI polish, representation toggles, CI with tests | Ship only after core loops work |

> **🔵 Important:** Do **not** start with gestures or analysis. Without StructureModel and a scene, you cannot validate anything scientifically.

> **🟡 Warning:** On Day 5, pin MediaPipe WASM version to match npm package immediately — avoid the LinkError trap documented in Chapter 10.
""")

ADR_CHAPTER = md("""
---
# Architecture Decision Records (ADR)

_ADRs document *why* a decision was made, not just what was chosen._

## ADR Template

| Section | Question |
|---------|----------|
| **Problem** | What forced a decision? |
| **Options** | What alternatives existed? |
| **Advantages / Disadvantages** | Trade space |
| **Decision** | What we chose |
| **Consequences** | What follows from this choice |
| **Future alternatives** | When might we revisit? |
""")

ADRS = [
    md("""
### ADR-001: MediaPipe Tasks Vision instead of TensorFlow HandPose

| | |
|---|---|
| **Problem** | Need reliable browser hand tracking without training custom models |
| **Options** | MediaPipe Tasks Vision, TensorFlow.js HandPose, custom CNN |
| **Advantages (MediaPipe)** | Production WASM, Google-maintained, 21 landmarks, VIDEO mode |
| **Disadvantages** | WASM version pinning required; empty results in poor lighting |
| **Decision** | MediaPipe `@mediapipe/tasks-vision@0.10.35` |
| **Consequences** | Must pin WASM CDN URL; GPU delegate with CPU fallback |
| **Future alternatives** | WebNN acceleration; newer MediaPipe versions when stable |
"""),
    md("""
### ADR-002: Custom Gesture Engine instead of ML classifier

| | |
|---|---|
| **Problem** | MediaPipe outputs poses, not gestures |
| **Options** | Rule-based detectors, trained gesture classifier, vendor gesture API |
| **Advantages (custom)** | Full control over priority, hysteresis, yield rules; no training data |
| **Disadvantages** | Threshold tuning per user/environment; more code to maintain |
| **Decision** | 6 independent detectors + `GestureEngine` priority orchestration |
| **Consequences** | All thresholds in `GESTURE_CONFIG`; temporal stabilization mandatory |
| **Future alternatives** | Per-user calibration; ML overlay for ambiguous poses |
"""),
    md("""
### ADR-003: StructureModel as canonical data layer

| | |
|---|---|
| **Problem** | Protein data must serve rendering AND scientific analysis |
| **Options** | Parse directly to Three.js, single JSON blob, typed tree model |
| **Advantages (StructureModel)** | Framework-agnostic; testable parsers; Å-native coordinates |
| **Disadvantages** | Duplicate coordinate storage (model + GPU buffers) |
| **Decision** | `StructureModel → chains → residues → atoms` |
| **Consequences** | Picking, distance, H-bonds all read StructureModel — never GPU |
| **Future alternatives** | WASM parser for speed; streaming for huge structures |
"""),
    md("""
### ADR-004: Plugin Architecture for InteractionEngine

| | |
|---|---|
| **Problem** | Multiple analyzers (H-bond, salt bridge, …) must share neighbor search |
| **Options** | Monolithic function, inheritance hierarchy, registry + plugins |
| **Advantages (plugins)** | Add analyzers without touching engine; composable filters |
| **Disadvantages** | Indirection overhead; registration via side-effect import |
| **Decision** | `InteractionRegistry` + `InteractionAnalyzer` interface |
| **Consequences** | `registerDefaultInteractionAnalyzers.ts` on import; one neighbor search per query |
| **Future alternatives** | Dynamic plugin loading; analyzer priority ordering |
"""),
    md("""
### ADR-005: React Context Provider Chain

| | |
|---|---|
| **Problem** | Many subsystems need shared state without prop drilling |
| **Options** | Context, Redux/Zustand, module singletons |
| **Advantages (Context)** | Matches feature boundaries; no extra dependency |
| **Disadvantages** | Re-render risk if misused; deep nesting |
| **Decision** | Camera → HandTracking → Gesture → Protein → Representation → Selection → StructureModel |
| **Consequences** | `resultRef`/`gestureRef` pattern avoids per-frame re-renders |
| **Future alternatives** | Zustand for selection if provider depth becomes painful |
"""),
    md("""
### ADR-006: RepresentationProvider (visibility without rebuild)

| | |
|---|---|
| **Problem** | Toggle cartoon/ligands/atoms without expensive geometry rebuild |
| **Options** | Rebuild on toggle, separate scenes, visibility flags |
| **Advantages (visibility)** | Instant toggle; two useEffects in ProteinMesh |
| **Disadvantages** | Hidden layers still consume GPU memory |
| **Decision** | `applyRepresentationVisibility()` sets `group.visible` |
| **Consequences** | Build effect and visibility effect are separate concerns |
| **Future alternatives** | LOD system; unload hidden layers for huge structures |
"""),
    md("""
### ADR-007: GeometryAnalysisEngine (pure geometry)

| | |
|---|---|
| **Problem** | Distance and neighbor search needed without Three.js coupling |
| **Options** | Three.js world-space distance, StructureModel pure functions |
| **Advantages (pure)** | Unit-testable; Å-native; works headless |
| **Disadvantages** | O(n) neighbor search — no spatial index yet |
| **Decision** | `GeometryUtils` + `DistanceAnalyzer` + `NeighborAnalyzer` facade |
| **Consequences** | Inspector and InteractionEngine share same math |
| **Future alternatives** | Octree/k-d tree for large structures |
"""),
    md("""
### ADR-008: createPortal for MeasurementOverlay

| | |
|---|---|
| **Problem** | Measurement line must align with protein coordinates |
| **Options** | Sibling group with manual transform sync, portal into protein group |
| **Advantages (portal)** | Automatic transform inheritance; no sync bugs |
| **Disadvantages** | R3F portal complexity; harder to debug |
| **Decision** | `createPortal` into `protein-structure` named group |
| **Consequences** | Overlay moves with protein manipulation automatically |
| **Future alternatives** | Custom shader overlay in screen space |
"""),
    md("""
### ADR-009: Parallel Transport Frames for cartoon ribbons

| | |
|---|---|
| **Problem** | Ribbon normals twist unpredictably along CA trace |
| **Options** | Frenet frames, fixed up vector, parallel transport |
| **Advantages (PT)** | Stable normals in arbitrary orientations; no gimbal flip |
| **Disadvantages** | More math; must handle degenerate tangents |
| **Decision** | `computeParallelTransportFrames()` on Catmull-Rom curve |
| **Consequences** | Helix/sheet ribbons look smooth at sharp turns |
| **Future alternatives** | Precomputed frames from DSSP; GPU ribbon generation |
"""),
    md("""
### ADR-010: SelectionManager as external store

| | |
|---|---|
| **Problem** | Selection must work from mouse AND future gesture picking |
| **Options** | React useState, Zustand, external class + useSyncExternalStore |
| **Advantages (external)** | Framework-agnostic API; same `select()` from any input |
| **Disadvantages** | More boilerplate than useState |
| **Decision** | `SelectionManager` class with subscriber pattern |
| **Consequences** | `ProteinPicker` and future gesture picker share one API |
| **Future alternatives** | Undo/redo selection history |
"""),
]

ENCYCLOPEDIA_HEADER = md("""
---
# BioAura Encyclopedia

_Alphabetical reference for every important concept in the project._
""")

ENCYCLOPEDIA_ENTRIES = md("""
| Term | Definition | Why it exists | Where in BioAura | Related |
|------|------------|---------------|------------------|---------|
| **Acceptor** | Atom that receives H-bond (N, O, S with lone pairs) | H-bond chemistry rule | `donorAcceptorDatabase.ts` | Donor, Hydrogen Bond |
| **Angle** | Measure of rotation between two vectors | Grab-rotate, future dihedral | `handGrabTwistAngle`, `normalizeAngleDelta` | Delta Angle, Rotation |
| **Atom** | Smallest selectable structural unit | PDB fundamental entity | `StructureAtom`, picking | Residue, Chain |
| **Backbone** | N–CA–C chain of polymer residues | Defines protein fold | Cartoon follows CA trace | Ribbon, Cartoon |
| **Builder** | Function assembling Three.js groups from StructureModel | Separates data from GPU | `buildProteinGroup`, `buildCartoonGroup` | StructureModel, Parser |
| **Camera** | Webcam stream + R3F perspective camera | Input for MediaPipe; scene view | `CameraProvider`, `SceneViewport` | FPS, Frame, MediaPipe |
| **Candidate** | Atom pair proposed for interaction analysis | Plugin pipeline input | `InteractionCandidate` | Interaction Engine, Filter |
| **Cartesian Coordinates** | (x, y, z) positions in Å or normalized | All spatial math | StructureModel (Å), landmarks ([0,1]) | Vector, Distance |
| **Cartoon** | Simplified protein representation (ribbon/tube) | Visual clarity over all-atom | `buildCartoonGroup` | Ribbon, Parallel Transport |
| **Chain** | Covalently linked polymer sequence | PDB organizational unit | `StructureChain`, shift+click select | Residue, Polymer |
| **Centroid** | Average position of a set of points | Residue reference when no CA | `residueReferencePoint()` | Neighbor Search, Vector |
| **Context** | React dependency injection for subtrees | Avoid prop drilling | `AppProviders.tsx` chain | Provider, Selection |
| **Cross Product** | Vector ⊥ to two input vectors | Binormal in ribbon frames | `cartoonGeometry.ts` | Normal, Tangent, Binormal |
| **Delta Angle** | Angle change between frames (wrapped ±π) | Grab-rotate detection | `normalizeAngleDelta()` | Rotation, Smoothing |
| **Distance** | Euclidean length between two points | Pinch, H-bond, measurement | `distance3D`, `GeometryUtils.distance` | Threshold, Vector |
| **Donor** | Atom providing H for H-bond | H-bond chemistry rule | `donorAcceptorDatabase.ts` | Acceptor, Hydrogen Bond |
| **FPS** | Frames per second | Performance monitoring | `FpsCounter`, hand tracking stats | Frame, Camera |
| **Frame** | Coordinate basis (tangent, normal, binormal) at curve point | Ribbon orientation | `CurveFrame` in cartoonGeometry | Parallel Transport |
| **Geometry** | Spatial structure of atoms | Foundation for analysis | `GeometryAnalysisEngine` | Distance, Neighbor Search |
| **Gesture** | Semantic hand action (pinch, grab, zoom) | User intent from landmarks | `GestureEngine`, detectors | Landmark, Threshold |
| **Hydrogen Bond** | Non-covalent D–H···A interaction | First scientific analyzer | `HydrogenBondAnalyzer` | Donor, Acceptor, Distance |
| **Interaction Engine** | Plugin pipeline for molecular interactions | Extensible analysis | `InteractionEngine.ts` | Registry, Candidate, Plugin |
| **Landmark** | Single detected hand point (21 per hand) | MediaPipe output unit | `HandLandmarks`, `HAND_LANDMARK` | MediaPipe, Gesture |
| **Ligand** | Non-polymer molecule (HETATM) | Drug/binding visualization | `buildLigandGroup`, ligand selection | Atom, Residue |
| **MediaPipe** | Google on-device ML (WASM in browser) | Hand tracking | `HandTracker.ts` | Landmark, WASM, Camera |
| **Mesh** | Three.js renderable geometry + material | GPU drawing primitive | `ProteinMesh`, cartoon meshes | Three.js, Raycasting |
| **Neighbor Search** | Find atoms within radius of target | H-bonds, inspector | `NeighborAnalyzer` | Distance, Centroid |
| **Normal** | Perpendicular vector to surface/curve | Ribbon width direction | `CurveFrame.normal` | Tangent, Binormal |
| **PDB** | Protein Data Bank text format | Primary structure source | `parsePdb.ts`, RCSB fetch | mmCIF, Parser, StructureModel |
| **Parallel Transport** | Propagate frame along curve without twist | Stable ribbon normals | `computeParallelTransportFrames` | Frame, Spline |
| **Parser** | Converts PDB/mmCIF text → StructureModel | Data ingestion | `parseStructureModel.ts` | PDB, StructureModel |
| **Picking** | Selecting 3D objects via ray intersection | Molecular inspection | `ProteinPicker`, `resolvePickHit` | Raycasting, Selection |
| **Plugin** | Registered analyzer in InteractionEngine | Extensibility | `InteractionAnalyzer` interface | Registry, Interaction Engine |
| **ProteinMesh** | R3F component rendering protein group | React integration | `ProteinMesh.tsx` | Builder, Representation |
| **Raycasting** | Project 2D pointer into 3D intersection test | Mouse picking | `THREE.Raycaster` in ProteinPicker | Picking, Mesh |
| **Registry** | Map of named analyzers | Plugin discovery | `InteractionRegistry` | Plugin, Interaction Engine |
| **Representation** | Visual style layer (cartoon, ligands, atoms) | User-controlled display | `RepresentationProvider` | Cartoon, Visibility |
| **Residue** | Amino acid or HETATM group | Selection granularity | `StructureResidue` | Atom, Chain |
| **Ribbon** | Flat strip along backbone | Helix/sheet cartoon | `cartoonGeometry.ts` | Cartoon, Parallel Transport |
| **Scene** | Three.js world containing all 3D objects | Rendering container | `SceneViewport` | SceneManager, Three.js |
| **SceneManager** | Pub/sub protein transform store | Decouple gestures from R3F | `SceneManager.ts` | Transform, Gesture |
| **Selection** | Currently highlighted structural entity | Analysis entry point | `SelectionManager` | Picking, Inspector |
| **Side Chain** | Residue atoms beyond backbone | Future interaction analysis | `TODO:` not visualized separately | Residue, Atom |
| **Spline** | Smooth curve through CA points | Coil backbone path | `CatmullRomCurve3` | Ribbon, Tube |
| **StructureModel** | Canonical typed protein data tree | Data/analysis foundation | `structure-model.types.ts` | Parser, Builder |
| **Threshold** | Numeric boundary for classification | Gesture stability | `GESTURE_CONFIG` | Pinch, Grab, H-bond cutoff |
| **Three.js** | WebGL 3D library | Rendering engine | Throughout scene/protein | Mesh, Raycasting |
| **Transform** | Position, rotation, scale of protein | Gesture manipulation | `SceneManager`, `ProteinTransformGroup` | Gesture, Scene |
| **Vector** | Directed quantity (x, y, z) | All spatial math | `Vec3`, `THREE.Vector3` | Distance, Cross Product |
| **Zoom** | Two-hand scale gesture | Protein size control | `TwoHandZoomDetector` | Gesture, Transform |
| **Quaternion** | 4D rotation representation | `TODO:` not used yet — Euler/Y rotation only | Future: gimbal-free rotation | Rotation, Transform |
| **Rotation Matrix** | 3×3 matrix encoding rotation | `TODO:` implicit in Three.js | `ProteinTransformGroup` applies rotation | Quaternion, Transform |
| **mmCIF** | Macromolecular Crystallographic Info File | PDB fallback format | `parseMmCif.ts` | PDB, Parser |
| **WASM** | WebAssembly — compiled MediaPipe runtime | Browser ML execution | jsDelivr CDN URL | MediaPipe, LinkError |
| **Registry** | Named plugin container | Analyzer discovery | `InteractionRegistry` | Plugin |
| **Hysteresis** | Different enter/exit thresholds | Prevent oscillation | Pinch 0.06/0.085 | Threshold, Gesture |
| **InstancedMesh** | GPU-efficient repeated geometry | Ligand atom spheres | `buildLigandGroup` | Picking, Mesh |
| **DSSP** | Secondary structure assignment algorithm | `TODO:` BioAura uses PDB HELIX/SHEET records | `annotateSecondaryStructure` | Cartoon, Helix |
""")

# Evolution stories for key systems
EVOLUTION_STORIES = {
    "ch3_mediapipe": evolution("MediaPipe Integration", """
**Initial idea:** Use MediaPipe Tasks Vision `HandLandmarker` in VIDEO mode with GPU delegate.

**Why early approach was fragile:** Unversioned WASM CDN URL resolved to a different major version than the npm JS package.

**Problems discovered:** `LinkError` on `WebAssembly.instantiate()` — JS @0.10.35 vs WASM @1.0.0 ABI mismatch.

**Alternative approaches considered:**
- Downgrade npm package to match CDN
- Bundle WASM locally with Vite
- Switch to TensorFlow.js HandPose

**Engineering reasoning:** Pinning CDN URL to `@0.10.35` is the smallest fix; local bundling is better long-term.

**Final solution:** `DEFAULT_MEDIAPIPE_WASM` pinned in `hand-tracking.types.ts` + `.env.example`.

**Remaining limitations:** Empty landmark arrays in poor lighting; no per-user calibration; GPU delegate may fail silently to CPU.
"""),
    "ch3_gesture": evolution("Gesture Engine", """
**Initial idea:** Single function classifying gesture type from landmarks each frame.

**Why it failed:** Gestures flickered — pinch would oscillate on/off at 30fps; grab and rotate conflicted.

**Problems discovered:**
- Raw landmark noise breaks boolean thresholds
- Multiple gestures can be "almost true" simultaneously
- Two-hand and one-hand modes interfere

**Alternative approaches:**
- ML gesture classifier (rejected: needs training data, opaque)
- MediaPipe Gesture Recognizer (rejected: less control over priority/yield)
- Single state machine for all gestures (rejected: too complex)

**Engineering reasoning:** Independent detector classes + explicit priority list + temporal frame counters.

**Final solution:** 6 detectors in `GestureEngine` constructor order; `GESTURE_CONFIG` centralizes all thresholds; stateful detectors reset on hand loss.

**Remaining limitations:** Thresholds tuned for one environment; no per-user calibration; grab_rotate vs pinch requires careful yield rules.
"""),
    "ch3_grab_rotate": evolution("GrabRotateDetector", """
**Initial idea:** Detect wrist rotation immediately when grab pose appears.

**Why it failed:** False rotations from noisy angle measurements; rotation triggered during grab-to-translate.

**Problems discovered:**
- Wrist angle wraps at ±π — raw delta spikes
- Brief stillness during rotation looked like "stop"
- Pinch should override rotation for translation

**Alternative approaches:**
- Use palm normal vector (rejected: less stable than wrist MCP angle)
- Immediate rotation without arming (rejected: too noisy)
- Separate ML model for rotate vs translate (rejected: overkill)

**Engineering reasoning:** Three-state machine: Idle → Armed (grab hold) → Rotating (sustained movement); EMA smoothing on angle; `normalizeAngleDelta` for wraparound.

**Final solution:** `grabRotateGrabHoldFrames: 2`, `movementFrames: 2`, `stillFrames: 4`, `grabRotateAngleSmoothing: 0.4`.

**Remaining limitations:** Rotation axis locked to Y in protein space; no 6-DOF manipulation.
"""),
    "ch3_representation": evolution("Representation System", """
**Initial idea:** Rebuild protein geometry when user toggles representation layers.

**Why it failed:** Toggle caused visible lag; unnecessary CPU/GPU work; React effect churn.

**Problems discovered:** Cartoon, ligands, and polymer-atoms are independent groups — visibility is sufficient.

**Alternative approaches:**
- Three separate protein loaders (rejected: triple memory for same structure)
- Single merged mesh (rejected: can't toggle parts)
- Lazy build on first toggle (rejected: first toggle still slow)

**Engineering reasoning:** Build once, toggle `group.visible` — two `useEffect`s in `ProteinMesh`.

**Final solution:** `RepresentationProvider` + `applyRepresentationVisibility()`.

**Remaining limitations:** Hidden layers still consume GPU memory; no LOD for large structures.
"""),
    "ch3_selection": evolution("Selection System", """
**Initial idea:** Raycast → search StructureModel linearly for nearest atom.

**Why it failed:** O(n) search per click; instanceId mapping unclear for InstancedMesh.

**Problems discovered:**
- `buildLigandGroup` atom order must match pick index exactly
- Cartoon meshes don't map 1:1 to atoms — need nearest CA
- Selection must work for future gesture input, not just mouse

**Alternative approaches:**
- Color-based picking render pass (rejected: complexity for current scale)
- React state for selection (rejected: can't share with gesture picker)
- GPU picking buffer (rejected: overkill)

**Engineering reasoning:** Precompute `buildPickIndex` at load time; `SelectionManager` as external store; `resolvePickHit` handles mesh-type-specific logic.

**Final solution:** O(1) instanceId lookup; cartoon name parsing; shift+click for coarser selection.

**Remaining limitations:** Gesture picking not implemented; no hover preview; no multi-select of residues.
"""),
    "ch3_protein_rendering": evolution("Protein Rendering", """
**Initial idea:** Render all atoms as spheres (CPK model).

**Why it failed:** Hemoglobin has thousands of atoms — cluttered, slow, unreadable.

**Problems discovered:**
- Secondary structure (helix/sheet/coil) needs different geometry per type
- Ribbon normals twist with Frenet frames at sharp turns
- Gaps appear between adjacent secondary structure segments

**Alternative approaches:**
- External library (NGL, Mol*) (rejected: less control, harder gesture integration)
- Single tube for entire chain (rejected: loses SS semantics)
- Frenet frames (rejected: gimbal flip at inflection points)

**Engineering reasoning:** CA-trace Catmull-Rom splines + parallel transport frames + per-SS geometry (tube/ribbon/arrow).

**Final solution:** `cartoonGeometry.ts` + `cartoonSegmentConnectivity.ts` for gap fix.

**Remaining limitations:** No side-chain display; no surface representation; no animation between conformations.
"""),
    "ch3_interaction": evolution("Interaction Engine", """
**Initial idea:** Single `detectHydrogenBonds()` function called from Inspector.

**Why it failed:** Every new interaction type would duplicate neighbor search and candidate generation.

**Problems discovered:**
- H-bonds, salt bridges, hydrophobic contacts share the same neighbor pool
- Filters differ per analyzer but candidates are the same
- Inspector must show results from multiple analyzers

**Alternative approaches:**
- Monolithic analyzer function (rejected: doesn't scale)
- Class inheritance per interaction (rejected: rigid)
- Microservice API (rejected: browser-only app)

**Engineering reasoning:** Registry + plugin interface; neighbor search once per query; composable `GeometryFilters`.

**Final solution:** `InteractionEngine.analyze()` pipeline with `HydrogenBondAnalyzer` as first plugin.

**Remaining limitations:** 7 interaction types are placeholders; no 3D overlay for H-bonds; distance-only confidence (no angle).
"""),
    "ch3_hbond": evolution("Hydrogen Bond Analyzer", """
**Initial idea:** Check all atom pairs within 3.5 Å for H-bond character.

**Why naive approach failed:** Too many false positives — any close O and N aren't necessarily H-bonded.

**Problems discovered:**
- Need donor/acceptor chemistry rules
- Same residue pairs should be excluded
- Confidence should vary with distance
- Duplicate pairs from symmetric detection

**Alternative approaches:**
- Full D–H···A angle criterion (deferred: Phase 8 is distance-only)
- External chemistry library (rejected: bundle size, dependency)
- Implicit hydrogen placement (deferred: Phase 8 uses heavy atoms only)

**Engineering reasoning:** `donorAcceptorDatabase` lookup + `orientHydrogenBondPair()` + tiered confidence + deduplication.

**Final solution:** `HydrogenBondAnalyzer` plugin with `differentResidue()` + `withinDistance(3.5)` filters.

**Remaining limitations:** No angle criterion; no explicit hydrogen atoms; no visualization overlay; `TODO:` validate against literature structures.
"""),
}


def insert_after(cells: list, marker: str, new_cells: list) -> list:
    """Insert new_cells after the last cell containing marker."""
    idx = None
    for i, c in enumerate(cells):
        if marker in "".join(c.get("source", [])):
            idx = i
    if idx is None:
        return cells + new_cells
    return cells[: idx + 1] + new_cells + cells[idx + 1 :]


def insert_before(cells: list, marker: str, new_cells: list) -> list:
    for i, c in enumerate(cells):
        if marker in "".join(c.get("source", [])):
            return cells[:i] + new_cells + cells[i:]
    return new_cells + cells


def main():
    nb = json.loads(NOTEBOOK.read_text(encoding="utf-8"))
    cells = nb["cells"]

    if any("# Learning Roadmap" in "".join(c.get("source", [])) for c in cells):
        print("Notebook already augmented — skipping to avoid duplicates.")
        print("Delete '# Learning Roadmap' cell manually to re-run.")
        return

    # 1. Learning Roadmap after Reading Guide
    cells = insert_after(cells, "## Reading Guide", [LEARNING_ROADMAP])

    ch1 = [
            living("Chapter 1", "Vision documented; portfolio project", "Add personal origin story", "Is this research or education first?", "Molecular signaling visualization papers"),
            reflection("Chapter 1",
                "BioAura is a platform, not a viewer. The scientific analysis layer is the long-term value.",
                "Separating vision from implementation lets the architecture evolve without losing direction.",
                "Ambitious scope vs. shipping incrementally.",
                "Start with StructureModel + one analyzer before gestures.",
                "Building gestures before data model; monolithic architecture.",
                "The gesture UX is the hook; the science layer is the substance."),
    ]
    cells = insert_after(cells, "`TODO:` Personal origin story (course, mentor, competition).", ch1)

    ch2 = [
            evolution("Overall Architecture", """
**Initial idea:** Single React app with everything in `App.tsx`.

**Why it failed:** Camera, gestures, protein, and analysis have different lifecycles and test needs.

**Problems discovered:** Per-frame hand tracking cannot trigger React re-renders; protein parsing is CPU-heavy; analysis must be pure functions.

**Alternative approaches:** Micro-frontends (rejected: overkill), monolithic store (rejected: wrong granularity).

**Engineering reasoning:** Feature folders + provider chain + independent data layer (`StructureModel`).

**Final solution:** Documented provider chain and independence matrix.

**Remaining limitations:** Deep provider nesting; no lazy loading of analysis modules.
"""),
            math_section("""
**Coordinate systems in BioAura (three spaces):**

1. **Normalized image space** (MediaPipe): \\(x, y \\in [0,1]\\), \\(z\\) relative depth
2. **StructureModel space** (PDB): Cartesian Ångströms, centered at origin
3. **Three.js world space**: Transformed by `ProteinTransformGroup` (translate, rotate Y, scale)

Gesture pinch deltas live in space 1; distances in Inspector live in space 2; rendering applies space 3 on top of space 2.

\\[
\\vec{p}_{\\text{world}} = T_{\\text{scale}} \\cdot R_y(\\theta) \\cdot T_{\\text{translate}} \\cdot \\vec{p}_{\\text{Å}}
\\]

> **💡 Engineering Insight:** Never mix these spaces in one function. `GestureProteinController` converts gesture deltas; `GeometryAnalysisEngine` never touches Three.js.
"""),
            living("Chapter 2", "Architecture stable; 8 providers", "Lazy-load analysis; reduce provider depth", "When does Context become painful?", "Event-driven architecture between features"),
            reflection("Chapter 2",
                "Independence boundaries are the most important architectural fact.",
                "You can test parsers and geometry without a browser.",
                "Provider depth vs. clarity; duplicate coordinate storage.",
                "Introduce a thin event bus between Gesture and Selection.",
                "Coupling analysis to Three.js mesh state.",
                "Draw the independence matrix before writing code."),
            reverse("Chapter 2", """
1. **How would you split a monolithic React app into features?**
   - *Hint:* What changes at different rates? What can be tested headlessly?

2. **How would you avoid re-rendering React on every 30fps hand frame?**
   - *Hint:* What React pattern stores mutable per-frame data?

3. **How would you design a transform system for gesture manipulation?**
   - *Hint:* Who writes transforms? Who reads them? Is React state appropriate?

<details><summary>Hints expanded</summary>

1. Features = camera, gestures, protein, scene, ui. Shared = types, config, utils.
2. `useRef` + `resultRef` pattern — read in animation loop, never `setState` per frame.
3. Pub/sub store (`SceneManager`) — gestures write, R3F `useFrame` reads.

</details>
"""),
    ]
    cells = insert_after(cells, "| SceneManager | MediaPipe, PDB |", ch2)

    # Chapter 3 - insert evolution stories after phase 8 detail, then reflection
    ch3_insertions = [
        EVOLUTION_STORIES["ch3_mediapipe"],
        EVOLUTION_STORIES["ch3_gesture"],
        EVOLUTION_STORIES["ch3_grab_rotate"],
        EVOLUTION_STORIES["ch3_representation"],
        EVOLUTION_STORIES["ch3_selection"],
        EVOLUTION_STORIES["ch3_protein_rendering"],
        EVOLUTION_STORIES["ch3_interaction"],
        EVOLUTION_STORIES["ch3_hbond"],
        living("Chapter 3", "Phases 1–10 bootstrap + analysis 4–8 complete", "Add git commits; record dates", "Exact order of analysis vs bootstrap phases?", "Phase 9 spatial indexing"),
        reflection("Chapter 3",
            "BioAura was built incrementally — each phase solved one problem completely before moving on.",
            "Phase comments in constants.ts create a traceable history even without git.",
            "Two phase numbering systems cause confusion.",
            "Commit after every phase; run tests in CI from day one.",
            "Building analysis before StructureModel; gestures before scene.",
            "The WASM pin bug is a lesson: version-pin ALL native assets."),
        reverse("Chapter 3", """
1. **How would you plan a 10-phase project so each phase is independently testable?**
2. **How would you document phases without git history?**
3. **What is the minimum viable order to get *something* on screen by Day 2?**

<details><summary>Answer sketch</summary>

1. Each phase produces a visible/testable artifact. Never start phase N+1 until phase N passes CI.
2. Phase comments in config, README checklist, engineering notebook (this file).
3. React scaffold → Three.js scene → placeholder mesh. Everything else can wait.

</details>
"""),
    ]
    cells = insert_after(cells, "### Analysis Phase 8 — Hydrogen Bond Analyzer (Detail)", ch3_insertions)

    # Chapters 4-13 augmentations
    ch4 = [
        math_section("""
Technology choices are tradeoffs, not winners. When evaluating a library, compute:

\\[
\\text{Score} = w_1 \\cdot \\text{maintained} + w_2 \\cdot \\text{ecosystem} + w_3 \\cdot \\text{testability} - w_4 \\cdot \\text{bundle\\_size}
\\]

BioAura weights **testability** and **ecosystem** highly for core deps (Three.js, React).

> **📚 Research Note:** Vitest was listed in early specs but Node built-in test runner won because protein parsers need zero DOM mocking.
"""),
        living("Chapter 4", "Stack locked at versions in package.json", "Evaluate Vitest if DOM tests needed", "Upgrade Three.js r174 breaking changes?", "WebGPU renderer when stable"),
        reflection("Chapter 4",
            "Every technology choice is a constraint on future you.",
            "Boring, popular tools (React, Three.js, Vite) reduce bus factor to 1.",
            "MediaPipe WASM pinning is ongoing maintenance.",
            "Bundle WASM locally; add tests to GitHub Actions.",
            "Exotic ML frameworks for gestures; custom test framework.",
            "Pin native asset versions on day one."),
        reverse("Chapter 4", """
1. **Why would you choose Node test runner over Vitest for this project?**
2. **What breaks if you upgrade MediaPipe without pinning WASM?**
3. **Why RCSB REST instead of embedding PDB files?**

<details><summary>Hints</summary>

1. Pure functions, no DOM, zero config, already on Node 20+.
2. LinkError — ABI mismatch between JS and WASM (see Ch 10 Bug 1).
3. Dynamic search, any PDB ID, smaller bundle, always latest revision.

</details>
"""),
    ]
    cells = insert_after(cells, "**CI gap:** GitHub Actions does not run tests", ch4)

    ch5 = [
        math_section("""
**Euclidean distance** between landmarks (normalized space):

\\[
d = \\sqrt{(x_1-x_2)^2 + (y_1-y_2)^2 + (z_1-z_2)^2}
\\]

Implemented as `distance3D()` in `shared/utils/math.ts`.

**Palm center** (centroid of 3 landmarks):

\\[
\\vec{c} = \\frac{1}{3}(\\vec{w}_{\\text{wrist}} + \\vec{v}_{\\text{index MCP}} + \\vec{v}_{\\text{pinky MCP}})
\\]

**FPS** estimation: count frames in rolling 1000ms window — \\( \\text{FPS} = N_{\\text{frames}} / 1\\text{s} \\).

> **🟡 Warning:** MediaPipe \\(z\\) is relative depth, not meters. Never convert to Ångströms.
"""),
        md("""
```mermaid
sequenceDiagram
    participant Cam as Camera 30fps
    participant Vid as Video Element
    participant RVFC as requestVideoFrameCallback
    participant MP as MediaPipe WASM
    participant Ref as resultRef

    loop Each frame
        Cam->>Vid: new frame
        Vid->>RVFC: callback(timestamp)
        RVFC->>MP: detectForVideo(video, ts)
        MP-->>Ref: landmarks[0..1][0..20]
    end
    Note over Ref: No React setState
```
"""),
        living("Chapter 5", "Hand tracking production-ready", "Bundle WASM locally", "Optimal resolution vs accuracy?", "MediaPipe Holistic for body+hand"),
        reflection("Chapter 5",
            "MediaPipe is a pose estimator, not a gesture system. Know what your ML model actually outputs.",
            "resultRef pattern keeps 30fps inference off React's render path.",
            "Empty results look like bugs but are environmental.",
            "Self-host WASM; add confidence visualization.",
            "Treating MediaPipe z as metric depth; re-rendering on every frame.",
            "Same video element for display and inference — display CSS mirror does not affect inference."),
        reverse("Chapter 5", """
1. **How would you pipe webcam frames to an ML model without freezing the UI?**
   - *Hint:* Where does inference run? What thread?

2. **How would you draw 21 landmarks on a canvas overlay?**
   - *Hint:* Normalized coords → pixel coords transformation.

3. **Why use VIDEO mode instead of IMAGE mode?**

<details><summary>Answers</summary>

1. `requestVideoFrameCallback` or RAF; store in ref; never setState per frame.
2. \\(x_{\\text{px}} = x_{\\text{norm}} \\times \\text{width}\\); flip x if mirrored display.
3. Temporal tracking — smoother landmarks across frames.

</details>
"""),
    ]
    cells = insert_after(cells, "- Guarantee detection in poor lighting (returns `[]`)", ch5)

    ch6 = [
        EVOLUTION_STORIES["ch3_gesture"],
        EVOLUTION_STORIES["ch3_grab_rotate"],
        math_section("""
**Pinch detection** — distance threshold with hysteresis:

\\[
\\text{pinch active} \\iff d_{\\text{thumb-index}} < 0.06, \\quad \\text{held} \\iff d < 0.085
\\]

**Finger extension ratio:**

\\[
r_{\\text{ext}} = \\frac{d(\\text{wrist}, \\text{tip})}{d(\\text{wrist}, \\text{pip})}
\\]

Finger extended if \\(r_{\\text{ext}} \\geq 1.08\\).

**Grab twist angle** (wrist roll in XZ plane):

\\[
\\theta = \\operatorname{atan2}(z_{\\text{mcp}} - z_{\\text{wrist}},\\; x_{\\text{mcp}} - x_{\\text{wrist}})
\\]

**Delta angle** (wrapped to \\([-\\pi, \\pi]\\)):

\\[
\\Delta\\theta = \\operatorname{atan2}(\\sin(\\theta_t - \\theta_{t-1}),\\; \\cos(\\theta_t - \\theta_{t-1}))
\\]

**EMA smoothing:** \\(\\theta_{\\text{smooth}} = \\theta_{\\text{prev}} + \\alpha \\cdot \\Delta\\theta\\) where \\(\\alpha = 0.4\\).

**Two-hand zoom:** \\(\\Delta d = d_{\\text{palms}}(t) - d_{\\text{palms}}(t-1)\\)

> **💡 Engineering Insight:** Hysteresis + frame counters = cheap temporal filter. No Kalman needed at 30fps.
"""),
        living("Chapter 6", "6 detectors stable", "Per-user calibration UI", "Optimal enter/exit frame counts?", "Gesture recording for regression tests"),
        reflection("Chapter 6",
            "Gestures are state machines, not classifiers. Think in frames, not snapshots.",
            "Priority list + yield rules resolve conflicts deterministically.",
            "Threshold tuning is environment-dependent.",
            "Build pinch first, test with recorded landmark sequences.",
            "ML gesture classifier for 6 simple gestures.",
            "GrabRotate is a 3-state machine — draw it before coding."),
        reverse("Chapter 6", """
1. **How would you detect Pinch yourself?**
   - *Hint:* Which two landmarks? What distance metric?

2. **How would you stabilize noisy gestures?**
   - *Hint:* Enter frames, exit frames, hysteresis — pick two.

3. **How would you resolve pinch vs grab_rotate conflict?**
   - *Hint:* Priority list and yield function.

4. **How would you detect two-hand zoom?**

<details><summary>Hints before answers</summary>

1. Thumb tip (4) and index tip (8); Euclidean distance in normalized space; threshold 0.06.
2. Require 2 consecutive qualifying frames to enter; 3 to exit; different enter/exit thresholds.
3. Pinch has higher priority; `GrabRotateDetector` calls `yieldsToPinch()`.
4. Track palm center distance between two hands; delta > `twoHandMinDistance` threshold.

</details>
"""),
    ]
    cells = insert_after(cells, "- `grab`/`release`/`open_palm` → end manipulation", ch6)

    ch7 = [
        EVOLUTION_STORIES["ch3_protein_rendering"],
        EVOLUTION_STORIES["ch3_representation"],
        math_section("""
**Catmull-Rom spline** through CA points — smooth curve \\(C(u)\\) for \\(u \\in [0,1]\\).

**Tangent** at parameter \\(u\\): \\(\\vec{T} = C'(u) / \\|C'(u)\\|\\)

**Parallel transport** updates normal \\(\\vec{N}\\) and binormal \\(\\vec{B}\\):

\\[
\\vec{B}_{i+1} = \\frac{\\vec{T}_i \\times \\vec{T}_{i+1}}{\\|\\vec{T}_i \\times \\vec{T}_{i+1}\\|}, \\quad
\\vec{N}_{i+1} = \\vec{B}_{i+1} \\times \\vec{T}_{i+1}
\\]

**Cross product** \\(\\vec{a} \\times \\vec{b}\\) gives a vector perpendicular to both — used for ribbon width direction.

**Ribbon vertex** at frame \\(i\\):

\\[
\\vec{v}_{\\pm} = C(u_i) \\pm \\frac{w}{2} \\vec{N}_i
\\]

where \\(w\\) = `HELIX_RIBBON_WIDTH` (1.6 Å) or `SHEET_WIDTH` (1.55 Å).

**Tube (coil):** `TubeGeometry` with radius `TUBE_RADIUS = 0.38` Å along the same spline.

> **📚 Research Note:** α-helix pitch in biology ≈ 5.4 Å per turn — BioAura uses this for helix ribbon spacing.
"""),
        md("""
```mermaid
flowchart LR
    PDB[PDB text] --> Parse[parseStructureModel]
    Parse --> SS[annotateSecondaryStructure]
    SS --> Center[centerStructureModel]
    Center --> Cartoon[buildCartoonGroup]
    Center --> Lig[buildLigandGroup]
    Center --> Atoms[buildPolymerAtomGroup]
    Cartoon --> Merge[buildProteinGroup]
    Lig --> Merge
    Atoms --> Merge
    Merge --> Scale[centerAndScaleGroup size=5]
    Scale --> Vis[applyRepresentationVisibility]
    Vis --> GPU[WebGL render]
```
"""),
        living("Chapter 7", "Cartoon + ligands + hidden atoms", "Side-chain display; surface mesh", "DSSP vs PDB SS records?", "GPU ribbon generation"),
        reflection("Chapter 7",
            "StructureModel is the most important abstraction in BioAura.",
            "Parallel transport prevents ribbon twisting — worth the math.",
            "Build once, toggle visibility — never rebuild for toggles.",
            "Start with coil tubes only; add helix/sheet after pipeline works.",
            "Parsing directly to Three.js; Frenet frames for normals.",
            "CA trace is the backbone — everything cartoon-related follows it."),
        reverse("Chapter 7", """
1. **How would you render a protein ribbon from a list of CA coordinates?**
   - *Hint:* Spline → frames → strip vertices.

2. **Why parallel transport instead of a fixed 'up' vector?**

3. **How would you center a structure at the origin?**

<details><summary>Hints</summary>

1. CatmullRomCurve3 → computeParallelTransportFrames → emit triangle strip along ±N direction.
2. Fixed up vector flips at certain orientations (gimbal-like artifact).
3. Subtract centroid of all atom coordinates: \\(\\vec{p}' = \\vec{p} - \\vec{c}_{\\text{centroid}}\\).

</details>
"""),
    ]
    cells = insert_after(cells, "Two `useEffect`s in `ProteinMesh`: one for build, one for visibility.", ch7)

    ch8 = [
        EVOLUTION_STORIES["ch3_selection"],
        math_section("""
**Raycasting:** Cast ray from camera through pointer \\((x_n, y_n)\\) in NDC:

\\[
x_{\\text{ndc}} = \\frac{2x_{\\text{px}}}{w} - 1, \\quad y_{\\text{ndc}} = -\\frac{2y_{\\text{px}}}{h} + 1
\\]

Three.js `Raycaster` computes intersection with mesh triangles.

**Atom distance** (Inspector measurement):

\\[
d_{\\text{Å}} = \\sqrt{(x_a-x_b)^2 + (y_a-y_b)^2 + (z_a-z_b)^2}
\\]

**Neighbor search:** all atoms where \\(d_{\\text{Å}}(\\text{source}, \\text{atom}) \\leq r\\) (default \\(r = 5\\) Å).

**Residue reference point:** CA atom if present, else centroid of residue atoms.

> **🔵 Important:** Pick index atom order must exactly mirror `buildLigandGroup` instance order.
"""),
        living("Chapter 8", "Mouse picking works; distance for 2 atoms", "Gesture picking; hover preview", "Spatial index for neighbors?", "Angle/dihedral with 4-atom queue"),
        reflection("Chapter 8",
            "Selection is the bridge between human input and scientific analysis.",
            "External store pattern enables multiple input modalities.",
            "O(n) neighbor search won't scale to huge structures.",
            "Implement gesture picking using same SelectionManager API.",
            "Linear StructureModel search on every click.",
            "buildPickIndex is fragile — test it whenever render order changes."),
        reverse("Chapter 8", """
1. **How would you build a raycaster for mouse picking?**
2. **How would you map an InstancedMesh hit to a specific atom?**
3. **How would you compute distance between two selected atoms?**

<details><summary>Hints</summary>

1. Normalize pointer to NDC; `raycaster.setFromCamera(pointer, camera)`; `intersectObjects(targets)`.
2. Pre-build index array matching instance creation order; `hit.instanceId` → index.
3. Read atom coords from StructureModel; Euclidean distance in Å — never from mesh vertices.

</details>
"""),
    ]
    cells = insert_after(cells, "`ProteinPicker` comment: gesture picking should call same `SelectionManager.select()` API.", ch8)

    ch9 = [
        EVOLUTION_STORIES["ch3_interaction"],
        EVOLUTION_STORIES["ch3_hbond"],
        math_section("""
**Interaction candidate distance:**

\\[
d = \\|\\vec{a}_{\\text{donor}} - \\vec{a}_{\\text{acceptor}}\\|
\\]

**H-bond cutoff:** detect if \\(d \\leq 3.5\\) Å (typical hydrogen bond range in structural biology).

**Confidence tiers** (Phase 8 — distance only):

| Condition | Confidence |
|-----------|------------|
| \\(d < 2.7\\) | 1.0 |
| \\(2.7 \\leq d < 3.0\\) | 0.8 |
| \\(3.0 \\leq d < 3.3\\) | 0.6 |
| \\(3.3 \\leq d \\leq 3.5\\) | 0.4 |

**Centroid** of residue (fallback reference):

\\[
\\vec{c} = \\frac{1}{N}\\sum_{i=1}^{N} \\vec{a}_i
\\]

> **🔮 Future Work:** Add angle criterion \\(\\angle D\\text{-}H\\cdots A > 120°\\) for higher specificity.
"""),
        md("""
```mermaid
stateDiagram-v2
    [*] --> Query: User selects atom/residue
    Query --> Neighbors: findNeighborAtoms once
    Neighbors --> Candidates: buildInteractionCandidates
    Candidates --> Filter: per-analyzer filters
    Filter --> Analyze: analyzer.analyze()
    Analyze --> Results: InteractionResult[]
    Results --> Inspector: display
```
"""),
        living("Chapter 9", "H-bond analyzer live; 7 types placeholder", "Salt bridge; hydrophobic; H-bond overlay", "Implicit hydrogen placement?", "Docking score integration"),
        reflection("Chapter 9",
            "Plugin architecture means new science ships without touching the engine.",
            "One neighbor search per query — critical performance invariant.",
            "Distance-only H-bonds have false positives.",
            "Add angle criterion before adding more analyzers.",
            "Monolithic interaction function.",
            "Register analyzers via side-effect import — document this pattern."),
        reverse("Chapter 9", """
1. **How would you implement a plugin architecture for analyzers?**
2. **Why run neighbor search only once per query?**
3. **How would you detect a hydrogen bond between two atoms?**

<details><summary>Hints</summary>

1. Interface with `analyze(context)` + `candidateFilters`; registry Map; engine loops registered plugins.
2. Neighbor search is O(n) — duplicating per analyzer is O(analyzers × n).
3. Check donor/acceptor types in database; distance ≤ 3.5 Å; different residues; orient D→A.

</details>
"""),
    ]
    cells = insert_after(cells, "Each adds a plugin — no changes to `InteractionEngine` core.", ch9)

    ch10 = [
        md("""
```mermaid
flowchart TD
    A[Symptom observed] --> B[Reproduce reliably?]
    B -->|No| C[Check environment / logging]
    B -->|Yes| D[Isolate subsystem]
    D --> E[Form hypothesis]
    E --> F[Test hypothesis]
    F -->|Wrong| E
    F -->|Right| G[Fix + regression test]
    G --> H[Document in notebook]
```
"""),
        living("Chapter 10", "5 major bugs documented", "Add regression tests for WASM pin", "Other undiscovered bugs?", "Automated gesture landmark replay tests"),
        reflection("Chapter 10",
            "Most 'bugs' are mismatched assumptions about what a library actually does.",
            "Debugging journal prevents re-learning the same lessons.",
            "Environmental issues look identical to code bugs.",
            "Add diagnostic mode behind feature flag, not removed entirely.",
            "Assuming MediaPipe z is metric; assuming CDN always serves matching WASM.",
            "When inference returns empty, check environment before rewriting code."),
        reverse("Chapter 10", """
1. **You see LinkError on WASM load. What do you check first?**
2. **Hands never detected but video plays. What are 3 non-code causes?**
3. **Pick index returns wrong atom. What likely broke?**

<details><summary>Answers</summary>

1. JS package version vs WASM CDN URL version.
2. Lighting, hand out of frame, confidence below threshold.
3. Render order changed in buildLigandGroup without updating buildPickIndex.

</details>
"""),
    ]
    cells = insert_after(cells, "- **Reality:** `package.json` includes `npm run test`", ch10)

    ch11 = [
        living("Chapter 11", "Decision table complete", "Migrate to formal ADR files in repo", "Which decisions need revisiting first?", "ADR for spatial indexing"),
        reflection("Chapter 11",
            "Document decisions when you make them, not six months later.",
            "Rejected alternatives are as valuable as chosen ones.",
            "Every 'why not X' saves future you a week.",
            "Move ADRs to `docs/adr/` as markdown files alongside notebook.",
            "Choosing trendy tools over boring ones.",
            "If you can't explain why X was rejected, you don't understand the decision."),
        reverse("Chapter 11", """
1. **Pick any BioAura decision. Write a one-paragraph ADR for it using the template.**
2. **For StructureModel: what would break if you deleted it?**
3. **Why is 'rejected alternative' a required ADR field?**

<details><summary>Hint for #2</summary>

Picking, distance, H-bonds, Inspector — all read StructureModel. Rendering would need a new data source. Tests would lose headless capability.

</details>
"""),
    ]
    cells = insert_after(cells, "- Consider Vitest if DOM testing becomes necessary", ch11)

    ch12 = [
        md("""
```mermaid
timeline
    title BioAura Scientific Roadmap
    section Done
        Picking & Inspection : done
        Distance Measurement : done
        Hydrogen Bonds : done
    section Next
        Salt Bridges : active
        Gesture Picking : planned
        H-bond Overlay : planned
    section Future
        Pocket Detection : future
        Docking : future
        Molecular Signaling : future
"""),
        living("Chapter 12", "H-bonds implemented; roadmap defined", "Salt bridge analyzer", "Which feature unlocks most research value?", "Compare with PyMOL interaction detection"),
        reflection("Chapter 12",
            "The plugin architecture means the roadmap is a list of analyzers to write, not architecture to change.",
            "Each analyzer is independently shippable.",
            "Science features without visualization are invisible to users.",
            "Build H-bond 3D overlay before salt bridges.",
            "Adding features that require restructuring InteractionEngine.",
            "The roadmap is additive — protect the plugin contract."),
    ]
    cells = insert_after(cells, "- Research platform for lightweight structural analysis", ch12)

    ch13 = [
        living("Chapter 13", "Editable personal section", "Fill in after each phase", "Your open questions", "Papers you read"),
        reflection("Chapter 13",
            "This chapter is yours — the notebook learns only if you write in it.",
            "Personal notes capture context that code never will.",
            "Time spent writing reflections compounds.",
            "Update after every merged phase.",
            "Skipping personal notes (this one!).",
            "Future you will thank present you for one sentence per phase."),
    ]
    cells = insert_after(cells, "- [ ] Verify H-bond results against known structures manually", ch13)

    # New chapters before appendices
    cells = insert_before(cells, "---\n# Appendix A", [BUILD_AGAIN, ADR_CHAPTER] + ADRS)

    # Encyclopedia before Appendix C (replace appendix C position - insert before it, keep C)
    cells = insert_before(cells, "---\n# Appendix C", [ENCYCLOPEDIA_HEADER, ENCYCLOPEDIA_ENTRIES])

    # Add visual callout to title cell - prepend to cell 0
    title_extra = md("""
> **🔵 Important:** This is a *living* engineering book. After each development phase, update the **Living Notebook** sections — do not rewrite chapters.

> **🔮 Future Work:** See Chapter 12 (Scientific Roadmap) and per-chapter Living Notebook TODOs.
""")
    # Insert after first cell
    cells = cells[:1] + [title_extra] + cells[1:]

    nb["cells"] = cells
    NOTEBOOK.write_text(json.dumps(nb, indent=1, ensure_ascii=False), encoding="utf-8")
    print(f"Augmented notebook: {len(cells)} cells written to {NOTEBOOK}")


if __name__ == "__main__":
    main()
