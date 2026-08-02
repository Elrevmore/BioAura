/** MediaPipe hand skeleton connections for landmark visualization */
export const HAND_CONNECTIONS: ReadonlyArray<readonly [number, number]> = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [0, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [0, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [0, 17],
  [17, 18],
  [18, 19],
  [19, 20],
  [5, 9],
  [9, 13],
  [13, 17],
] as const;

/** Distinct colors per hand for overlay rendering */
export const HAND_COLORS = {
  left: {
    joint: '#22d3ee',
    bone: 'rgba(34, 211, 238, 0.65)',
    glow: 'rgba(34, 211, 238, 0.35)',
  },
  right: {
    joint: '#a78bfa',
    bone: 'rgba(167, 139, 250, 0.65)',
    glow: 'rgba(167, 139, 250, 0.35)',
  },
} as const;
