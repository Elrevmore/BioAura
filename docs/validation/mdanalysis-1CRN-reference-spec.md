# MDAnalysis 1CRN hydrogen-bond reference specification

**Status:** Approved protocol draft (documentation only).  
**Pilot structure:** PDB `1CRN` (crambin).  
**Related:** [Hydrogen-bond curation protocol](./hydrogen-bond-curation.md); manifest schema in `src/features/protein/analysis/interactions/validation/hydrogenBondValidation.types.ts`.

**Legend**

| Tag | Meaning |
|-----|---------|
| **Verified (repo)** | Established in BioAura source, tests, or existing docs. |
| **External (MDAnalysis docs)** | Documented MDAnalysis behavior; not executed in this repository. |
| **Proposed** | Protocol choice; pending execution or approval. |
| **TBD** | Unresolved; must be decided before or during curation. |

MDAnalysis output is a **geometric reference** under stated selections and cutoffs. It is **not** experimental ground truth and does not by itself validate BioAura scientifically.

---

## 1. Validation objectives (two tracks — do not merge)

### Track R — MDAnalysis reference export (this specification)

**Purpose:** Produce a frozen, provenance-backed list of hydrogen bonds **as defined by MDAnalysis `HydrogenBondAnalysis`** under **MDAnalysis-native geometric criteria** (proposed §4), on a single frozen `1CRN` PDB (or a documented hydrogen-augmented derivative with its own hash).

**Outcome:** Raw export, session log, and (after manual review) manifest rows meaning: *“MDAnalysis reported this donor–H–acceptor geometry under settings S on file F.”*

**Not claimed:** Experimental truth; a complete inventory of crambin hydrogen bonds; agreement with BioAura.

### Track B — BioAura implementation assessment (separate, later)

**Purpose:** Evaluate BioAura’s **current** distance-only, heavy-atom, `donorAcceptorDatabase` rules on the same frozen structure identifiers.

**Verified (repo):** `HydrogenBondAnalyzer` uses `withinDistance(3.5)` (`HYDROGEN_BOND_MAX_DISTANCE_ANGSTROM`), `differentResidue()`, chemistry via `orientHydrogenBondPair` / `donorAcceptorDatabase`; **no** D–H···A angle; explicit H/D rejected as bond endpoints in `hydrogenBondDetection.ts`.

**Outcome:** Descriptive comparison harness (Milestone A Task 1.5, **TBD** implementation) and optional engineering report. Track R pairs are **one independent reference**, not a pass/fail oracle.

**Rule:** Track R is **independent** of BioAura cutoffs. Tuning MDAnalysis to match BioAura’s 3.5 Å distance-only rules is **out of scope** for the first MDAnalysis run.

### Later, separate BioAura assessment

A separate analysis may ask how distance-only 3.5 Å + tables behave versus literature or a harmonized reference. That is **not** the first MDAnalysis export and must not retroactively change Track R settings.

---

## 2. Input provenance

| Item | Requirement |
|------|-------------|
| **Entry** | `1CRN` |
| **URL** | `https://files.rcsb.org/download/1CRN.pdb` |
| **Format** | **PDB only** for pilot case v1. No silent switch to mmCIF or another file without new SHA-256, new case metadata, and explicit approval. |
| **Retrieval date** | ISO `YYYY-MM-DD` in curation log and manifest `structureSource`. **TBD** at download. |
| **SHA-256** | Compute on exact saved bytes (e.g. `sha256sum 1CRN.pdb`). Record in curation log, `structureSource`, and optional sidecar when reference archive exists. |
| **Immutability** | MDAnalysis, BioAura parsing, and test fixtures use **that hashed file** unless a new file is deliberately introduced and documented. |

**Verified (repo):** `PdbProteinLoader` prefers PDB (`src/features/protein/loaders/PdbProteinLoader.ts`). PDB parse: auth chain (col 22), `seqId` (cols 23–26), atom name (cols 13–16), insertion (col 27) → `StructureResidue.insertionCode` (`parsePdbStructureModel.ts`).

**Assumption (not verified without file):** File contains parseable `ATOM`/`HETATM` records. Hydrogen count, waters, altLoc, and chain count are **unknown** until inspection.

---

## 3. Hydrogen policy (decision tree)

Inspect frozen `1CRN.pdb` **before** any MDAnalysis run.

| Branch | Condition | Action |
|--------|-----------|--------|
| **H-INSPECT** | Always first | Log presence of H/D on protein (**TBD** counting criteria). |
| **H-EXPLICIT** | Sufficient explicit H for a non-empty `hydrogens_sel` | Use same hashed PDB; record H count in session log. Threshold **TBD**. |
| **H-MODEL** | Insufficient H for MDAnalysis | **Stop** until an approved protonation pipeline is chosen. Method **TBD** (e.g. Reduce, `addh`, `pdb2gmx`). Output PDB gets a **new SHA-256**; `structureSource` documents parent and derived file. |
| **H-DEFER** | No approved H policy | No MDAnalysis run; no manifest pairs; PDB hash + inspection log only. |

Protonated structures use **modeled** hydrogens, not crystallographic fact. Do not imply BioAura loaded a protonated file unless explicitly tested.

**External (MDAnalysis docs):** Bonded topology (PSF/TPR/PRMTOP) is recommended for donor–H pairs; PDB-only pairing uses `donors_sel`, `hydrogens_sel`, and `d_h_cutoff`.

---

## 4. MDAnalysis configuration — first reference run

**External (MDAnalysis docs):** `MDAnalysis.analysis.hydrogenbonds.hbond_analysis.HydrogenBondAnalysis` on a static structure: `Universe(pdb_path)`, `update_selections=False`.

### Proposed parameters (not executed, not validated on 1CRN)

| Parameter | Proposed value | Notes |
|-----------|----------------|--------|
| `d_a_cutoff` | **3.0 Å** | MDAnalysis default; **D–A** distance per docs. **Independent of BioAura’s 3.5 Å.** |
| `d_h_a_angle_cutoff` | **150°** | MDAnalysis default; D–H···A angle. BioAura has no angle criterion. |
| `d_h_cutoff` | **1.2 Å** | MDAnalysis default for donor–H pairing without bond topology. |
| `update_selections` | **False** | Single-frame static PDB. |

| Metadata | Value |
|----------|--------|
| MDAnalysis version | **TBD** (record in `referenceTool` at run time) |
| Python version | **TBD** (session log) |

---

## 5. Donor, hydrogen, and acceptor selections

**External (MDAnalysis docs):** Selections use MDAnalysis selection language (`select_atoms`). Empty selection strings warn and yield no bonds.

**Principle:** Start narrow (protein-focused); expand only with documented approval. The strings below are **provisional examples only** — not chemically complete, not validated on 1CRN, and not executed.

### 5.1 Provisional example strings (revise after H-INSPECT)

| Role | Provisional example | Intent (illustrative only) |
|------|---------------------|----------------------------|
| **Acceptors** | `protein and not resname HOH WAT H2O DOD and (name O* or name NE2 or name ND1)` | **TBD** — O and some N acceptors; glob semantics **TBD** on installed MDAnalysis. |
| **Donors** | `protein and not resname HOH WAT H2O DOD and (name N or name NE* or name ND* or name NZ or name OG* or name OH)` | **TBD** — overlaps with acceptors on some residues; MDAnalysis resolves via donor–H–acceptor geometry, not BioAura tables. |
| **Hydrogens** | `protein and (name H* or name H)` | Valid only under **H-EXPLICIT** or **H-MODEL**; PDB hydrogen naming varies. |

### 5.2 Unresolved selection topics (TBD)

- Use of `guess_donors` / `guess_acceptors` / `guess_hydrogens` vs fixed strings.
- Sulfur (e.g. CYS SG) in donor/acceptor sets.
- Full aromatic N coverage (TRP, HIS, etc.).
- Intra- vs inter-chain scope (`between` / chain filters) after chain inspection.
- Final strings must be copied **verbatim** into `mdanalysis-session-log.txt`; any change invalidates comparison to the raw export.

### 5.3 D–H pairing

**Proposed (PDB-only pilot):** `donors_sel` + `hydrogens_sel` + `d_h_cutoff=1.2 Å`. No PSF/TPR/PRMTOP in v1 unless **TBD** approved.

**Do not** translate BioAura `donorAcceptorDatabase.ts` into MDAnalysis selections for Track R (that would conflate Track B with Track R).

---

## 6. Waters, altLoc, insertion codes, identity mapping

Do **not** assume 1CRN file contents. Handle via inspection and rules.

| Issue | Proposed handling |
|-------|-------------------|
| **Waters** | Exclude from selections (`not resname HOH WAT H2O DOD` and **TBD** others found in file). **Verified (repo):** BioAura excludes crystallographic waters from H-bond donor/acceptor analysis. |
| **Insertion codes** | **Verified (repo):** PDB col 27 → `insertionCode`; manifest pair schema has `seqId` only — document insertion in `referenceNotes` when non-blank; map to same residue key as BioAura (`residueKey` in `structureModelUtils.ts`). |
| **Alternate locations** | **Verified (repo):** altLoc (PDB col 17) **not parsed**; duplicate atom names possible. **TBD:** exclude ambiguous residues from pilot v1 vs occupancy-based preprocessing (preprocessing file **TBD** + new hash if used). |
| **Chain ID** | MDAnalysis `chainID` → manifest `donorChainId` / `acceptorChainId`. **TBD** if multiple chains. |
| **Residue ID** | Map to BioAura PDB `seqId` (auth seq). Confirm MDAnalysis PDB `resid` alignment on first run — **TBD**. |
| **Residue name** | `resname` → uppercase trim → manifest `*ResidueName`. |
| **Atom name** | `name` → trim → manifest `*AtomName`. |
| **Hydrogen in export** | Raw CSV may include H; manifest comparison identity uses **heavy donor and acceptor**; H details in `referenceNotes` — **TBD** approval. |

---

## 7. Comparison policy

### 7.1 Track R → manifest

1. Archive `reference-export-raw.csv` **unchanged**.
2. Map reviewed rows to `HydrogenBondReferencePair` with provenance (`curator`, `referenceTool`, `evidenceUrl`).
3. **Verified (repo):** `EMPTY_HYDROGEN_BOND_VALIDATION_MANIFEST` in `hydrogenBondValidation.manifest.ts` remains canonical until reviewed pairs are merged (Task 1.4).

### 7.2 Track B — descriptive comparison (later)

- **Identity key (proposed):** `{chainId}|{seqId}|{resname}|{atomName}` for heavy donor and heavy acceptor. **Do not use coordinates** — **Verified (repo):** `hydrogenBondPairKey` includes `x,y,z` (`hydrogenBondDetection.ts`); harness must not use that for reference matching. **Verified (repo):** `centerStructureModel` translates coordinates; distances are invariant.
- **Directed pairs:** Manifest stores MDAnalysis donor/acceptor; whether swapped D/A on the same heavy pair counts as a match — **TBD**.
- Report TP/FP/FN **relative to curated manifest**, not “BioAura failed science.”

### 7.3 Why matching `d_a_cutoff` alone would not equate the algorithms

Even if BioAura later used 3.0 Å instead of **Verified (repo)** 3.5 Å:

| Dimension | MDAnalysis (proposed first run) | BioAura (current) |
|-----------|-------------------------------|-------------------|
| Angle | D–H···A > 150° (needs H) | None |
| Hydrogen | Required in analysis; D–H vector | Heavy–heavy D···A; explicit H/D rejected as endpoints |
| Donor/acceptor | MDAnalysis selections | `donorAcceptorDatabase` + common names |
| Donor–H link | `d_h_cutoff` or topology | No D–H graph |
| Candidate shell | Universe-wide geometry | **Verified (repo):** ~5 Å neighbor search then filters |
| Same-residue | **TBD** MDAnalysis behavior | `differentResidue()` |

The first MDAnalysis run intentionally uses **3.0 Å + 150°** to remain MDAnalysis-native, not BioAura-mimetic.

---

## 8. Evidence, curation, manifest

Follow [hydrogen-bond-curation.md](./hydrogen-bond-curation.md) and **Verified (repo)** `validateHydrogenBondValidationManifest`.

**Proposed archive layout (Task 1.3, TBD path in repo):**

```text
reference-exports/1CRN/
  1CRN.pdb
  1CRN.pdb.sha256                 # optional
  mdanalysis-session-log.txt
  reference-export-raw.csv        # unedited MDAnalysis output
  candidates-for-review.csv       # sampled rows; manifest_status column
  curation-log.md
```

**Strict order:**

1. Freeze PDB (+ optional derived protonated file) + SHA-256.  
2. `H-INSPECT` log.  
3. Approved settings and **final** selection strings in session log.  
4. Run MDAnalysis → `reference-export-raw.csv`.  
5. `candidates-for-review.csv` — sampling size **TBD**; all rows `pending_review`.  
6. Manual mapping + second reviewer.  
7. Append to manifest `pairs` only after review; run validator.

**Rule:** No reference pairs enter the canonical manifest before steps 1–6 complete. No benchmark accuracy or agreement claims until Task 1.5 harness exists.

**`referenceTool` shape (example, TBD at run):**  
`MDAnalysis <version> HydrogenBondAnalysis; d_a_cutoff=3.0; d_h_a_angle_cutoff=150; d_h_cutoff=1.2; selections=<verbatim>`

---

## 9. Non-goals

- MDAnalysis or Python in BioAura browser runtime or default `npm run ci` (**Verified (repo):** CI is Node lint/typecheck/build; tests are Node).
- Changes to `HydrogenBondAnalyzer`, thresholds, or `donorAcceptorDatabase` as part of this spec.
- Fabricated pairs, metrics, or scientific-validation claims before curated evidence and comparison harness.
- Presenting provisional selection strings as complete or validated chemistry.

---

## 10. Smallest next action after protocol approval

1. Reviewer approves or edits **TBD** items in §3, §5, §6, §7.2.  
2. **Do not** install MDAnalysis or download `1CRN` until separately approved.  
3. When approved: out-of-repo Python venv (**TBD** path), single MDAnalysis run per this spec, archive raw output only — **no manifest pairs** until curation.  

---

## Document history

| Date | Change |
|------|--------|
| **TBD** | Initial approved draft added as `docs/validation/mdanalysis-1CRN-reference-spec.md` |
