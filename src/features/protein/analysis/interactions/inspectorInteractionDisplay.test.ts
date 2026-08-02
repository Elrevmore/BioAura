import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { InteractionResult } from './InteractionResult';
import { InteractionType } from './InteractionTypes';
import {
  buildHydrogenBondInspectorRows,
  getHydrogenBondInteractions,
  hydrogenBondEmptyMessage,
} from './inspectorInteractionDisplay';

function sampleHydrogenBond(): InteractionResult {
  return {
    type: InteractionType.HYDROGEN_BOND,
    sourceAtom: {
      name: 'OG',
      element: 'O',
      x: 0,
      y: 0,
      z: 0,
      recordGroup: 'ATOM',
      isPolymer: true,
    },
    targetAtom: {
      name: 'OD1',
      element: 'O',
      x: 2.5,
      y: 0,
      z: 0,
      recordGroup: 'ATOM',
      isPolymer: true,
    },
    sourceResidue: {
      name: 'SER',
      seqId: '12',
      seqNumber: 12,
      recordGroup: 'ATOM',
      isPolymer: true,
      atoms: [],
    },
    targetResidue: {
      name: 'ASP',
      seqId: '25',
      seqNumber: 25,
      recordGroup: 'ATOM',
      isPolymer: true,
      atoms: [],
    },
    sourceChainId: 'A',
    targetChainId: 'A',
    distanceAngstrom: 2.5,
    confidence: 0.8,
    reason: 'Donor–acceptor distance within hydrogen bond cutoff.',
  };
}

describe('inspectorInteractionDisplay', () => {
  it('renders hydrogen bond inspector rows', () => {
    const rows = buildHydrogenBondInspectorRows(sampleHydrogenBond());
    assert.equal(rows[0]?.value, 'Hydrogen Bond');
    assert.match(rows.find((row) => row.label === 'Source residue')?.value ?? '', /SER 12/);
    assert.match(rows.find((row) => row.label === 'Target residue')?.value ?? '', /ASP 25/);
    assert.equal(rows.find((row) => row.label === 'Donor atom')?.value, 'OG');
    assert.equal(rows.find((row) => row.label === 'Acceptor atom')?.value, 'OD1');
    assert.equal(rows.find((row) => row.label === 'Distance')?.value, '2.50 Å');
    assert.equal(rows.find((row) => row.label === 'Confidence')?.value, '0.8');
  });

  it('returns empty-state message when no hydrogen bonds are present', () => {
    assert.equal(hydrogenBondEmptyMessage([]), 'No hydrogen bonds detected.');
    assert.equal(
      hydrogenBondEmptyMessage([
        {
          ...sampleHydrogenBond(),
          type: InteractionType.SALT_BRIDGE,
        },
      ]),
      'No hydrogen bonds detected.',
    );
    assert.equal(hydrogenBondEmptyMessage([sampleHydrogenBond()]), '');
    assert.equal(getHydrogenBondInteractions([sampleHydrogenBond()]).length, 1);
  });
});
