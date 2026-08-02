import type { LoopPriority } from '@shared/config';

export type FrameCallback = (timestamp: number, deltaMs: number) => void;

interface Subscription {
  callback: FrameCallback;
  priority: LoopPriority;
}

/**
 * Single requestAnimationFrame coordinator for the vision pipeline.
 * Replaces multiple independent RAF loops with one ordered tick.
 */
class AnimationLoop {
  private subscriptions = new Map<number, Subscription>();
  private ordered: Subscription[] = [];
  private orderDirty = true;
  private nextId = 0;
  private handle = 0;
  private previousTimestamp = 0;
  private running = false;

  subscribe(callback: FrameCallback, priority: LoopPriority): () => void {
    const id = this.nextId++;
    this.subscriptions.set(id, { callback, priority });
    this.orderDirty = true;

    if (!this.running) {
      this.start();
    }

    return () => {
      this.subscriptions.delete(id);
      this.orderDirty = true;
      if (this.subscriptions.size === 0) {
        this.stop();
      }
    };
  }

  getSubscriberCount(): number {
    return this.subscriptions.size;
  }

  private start(): void {
    this.running = true;
    this.previousTimestamp = 0;
    this.handle = requestAnimationFrame(this.tick);
  }

  private stop(): void {
    this.running = false;
    cancelAnimationFrame(this.handle);
    this.previousTimestamp = 0;
  }

  private tick = (timestamp: number): void => {
    const deltaMs = this.previousTimestamp ? timestamp - this.previousTimestamp : 0;
    this.previousTimestamp = timestamp;

    if (this.orderDirty) {
      this.ordered = [...this.subscriptions.values()].sort(
        (a, b) => a.priority - b.priority,
      );
      this.orderDirty = false;
    }

    for (const { callback } of this.ordered) {
      callback(timestamp, deltaMs);
    }

    if (this.running) {
      this.handle = requestAnimationFrame(this.tick);
    }
  };
}

export const animationLoop = new AnimationLoop();
