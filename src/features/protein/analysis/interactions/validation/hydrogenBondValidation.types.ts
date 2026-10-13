/**
 * Schema for Milestone A hydrogen-bond validation manifests.
 * Curated pairs require provenance — see validateHydrogenBondValidationManifest.
 */

export const HYDROGEN_BOND_VALIDATION_MANIFEST_VERSION = 1;

/** Independent reference metadata shared by a validation case. */
export interface HydrogenBondValidationCaseProvenance {
  /** RCSB PDB identifier (e.g. 1HHO). */
  pdbId: string;
  /** Source revision: RCSB deposit date, file hash, or revision note. */
  structureSource: string;
  /** Reference program used to curate pairs (name + version). */
  referenceTool: string;
  /** ISO-8601 date when the reference export was produced. */
  referenceExportDate: string;
  /** Link or repo path to the reference export / session / publication. */
  evidenceUrl: string;
}

/**
 * One donor–acceptor pair from an independent reference export.
 * Atom identities match BioAura StructureModel naming (chainId, seqId, atom.name).
 */
export interface HydrogenBondReferencePair {
  donorChainId: string;
  donorResidueName: string;
  donorSeqId: string;
  donorAtomName: string;
  acceptorChainId: string;
  acceptorResidueName: string;
  acceptorSeqId: string;
  acceptorAtomName: string;
  /** Person or process that mapped this row from the reference export. */
  curator: string;
  /** Reference tool for this row (may match the case when re-exported together). */
  referenceTool: string;
  evidenceUrl: string;
  referenceDistanceAngstrom?: number;
  referenceNotes?: string;
}

export interface HydrogenBondValidationCase extends HydrogenBondValidationCaseProvenance {
  pairs: HydrogenBondReferencePair[];
}

export interface HydrogenBondValidationManifest {
  version: typeof HYDROGEN_BOND_VALIDATION_MANIFEST_VERSION;
  cases: HydrogenBondValidationCase[];
}
