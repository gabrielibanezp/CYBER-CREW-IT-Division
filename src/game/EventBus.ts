/**
 * Bridge between Phaser scene and React UI.
 */
type Handler = (...args: any[]) => void;

class Bus {
  private map = new Map<string, Set<Handler>>();
  on(evt: string, h: Handler) {
    if (!this.map.has(evt)) this.map.set(evt, new Set());
    this.map.get(evt)!.add(h);
    return () => this.off(evt, h);
  }
  off(evt: string, h: Handler) {
    this.map.get(evt)?.delete(h);
  }
  emit(evt: string, ...args: any[]) {
    this.map.get(evt)?.forEach((h) => h(...args));
  }
}

export const EventBus = new Bus();

/** Virtual joystick input shared with the Phaser scene (values -1..1). */
export const virtualInput = { x: 0, y: 0 };

/** Live player position for the minimap (updated every frame, no re-render). */
export const playerLive = { x: 0, y: 0, room: '' };

/** Whether the world should ignore movement input (modal open etc.). */
export const worldLock = { locked: false };

