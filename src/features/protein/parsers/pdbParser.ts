import { isStandardAminoAcidResidue } from './shared/polymerResidues';

export interface ParsedPdbStats {
  chainIds: Set<string>;
  residueKeys: Set<string>;
}

export function parsePdbStats(pdbText: string): ParsedPdbStats {
  const chainIds = new Set<string>();
  const residueKeys = new Set<string>();

  for (const line of pdbText.split('\n')) {
    if (!line.startsWith('ATOM')) continue;

    const resName = line.slice(17, 20).trim();
    const chainId = line[21]?.trim();
    const resSeq = line.slice(22, 26).trim();

    if (!chainId || !isStandardAminoAcidResidue(resName)) continue;

    chainIds.add(chainId);
    residueKeys.add(`${chainId}:${resSeq}:${resName}`);
  }

  return { chainIds, residueKeys };
}

export function extractPdbTitle(pdbText: string): string {
  const titleLines: string[] = [];

  for (const line of pdbText.split('\n')) {
    if (line.startsWith('TITLE')) {
      titleLines.push(line.slice(10, 80).trim());
    }
  }

  return titleLines.join(' ').trim();
}

export function extractPdbOrganism(pdbText: string): string {
  for (const line of pdbText.split('\n')) {
    if (line.includes('ORGANISM_SCIENTIFIC:')) {
      const match = line.match(/ORGANISM_SCIENTIFIC:\s*(.+?);/);
      if (match?.[1]) {
        return capitalizeOrganism(match[1].trim());
      }
    }
  }
  return 'Unknown';
}

export function extractPdbMoleculeName(pdbText: string): string {
  for (const line of pdbText.split('\n')) {
    if (line.includes('MOLECULE:')) {
      const match = line.match(/MOLECULE:\s*(.+?);/);
      if (match?.[1]) {
        return match[1].trim();
      }
    }
  }
  return '';
}

function capitalizeOrganism(name: string): string {
  return name
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/** Reject empty or atom-less PDB text before marking a load as successful. */
export function validatePdbStructure(pdbText: string): void {
  const trimmed = pdbText.trim();
  if (!trimmed) {
    throw new Error('PDB file is empty');
  }

  for (const line of trimmed.split('\n')) {
    if (line.startsWith('ATOM') || line.startsWith('HETATM')) {
      return;
    }
  }

  throw new Error('PDB file contains no atom records');
}

export function buildMetadataFromPdb(
  pdbId: string,
  pdbText: string,
  overrides?: Partial<import('@shared/types').ProteinMetadata>,
): import('@shared/types').ProteinMetadata {
  const stats = parsePdbStats(pdbText);
  const molecule = extractPdbMoleculeName(pdbText);
  const title = extractPdbTitle(pdbText);

  return {
    pdbId: pdbId.toUpperCase(),
    name: overrides?.name ?? (molecule || title || pdbId.toUpperCase()),
    organism: overrides?.organism ?? extractPdbOrganism(pdbText),
    function:
      overrides?.function ??
      (title || 'Structural protein — function annotated from PDB record'),
    chainCount: stats.chainIds.size,
    aminoAcidCount: stats.residueKeys.size,
  };
}
