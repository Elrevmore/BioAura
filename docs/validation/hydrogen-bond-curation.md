# Hydrogen-bond reference curation protocol

Human workflow for building **independent reference data** used to validate BioAura hydrogen-bond detection (Milestone A, Track 1). This document does **not** define detection rules in BioAura and does **not** assert that any structure has been fully validated until a manifest is curated and reviewed.

**Related artifacts (code):**

| Artifact | Path |
|----------|------|
| Manifest schema (types) | `src/features/protein/analysis/interactions/validation/hydrogenBondValidation.types.ts` |
| Runtime validator | `src/features/protein/analysis/interactions/validation/validateHydrogenBondValidationManifest.ts` |
| Empty manifest constant | `src/features/protein/analysis/interactions/validation/hydrogenBondValidation.manifest.ts` |

Each curated pair must pass `validateHydrogenBondValidationManifest` before it is merged into the project manifest (future Task 1.4).

---

## What the reference is (and is not)

| Claim | Valid? |
|-------|--------|
| “Listed in our reference export from tool X with settings Y” | **Yes** — if provenance is recorded |
| “Experimentally proven hydrogen bond in the crystal” | **Only** with a primary citation or validated annotation — **not** inferred from a viewer alone |
| “BioAura agrees with the benchmark” | **Only** after harness comparison (future Task 1.5) — not assumed here |

Reference tools (PyMOL, ChimeraX, HBPLUS, etc.) apply **geometric and chemical heuristics**, often with **implicit or modeled hydrogens**. Their output is the **independent reference** for regression testing, not ground truth from experiment.

---

## Overview workflow

```text
1. Select PDB entry → record revision/provenance
2. Choose ONE primary reference tool → record version + all criteria + export command
3. Load the same coordinate file BioAura will use (PDB preferred; mmCIF if fallback)
4. Export donor–acceptor pairs from the tool → archive raw export (evidence)
5. Map each pair to BioAura identifiers → manifest row + curation log
6. Optional: negative controls ONLY if the tool/export procedure defines them explicitly
7. Second-person review of mapping before merge
```

Keep **raw exports** under version control (e.g. `src/features/protein/analysis/interactions/validation/reference-exports/`, planned in Task 1.3) and point `evidenceUrl` at the committed file or an immutable external link.

---

## Step 1 — Select and record the PDB structure

### Choosing structures

Start with **one or two** small, well-documented entries (candidate examples: `1CRN`, `1HHO`, `1UBQ`). Expand only after the pipeline is stable. **Do not** pre-fill expected bond counts or accuracy metrics.

### Provenance to record (maps to manifest case fields)

| Field | What to record |
|-------|----------------|
| `pdbId` | Four-character PDB ID (uppercase) |
| `structureSource` | Enough detail to reproduce the exact coordinates BioAura parsed |

**Recommended `structureSource` contents (single string or structured note):**

- RCSB download URL and date fetched (e.g. `https://files.rcsb.org/download/1CRN.pdb`, `2026-03-01`)
- File **SHA-256** of the downloaded `.pdb` or `.cif` used for both reference tool and BioAura
- Optional: PDB `REMARK` revision date or RCSB “Released” / revision metadata from the entry page

BioAura loading behavior (for alignment):

- `PdbProteinLoader` tries **PDB first**, then **mmCIF** if PDB is missing or invalid (`src/features/protein/loaders/PdbProteinLoader.ts`).
- Curation must use the **same file format and file hash** you will place in test fixtures or that the loader fetches for that ID.

---

## Step 2 — Choose and record the independent reference tool

Pick **one primary tool** per validation case so exports are comparable. Record everything needed for another curator to reproduce the export.

### Manifest fields

| Field | Content |
|-------|---------|
| `referenceTool` | Program name and **exact version** (e.g. `ChimeraX 1.9`, `PyMOL 3.0.0`) |
| `referenceExportDate` | ISO-8601 date of export (`YYYY-MM-DD`) |
| `evidenceUrl` | Path or URL to archived session script, log, or export file |

### Settings checklist (record in curation log + `referenceNotes` on pairs when needed)

Document **all** parameters that affect which pairs are reported:

| Parameter | Example values to record |
|-----------|---------------------------|
| Distance cutoff | e.g. 3.5 Å donor–acceptor or H···A (state which) |
| Angle cutoff | e.g. D–H···A ≥ 120° (only if tool uses angles) |
| Hydrogen treatment | implicit H added / only explicit H / none |
| Inter-molecular vs intra | include protein–protein, protein–ligand, or exclude waters |
| Water | include `HOH` bridges or exclude (BioAura excludes crystallographic water from donor/acceptor analysis in `donorAcceptorDatabase.ts`) |
| Export scope | whole structure vs selected chains/residues |

**Command / session log:** Paste the exact commands (ChimeraX command line, PyMOL `hbonds` invocation, HBPLUS input deck) into the evidence archive. Screenshots alone are supplementary, not sufficient.

---

## Step 3 — Export reference pairs

1. Open the **same coordinate file** recorded in Step 1.
2. Run the documented hydrogen-bond (or contact) detection with the recorded settings.
3. Export to a **machine-readable** format when possible (CSV, JSON, log). If the tool only provides a table in the UI, transcribe to CSV and store the screenshot as secondary evidence.
4. For each exported interaction, capture at minimum:
   - Donor atom identity (chain, residue name, sequence id, atom name)
   - Acceptor atom identity
   - Distance reported by the tool (optional → `referenceDistanceAngstrom` in manifest)

**Do not** edit the export to “fix” disagreements with BioAura before archiving the raw file.

---

## Step 4 — Map identifiers to BioAura `StructureModel` conventions

Manifest pair fields must match what `parseStructureModel` produces (`hydrogenBondValidation.types.ts`).

### Chain ID (`donorChainId`, `acceptorChainId`)

| Format loaded | BioAura `chainId` source |
|---------------|---------------------------|
| **PDB** | Chain column (line index 21), trimmed (`parsePdbStructureModel.ts`) |
| **mmCIF** | `_atom_site.label_asym_id` (`parseMmcifStructureModel.ts`) |

If the reference tool displays **auth** chain IDs but BioAura uses **label** asym IDs (common in mmCIF), map explicitly in the curation log.

### Residue sequence ID (`donorSeqId`, `acceptorSeqId`)

| Format loaded | BioAura `seqId` source |
|---------------|-------------------------|
| **PDB** | Residue sequence field (columns 23–26), trimmed — **author** numbering in standard PDB |
| **mmCIF** | `label_seq_id` if present and not `.`, else `auth_seq_id` (`resolveMmcifSeqId`) |

Record in `referenceNotes` when the tool’s UI shows **auth** seq but BioAura stores **label** seq (or vice versa).

### Insertion codes

BioAura stores `insertionCode` on `StructureResidue` when PDB column 26 or mmCIF `pdbx_PDB_ins_code` is set. Manifest `seqId` should match the **same** residue key BioAura uses; if insertion codes split one auth number into two residues, use the `seqId` + insertion combination that appears in the parsed model (verify by loading the structure in BioAura Inspector or a one-off parse in tests).

### Residue name (`donorResidueName`, `acceptorResidueName`)

Three-letter code, uppercase (as in PDB).

### Atom name (`donorAtomName`, `acceptorAtomName`)

PDB atom name field (columns 12–16), trimmed — e.g. `OD1`, `OG`, `N`. BioAura does **not** strip alternate-location suffixes into separate atoms; if the PDB contains multiple altLocs for one name, **all** matching atoms may exist on the same residue. Note conflicts in `referenceNotes` and prefer residues without altLoc ambiguity for early benchmarks.

### Donor vs acceptor orientation

Record the tool’s donor and acceptor assignment. BioAura’s `orientHydrogenBondPair` may swap orientation when both atoms can act as donor/acceptor; the manifest should store the **reference tool’s** donor/acceptor labels. Comparison harness (Task 1.5) should treat swapped chemically equivalent orientations consistently — document any normalization rule there, not in this protocol.

---

## Step 5 — Evidence and known mismatch sources

### Required evidence per case

- Archived raw export (file committed or stable URL)
- `evidenceUrl` on the case pointing to that archive
- Curator name on each pair (`curator` field)

### Per-pair optional notes (`referenceNotes`)

Use for:

- Auth vs label numbering mismatches resolved during mapping
- Insertion codes
- Ligand (HETATM) vs polymer (ATOM) residues
- Reference tool used implicit hydrogens; distance is H···A in tool but D···A in BioAura
- Residue excluded by BioAura water rules (`HOH`, `WAT`, etc.)
- AltLoc, missing atoms, or duplicate atom names in the parsed model

### BioAura parser limitations relevant to curation

| Issue | Impact on mapping |
|-------|-------------------|
| No altLoc filtering | Multiple atoms may share one atom name; picking the wrong alternate invalidates comparison |
| No occupancy/B-factor filtering in H-bond analyzer | Low-occupancy sites may appear in structure but not in reference |
| mmCIF vs PDB same entry | Different `chainId` / `seqId` conventions — **never** mix formats between reference and BioAura without remapping |
| Distance-only detection in BioAura (current) | Reference may use angle + H placement; disagreements are expected until Milestone A Track 2 |

---

## Step 6 — Negative controls

Include a **negative control** in the manifest only when:

1. The reference tool or export procedure **explicitly** classifies a close atom pair as **not** a hydrogen bond (or below threshold), **or**
2. A published supplementary table lists rejected pairs for the same criteria.

Do **not** add negatives by guessing (“these atoms look too far” without tool output). For each negative, record in `referenceNotes` the **reason from the reference procedure** (e.g. “angle below cutoff in ChimeraX export row 42”).

---

## Step 7 — Review before merge

- [ ] Same PDB/mmCIF file hash used for reference export and BioAura load path
- [ ] Tool name, version, and all cutoffs documented
- [ ] Raw export archived; `evidenceUrl` resolves
- [ ] Every pair mapped to BioAura `chainId`, `seqId`, residue name, atom name (verified against parsed model)
- [ ] `validateHydrogenBondValidationManifest` passes on the case object
- [ ] Independent reviewer checked mappings (initials + date in curation log)
- [ ] No benchmark accuracy or “X% agreement” claims in commit messages until Task 1.5 report exists

---

## Curation log template

Copy one block per structure case. Store alongside the raw export (e.g. `reference-exports/1CRN/curation-log.md`).

```markdown
# H-bond curation log — {PDB_ID}

## Structure provenance
- **PDB ID:** 
- **File:** {filename}.pdb | .cif
- **Fetched:** YYYY-MM-DD
- **SHA-256:** 
- **BioAura load path:** RCSB PDB first / mmCIF fallback (which file used: )

## Reference tool
- **Tool:** {name} {version}
- **Export date:** YYYY-MM-DD
- **Evidence archive:** {repo-relative path or URL}
- **Distance criterion:** 
- **Angle criterion:** 
- **Hydrogen model:** explicit | implicit | none
- **Waters / ligands / inter-chain:** 
- **Commands / script:**

## Mapping verification
- **Parsed with:** BioAura `parseStructureModel` (format: pdb | mmcif)
- **Spot-check residues:** {list 2–3 residues used in pairs — IDs only, no bond claims}
- **Known numbering issues:** auth vs label | insertion | altLoc | other
- **Curator:** 
- **Reviewer:** 

## Pairs summary (counts only)
- **Positive pairs mapped:** {N} (listed in manifest — do not paste full table here until Task 1.4)
- **Negative controls:** {N} (each tied to reference procedure — see referenceNotes)

## Open questions
- 
```

---

## Mapping manifest fields (quick reference)

**Case** (`HydrogenBondValidationCase`): `pdbId`, `structureSource`, `referenceTool`, `referenceExportDate`, `evidenceUrl`, `pairs[]`

**Pair** (`HydrogenBondReferencePair`): donor/acceptor chain, residue name, `seqId`, atom name; `curator`, `referenceTool`, `evidenceUrl`; optional `referenceDistanceAngstrom`, `referenceNotes`

**Empty baseline:** `EMPTY_HYDROGEN_BOND_VALIDATION_MANIFEST` in `hydrogenBondValidation.manifest.ts` — valid with `cases: []` until curation is complete.

---

## Document history

| Date | Change |
|------|--------|
| 2026-03-01 | Initial protocol (Milestone A, Task 1.2) |
