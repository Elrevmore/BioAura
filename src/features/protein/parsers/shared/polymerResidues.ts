/** Standard amino acid residue names recognized as protein polymer components. */
export const STANDARD_AMINO_ACID_RESIDUES = new Set([
  'ALA', 'ARG', 'ASN', 'ASP', 'CYS', 'GLN', 'GLU', 'GLY', 'HIS', 'ILE',
  'LEU', 'LYS', 'MET', 'PHE', 'PRO', 'SER', 'THR', 'TRP', 'TYR', 'VAL',
]);

export function isStandardAminoAcidResidue(residueName: string): boolean {
  return STANDARD_AMINO_ACID_RESIDUES.has(residueName.trim().toUpperCase());
}
