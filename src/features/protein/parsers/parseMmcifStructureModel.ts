import { elementFromAtomName } from '../core/cpkColors';
import type { StructureRecordGroup } from '../types/structure-model.types';
import {
  findAtomSiteLoop,
  getLoopColumnIndex,
} from './shared/mmcifAtomSite';
import {
  addAtomToModel,
  finalizeStructureModel,
  type MutableResidue,
} from './structureModelUtils';

function parseMmcifRecordGroup(value: string | undefined): StructureRecordGroup {
  return value === 'HETATM' ? 'HETATM' : 'ATOM';
}

function resolveMmcifSeqId(labelSeqId: string, authSeqId: string): string {
  const label = labelSeqId.trim();
  if (label && label !== '.') {
    return label;
  }

  const auth = authSeqId.trim();
  if (auth && auth !== '.') {
    return auth;
  }

  return '.';
}

export function parseMmcifStructureModel(cifText: string) {
  const loop = findAtomSiteLoop(cifText);
  if (!loop) {
    throw new Error('mmCIF file contains no atom site records');
  }

  const xIdx = getLoopColumnIndex(loop.columns, '_atom_site.Cartn_x');
  const yIdx = getLoopColumnIndex(loop.columns, '_atom_site.Cartn_y');
  const zIdx = getLoopColumnIndex(loop.columns, '_atom_site.Cartn_z');
  const groupIdx = getLoopColumnIndex(loop.columns, '_atom_site.group_PDB');
  const asymIdx = getLoopColumnIndex(loop.columns, '_atom_site.label_asym_id');
  const seqIdx = getLoopColumnIndex(loop.columns, '_atom_site.label_seq_id');
  const authSeqIdx = getLoopColumnIndex(loop.columns, '_atom_site.auth_seq_id');
  const compIdx = getLoopColumnIndex(loop.columns, '_atom_site.label_comp_id');
  const atomIdIdx = getLoopColumnIndex(loop.columns, '_atom_site.label_atom_id');
  const typeSymbolIdx = getLoopColumnIndex(loop.columns, '_atom_site.type_symbol');
  const insCodeIdx = getLoopColumnIndex(loop.columns, '_atom_site.pdbx_PDB_ins_code');

  if (xIdx < 0 || yIdx < 0 || zIdx < 0) {
    throw new Error('mmCIF atom site loop missing coordinates');
  }

  const chainMap = new Map<string, Map<string, MutableResidue>>();

  for (const tokens of loop.rows) {
    const recordGroup = parseMmcifRecordGroup(
      groupIdx >= 0 ? tokens[groupIdx] : 'ATOM',
    );

    const chainId = asymIdx >= 0 ? tokens[asymIdx] ?? '' : '';
    const residueName = compIdx >= 0 ? tokens[compIdx] ?? '' : '';
    const atomName = atomIdIdx >= 0 ? tokens[atomIdIdx] ?? '' : '';
    const seqId = resolveMmcifSeqId(
      seqIdx >= 0 ? tokens[seqIdx] ?? '' : '',
      authSeqIdx >= 0 ? tokens[authSeqIdx] ?? '' : '',
    );
    const insertionCode =
      insCodeIdx >= 0 && tokens[insCodeIdx] !== '.' ? tokens[insCodeIdx] ?? '' : '';

    const x = Number.parseFloat(tokens[xIdx] ?? '');
    const y = Number.parseFloat(tokens[yIdx] ?? '');
    const z = Number.parseFloat(tokens[zIdx] ?? '');

    if (!chainId || !residueName || !atomName) continue;
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) continue;

    let element = typeSymbolIdx >= 0 ? (tokens[typeSymbolIdx] ?? '').trim() : '';
    if (!element || element === '.') {
      element = elementFromAtomName(atomName);
    }

    addAtomToModel(chainMap, chainId, residueName, seqId, insertionCode, recordGroup, {
      name: atomName.trim(),
      element: element.toUpperCase(),
      x,
      y,
      z,
    });
  }

  if (chainMap.size === 0) {
    throw new Error('Structure contains no displayable atoms');
  }

  return finalizeStructureModel('mmcif', chainMap);
}
