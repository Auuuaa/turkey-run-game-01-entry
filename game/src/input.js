// Gobble Dash — keyboard and mouse input, shared by the game and the menus.
// Keys: Space / ArrowUp / W jump, ArrowDown / S duck, Shift / X dash,
// H hide in a haystack, P pause, M mute, R restart, Enter start.
// Mouse: click the canvas to jump, click the on-screen buttons to act.

export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.pressed = new Set();
    this.clicks = [];
    this.mouse = { x: 0, y: 0, down: false };
    this.onKey = null;

    window.addEventListener('keydown', (event) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) {
        event.preventDefault();
      }
      if (!event.repeat) {
        this.keys.add(event.code);
        this.pressed.add(event.code);
        if (this.onKey) this.onKey(event.code);
      }
    });
    window.addEventListener('keyup', (event) => {
      this.keys.delete(event.code);
    });
    window.addEventListener('blur', () => {
      this.keys.clear();
    });

    canvas.addEventListener('pointerdown', (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) * (canvas.width / rect.width);
      const y = (event.clientY - rect.top) * (canvas.height / rect.height);
      this.mouse.x = x;
      this.mouse.y = y;
      this.mouse.down = true;
      this.clicks.push({ x, y });
    });
    window.addEventListener('pointerup', () => {
      this.mouse.down = false;
    });
    canvas.addEventListener('pointermove', (event) => {
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = (event.clientX - rect.left) * (canvas.width / rect.width);
      this.mouse.y = (event.clientY - rect.top) * (canvas.height / rect.height);
    });
  }

  down(...codes) {
    return codes.some((c) => this.keys.has(c));
  }

  wasPressed(...codes) {
    return codes.some((c) => this.pressed.has(c));
  }

  // Buttons the game draws on the canvas: returns the clicked one, if any.
  takeClickIn(rect) {
    for (let i = 0; i < this.clicks.length; i += 1) {
      const click = this.clicks[i];
      if (click.x >= rect.x && click.x <= rect.x + rect.w && click.y >= rect.y && click.y <= rect.y + rect.h) {
        this.clicks.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  // True while the pointer is hovering a drawn button (for hover styling).
  hovering(rect) {
    return this.mouse.x >= rect.x && this.mouse.x <= rect.x + rect.w
      && this.mouse.y >= rect.y && this.mouse.y <= rect.y + rect.h;
  }

  // A click anywhere on the canvas (used to jump while running).
  takeAnyClick() {
    if (this.clicks.length === 0) return null;
    return this.clicks.shift();
  }

  endFrame() {
    this.pressed.clear();
    this.clicks.length = 0;
  }
}
