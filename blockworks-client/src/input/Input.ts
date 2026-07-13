export class Input {
  readonly keys = new Set<string>();
  yaw = 0;
  pitch = 0;
  mine = false;
  private placeRequested = false;
  private jumpQueued = false;
  private wheel = 0;
  private enabled = false;

  constructor(private canvas: HTMLCanvasElement, private sensitivity: () => number) {
    addEventListener('keydown', event => {
      if (!this.enabled || event.repeat && event.code === 'Space') return;
      this.keys.add(event.code);
      if (event.code === 'Space') this.jumpQueued = true;
    });
    addEventListener('keyup', event => this.keys.delete(event.code));
    addEventListener('mousemove', event => {
      if (!this.enabled || document.pointerLockElement !== this.canvas) return;
      this.yaw = (this.yaw - event.movementX * this.sensitivity()) % (Math.PI * 2);
      this.pitch = Math.max(-1.54, Math.min(1.54, this.pitch - event.movementY * this.sensitivity()));
    });
    addEventListener('mousedown', event => {
      if (!this.enabled || document.pointerLockElement !== this.canvas) return;
      if (event.button === 0) this.mine = true;
      if (event.button === 2) this.placeRequested = true;
    });
    addEventListener('mouseup', event => { if (event.button === 0) this.mine = false; });
    addEventListener('wheel', event => {
      if (this.enabled && document.pointerLockElement === this.canvas) this.wheel += Math.sign(event.deltaY);
    }, { passive: true });
    addEventListener('blur', () => this.clear());
    addEventListener('visibilitychange', () => { if (document.hidden) this.clear(); });
    this.canvas.addEventListener('contextmenu', event => event.preventDefault());
  }

  setEnabled(enabled: boolean) { this.enabled = enabled; if (!enabled) this.clear(); }
  axis() { return { x: Number(this.keys.has('KeyD')) - Number(this.keys.has('KeyA')), z: Number(this.keys.has('KeyW')) - Number(this.keys.has('KeyS')) }; }
  sprinting() { return this.keys.has('ShiftLeft') || this.keys.has('ShiftRight'); }
  jumpHeld() { return this.keys.has('Space'); }
  consumeJump() { const value = this.jumpQueued; this.jumpQueued = false; return value; }
  consumePlace() { const value = this.placeRequested; this.placeRequested = false; return value; }
  consumeWheel() { const value = this.wheel; this.wheel = 0; return value; }
  clear() { this.keys.clear(); this.mine = false; this.placeRequested = false; this.jumpQueued = false; this.wheel = 0; }
}
