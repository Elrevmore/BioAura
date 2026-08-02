import { PDB_BASE_URL } from '@shared/config';
import type {
  ProteinLoadOptions,
  ProteinLoadResult,
  ProteinLoader,
  ProteinMetadata,
  ProteinStructureFormat,
} from '@shared/types';
import { buildMetadataFromMmcif, validateMmcifStructure } from '../parsers/mmcifParser';
import { buildMetadataFromPdb, validatePdbStructure } from '../parsers/pdbParser';

const RCSB_ENTRY_API = 'https://data.rcsb.org/rest/v1/core/entry';

interface RcsbEntryResponse {
  struct?: { title?: string };
  rcsb_entry_info?: { molecular_weight?: number };
}

async function fetchCifText(entryId: string): Promise<string> {
  const id = entryId.toUpperCase();
  const response = await fetch(`${PDB_BASE_URL}/${id}.cif`);

  if (!response.ok) {
    throw new Error(`Failed to fetch mmCIF ${id}: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

async function fetchRcsbMetadata(entryId: string): Promise<Partial<ProteinMetadata> | null> {
  const id = entryId.toUpperCase();

  try {
    const response = await fetch(`${RCSB_ENTRY_API}/${id}`);
    if (!response.ok) return null;

    const data = (await response.json()) as RcsbEntryResponse;
    const title = data.struct?.title?.trim();

    return title ? { function: title, name: title } : null;
  } catch {
    return null;
  }
}

async function fetchStructureText(
  entryId: string,
  preferredFormat: ProteinStructureFormat = 'pdb',
): Promise<{ text: string; format: ProteinStructureFormat }> {
  const id = entryId.toUpperCase();

  if (preferredFormat === 'mmcif') {
    const text = await fetchCifText(id);
    validateMmcifStructure(text);
    return { text, format: 'mmcif' };
  }

  const pdbResponse = await fetch(`${PDB_BASE_URL}/${id}.pdb`);

  if (pdbResponse.ok) {
    const text = await pdbResponse.text();

    try {
      validatePdbStructure(text);
      return { text, format: 'pdb' };
    } catch {
      // Fall through to mmCIF when the PDB payload is empty or invalid.
    }
  }

  const cifText = await fetchCifText(id);
  validateMmcifStructure(cifText);
  return { text: cifText, format: 'mmcif' };
}

/**
 * Loads protein structures from the RCSB Protein Data Bank.
 * Tries PDB first and falls back to mmCIF when PDB is unavailable.
 */
export class PdbProteinLoader implements ProteinLoader {
  readonly supportedFormats = ['pdb', 'mmcif'] as const;

  async load(entryId: string, options?: ProteinLoadOptions): Promise<ProteinLoadResult> {
    const id = entryId.toUpperCase().trim();

    if (!/^[A-Z0-9]{4}$/.test(id)) {
      throw new Error(`Invalid PDB ID: ${entryId}`);
    }

    const preferredFormat = options?.format ?? 'pdb';

    const [structure, rcsbMeta] = await Promise.all([
      fetchStructureText(id, preferredFormat),
      fetchRcsbMetadata(id),
    ]);

    const metadata =
      structure.format === 'pdb'
        ? buildMetadataFromPdb(id, structure.text, rcsbMeta ?? undefined)
        : buildMetadataFromMmcif(id, structure.text, rcsbMeta ?? undefined);

    return {
      metadata,
      rawData: structure.text,
      format: structure.format,
    };
  }
}
