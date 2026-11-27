// Gobble Dash — Farmer Bram, the chaser.
// He runs behind the turkey, sprinting whenever the turkey stumbles and
// slowing to search whenever the turkey hides in a haystack. If his gap
// to the turkey closes to zero, dinner is served.

import { FARMER, GROUND_Y } from './config.js';

export class Farmer {
  constructor() {
    this.reset();
  }

  reset() {
    this.gap = 300;
    this.runCycle = 0;
    this.searching = false;
    this.searchTimer = 0;
    this.sprinting = false;
    this.caught = false;
  }

  get x() {
    return 300 - this.gap;
  }

  update(dt, turkey, turkeyStumbled) {
    if (this.caught) return;
    this.runCycle += dt * 13;

    if (this.searching) {
      this.searchTimer -= dt;
      if (this.searchTimer <= 0) {
        this.searching = false;
        this.gap = Math.min(this.gap, 240);
      }
      return;
    }

    let speed = FARMER.baseSpeed;
    this.sprinting = false;
    if (turkeyStumbled || turkey.hurtTimer > 0) {
      speed = FARMER.sprintSpeed;
      this.sprinting = true;
    }
    if (turkey.hidden) {
      speed = FARMER.baseSpeed + 60;
    }

    const turkeySpeed = turkey.hidden ? 0 : turkey.speed;
    this.gap += (turkeySpeed - speed) * dt;
    if (this.gap > FARMER.maxGap) this.gap = FARMER.maxGap;
    if (this.gap <= FARMER.catchGap) {
      this.gap = FARMER.catchGap;
      this.caught = true;
    }
  }

  // The turkey ducked into a haystack: the farmer runs past, puzzled,
  // and loses the trail for a while.
  loseTrail() {
    this.searching = true;
    this.searchTimer = 2.2;
    this.gap = 420;
  }

  // How close the farmer is, 0 = caught, 1 = far behind and harmless.
  get danger() {
    return 1 - this.gap / FARMER.maxGap;
  }

  box() {
    return { x: this.x - 34, y: GROUND_Y - 128, w: 68, h: 128 };
  }
}
