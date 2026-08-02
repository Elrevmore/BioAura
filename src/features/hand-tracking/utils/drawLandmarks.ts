import type { HandLandmarks, HandTrackingResult, Landmark } from '@shared/types';
import { HAND_COLORS, HAND_CONNECTIONS } from './handConnections';

interface DrawLandmarksOptions {
  mirrored?: boolean;
}

function toPixel(
  landmark: Landmark,
  width: number,
  height: number,
  mirrored: boolean,
): { x: number; y: number } {
  const x = mirrored ? (1 - landmark.x) * width : landmark.x * width;
  const y = landmark.y * height;
  return { x, y };
}

function getHandColors(handedness: HandLandmarks['handedness']) {
  return handedness === 'Left' ? HAND_COLORS.left : HAND_COLORS.right;
}

/**
 * Renders hand landmarks and skeleton onto a 2D canvas overlay.
 * Called every animation frame — no React re-renders involved.
 */
export function drawHandLandmarks(
  ctx: CanvasRenderingContext2D,
  result: HandTrackingResult | null,
  width: number,
  height: number,
  options: DrawLandmarksOptions = {},
): void {
  const { mirrored = true } = options;

  ctx.clearRect(0, 0, width, height);

  if (!result || result.hands.length === 0) {
    return;
  }

  for (const hand of result.hands) {
    const colors = getHandColors(hand.handedness);
    const points = hand.landmarks.map((lm) =>
      toPixel(lm, width, height, mirrored),
    );

    ctx.lineCap = 'round';
    for (const [from, to] of HAND_CONNECTIONS) {
      const start = points[from];
      const end = points[to];
      if (!start || !end) continue;

      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.strokeStyle = colors.bone;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    for (const point of points) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = colors.glow;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(point.x, point.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = colors.joint;
      ctx.fill();
    }
  }
}
