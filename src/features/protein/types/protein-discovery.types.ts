/**
 * Lightweight preview fields for protein discovery search results.
 * Intentionally separate from {@link ProteinMetadata} — no structure stats or load state.
 */
export interface ProteinSearchResult {
  pdbId: string;
  title: string;
  organism?: string;
  experimentalMethod?: string;
}

/** Thrown when the RCSB search or preview enrichment request fails. */
export class ProteinSearchError extends Error {
  override readonly name = 'ProteinSearchError';

  constructor(
    message: string,
    options?: {
      cause?: unknown;
    },
  ) {
    super(message, options);
  }
}
