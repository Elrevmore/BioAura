import type { ProteinStructureFormat } from '@shared/types';
import type { StructureModel } from '../types/structure-model.types';
import { parseMmcifStructureModel } from './parseMmcifStructureModel';
import { parsePdbStructureModel } from './parsePdbStructureModel';

/**
 * Normalize loaded structure text into a representation-independent model.
 */
export function parseStructureModel(
  rawData: string,
  format: ProteinStructureFormat,
): StructureModel {
  if (format === 'mmcif') {
    return parseMmcifStructureModel(rawData);
  }

  return parsePdbStructureModel(rawData);
}
