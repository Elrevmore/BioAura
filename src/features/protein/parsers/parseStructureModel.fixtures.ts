/** Representative 1HHO-style PDB snippet (polymer + heme HETATM). */
export const HEMOGLOBIN_PDB_SNIPPET = `ATOM      1  N   VAL A   1       6.204  16.869  18.532  1.00 49.05           N
ATOM      2  CA  VAL A   1       6.070  15.424  18.522  1.00 43.14           C
ATOM      3  C   VAL A   1       7.342  14.740  18.037  1.00 34.58           C
ATOM      4  O   VAL A   1       8.420  15.331  17.870  1.00 30.32           O
ATOM      5  N   LEU A   2       7.203  13.505  17.738  1.00 26.35           N
ATOM      6  CA  LEU A   2       8.327  12.673  17.203  1.00 20.49           C
HETATM 3011 FE   HEM A 142      12.991  15.580  19.131  1.00 14.80          FE
HETATM 3012  C1A HEM A 142      11.780  16.770  18.921  1.00 16.21           C
`;

/** Minimal mmCIF atom_site loop (polymer + ligand-style HETATM). */
export const MMCIF_FALLBACK_SNIPPET = `data_1HHO
loop_
_atom_site.group_PDB
_atom_site.label_asym_id
_atom_site.label_seq_id
_atom_site.auth_seq_id
_atom_site.label_comp_id
_atom_site.label_atom_id
_atom_site.type_symbol
_atom_site.Cartn_x
_atom_site.Cartn_y
_atom_site.Cartn_z
ATOM A 1 1 VAL N N 6.204 16.869 18.532
ATOM A 1 1 VAL CA C 6.070 15.424 18.522
ATOM A 1 1 VAL C C 7.342 14.740 18.037
ATOM A 1 1 VAL O O 8.420 15.331 17.870
ATOM A 2 2 LEU N N 7.203 13.505 17.738
ATOM A 2 2 LEU CA C 8.327 12.673 17.203
HETATM A 142 142 HEM FE FE 12.991 15.580 19.131
HETATM A 142 142 HEM C1A C 11.780 16.770 18.921
`;

/** Multi-chain polymer snippet (two chains with CA traces). */
export const MULTI_CHAIN_PDB_SNIPPET = `ATOM      1  N   ALA A   1       0.000   0.000   0.000  1.00  0.00           N
ATOM      2  CA  ALA A   1       1.500   0.000   0.000  1.00  0.00           C
ATOM      3  C   ALA A   1       3.000   0.000   0.000  1.00  0.00           C
ATOM      4  N   GLY A   2       4.500   0.000   0.000  1.00  0.00           N
ATOM      5  CA  GLY A   2       6.000   0.000   0.000  1.00  0.00           C
ATOM      6  N   ALA B   1      10.000   5.000   0.000  1.00  0.00           N
ATOM      7  CA  ALA B   1      11.500   5.000   0.000  1.00  0.00           C
ATOM      8  C   ALA B   1      13.000   5.000   0.000  1.00  0.00           C
ATOM      9  N   GLY B   2      14.500   5.000   0.000  1.00  0.00           N
ATOM     10  CA  GLY B   2      16.000   5.000   0.000  1.00  0.00           C
`;

/** PDB snippet with HELIX and SHEET annotations for secondary-structure tests. */
export const SSE_PDB_SNIPPET = `HELIX 11  ALAA   3 GLYA   4
SHEET 1A1  1ALA B   1 GLYB   2
ATOM      1  N   ALA A   1       0.000   0.000   0.000  1.00  0.00           N
ATOM      2  CA  ALA A   1       1.500   0.000   0.000  1.00  0.00           C
ATOM      3  N   GLY A   2       3.000   0.000   0.000  1.00  0.00           N
ATOM      4  CA  GLY A   2       4.500   0.000   0.000  1.00  0.00           C
ATOM      5  N   ALA A   3       6.000   0.000   0.000  1.00  0.00           N
ATOM      6  CA  ALA A   3       7.500   0.000   0.000  1.00  0.00           C
ATOM      7  N   GLY A   4       9.000   0.000   0.000  1.00  0.00           N
ATOM      8  CA  GLY A   4      10.500   0.000   0.000  1.00  0.00           C
ATOM      9  N   ALA A   5      12.000   0.000   0.000  1.00  0.00           N
ATOM     10  CA  ALA A   5      13.500   0.000   0.000  1.00  0.00           C
ATOM     11  N   GLY A   6      15.000   0.000   0.000  1.00  0.00           N
ATOM     12  CA  GLY A   6      16.500   0.000   0.000  1.00  0.00           C
ATOM     13  N   ALA B   1      20.000   5.000   0.000  1.00  0.00           N
ATOM     14  CA  ALA B   1      21.500   5.000   0.000  1.00  0.00           C
ATOM     15  N   GLY B   2      23.000   5.000   0.000  1.00  0.00           N
ATOM     16  CA  GLY B   2      24.500   5.000   0.000  1.00  0.00           C
`;

function pdbCaAtom(serial: number, chainId: string, seqId: number, x: number): string {
  const serialStr = String(serial).padStart(5);
  const seqStr = String(seqId).padStart(4);
  const xStr = x.toFixed(3).padStart(8);
  return `ATOM  ${serialStr}  CA  ALA ${chainId}${seqStr}      ${xStr}   0.000   0.000  1.00  0.00           C`;
}

function pdbCaTrace(chainId: string, residueCount: number, startSeq = 1, startSerial = 1): string {
  return Array.from({ length: residueCount }, (_, index) =>
    pdbCaAtom(startSerial + index, chainId, startSeq + index, index * 3.8),
  ).join('\n');
}

/** RCSB-style 1UBQ HELIX/SHEET records with a minimal chain-A CA trace. */
export const UBIQUITIN_RCSB_SSE_SNIPPET = `HELIX    1  H1 ILE A   23  GLU A   34  1
HELIX    2  H2 LEU A   56  TYR A   59  5
SHEET    1 BET 5 GLY A  10  VAL A  17  0
${pdbCaTrace('A', 60)}
`;

/** RCSB-style 1CRN HELIX/SHEET records with a minimal chain-A CA trace. */
export const CRAMBIN_RCSB_SSE_SNIPPET = `HELIX    1  H1 ILE A    7  PRO A   19  13
SHEET    1 BET 2 TYR A   2  ASN A   4  0
SHEET    2 BET 2 ASN A  29  SER A  32  0
${pdbCaTrace('A', 46)}
`;

/** RCSB-style 1TPC HELIX records with numeric chain ID and a minimal CA trace. */
export const TPC_RCSB_SSE_SNIPPET = `HELIX    1  A1 LYS 1   18  GLY 1   30  1
HELIX    2  A2 GLU 1   40  LEU 1   52  1
${pdbCaTrace('1', 55)}
`;

/** RCSB-style 1HHO HELIX records with a minimal chain-A CA trace. */
export const HEMOGLOBIN_RCSB_SSE_SNIPPET = `HELIX    1  AA SER A    3  GLY A   18  1
HELIX    2  AB ASN A   20  LYS A   35  1
${pdbCaTrace('A', 40)}
`;

/** mmCIF snippet with helix and sheet secondary-structure loops. */
export const SSE_MMCIF_SNIPPET = `data_SSE
loop_
_struct_conf.conf_type_id
_struct_conf.beg_label_asym_id
_struct_conf.beg_label_seq_id
_struct_conf.end_label_asym_id
_struct_conf.end_label_seq_id
HELX_P A 2 A 3
loop_
_struct_sheet_range.beg_label_asym_id
_struct_sheet_range.beg_label_seq_id
_struct_sheet_range.end_label_asym_id
_struct_sheet_range.end_label_seq_id
B 1 B 2
loop_
_atom_site.group_PDB
_atom_site.label_asym_id
_atom_site.label_seq_id
_atom_site.auth_seq_id
_atom_site.label_comp_id
_atom_site.label_atom_id
_atom_site.type_symbol
_atom_site.Cartn_x
_atom_site.Cartn_y
_atom_site.Cartn_z
ATOM A 1 1 ALA N N 0.000 0.000 0.000
ATOM A 1 1 ALA CA C 1.500 0.000 0.000
ATOM A 2 2 GLY N N 3.000 0.000 0.000
ATOM A 2 2 GLY CA C 4.500 0.000 0.000
ATOM A 3 3 ALA N N 6.000 0.000 0.000
ATOM A 3 3 ALA CA C 7.500 0.000 0.000
ATOM A 4 4 GLY N N 9.000 0.000 0.000
ATOM A 4 4 GLY CA C 10.500 0.000 0.000
ATOM B 1 1 ALA N N 20.000 5.000 0.000
ATOM B 1 1 ALA CA C 21.500 5.000 0.000
ATOM B 2 2 GLY N N 23.000 5.000 0.000
ATOM B 2 2 GLY CA C 24.500 5.000 0.000
`;
