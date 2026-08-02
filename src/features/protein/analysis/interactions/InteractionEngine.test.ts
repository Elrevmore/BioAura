import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { GeometryAnalysisEngine } from '../GeometryAnalysisEngine';
import { parseStructureModel } from '../../parsers/parseStructureModel';
import { InteractionEngine } from './InteractionEngine';
import { InteractionRegistry } from './InteractionRegistry';
import type { InteractionAnalyzer } from './InteractionAnalyzer';
import { InteractionType } from './InteractionTypes';
import { differentResidue } from './GeometryFilters';

const SNIPPET = `ATOM      1  CA  ALA A   1       0.000   0.000   0.000  1.00  0.00           C
ATOM      2  CA  GLY A   2       3.000   0.000   0.000  1.00  0.00           C
ATOM      3  CA  VAL A   3       4.000   0.000   0.000  1.00  0.00           C
`;

describe('InteractionEngine', () => {
  it('runs neighbor search once and returns candidates without interactions', () => {
    const model = parseStructureModel(SNIPPET, 'pdb');
    const geometry = new GeometryAnalysisEngine();
    let neighborCalls = 0;
    const proxied = new Proxy(geometry, {
      get(target, prop, receiver) {
        if (prop === 'findNeighborAtoms') {
          return (...args: unknown[]) => {
            neighborCalls += 1;
            return Reflect.apply(target.findNeighborAtoms, target, args);
          };
        }
        return Reflect.get(target, prop, receiver);
      },
    });

    const engine = new InteractionEngine(proxied, new InteractionRegistry());
    const atom = model.chains[0].residues[0].atoms[0];
    const output = engine.analyze({
      model,
      selection: {
        kind: 'atom',
        atom,
        residue: model.chains[0].residues[0],
        chainId: 'A',
      },
      radiusAngstrom: 5,
    });

    assert.equal(neighborCalls, 1);
    assert.ok(output.candidates.length > 0);
    assert.equal(output.interactions.length, 0);
  });

  it('runs registered analyzer plugins on filtered candidates', () => {
    const model = parseStructureModel(SNIPPET, 'pdb');
    const registry = new InteractionRegistry();
    const analyzer: InteractionAnalyzer = {
      type: InteractionType.HYDROGEN_BOND,
      candidateFilters: [differentResidue()],
      analyze: (context) =>
        context.candidates.map((candidate) => ({
          type: InteractionType.HYDROGEN_BOND,
          sourceAtom: candidate.sourceAtom,
          targetAtom: candidate.targetAtom,
          sourceResidue: candidate.sourceResidue,
          targetResidue: candidate.targetResidue,
          sourceChainId: candidate.sourceChainId,
          targetChainId: candidate.targetChainId,
          distanceAngstrom: candidate.distanceAngstrom,
          confidence: 0.5,
          reason: 'test',
        })),
    };
    registry.register(analyzer);

    const engine = new InteractionEngine(new GeometryAnalysisEngine(), registry);
    const atom = model.chains[0].residues[0].atoms[0];
    const output = engine.analyze({
      model,
      selection: {
        kind: 'atom',
        atom,
        residue: model.chains[0].residues[0],
        chainId: 'A',
      },
      radiusAngstrom: 5,
    });

    assert.equal(output.interactions.length, output.candidates.length);
    assert.equal(output.interactions[0]?.type, InteractionType.HYDROGEN_BOND);
  });
});
