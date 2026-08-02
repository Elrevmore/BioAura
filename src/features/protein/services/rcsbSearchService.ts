import { PROTEIN_SEARCH_CONFIG } from '@shared/config';
import type { ProteinSearchResult } from '../types/protein-discovery.types';
import { ProteinSearchError } from '../types/protein-discovery.types';

const PDB_ID_PATTERN = /^[A-Z0-9]{4}$/;

interface RcsbSearchResponse {
  result_set?: Array<{
    identifier: string;
    score?: number;
  }>;
}

interface RcsbGraphqlEntry {
  rcsb_id?: string;
  struct?: { title?: string };
  exptl?: Array<{ method?: string }>;
  polymer_entities?: Array<{
    rcsb_entity_source_organism?: Array<{ scientific_name?: string }>;
  }>;
}

interface RcsbGraphqlResponse {
  data?: {
    entries?: Array<RcsbGraphqlEntry | null>;
  };
  errors?: Array<{ message?: string }>;
}

function buildSearchRequestBody(query: string) {
  return {
    query: {
      type: 'terminal',
      service: 'full_text',
      parameters: { value: query },
    },
    return_type: 'entry',
    request_options: {
      paginate: {
        start: 0,
        rows: PROTEIN_SEARCH_CONFIG.maxResults,
      },
      results_content_type: ['experimental'],
      scoring_strategy: 'combined',
      sort: [{ sort_by: 'score', direction: 'desc' }],
    },
  };
}

function normalizePdbId(identifier: string): string | null {
  const id = identifier.trim().toUpperCase().split('_')[0]?.split('.')[0] ?? '';
  return PDB_ID_PATTERN.test(id) ? id : null;
}

async function fetchSearchIdentifiers(query: string): Promise<string[]> {
  const response = await fetch(PROTEIN_SEARCH_CONFIG.searchApiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildSearchRequestBody(query)),
  });

  if (response.status === 204) {
    return [];
  }

  if (!response.ok) {
    throw new ProteinSearchError(
      `RCSB search failed: ${response.status} ${response.statusText}`,
    );
  }

  const payload = (await response.json()) as RcsbSearchResponse;
  const identifiers = payload.result_set?.map((hit) => hit.identifier) ?? [];

  const uniqueIds: string[] = [];
  const seen = new Set<string>();

  for (const identifier of identifiers) {
    const pdbId = normalizePdbId(identifier);
    if (!pdbId || seen.has(pdbId)) {
      continue;
    }

    seen.add(pdbId);
    uniqueIds.push(pdbId);

    if (uniqueIds.length >= PROTEIN_SEARCH_CONFIG.maxResults) {
      break;
    }
  }

  return uniqueIds;
}

const SEARCH_PREVIEW_GRAPHQL = `
  query SearchPreviewEntries($ids: [String!]!) {
    entries(entry_ids: $ids) {
      rcsb_id
      struct {
        title
      }
      exptl {
        method
      }
      polymer_entities {
        rcsb_entity_source_organism {
          scientific_name
        }
      }
    }
  }
`;

function pickOrganism(entry: RcsbGraphqlEntry): string | undefined {
  const names = new Set<string>();

  for (const entity of entry.polymer_entities ?? []) {
    for (const source of entity.rcsb_entity_source_organism ?? []) {
      const name = source.scientific_name?.trim();
      if (name) {
        names.add(name);
      }
    }
  }

  if (names.size === 0) {
    return undefined;
  }

  return [...names].sort((a, b) => a.localeCompare(b)).join(', ');
}

function pickExperimentalMethod(entry: RcsbGraphqlEntry): string | undefined {
  const methods = new Set<string>();

  for (const experiment of entry.exptl ?? []) {
    const method = experiment.method?.trim();
    if (method) {
      methods.add(method);
    }
  }

  if (methods.size === 0) {
    return undefined;
  }

  return [...methods].sort((a, b) => a.localeCompare(b)).join(', ');
}

async function fetchSearchPreviews(pdbIds: string[]): Promise<Map<string, ProteinSearchResult>> {
  if (pdbIds.length === 0) {
    return new Map();
  }

  const response = await fetch(PROTEIN_SEARCH_CONFIG.graphqlApiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: SEARCH_PREVIEW_GRAPHQL,
      variables: { ids: pdbIds },
    }),
  });

  if (!response.ok) {
    throw new ProteinSearchError(
      `RCSB preview lookup failed: ${response.status} ${response.statusText}`,
    );
  }

  const payload = (await response.json()) as RcsbGraphqlResponse;

  if (payload.errors?.length) {
    const message = payload.errors.map((error) => error.message).filter(Boolean).join('; ');
    throw new ProteinSearchError(message || 'RCSB preview lookup returned GraphQL errors');
  }

  const previews = new Map<string, ProteinSearchResult>();

  for (const entry of payload.data?.entries ?? []) {
    if (!entry?.rcsb_id) {
      continue;
    }

    const pdbId = normalizePdbId(entry.rcsb_id);
    if (!pdbId) {
      continue;
    }

    const title = entry.struct?.title?.trim() || pdbId;

    previews.set(pdbId, {
      pdbId,
      title,
      organism: pickOrganism(entry),
      experimentalMethod: pickExperimentalMethod(entry),
    });
  }

  return previews;
}

/**
 * Search the RCSB PDB archive for experimental structures matching a text query.
 *
 * Step 1: RCSB Search API (`full_text` on entries, max 20 hits).
 * Step 2: RCSB Data API GraphQL batch for lightweight preview fields only.
 *
 * Does not fetch structure files or build {@link ProteinMetadata}.
 */
export async function searchProteins(query: string): Promise<ProteinSearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  try {
    const pdbIds = await fetchSearchIdentifiers(trimmed);

    if (pdbIds.length === 0) {
      return [];
    }

    try {
      const previews = await fetchSearchPreviews(pdbIds);

      return pdbIds.map((pdbId) => previews.get(pdbId) ?? { pdbId, title: pdbId });
    } catch (previewError) {
      if (previewError instanceof ProteinSearchError) {
        throw previewError;
      }

      throw new ProteinSearchError('RCSB preview lookup failed', { cause: previewError });
    }
  } catch (error) {
    if (error instanceof ProteinSearchError) {
      throw error;
    }

    throw new ProteinSearchError('RCSB protein search failed', { cause: error });
  }
}
