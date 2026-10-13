import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { EMPTY_HYDROGEN_BOND_VALIDATION_MANIFEST } from './hydrogenBondValidation.manifest';
import {
  HydrogenBondValidationManifestError,
  validateHydrogenBondValidationManifest,
} from './validateHydrogenBondValidationManifest';
import { HYDROGEN_BOND_VALIDATION_MANIFEST_VERSION } from './hydrogenBondValidation.types';

describe('validateHydrogenBondValidationManifest', () => {
  it('accepts the empty validation manifest', () => {
    const result = validateHydrogenBondValidationManifest(
      EMPTY_HYDROGEN_BOND_VALIDATION_MANIFEST,
    );
    assert.equal(result.version, HYDROGEN_BOND_VALIDATION_MANIFEST_VERSION);
    assert.deepEqual(result.cases, []);
  });

  it('accepts a case with an empty pairs list when provenance is complete', () => {
    const manifest = {
      version: HYDROGEN_BOND_VALIDATION_MANIFEST_VERSION,
      cases: [
        {
          pdbId: '1CRN',
          structureSource: 'RCSB PDB revision pending curation',
          referenceTool: 'TBD',
          referenceExportDate: '2026-01-01',
          evidenceUrl: 'https://example.invalid/pending',
          pairs: [],
        },
      ],
    };

    const result = validateHydrogenBondValidationManifest(manifest);
    assert.equal(result.cases.length, 1);
    assert.equal(result.cases[0].pairs.length, 0);
  });

  it('rejects a case missing required provenance fields', () => {
    const manifest = {
      version: HYDROGEN_BOND_VALIDATION_MANIFEST_VERSION,
      cases: [
        {
          pdbId: '1CRN',
          structureSource: 'test',
          referenceTool: 'PyMOL 3.0',
          referenceExportDate: '2026-01-01',
          evidenceUrl: '',
          pairs: [],
        },
      ],
    };

    assert.throws(
      () => validateHydrogenBondValidationManifest(manifest),
      (error: unknown) => {
        assert.ok(error instanceof HydrogenBondValidationManifestError);
        assert.ok(
          error.issues.some((issue) => issue.includes('evidenceUrl')),
        );
        return true;
      },
    );
  });

  it('rejects a pair missing required provenance fields', () => {
    const manifest = {
      version: HYDROGEN_BOND_VALIDATION_MANIFEST_VERSION,
      cases: [
        {
          pdbId: '1CRN',
          structureSource: 'test',
          referenceTool: 'ChimeraX 1.8',
          referenceExportDate: '2026-01-01',
          evidenceUrl: 'https://example.invalid/export.json',
          pairs: [
            {
              donorChainId: 'A',
              donorResidueName: 'SER',
              donorSeqId: '7',
              donorAtomName: 'OG',
              acceptorChainId: 'A',
              acceptorResidueName: 'ASP',
              acceptorSeqId: '21',
              acceptorAtomName: 'OD1',
              curator: '',
              referenceTool: 'ChimeraX 1.8',
              evidenceUrl: 'https://example.invalid/export.json',
            },
          ],
        },
      ],
    };

    assert.throws(
      () => validateHydrogenBondValidationManifest(manifest),
      (error: unknown) => {
        assert.ok(error instanceof HydrogenBondValidationManifestError);
        assert.ok(error.issues.some((issue) => issue.includes('curator')));
        return true;
      },
    );
  });
});
