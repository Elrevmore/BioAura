/** Clamp a value between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Euclidean distance between two 3D points */
export function distance3D(
  a: { x: number; y: number; z: number },
  b: { x: number; y: number; z: number },
): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/** Linear interpolation */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Map a value from one range to another */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}

/** Rolling FPS calculator — O(1) amortized per tick */
export class FpsCounter {
  private timestamps: number[] = [];
  private head = 0;
  private readonly windowMs: number;
  private readonly capacity: number;

  constructor(windowMs = 1000) {
    this.windowMs = windowMs;
    this.capacity = Math.max(120, Math.ceil(windowMs / 8));
    this.timestamps = new Array(this.capacity).fill(0);
  }

  tick(now = performance.now()): number {
    this.timestamps[this.head] = now;
    this.head = (this.head + 1) % this.capacity;

    const cutoff = now - this.windowMs;
    let count = 0;

    for (let i = 0; i < this.capacity; i++) {
      const t = this.timestamps[i];
      if (t >= cutoff) count++;
    }

    return count;
  }

  reset(): void {
    this.timestamps.fill(0);
    this.head = 0;
  }
}
