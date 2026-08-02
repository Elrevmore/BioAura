#!/usr/bin/env python3
"""Polish BioAura_Engineering_Notebook.ipynb — additive only, no rewrites."""
import json
import re
from pathlib import Path

NOTEBOOK = Path(__file__).resolve().parent.parent / "BioAura_Engineering_Notebook.ipynb"
MARKER = "## Questions To Test Yourself"


def md(text: str) -> dict:
    return {
        "cell_type": "markdown",
        "metadata": {},
        "source": [line + "\n" for line in text.strip().split("\n")],
    }


def chapter_boundaries(cells: list) -> list[tuple[int, int, int]]:
    """Return list of (chapter_num, start_idx, end_idx_exclusive)."""
    starts: list[tuple[int, int]] = []
    for i, c in enumerate(cells):
        src = "".join(c["source"])
        m = re.search(r"^# Chapter (\d+)", src, re.MULTILINE)
        if m:
            starts.append((int(m.group(1)), i))

    bounds = []
    for j, (num, start) in enumerate(starts):
        end = starts[j + 1][1] if j + 1 < len(starts) else len(cells)
        for k in range(start + 1, end):
            s = "".join(cells[k]["source"]).strip()
            if s.startswith("# If I Had To Build") or s.startswith("# Architecture Decision"):
                end = k
                break
        bounds.append((num, start, end))
    return bounds


def last_closing_index(cells: list, start: int, end: int) -> int:
    """Find last cell of chapter closing sections (reflection/reverse/living)."""
    priority = [
        "## Reverse Engineering",
        "## Engineering Reflection",
        "### Living Notebook",
    ]
    last = end - 1
    for marker in priority:
        for i in range(end - 1, start, -1):
            if marker in "".join(cells[i]["source"]):
                return i
    return last


# ─── Per-chapter polish content ───────────────────────────────────────────────

CHAPTER_POLISH: dict[int, dict] = {
    1: {
        "insights": False,
        "misconceptions": False,
        "references": """
## References

| Source | URL / Citation |
|--------|----------------|
| RCSB Protein Data Bank | [rcsb.org](https://www.rcsb.org/) |
| PDB Format Guide | [wwPDB Documentation](https://www.wwpdb.org/documentation/file-format) |
| Hemoglobin 1HHO | [RCSB 1HHO](https://www.rcsb.org/structure/1HHO) |

## Further Reading

| Resource | Why read it |
|----------|-------------|
| *Introduction to Protein Structure* — Branden & Tooze | Foundational structural biology |
| *Molecular Biology of the Cell* — Alberts et al. (Ch. 3–4) | Why 3D structure matters biologically |
| Mol* Viewer | [molstar.org](https://molstar.org/) — state-of-the-art web molecular graphics |
| PyMOL Molecular Graphics System | [pymol.org](https://pymol.org/) — desktop gold standard |
""",
        "questions": """
## Questions To Test Yourself

**Conceptual**
1. Is BioAura primarily a viewer or an analysis platform? What evidence supports your answer?
2. Why is gesture control valuable for molecular education?

**Architecture**
3. Why separate rendering from scientific data at the vision level?
4. What subsystems must remain independent for the long-term roadmap to work?

**Engineering**
5. If you had to ship an MVP in one week, which features would you cut?

**Research**
6. What scientific question could BioAura answer that PyMOL cannot (in a browser)?
""",
    },
    2: {
        "insights": """
# Key Engineering Insights — Chapter 2

- 🧱 **Feature folders** mirror runtime boundaries — camera, gestures, protein never import each other circularly.
- 🔌 **Provider chain** order matches data flow: camera → landmarks → gestures → protein → selection.
- 📦 **StructureModel** is independent of Three.js — analysis never reads GPU state.
- 🔄 **resultRef / gestureRef** exist because 30fps data must not trigger React re-renders.
- 🎯 **SceneManager** decouples gesture writers from R3F readers.
- 🧪 **GeometryAnalysisEngine** is testable headlessly — no browser required.
- 📐 Three coordinate spaces exist — never mix normalized landmarks with Ångström coords in one function.
- 🔗 **InteractionEngine** depends on selection, not on rendering.
- ⚡ **AnimationLoop** coordinates RAF priorities across subsystems.
- 🗺️ Draw the independence matrix before writing code — it prevents coupling bugs.
""",
        "misconceptions": """
## Common Misconceptions

| Misconception | Correction |
|---------------|------------|
| "Everything should live in React state." | Per-frame tracking uses **refs**. Only UI-visible state belongs in React state or external stores. |
| "Three.js scene graph is the source of truth for science." | **StructureModel** is the source of truth. The scene graph is a visualization cache. |
| "Providers are just for avoiding prop drilling." | They encode **subsystem lifecycle** and dependency order. |
| "Gestures and protein are tightly coupled." | `GestureEngine` has zero imports from the protein feature. |
""",
        "references": """
## References

| Source | URL |
|--------|-----|
| React Documentation | [react.dev](https://react.dev/) |
| React Context | [react.dev/learn/passing-data-deeply-with-context](https://react.dev/learn/passing-data-deeply-with-context) |
| React Three Fiber | [docs.pmnd.rs/react-three-fiber](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction) |
| Drei Helpers | [github.com/pmndrs/drei](https://github.com/pmndrs/drei) |
| Three.js Manual | [threejs.org/manual](https://threejs.org/manual/) |

## Further Reading

| Resource | Topic |
|----------|-------|
| *Clean Architecture* — Robert C. Martin | Dependency rules between layers |
| R3F Journey (paid) | [threejs-journey.com](https://threejs-journey.com/) | Deep Three.js + R3F |
| Feature-Sliced Design | [feature-sliced.design](https://feature-sliced.design/) | Alternative folder philosophy |
""",
        "questions": """
## Questions To Test Yourself

**Conceptual**
1. Name three subsystems that can be unit-tested without a browser.
2. Why does hand tracking sit above camera but below gestures in the provider chain?

**Architecture**
3. What breaks if `GeometryAnalysisEngine` imported `THREE.Raycaster`?
4. Why is `SceneManager` not a React Context?

**Engineering**
5. How would you add a fourth coordinate space (screen pixels) without polluting StructureModel?
6. What is the data flow from a webcam frame to a protein rotation?

**Research**
7. Could this architecture support a server-side analysis API later? What would change?
""",
    },
    3: {
        "insights": """
# Key Engineering Insights — Chapter 3

- 📅 BioAura was built **incrementally** — each phase produced a testable artifact.
- 🏷️ Phase comments in `constants.ts` trace history even without git commits.
- 🐛 The WASM version bug taught: **pin all native asset versions** on day one.
- 🔧 `constants.ts` overwrite taught: **surgical edits** on shared config files.
- 🎨 Cartoon gap fix (Phase 3.2) came *after* basic rendering — polish follows function.
- 🔬 Analysis phases (4–8) extended protein without touching gesture engine.
- 📋 Two phase numbering systems exist — bootstrap vs analysis — don't conflate them.
- ✅ 76 tests cover parsers and geometry — not gestures (browser-required).
- 🚀 CI gap: GitHub Actions omits tests — local `npm run ci` is the real gate.
- 📝 Document phases when you ship them, not months later.
""",
        "misconceptions": """
## Common Misconceptions

| Misconception | Correction |
|---------------|------------|
| "Phase 5 in README equals Analysis Phase 5." | **No.** README Phase 5 = gestures. Analysis Phase 5 = picking. Different numbering. |
| "All phases modified the gesture engine." | Analysis phases 4–8 explicitly did **not** touch gestures. |
| "No git history means no timeline." | README, constants comments, tests, and this notebook reconstruct it. |
| "Phase 10 means the project is finished." | Phase 10 is **deployment** — scientific features continue in analysis phases. |
""",
        "references": """
## References

| Source | URL |
|--------|-----|
| Vite Documentation | [vite.dev](https://vite.dev/) |
| GitHub Actions | [docs.github.com/actions](https://docs.github.com/en/actions) |
| MediaPipe Tasks Vision Release | [npm @mediapipe/tasks-vision](https://www.npmjs.com/package/@mediapipe/tasks-vision) |

## Further Reading

| Resource | Topic |
|----------|-------|
| *The Pragmatic Programmer* — Hunt & Thomas | Tracer bullets, incremental delivery |
| ADR GitHub org | [adr.github.io](https://adr.github.io/) | Documenting decisions per phase |
| Conventional Commits | [conventionalcommits.org](https://www.conventionalcommits.org/) | Phase-based commit messages |
""",
        "questions": """
## Questions To Test Yourself

**Conceptual**
1. What is the difference between bootstrap Phase 6 and Analysis Phase 6?
2. Which phase introduced StructureModel? Why was it placed there?

**Architecture**
3. Why were analysis phases forbidden from modifying the gesture engine?
4. What artifact proves Phase 3.2 (cartoon connectivity) was a real bug fix?

**Engineering**
5. How would you add git commits retroactively to preserve this timeline?
6. What would you put in CI on Day 1 if rebuilding?

**Research**
7. Which phase unlocked hydrogen bond detection? What had to exist first?
""",
    },
    4: {
        "insights": """
# Key Engineering Insights — Chapter 4

- ⚛️ **React 19** — providers + `useSyncExternalStore` for selection without Redux.
- 📘 **TypeScript** pays off most in StructureModel and parser types.
- ⚡ **Vite** manual chunks split three/r3f/mediapipe/motion — load only what's needed.
- 🤚 **MediaPipe** chosen over TF HandPose for maintenance and WASM path.
- 🧪 **Node test runner** — pure functions need no Vitest overhead.
- 📄 **PDB primary, mmCIF fallback** — real structures from RCSB REST.
- 🎯 **Raycasting** via Three.js — sufficient at current scale.
- 📦 **Context** matches features — not a global god-store.
- ⚠️ README `ci` description is stale — trust `package.json` scripts.
- 🔒 Pin WASM version to npm package version — always.
""",
        "misconceptions": """
## Common Misconceptions

| Misconception | Correction |
|---------------|------------|
| "BioAura uses Vitest." | **No.** `node --import tsx --test` — 76 tests, zero Vitest dependency. |
| "MediaPipe is the same as MediaPipe Hands (legacy)." | BioAura uses **Tasks Vision** `HandLandmarker` — different API and WASM bundle. |
| "Tailwind handles all styling." | Tailwind for HUD; Three.js materials are separate. |
| "Framer Motion runs the 3D scene." | Framer Motion animates **2D HUD panels** only. |
""",
        "references": """
## References

| Source | URL |
|--------|-----|
| React 19 | [react.dev](https://react.dev/) |
| TypeScript Handbook | [typescriptlang.org/docs](https://www.typescriptlang.org/docs/) |
| Vite | [vite.dev](https://vite.dev/) |
| Three.js | [threejs.org/docs](https://threejs.org/docs/) |
| React Three Fiber | [docs.pmnd.rs/react-three-fiber](https://docs.pmnd.rs/react-three-fiber) |
| MediaPipe Tasks Vision | [developers.google.com/mediapipe](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker) |
| Node.js Test Runner | [nodejs.org/api/test.html](https://nodejs.org/api/test.html) |
| RCSB PDB | [rcsb.org](https://www.rcsb.org/) |
| mmCIF Specification | [mmcif.wwpdb.org](https://mmcif.wwpdb.org/) |
| Tailwind CSS v4 | [tailwindcss.com](https://tailwindcss.com/) |

## Further Reading

| Resource | Topic |
|----------|-------|
| *Programming TypeScript* — Boris Cherny | Advanced TS patterns |
| Three.js Fundamentals | [threejs.org/manual](https://threejs.org/manual/) | WebGL concepts |
| MediaPipe Hand Landmarker Guide | Google Developers docs | Model options, delegates |
""",
        "questions": """
## Questions To Test Yourself

**Conceptual**
1. Why Node test runner instead of Vitest for this codebase?
2. When would you reconsider TensorFlow.js HandPose?

**Architecture**
3. Why manual chunk splitting in Vite? Which chunks exist?
4. Why fetch PDB from RCSB instead of bundling files?

**Engineering**
5. What happens if you upgrade `@mediapipe/tasks-vision` without updating the WASM URL?
6. Why TypeScript strict mode for parser code?

**Research**
7. Could mmCIF replace PDB entirely? What does BioAura lose?
""",
    },
    5: {
        "insights": """
# Key Engineering Insights — Chapter 5

- 📷 Camera provides **one shared** `HTMLVideoElement` for display and inference.
- 🤖 **MediaPipe does not recognize gestures** — it only predicts 21 landmarks per hand.
- 📊 Landmarks are **normalized** [0,1] — not metric 3D coordinates.
- 🎬 **VIDEO mode** enables temporal tracking across frames.
- 🔄 **resultRef** stores detections — zero React re-renders at 30fps.
- 🖥️ GPU delegate with **CPU fallback** — not all devices support GPU WASM.
- 📌 **Pin WASM version** to match npm package — see Chapter 10 Bug 1.
- 🪞 CSS mirror is **display-only** — does not flip inference coordinates.
- 🕳️ Empty landmarks `[]` is often **environmental**, not a code bug.
- ⏱️ Target 30 FPS — `requestVideoFrameCallback` or RAF fallback.
""",
        "misconceptions": """
## Common Misconceptions

| Misconception | Correction |
|---------------|------------|
| "MediaPipe detects pinch." | **No.** MediaPipe estimates landmarks. **GestureEngine** detects pinch from thumb-index distance. |
| "MediaPipe z-coordinate is depth in meters." | z is **relative** depth in model space — not Ångströms, not meters. |
| "Mirroring the video flips landmark coordinates." | CSS `transform: scaleX(-1)` is display-only. Same element feeds inference unmirrored. |
| "Empty hands = broken pipeline." | Often lighting, hand position, or confidence threshold — pipeline can be correct. |
| "Two video elements would be more reliable." | One element avoids sync issues — display and inference share the same frame. |
""",
        "references": """
## References

| Source | URL / Citation |
|--------|----------------|
| MediaPipe Hands (original paper) | Zhang et al., *MediaPipe Hands: On-device Real-time Hand Tracking*, [arXiv:2006.10214](https://arxiv.org/abs/2006.10214) |
| MediaPipe Hand Landmarker (Tasks Vision) | [Google Developers](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker) |
| getUserMedia API | [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) |
| requestVideoFrameCallback | [WICG Spec](https://wicg.github.io/video-rvfc/) |
| WebAssembly | [webassembly.org](https://webassembly.org/) |

## Further Reading

| Resource | Topic |
|----------|-------|
| *Computer Vision: Algorithms and Applications* — Szeliski (Ch. 11) | Human pose and tracking fundamentals |
| MediaPipe Model Card — Hand Landmarker | Model limitations and bias |
| *Learning OpenCV 4* — Minch & Howdy | Camera pipelines in practice |
""",
        "questions": """
## Questions To Test Yourself

**Conceptual**
1. What exactly does MediaPipe output per hand per frame?
2. Why normalize landmark coordinates to [0,1]?

**Architecture**
3. Why store results in a ref instead of React state?
4. Why one video element for both display and inference?

**Engineering**
5. How would you diagnose "zero hands" without changing code?
6. What is VIDEO mode vs IMAGE mode in HandLandmarker?

**Research**
7. Could hand tracking work without a GPU delegate? What is the tradeoff?
""",
    },
    6: {
        "insights": """
# Key Engineering Insights — Chapter 6

- 🎯 **MediaPipe gives poses, not gestures** — GestureEngine is mandatory.
- 🏆 **Priority list** resolves conflicts — two-hand zoom > pinch > grab_rotate > grab.
- ⏳ **Temporal stabilization** — enter/exit frame counters prevent flicker.
- 📏 **Hysteresis** — pinch enters at 0.06, exits at 0.085.
- 🔄 **GrabRotate** is a 3-state machine: Idle → Armed → Rotating.
- 📐 **normalizeAngleDelta** handles ±π wraparound in wrist angle.
- 🤏 Pinch **yields over** grab_rotate for translation priority.
- 🧹 Stateful detectors **reset** when hands disappear.
- 📋 All thresholds live in **GESTURE_CONFIG** — single tuning surface.
- 🚫 No ML classifier needed — rule-based detectors suffice at 30fps.
""",
        "misconceptions": """
## Common Misconceptions

| Misconception | Correction |
|---------------|------------|
| "MediaPipe detects grab/pinch/zoom." | **No.** Only landmarks. **Six custom detectors** interpret them. |
| "One frame is enough to detect a gesture." | **No.** Enter frames (e.g. 2) and exit frames (e.g. 3) are required. |
| "Grab and grab_rotate are the same gesture." | Grab = closed fist. Grab_rotate = fist + sustained wrist twist. |
| "Two-hand zoom works with one hand." | `TwoHandZoomDetector` requires **two hands** — resets single-hand detectors. |
| "Higher priority = higher confidence." | Priority is **deterministic ordering**, not a confidence score. |
""",
        "references": """
## References

| Source | URL / Citation |
|--------|----------------|
| MediaPipe Hand Landmarks diagram | [Google Hand Landmarker](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker) |
| Hysteresis (control systems) | [Wikipedia — Hysteresis](https://en.wikipedia.org/wiki/Hysteresis) |
| Exponential Moving Average | Standard DSP reference |

## Further Reading

| Resource | Topic |
|----------|-------|
| *Gesture-Based Human-Computer Interaction* — survey papers | Academic gesture taxonomy |
| *Designing Gestural Interfaces* — Saffer | UX of gesture systems |
| Kalman Filtering (optional) | Alternative to EMA for landmark smoothing — BioAura uses simpler EMA |
""",
        "questions": """
## Questions To Test Yourself

**Conceptual**
1. Why does pinch have higher priority than grab_rotate?
2. What problem does hysteresis solve?

**Architecture**
3. Why separate detector classes instead of one state machine?
4. Why reset detectors when hands disappear?

**Engineering**
5. How would you detect pinch using only landmarks 4 and 8?
6. Write the formula for wrist twist angle in the XZ plane.

**Research**
7. When would a learned gesture classifier outperform rule-based detectors?
""",
    },
    7: {
        "insights": """
# Key Engineering Insights — Chapter 7

- 🧬 **StructureModel** is the single source of truth — not ProteinMesh.
- 🎨 **ProteinMesh is only visualization** — scientific data lives in StructureModel.
- 🧵 Cartoon follows **CA trace** — alpha carbons define the backbone path.
- 📐 **Parallel transport frames** prevent ribbon normal twisting.
- 🔗 **Segment connectivity** fixes gaps between helix/sheet/coil segments.
- 👁️ **Representation visibility** toggles `group.visible` — no geometry rebuild.
- 🧪 Build effect and visibility effect are **separate useEffects** in ProteinMesh.
- 📦 Three layers: cartoon, ligands, polymer-atoms (hidden by default).
- 📏 Coordinates in **Ångströms** — PDB native units throughout StructureModel.
- 🎯 `centerAndScaleGroup(targetSize=5)` fits protein in view frustum.
""",
        "misconceptions": """
## Common Misconceptions

| Misconception | Correction |
|---------------|------------|
| "The protein mesh contains scientific information." | **No.** **StructureModel** contains coordinates and chemistry. Mesh is GPU geometry. |
| "Toggling representation rebuilds geometry." | **No.** `applyRepresentationVisibility()` only sets `visible` flags. |
| "Frenet frames are used for ribbon normals." | **No.** **Parallel transport** — Frenet flips at inflection points. |
| "Cartoon shows all atoms." | Cartoon shows **CA trace** ribbons/tubes. All-atom layer is hidden by default. |
| "PDB and mmCIF parse to different StructureModels." | Both parse to the **same** unified StructureModel type. |
""",
        "references": """
## References

| Source | URL / Citation |
|--------|----------------|
| PDB Format v3.3 | [wwPDB Format Guide](https://www.wwpdb.org/documentation/file-format-content/format33/v3.3.html) |
| mmCIF Dictionary | [mmcif.wwpdb.org](https://mmcif.wwpdb.org/) |
| Richardson Ribbon Representation | Richardson, J.S. (1981), *Advances in Protein Chemistry* 34, 167–339 |
| Catmull-Rom Splines | Catmull & Rom (1974), *Computer-Aided Design* |
| Parallel Transport Frames | Bishop (1975), *Bulletin of the AMS* — frame propagation along curves |
| Three.js CatmullRomCurve3 | [threejs.org/docs](https://threejs.org/docs/#api/en/extras/curves/CatmullRomCurve3) |
| Three.js TubeGeometry | [threejs.org/docs](https://threejs.org/docs/#api/en/geometries/TubeGeometry) |
| Mol* | [molstar.org](https://molstar.org/) |
| PyMOL | [pymol.org](https://pymol.org/) |

## Further Reading

| Resource | Topic |
|----------|-------|
| *Protein Structure Prediction* — Bates & Kelley | Secondary structure and fold |
| NGL Viewer paper | Rose et al., *NAR* 2018 — web molecular graphics |
| DSSP algorithm | Kabsch & Sander (1983) — SS assignment (BioAura uses PDB records) |
""",
        "questions": """
## Questions To Test Yourself

**Conceptual**
1. Why StructureModel instead of parsing directly to Three.js?
2. What is parallel transport and why not use a fixed up vector?

**Architecture**
3. Why two useEffects in ProteinMesh?
4. What happens if you delete `annotateSecondaryStructure()`?

**Engineering**
5. How would you build a coil tube from 5 CA coordinates?
6. Why center the structure before rendering?

**Research**
7. How does Richardson ribbon differ from BioAura's implementation?
""",
    },
    8: {
        "insights": """
# Key Engineering Insights — Chapter 8

- 🖱️ **Raycasting** projects pointer → 3D ray → mesh intersection.
- 🎯 **buildPickIndex** mirrors render order — O(1) instanceId → atom lookup.
- 📦 **SelectionManager** is framework-agnostic — mouse and future gestures share `select()`.
- 🧬 Picking reads **StructureModel** after hit resolution — never mesh vertices for science.
- ↔️ **Shift+click** selects coarser entities (chain, ligand residue).
- 📏 **2-atom selection** enables distance; queue holds up to 4 for angle/dihedral.
- 📐 Distance computed in **Å** from StructureModel — not Three.js world space.
- 🌀 **createPortal** aligns MeasurementOverlay with protein transforms automatically.
- 🔍 Neighbor search is **O(n)** — spatial index is future work.
- 🚫 Gesture picking not implemented — API is ready.
""",
        "misconceptions": """
## Common Misconceptions

| Misconception | Correction |
|---------------|------------|
| "Distance comes from mesh vertex positions." | **No.** Distance uses **StructureModel atom coordinates** in Å. |
| "Raycasting selects atoms directly." | Raycasting hits **meshes**. `resolvePickHit` maps mesh → StructureModel entity. |
| "Cartoon mesh click selects one atom." | Cartoon click selects **nearest CA residue** — not individual side-chain atoms. |
| "SelectionManager is React state." | It's an **external store** with `useSyncExternalStore` subscription. |
| "Neighbor search uses GPU." | Pure **CPU** scan over StructureModel atoms. |
""",
        "references": """
## References

| Source | URL |
|--------|-----|
| Three.js Raycaster | [threejs.org/docs/#api/en/core/Raycaster](https://threejs.org/docs/#api/en/core/Raycaster) |
| OpenGL Picking (conceptual ancestor) | [OpenGL Wiki — Color Buffer Selection](https://www.khronos.org/opengl/wiki/Color_Buffer_Selection) |
| R3F Events | [docs.pmnd.rs/react-three-fiber/api/events](https://docs.pmnd.rs/react-three-fiber/api/events) |
| React useSyncExternalStore | [react.dev/reference/react/useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore) |
| R3F createPortal | [docs.pmnd.rs/react-three-fiber/api/canvas#createportal](https://docs.pmnd.rs/react-three-fiber/api/canvas#createportal) |

## Further Reading

| Resource | Topic |
|----------|-------|
| *Real-Time Collision Detection* — Ericson (Ch. 9) | Ray casting algorithms |
| Mol* picking architecture | Source code / documentation |
| k-d tree / octree | Spatial indexing for neighbor search |
""",
        "questions": """
## Questions To Test Yourself

**Conceptual**
1. Why separate StructureModel from ProteinMesh for picking?
2. Why precompute buildPickIndex at load time?

**Architecture**
3. Why SelectionManager instead of useState?
4. Why createPortal for MeasurementOverlay?

**Engineering**
5. How does InstancedMesh instanceId map to an atom?
6. What breaks if buildLigandGroup atom order changes?

**Research**
7. How would spatial indexing change neighbor search complexity?
""",
    },
    9: {
        "insights": """
# Key Engineering Insights — Chapter 9

- 🔌 **Plugin architecture** — add analyzers without touching InteractionEngine core.
- 🔍 **Neighbor search runs once** per query — shared by all analyzers.
- 🧪 **GeometryFilters** are composable predicates per analyzer.
- 💧 **H-bond cutoff: 3.5 Å** — distance-only confidence in Phase 8.
- 🧬 **donorAcceptorDatabase** encodes chemistry rules — not distance alone.
- 📊 Confidence tiers: 1.0 / 0.8 / 0.6 / 0.4 by distance bracket.
- 🚫 Seven interaction types are **placeholders** — only H-bond implemented.
- 📋 Registration via **side-effect import** on module load.
- 🧮 All math on **StructureModel** — no Three.js in analysis path.
- 🔮 Angle criterion (D–H···A) deferred to future phase.
""",
        "misconceptions": """
## Common Misconceptions

| Misconception | Correction |
|---------------|------------|
| "Any two atoms within 3.5 Å are hydrogen bonded." | **No.** Must satisfy **donor/acceptor** chemistry rules. |
| "InteractionEngine performs neighbor search per analyzer." | **No.** **Once** per `analyze()` call, then shared candidates. |
| "H-bond confidence uses angle." | Phase 8 is **distance-only**. Angle criterion is future work. |
| "Implicit hydrogens are modeled." | Phase 8 uses **heavy atoms only** — D–H···A angle needs H placement later. |
| "Salt bridge analyzer exists." | Type is defined; **no analyzer implemented** yet. |
""",
        "references": """
## References

| Source | URL / Citation |
|--------|----------------|
| IUPAC Hydrogen Bond Definition (2011) | [IUPAC Recommendations](https://iupac.org/what-we-do/standards/) |
| Jeffrey, G.A. (1997) *An Introduction to Hydrogen Bonding* | Standard H-bond geometry criteria |
| Baker & Hubbard (1984), *Prog. Biophys. Mol. Biol.* | Protein H-bond geometry in structures |
| Plugin Pattern | Gamma et al., *Design Patterns* (GoF) |
| RCSB Interaction Analysis | [rcsb.org/docs](https://www.rcsb.org/docs) |

## Further Reading

| Resource | Topic |
|----------|-------|
| *Molecular Modelling: Principles and Applications* — Leach (Ch. 4) | Non-covalent interactions |
| HBPLUS / WHAT IF algorithms | H-bond detection in structural biology |
| ProteinsPlus Web Server | [proteins.plus](https://proteins.plus/) — interaction analysis reference |
""",
        "questions": """
## Questions To Test Yourself

**Conceptual**
1. Why plugin architecture for interactions?
2. What makes a valid hydrogen bond in BioAura Phase 8?

**Architecture**
3. Why run neighbor search once, not per analyzer?
4. What is an InteractionCandidate?

**Engineering**
5. How would you add a SaltBridgeAnalyzer as a plugin?
6. Write the confidence function for d = 2.85 Å.

**Research**
7. What false positives does distance-only H-bond detection produce?
""",
    },
    10: {
        "insights": """
# Key Engineering Insights — Chapter 10

- 🐛 **LinkError on WASM** = version mismatch — pin JS and WASM together.
- 🕳️ **Empty landmarks** often means environment, not broken code.
- 📝 **constants.ts overwrite** — never wholesale-replace shared config.
- 🎨 **Cartoon gaps** fixed by segment endpoint overlap — test with phase32 suite.
- ⚙️ **CI gap** — GitHub Actions skips tests; trust local `npm run ci`.
- 🔍 Debug by **isolating subsystems** — video, WASM, inference, gestures separately.
- 📓 Document bugs in this journal — future you will hit the same traps.
- 🧪 Every bug fix deserves a **regression test** when possible.
- 🔄 Distinguish **symptom** (empty hands) from **root cause** (lighting).
- 📌 Reproduce before fixing — hypothesis → test → fix.
""",
        "misconceptions": """
## Common Misconceptions

| Misconception | Correction |
|---------------|------------|
| "LinkError means MediaPipe is broken." | Usually **WASM/JS version mismatch** — check CDN pin. |
| "If tests pass in CI, all 76 tests ran." | GitHub Actions CI **does not run tests** — only lint, typecheck, build. |
| "Rewriting HandTracker fixes zero hands." | If video plays and WASM loads, empty results are often **environmental**. |
| "Cartoon gaps mean wrong PDB parse." | Gaps are **geometry connectivity** — atoms are correct, ribbon endpoints aren't. |
""",
        "references": """
## References

| Source | URL |
|--------|-----|
| WebAssembly LinkError | [MDN — WebAssembly.RuntimeError](https://developer.mozilla.org/en-US/docs/WebAssembly/Reference/JavaScript_interface/RuntimeError) |
| MediaPipe WASM Troubleshooting | MediaPipe GitHub Issues |
| Node.js Test Runner | [nodejs.org/api/test.html](https://nodejs.org/api/test.html) |

## Further Reading

| Resource | Topic |
|----------|-------|
| *Debug It!* — Paul Butcher | Systematic debugging methodology |
| *Release It!* — Michael Nygard | Production failure patterns |
""",
        "questions": """
## Questions To Test Yourself

**Conceptual**
1. What is the first check when WASM fails to instantiate?
2. How do you distinguish code bugs from environmental issues?

**Architecture**
3. Why did cartoon gap fix live in connectivity, not parsing?
4. Why is a regression test valuable for the WASM pin fix?

**Engineering**
5. Write a debugging checklist for "zero hands detected."
6. How would you add tests to GitHub Actions CI?

**Research**
7. What automated tests could replay recorded landmark sequences?
""",
    },
    11: {
        "insights": """
# Key Engineering Insights — Chapter 11

- 📋 Every major decision has a **rejected alternative** — document both sides.
- 🧬 **StructureModel** decision is the most consequential — protects all future science.
- 🔌 **Plugin pattern** for interactions — scales without engine rewrites.
- 🤚 **Custom gesture engine** — poses ≠ gestures, always.
- 📦 **Context** fits provider chain — not every state belongs there.
- 🌀 **createPortal** — prefer transform inheritance over manual sync.
- 📐 **Parallel transport** — math cost buys visual quality.
- 🎯 **External stores** (SelectionManager, SceneManager) for non-React consumers.
- 📌 **ADR format** — Problem, Options, Decision, Consequences.
- 🔮 Revisit decisions when constraints change — not when trends change.
""",
        "misconceptions": """
## Common Misconceptions

| Misconception | Correction |
|---------------|------------|
| "ADR means the decision is permanent." | ADRs record **context at decision time**. Revisit when requirements change. |
| "Context API was chosen because Redux is bad." | Redux was **overkill** for this scope — not wrong for larger apps. |
| "Plugin architecture is always better than monolith." | Plugins add **indirection** — justified when multiple analyzers share a pipeline. |
| "StructureModel duplicates Three.js data wastefully." | Duplication **buys independence** — analysis without WebGL. |
""",
        "references": """
## References

| Source | URL |
|--------|-----|
| Architecture Decision Records | [adr.github.io](https://adr.github.io/) |
| Documenting Architecture Decisions | Michael Nygard's original blog post |
| Design Patterns (GoF) | Plugin, Registry, Observer patterns |
| React Context | [react.dev](https://react.dev/learn/passing-data-deeply-with-context) |

## Further Reading

| Resource | Topic |
|----------|-------|
| *Software Architecture: The Hard Parts* — Ford et al. | Trade-off analysis |
| *A Philosophy of Software Design* — John Ousterhout | Deep modules, complexity |
""",
        "questions": """
## Questions To Test Yourself

**Conceptual**
1. State the StructureModel ADR in one sentence.
2. When would you revoke the Context API decision?

**Architecture**
3. Why external store for SelectionManager but Context for Representation?
4. What are consequences of the plugin architecture?

**Engineering**
5. Write an ADR for adding Vitest to the project.
6. Which decision would hurt most to reverse?

**Research**
7. How do structural biology tools (PyMOL, ChimeraX) solve the data/visualization split?
""",
    },
    12: {
        "insights": """
# Key Engineering Insights — Chapter 12

- 🔬 Scientific roadmap is **additive** — plugin contract protects existing work.
- ✅ H-bonds shipped first because infrastructure was ready — not because they're simplest.
- 🧪 Each future analyzer is ~1 plugin + tests — not an architecture change.
- 👁️ Visualization overlays lag analysis — users can't see H-bonds in 3D yet.
- 📏 Angle/dihedral needs 3–4 atom queue — already reserved in SelectionManager.
- 🎯 Gesture picking reuses SelectionManager — no new selection architecture.
- 🏗️ Pocket detection needs spatial algorithms — hardest near-term feature.
- 🧬 Docking is **future** — requires energy functions and conformation search.
- 📚 Master's thesis topics exist at every difficulty tier.
- 🔄 Update this chapter after each shipped analyzer.
""",
        "misconceptions": """
## Common Misconceptions

| Misconception | Correction |
|---------------|------------|
| "Roadmap items need architecture changes." | Most items need **new plugins** only. |
| "H-bond detection is complete." | Distance-only, no overlay, no angle — **Phase 8 foundation**, not finished science. |
| "Docking is just another analyzer." | Docking needs **conformational search** — orders of magnitude harder than H-bonds. |
| "BioAura will replace PyMOL." | BioAura targets **web + gestures + lightweight analysis** — different niche. |
""",
        "references": """
## References

| Source | URL |
|--------|-----|
| PyMOL | [pymol.org](https://pymol.org/) |
| ChimeraX | [cgl.ucsf.edu/chimerax](https://www.cgl.ucsf.edu/chimerax/) |
| AutoDock Vina | Morris et al., *J. Comput. Chem.* 2009 |
| fpocket | Le Guilloux et al., *BMC Bioinformatics* 2009 |
| PRODIGY (protein-protein binding) | Xue et al., *Bioinformatics* 2016 |

## Further Reading

| Resource | Topic |
|----------|-------|
| *Structural Bioinformatics* — Gu & Bourne | Comprehensive methods overview |
| CASP competition proceedings | Structure prediction state of the art |
| AlphaFold Database | [alphafold.ebi.ac.uk](https://alphafold.ebi.ac.uk/) |
""",
        "questions": """
## Questions To Test Yourself

**Conceptual**
1. Why was hydrogen bond detection prioritized over salt bridges?
2. What infrastructure must exist before pocket detection?

**Architecture**
3. Can docking reuse InteractionEngine? Why or why not?
4. What is the minimum addition for H-bond 3D visualization?

**Engineering**
5. Estimate effort: salt bridge analyzer vs pocket detection.
6. How would gesture picking change the roadmap priority?

**Research**
7. Pick one future feature and outline a master's thesis proposal in 3 sentences.
""",
        "expand": True,
    },
    13: {
        "insights": False,
        "misconceptions": False,
        "references": """
## References

| Source | URL |
|--------|-----|
| This notebook | `BioAura_Engineering_Notebook.ipynb` |
| BioAura source | `src/` feature folders |
| Development transcript | `TODO:` add path if archived |

## Further Reading

| Resource | Topic |
|----------|-------|
| *The Programmer's Brain* — Felienne Hermans | How to retain what you learn |
| Zettelkasten method | Personal knowledge management |
| Your own lab notebook | Primary research record |
""",
        "questions": """
## Questions To Test Yourself

**Conceptual**
1. What is the single most important insight from this notebook?
2. What would you tell a junior engineer joining BioAura?

**Architecture**
3. Draw the provider chain from memory.
4. Draw the interaction pipeline from memory.

**Engineering**
5. What would you do differently on a rebuild?
6. What bug are you most likely to forget?

**Research**
7. What question do you still want BioAura to answer scientifically?
""",
    },
}

CHAPTER_12_EXPANSION = md("""
---

## Future Research — Expanded

### Salt Bridge Analyzer

| Field | Detail |
|-------|--------|
| **Scientific motivation** | Electrostatic interactions between charged residues (Asp/Glu ↔ Lys/Arg) stabilize protein structure and mediate binding |
| **Engineering challenges** | Charge state depends on pH; distance + geometry criteria; distinguish from H-bond |
| **Algorithms** | Distance cutoff (~4 Å), optional angular criterion, charged atom pair lookup |
| **Literature** | Barlow & Thornton (1983); Kumar & Nussinov (2002) |
| **Difficulty** | 🟡 Intermediate |
| **Master's thesis** | "Browser-based salt bridge detection in PDB structures with pH-dependent protonation" |
| **Publication** | Web-based structural interaction benchmarking tool |

---

### Hydrophobic Contact Analyzer

| Field | Detail |
|-------|--------|
| **Scientific motivation** | Buried hydrophobic surfaces drive folding and protein-protein association |
| **Engineering challenges** | Requires surface/burial classification; Cβ–Cβ distance thresholds vary by residue type |
| **Algorithms** | SASA calculation (Shrake-Rupley) or proxy via neighbor Cβ counts |
| **Literature** | Chothia (1974) hydrophobic burial; PROTORP server |
| **Difficulty** | 🟠 Advanced |
| **Master's thesis** | "Client-side hydrophobic contact mapping for educational protein visualization" |
| **Publication** | Comparison with COCOMAPS for PPI interfaces |

---

### Pocket Detection

| Field | Detail |
|-------|--------|
| **Scientific motivation** | Identify ligand-binding cavities for drug discovery |
| **Engineering challenges** | 3D grid computation in browser; performance on large structures; false positive pockets |
| **Algorithms** | fpocket (Voronoi tessellation); CASTp; grid-based cavity search |
| **Literature** | Le Guilloux et al. (2009) fpocket; Hendlich et al. (1997) LIGSITE |
| **Difficulty** | 🔴 Advanced |
| **Master's thesis** | "WebAssembly-accelerated pocket detection for interactive drug discovery education" |
| **Publication** | Real-time pocket visualization benchmark vs desktop tools |

---

### Molecular Docking

| Field | Detail |
|-------|--------|
| **Scientific motivation** | Predict ligand binding pose and affinity — core computational drug design |
| **Engineering challenges** | Conformational search, scoring functions, WebAssembly port of docking engine, GPU |
| **Algorithms** | AutoDock Vina, GNINA, DiffDock (ML-based) |
| **Literature** | Morris et al. (2009) Vina; Corso et al. (2022) DiffDock |
| **Difficulty** | ⚫ Future |
| **Master's thesis** | "Integrating AutoDock Vina WASM with gesture-controlled ligand placement" |
| **Publication** | Interactive docking UX study vs traditional desktop workflows |

---

### Ligand Manipulation in 3D

| Field | Detail |
|-------|--------|
| **Scientific motivation** | Manual pose adjustment is standard in medicinal chemistry workflows |
| **Engineering challenges** | Transform ligand separately from protein; collision detection; snap to pocket |
| **Algorithms** | Rigid-body transform; clash detection via distance grids |
| **Literature** | Mol* ligand component; PyMOL editing mode |
| **Difficulty** | 🟠 Advanced |
| **Master's thesis** | "Gesture-based ligand pose editing with real-time clash feedback" |
| **Publication** | HCI paper on gesture vs mouse for 3D molecular editing |

---

### Protein-Protein Interaction Visualization

| Field | Detail |
|-------|--------|
| **Scientific motivation** | PPIs govern signaling, immunity, and disease |
| **Engineering challenges** | Load two structures; align chains; map interface residues |
| **Algorithms** | Interface residue detection (ΔSASA); PRODIGY binding affinity |
| **Literature** | Janin et al. (2008) protein-protein interfaces |
| **Difficulty** | 🔴 Advanced |
| **Master's thesis** | "Dual-structure PPI viewer with interface highlighting in the browser" |
| **Publication** | Educational PPI atlas |

---

### Conformational Comparison & Mutation Visualization

| Field | Detail |
|-------|--------|
| **Scientific motivation** | Disease mutations alter structure and dynamics |
| **Engineering challenges** | Load two PDBs; structural alignment (RMSD); morph animation |
| **Algorithms** | Kabsch alignment; RMSD per residue; interpolation between conformations |
| **Literature** | Kabsch (1976); MolProbity mutation analysis |
| **Difficulty** | 🔴 Advanced |
| **Master's thesis** | "Animated conformational morphing between wild-type and mutant structures" |
| **Publication** | Mutation effect visualization for clinical variant interpretation |

---

### Molecular Signaling Pathways

| Field | Detail |
|-------|--------|
| **Scientific motivation** | Visualize cascade of protein interactions in cellular signaling |
| **Engineering challenges** | Graph layout; multi-protein scene; temporal activation; data integration (KEGG/Reactome) |
| **Algorithms** | Graph drawing; pathway database APIs; state machine for activation |
| **Literature** | Kanehisa KEGG; Reactome; SBGN notation standard |
| **Difficulty** | ⚫ Future |
| **Master's thesis** | "Interactive signaling pathway explorer with 3D protein structure integration" |
| **Publication** | Systems biology visualization platform |

---

### H-Bond 3D Overlay (Near-term)

| Field | Detail |
|-------|--------|
| **Scientific motivation** | Users cannot see detected H-bonds — analysis is invisible |
| **Engineering challenges** | Dashed lines in Three.js; update on selection change; performance |
| **Algorithms** | Line geometry between donor/acceptor atoms; `createPortal` pattern |
| **Literature** | Richardson ribbon conventions for H-bond display |
| **Difficulty** | 🟡 Intermediate |
| **Master's thesis** | N/A — suitable course project |
| **Publication** | N/A |
""")

DIFFICULTY_GUIDE = md("""
---
# Learning Difficulty Guide

_Progress from Beginner → Intermediate → Advanced → Future. Each concept links to its chapter._

---

## 🟢 Beginner

| Concept | One-line explanation | Chapter |
|---------|---------------------|---------|
| **Frame** | One camera capture or animation tick | Ch 5 |
| **FPS** | Frames processed per second | Ch 5, 9 |
| **Mesh** | GPU drawable geometry + material | Ch 2, 7 |
| **Component** | React UI building block | Ch 2, 4 |
| **State** | Data that triggers UI re-render when changed | Ch 2, 4 |
| **Props** | Inputs passed parent → child in React | Ch 4 |
| **Protein** | Biological macromolecule — chains of amino acids | Ch 1, 7 |
| **Atom** | Smallest selectable unit (element + position) | Ch 7, 8 |
| **Residue** | One amino acid or HETATM group | Ch 7, 8 |
| **Chain** | Covalently linked polymer sequence | Ch 7, 8 |
| **Landmark** | Single detected hand point (21 per hand) | Ch 5, 6 |
| **Gesture** | Semantic hand action (pinch, grab, zoom) | Ch 6 |
| **PDB** | Text file format for 3D macromolecular coordinates | Ch 4, 7 |
| **Provider** | React Context wrapper supplying shared data | Ch 2, 4 |
| **Transform** | Position, rotation, scale of protein in scene | Ch 2, 6 |
| **Distance** | Euclidean length between two points | Ch 8, 9 |
| **Threshold** | Numeric boundary for yes/no classification | Ch 6 |
| **Plugin** | Registered module extending a pipeline | Ch 9 |
| **Inspector** | HUD panel showing selected entity metadata | Ch 8 |
| **HUD** | Heads-up display overlay on 3D viewport | Ch 2, 8 |

---

## 🟡 Intermediate

| Concept | One-line explanation | Chapter |
|---------|---------------------|---------|
| **Raycasting** | Project 2D pointer into 3D ray to hit meshes | Ch 8 |
| **Scene Graph** | Tree of Three.js objects parented together | Ch 2, 7 |
| **Representation** | Visual style layer (cartoon, ligands, atoms) | Ch 7 |
| **Context API** | React dependency injection for subtrees | Ch 2, 4, 11 |
| **Selection** | Currently highlighted structural entity | Ch 8 |
| **Spline** | Smooth curve through CA backbone points | Ch 7 |
| **Neighbor Search** | Find atoms within radius of target | Ch 8, 9 |
| **SceneManager** | Pub/sub store for protein manipulation transform | Ch 2, 6 |
| **StructureModel** | Canonical typed protein data tree | Ch 7, 11 |
| **Parser** | Converts PDB/mmCIF text → StructureModel | Ch 7 |
| **Registry** | Named container for registered plugins | Ch 9, 11 |
| **WASM** | WebAssembly — compiled MediaPipe runtime | Ch 5, 10 |
| **Hysteresis** | Different enter/exit thresholds | Ch 6 |
| **createPortal** | R3F render into existing Three.js group | Ch 8, 11 |
| **InstancedMesh** | GPU-efficient repeated geometry (ligand spheres) | Ch 7, 8 |
| **Cartoon** | Simplified ribbon/tube backbone view | Ch 7 |
| **Ligand** | Non-polymer bound molecule | Ch 7, 8 |
| **Confidence** | Score 0–1 for interaction quality | Ch 9 |
| **Donor / Acceptor** | H-bond chemistry roles | Ch 9 |
| **ADR** | Architecture Decision Record | Ch 11 |
| **Evolution Story** | How a design failed and was replaced | Ch 3 |

---

## 🟠 Advanced

| Concept | One-line explanation | Chapter |
|---------|---------------------|---------|
| **Parallel Transport Frames** | Propagate stable normals along a curve | Ch 7, 11 |
| **Quaternion** | 4D rotation representation (not yet used) | Ch 2 — Future |
| **Registry Pattern** | Plugin discovery via named registration | Ch 9, 11 |
| **Interaction Engine** | Plugin pipeline for molecular interactions | Ch 9 |
| **GeometryAnalysisEngine** | Pure geometry facade on StructureModel | Ch 8, 9, 11 |
| **Hydrogen Bond Detection** | Donor/acceptor rules + distance cutoff | Ch 9 |
| **Protein Secondary Structure** | Helix, sheet, coil classification | Ch 7 |
| **GrabRotateDetector** | 3-state machine for wrist rotation gesture | Ch 6 |
| **buildPickIndex** | O(1) mesh hit → atom lookup table | Ch 8 |
| **donorAcceptorDatabase** | Chemistry lookup for H-bond roles | Ch 9 |
| **Segment Connectivity** | Endpoint overlap fixing cartoon gaps | Ch 3, 7 |
| **useSyncExternalStore** | React subscription to non-React stores | Ch 8, 11 |
| **AnimationLoop** | Priority-based RAF coordinator | Ch 2, 3 |
| **GestureProteinController** | Maps gestures → SceneManager transforms | Ch 6 |
| **Catmull-Rom Spline** | Interpolation curve through CA points | Ch 7 |

---

## ⚫ Future (Not Yet Implemented)

| Concept | One-line explanation | Chapter |
|---------|---------------------|---------|
| **Docking** | Predict ligand binding pose and affinity | Ch 12 |
| **Pocket Detection** | Find surface cavities for drug binding | Ch 12 |
| **Protein Dynamics** | Simulate or animate conformational motion | Ch 12 |
| **Molecular Signaling** | Visualize cascade of protein interactions | Ch 12 |
| **Conformational Analysis** | Compare and align multiple structures | Ch 12 |
| **Salt Bridge** | Electrostatic interaction between charged residues | Ch 12 |
| **Hydrophobic Contact** | Buried non-polar surface interactions | Ch 12 |
| **Spatial Index** | Octree/k-d tree for fast neighbor search | Ch 8, 12 |
| **D–H···A Angle** | Angular criterion for H-bond validation | Ch 9, 12 |
| **Gesture Picking** | Select atoms via hand pointing | Ch 8, 12 |
| **Quaternion Rotation** | Gimbal-free 6-DOF protein manipulation | Ch 12 |
""")


def build_closing_cells(num: int, data: dict) -> list:
    cells = []
    if data.get("misconceptions"):
        cells.append(md(data["misconceptions"]))
    if data.get("insights"):
        cells.append(md(data["insights"]))
    if data.get("questions"):
        cells.append(md(data["questions"]))
    if data.get("references"):
        cells.append(md(data["references"]))
    return cells


def main():
    nb = json.loads(NOTEBOOK.read_text(encoding="utf-8"))
    cells = nb["cells"]

    if any(MARKER in "".join(c.get("source", [])) for c in cells):
        print("Notebook already polished — skipping.")
        return

    bounds = chapter_boundaries(cells)
    print(f"Found chapters: {[b[0] for b in bounds]}")

    # Insert in reverse order to preserve indices
    insertions: list[tuple[int, list]] = []

    for num, start, end in reversed(bounds):
        data = CHAPTER_POLISH.get(num, {})
        if not data:
            continue

        closing = last_closing_index(cells, start, end)
        new_cells = build_closing_cells(num, data)

        if data.get("expand") and num == 12:
            # Insert expansion before Living Notebook of ch12
            for i in range(start, end):
                if "### Living Notebook — Chapter 12" in "".join(cells[i]["source"]):
                    insertions.append((i, [CHAPTER_12_EXPANSION]))
                    break

        if new_cells:
            insertions.append((closing + 1, new_cells))

    for idx, new_cells in insertions:
        cells[idx:idx] = new_cells

    # Learning Difficulty Guide — before Encyclopedia (if not already present)
    if not any("# Learning Difficulty Guide" in "".join(c.get("source", [])) for c in cells):
        for i, c in enumerate(cells):
            if "# BioAura Encyclopedia" in "".join(c["source"]):
                cells.insert(i, DIFFICULTY_GUIDE)
                break
        else:
            for i, c in enumerate(cells):
                if "# Appendix C" in "".join(c["source"]):
                    cells.insert(i, DIFFICULTY_GUIDE)
                    break

    nb["cells"] = cells
    NOTEBOOK.write_text(json.dumps(nb, indent=1, ensure_ascii=False), encoding="utf-8")
    print(f"Polished notebook: {len(cells)} cells → {NOTEBOOK}")


if __name__ == "__main__":
    main()
