import * as THREE from 'three';

/**
 * CPK element colors — aligned with three.js PDBLoader palette.
 * Values are 0–255 RGB tuples.
 */
const CPK_RGB: Record<string, [number, number, number]> = {
  h: [255, 255, 255],
  he: [217, 255, 255],
  li: [204, 128, 255],
  be: [194, 255, 0],
  b: [255, 181, 181],
  c: [144, 144, 144],
  n: [48, 80, 248],
  o: [255, 13, 13],
  f: [144, 224, 80],
  ne: [179, 227, 245],
  na: [171, 92, 242],
  mg: [138, 255, 0],
  al: [191, 166, 166],
  si: [240, 200, 160],
  p: [255, 128, 0],
  s: [255, 255, 48],
  cl: [31, 240, 31],
  ar: [128, 209, 227],
  k: [143, 64, 212],
  ca: [61, 255, 0],
  fe: [224, 102, 51],
  cu: [200, 128, 51],
  zn: [125, 128, 176],
  br: [166, 41, 41],
  i: [148, 0, 148],
  se: [255, 161, 0],
  mn: [156, 122, 199],
  co: [240, 144, 160],
  ni: [80, 208, 80],
  mo: [84, 181, 181],
  au: [255, 209, 35],
};

/** Neutral gray for unknown or missing elements (CPK carbon-like fallback). */
const FALLBACK_RGB: [number, number, number] = [144, 144, 144];

const _color = new THREE.Color();

export function cpkRgbForElement(symbol: string): [number, number, number] {
  const key = symbol.trim().toLowerCase();
  return CPK_RGB[key] ?? FALLBACK_RGB;
}

export function cpkColorForElement(symbol: string): THREE.Color {
  const [r, g, b] = cpkRgbForElement(symbol);
  return _color.setRGB(r / 255, g / 255, b / 255);
}

/** Derive an element symbol from a PDB/mmCIF atom name when type_symbol is absent. */
export function elementFromAtomName(atomName: string): string {
  const name = atomName.replace(/[0-9+\-*.]/g, '').trim().toLowerCase();
  if (!name) return '';

  if (name.length === 1) {
    return name;
  }

  const second = name[1];
  if (second >= 'a' && second <= 'z') {
    return name.slice(0, 2);
  }

  return name[0];
}

export function cpkLinearRgbTriplet(symbol: string): [number, number, number] {
  const [r, g, b] = cpkRgbForElement(symbol);
  return [r / 255, g / 255, b / 255];
}
