import { elementFromAtomName } from '../core/cpkColors';
import type { StructureRecordGroup } from '../types/structure-model.types';
import {
  addAtomToModel,
  finalizeStructureModel,
  type MutableResidue,
} from './structureModelUtils';

function trimLineField(value: string): string {
  return value.trim();
}

function parsePdbElement(line: string, atomName: string): string {
  const elementField = trimLineField(line.slice(76, 78));
  if (elementField) {
    return elementField.toUpperCase();
  }

  return elementFromAtomName(atomName).toUpperCase();
}

function parsePdbRecordGroup(line: string): StructureRecordGroup {
  return line.startsWith('HETATM') ? 'HETATM' : 'ATOM';
}

export function parsePdbStructureModel(pdbText: string) {
  const chainMap = new Map<string, Map<string, MutableResidue>>();

  for (const line of pdbText.split('\n')) {
    if (!line.startsWith('ATOM') && !line.startsWith('HETATM')) continue;

    const recordGroup = parsePdbRecordGroup(line);
    const atomName = trimLineField(line.slice(12, 16));
    const residueName = trimLineField(line.slice(17, 20));
    const chainId = line[21]?.trim() ?? '';
    const seqId = trimLineField(line.slice(22, 26));
    const insertionCode = line[26]?.trim() ?? '';

    const x = Number.parseFloat(line.slice(30, 38));
    const y = Number.parseFloat(line.slice(38, 46));
    const z = Number.parseFloat(line.slice(46, 54));

    if (!chainId || !atomName || !residueName) continue;
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) continue;

    addAtomToModel(chainMap, chainId, residueName, seqId, insertionCode, recordGroup, {
      name: atomName,
      element: parsePdbElement(line, atomName),
      x,
      y,
      z,
    });
  }

  const model = finalizeStructureModel('pdb', chainMap);

  if (model.chains.length === 0) {
    throw new Error('Structure contains no displayable atoms');
  }

  return model;
}
