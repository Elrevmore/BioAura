import {
  HYDROGEN_BOND_VALIDATION_MANIFEST_VERSION,
  type HydrogenBondReferencePair,
  type HydrogenBondValidationCaseProvenance,
  type HydrogenBondValidationManifest,
} from './hydrogenBondValidation.types';

export class HydrogenBondValidationManifestError extends Error {
  readonly issues: readonly string[];

  constructor(issues: string[]) {
    super(issues.join('; '));
    this.name = 'HydrogenBondValidationManifestError';
    this.issues = issues;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requireNonEmptyString(
  issues: string[],
  value: unknown,
  path: string,
): string | undefined {
  if (typeof value !== 'string') {
    issues.push(`${path} must be a string`);
    return undefined;
  }
  if (value.trim().length === 0) {
    issues.push(`${path} must be a non-empty string`);
    return undefined;
  }
  return value;
}

function validatePairProvenance(
  pair: unknown,
  caseIndex: number,
  pairIndex: number,
  issues: string[],
): void {
  if (!isRecord(pair)) {
    issues.push(`cases[${caseIndex}].pairs[${pairIndex}] must be an object`);
    return;
  }

  const prefix = `cases[${caseIndex}].pairs[${pairIndex}]`;
  const provenanceKeys: Array<keyof HydrogenBondReferencePair> = [
    'donorChainId',
    'donorResidueName',
    'donorSeqId',
    'donorAtomName',
    'acceptorChainId',
    'acceptorResidueName',
    'acceptorSeqId',
    'acceptorAtomName',
    'curator',
    'referenceTool',
    'evidenceUrl',
  ];

  for (const key of provenanceKeys) {
    requireNonEmptyString(issues, pair[key], `${prefix}.${key}`);
  }

  if (pair.referenceDistanceAngstrom !== undefined) {
    if (typeof pair.referenceDistanceAngstrom !== 'number' || !Number.isFinite(pair.referenceDistanceAngstrom)) {
      issues.push(`${prefix}.referenceDistanceAngstrom must be a finite number when present`);
    }
  }

  if (pair.referenceNotes !== undefined && typeof pair.referenceNotes !== 'string') {
    issues.push(`${prefix}.referenceNotes must be a string when present`);
  }
}

function validateCaseProvenance(caseValue: unknown, caseIndex: number, issues: string[]): void {
  if (!isRecord(caseValue)) {
    issues.push(`cases[${caseIndex}] must be an object`);
    return;
  }

  const prefix = `cases[${caseIndex}]`;
  const caseKeys: Array<keyof HydrogenBondValidationCaseProvenance> = [
    'pdbId',
    'structureSource',
    'referenceTool',
    'referenceExportDate',
    'evidenceUrl',
  ];

  for (const key of caseKeys) {
    requireNonEmptyString(issues, caseValue[key], `${prefix}.${key}`);
  }

  if (!Array.isArray(caseValue.pairs)) {
    issues.push(`${prefix}.pairs must be an array`);
    return;
  }

  for (let pairIndex = 0; pairIndex < caseValue.pairs.length; pairIndex++) {
    validatePairProvenance(caseValue.pairs[pairIndex], caseIndex, pairIndex, issues);
  }
}

/**
 * Validates manifest shape and required provenance fields.
 * @throws {HydrogenBondValidationManifestError} when invalid
 */
export function validateHydrogenBondValidationManifest(
  manifest: unknown,
): HydrogenBondValidationManifest {
  const issues: string[] = [];

  if (!isRecord(manifest)) {
    throw new HydrogenBondValidationManifestError(['manifest must be an object']);
  }

  if (manifest.version !== HYDROGEN_BOND_VALIDATION_MANIFEST_VERSION) {
    issues.push(
      `version must be ${HYDROGEN_BOND_VALIDATION_MANIFEST_VERSION}`,
    );
  }

  if (!Array.isArray(manifest.cases)) {
    issues.push('cases must be an array');
  } else {
    for (let caseIndex = 0; caseIndex < manifest.cases.length; caseIndex++) {
      validateCaseProvenance(manifest.cases[caseIndex], caseIndex, issues);
    }
  }

  if (issues.length > 0) {
    throw new HydrogenBondValidationManifestError(issues);
  }

  return manifest as unknown as HydrogenBondValidationManifest;
}
