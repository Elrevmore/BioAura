import * as THREE from 'three';

/** Distinct chain colors aligned with the BioAura holographic palette. */
const CHAIN_COLOR_HEX = [
  0x22d3ee,
  0x8b5cf6,
  0x34d399,
  0xfbbf24,
  0xf472b6,
  0x60a5fa,
  0xa78bfa,
  0x2dd4bf,
] as const;

const _color = new THREE.Color();

export function chainColorForIndex(index: number): THREE.Color {
  const hex = CHAIN_COLOR_HEX[index % CHAIN_COLOR_HEX.length];
  return _color.setHex(hex);
}

export function chainColorHexForIndex(index: number): number {
  return CHAIN_COLOR_HEX[index % CHAIN_COLOR_HEX.length];
}
