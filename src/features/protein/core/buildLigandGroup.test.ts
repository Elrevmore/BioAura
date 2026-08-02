import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import * as THREE from 'three';
import { buildLigandGroup } from './buildLigandGroup';
import { parseStructureModel } from '../parsers/parseStructureModel';
import { HEMOGLOBIN_PDB_SNIPPET } from '../parsers/parseStructureModel.fixtures';
import {
  getNonPolymerResidues,
  getRenderableLigandResidues,
} from './structureModelQueries';

const LIGAND_FILTER_SNIPPET = `ATOM      1  CA  VAL A   1       0.000   0.000   0.000  1.00  0.00           C
HETATM  101 FE   HEM A 142      12.991  15.580  19.131  1.00 14.80          FE
HETATM  102  C1A HEM A 142      11.780  16.770  18.921  1.00 16.21           C
HETATM  201  O   HOH A 151       1.000   2.000   3.000  1.00 20.00           O
HETATM  202  O   HOH A 152       2.000   3.000   4.000  1.00 20.00           O
HETATM  301  O   OXY A 150       5.000   6.000   7.000  1.00 30.00           O
HETATM  401  P   PO4 A 141       8.000   9.000  10.000  1.00 25.00           P
`;

describe('buildLigandGroup water filtering', () => {
  it('excludes HOH residues from renderable ligand selection', () => {
    const model = parseStructureModel(LIGAND_FILTER_SNIPPET, 'pdb');
    const nonPolymer = getNonPolymerResidues(model);
    const renderable = getRenderableLigandResidues(model);

    assert.ok(nonPolymer.some((residue) => residue.name === 'HOH'));
    assert.ok(!renderable.some((residue) => residue.name === 'HOH'));
    assert.equal(
      renderable.map((residue) => residue.name).sort().join(','),
      'HEM,OXY,PO4',
    );
  });

  it('renders HEM and other non-water non-polymer atoms in the ligand layer', () => {
    const model = parseStructureModel(LIGAND_FILTER_SNIPPET, 'pdb');
    const renderableAtoms = getRenderableLigandResidues(model).reduce(
      (count, residue) => count + residue.atoms.length,
      0,
    );

    const ligandGroup = buildLigandGroup(model);
    const atomMesh = ligandGroup.getObjectByName('atoms');
    assert.ok(atomMesh instanceof THREE.InstancedMesh);
    assert.equal(atomMesh.count, renderableAtoms);
    assert.ok(renderableAtoms >= 4);
  });

  it('still renders heme from the 1HHO-style fixture', () => {
    const model = parseStructureModel(HEMOGLOBIN_PDB_SNIPPET, 'pdb');
    const renderable = getRenderableLigandResidues(model);
    const ligandGroup = buildLigandGroup(model);
    const atomMesh = ligandGroup.getObjectByName('atoms');

    assert.equal(renderable.length, 1);
    assert.equal(renderable[0]?.name, 'HEM');
    assert.ok(atomMesh instanceof THREE.InstancedMesh);
    assert.equal(atomMesh.count, 2);
  });
});
