import {
  HYDROGEN_BOND_VALIDATION_MANIFEST_VERSION,
  type HydrogenBondValidationManifest,
} from './hydrogenBondValidation.types';

/** Initial validation manifest — cases are added during Track 1 curation (Task 1.4). */
export const EMPTY_HYDROGEN_BOND_VALIDATION_MANIFEST: HydrogenBondValidationManifest = {
  version: HYDROGEN_BOND_VALIDATION_MANIFEST_VERSION,
  cases: [],
};
