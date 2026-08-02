import type { ProteinMetadata } from '@shared/types';
import * as THREE from 'three';
import { cpkLinearRgbTriplet, elementFromAtomName } from '../core/cpkColors';
import { findAtomSiteLoop, getLoopColumnIndex } from './shared/mmcifAtomSite';
import { isStandardAminoAcidResidue } from './shared/polymerResidues';

/** Reject empty or atom-less mmCIF text before marking a load as successful. */
export function validateMmcifStructure(cifText: string): void {
  const trimmed = cifText.trim();
  if (!trimmed) {
    throw new Error('mmCIF file is empty');
  }

  if (!trimmed.includes('_atom_site.')) {
    throw new Error('mmCIF file contains no atom site records');
  }
}

export function buildMetadataFromMmcif(
  pdbId: string,
  cifText: string,
  overrides?: Partial<ProteinMetadata>,
): ProteinMetadata {
  const stats = parseMmcifStats(cifText);

  return {
    pdbId: pdbId.toUpperCase(),
    name: overrides?.name ?? pdbId.toUpperCase(),
    organism: overrides?.organism ?? 'Unknown',
    function:
      overrides?.function ??
      'Structural protein — function annotated from structure record',
    chainCount: stats.chainIds.size,
    aminoAcidCount: stats.residueKeys.size,
  };
}

function parseMmcifStats(cifText: string): { chainIds: Set<string>; residueKeys: Set<string> } {
  const chainIds = new Set<string>();
  const residueKeys = new Set<string>();
  const loop = findAtomSiteLoop(cifText);

  if (!loop) {
    return { chainIds, residueKeys };
  }

  const asymIdx = getLoopColumnIndex(loop.columns, '_atom_site.label_asym_id');
  const seqIdx = getLoopColumnIndex(loop.columns, '_atom_site.label_seq_id');
  const compIdx = getLoopColumnIndex(loop.columns, '_atom_site.label_comp_id');
  const groupIdx = getLoopColumnIndex(loop.columns, '_atom_site.group_PDB');

  for (const tokens of loop.rows) {
    const group = groupIdx >= 0 ? tokens[groupIdx] : 'ATOM';
    if (group !== 'ATOM') continue;

    const chainId = asymIdx >= 0 ? tokens[asymIdx] : '';
    const resSeq = seqIdx >= 0 ? tokens[seqIdx] : '';
    const resName = compIdx >= 0 ? tokens[compIdx] : '';

    if (!chainId || !resSeq || !isStandardAminoAcidResidue(resName)) continue;

    chainIds.add(chainId);
    residueKeys.add(`${chainId}:${resSeq}:${resName}`);
  }

  return { chainIds, residueKeys };
}

/** Produces a PDBLoader-compatible atom position geometry from mmCIF atom sites. */
export function parseMmcifAtomGeometry(cifText: string): THREE.BufferGeometry {
  const loop = findAtomSiteLoop(cifText);
  if (!loop) {
    throw new Error('mmCIF file contains no atom site records');
  }

  const xIdx = getLoopColumnIndex(loop.columns, '_atom_site.Cartn_x');
  const yIdx = getLoopColumnIndex(loop.columns, '_atom_site.Cartn_y');
  const zIdx = getLoopColumnIndex(loop.columns, '_atom_site.Cartn_z');
  const groupIdx = getLoopColumnIndex(loop.columns, '_atom_site.group_PDB');
  const typeSymbolIdx = getLoopColumnIndex(loop.columns, '_atom_site.type_symbol');
  const atomIdIdx = getLoopColumnIndex(loop.columns, '_atom_site.label_atom_id');

  if (xIdx < 0 || yIdx < 0 || zIdx < 0) {
    throw new Error('mmCIF atom site loop missing coordinates');
  }

  const positions: number[] = [];
  const colors: number[] = [];

  for (const tokens of loop.rows) {
    const group = groupIdx >= 0 ? tokens[groupIdx] : 'ATOM';
    if (group !== 'ATOM' && group !== 'HETATM') continue;

    const x = Number.parseFloat(tokens[xIdx] ?? '');
    const y = Number.parseFloat(tokens[yIdx] ?? '');
    const z = Number.parseFloat(tokens[zIdx] ?? '');

    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) continue;

    positions.push(x, y, z);

    let element = typeSymbolIdx >= 0 ? (tokens[typeSymbolIdx] ?? '') : '';
    if (!element && atomIdIdx >= 0) {
      element = elementFromAtomName(tokens[atomIdIdx] ?? '');
    }

    const [r, g, b] = cpkLinearRgbTriplet(element);
    colors.push(r, g, b);
  }

  if (positions.length === 0) {
    throw new Error('Structure contains no displayable atoms');
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  return geometry;
}

export function createEmptyBondGeometry(): THREE.BufferGeometry {
  return new THREE.BufferGeometry().setAttribute(
    'position',
    new THREE.Float32BufferAttribute([], 3),
  );
}
