// Gobble Dash — Giblet the turkey: run, jump, duck, dash and hide.
// Physics live here; the drawing lives in render.js. The turkey is a
// plump brown bird with a red wattle, a fan tail and very worried eyes.

import { TURKEY, GROUND_Y } from './config.js';

export class Turkey {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = TURKEY.x;
    this.y = GROUND_Y;
    this.vy = 0;
    this.onGround = true;
    this.ducking = false;
    this.dashing = false;
    this.dashTime = 0;
    this.dashCooldown = 0;
    this.hidden = false;
    this.hideTimer = 0;
    this.runCycle = 0;
    this.hurtTimer = 0;
    this.dead = false;
  }

  get width() {
    return this.ducking ? TURKEY.width + 14 : TURKEY.width;
  }

  get height() {
    return this.ducking ? TURKEY.height - 22 : TURKEY.height;
  }

  get speed() {
    return this.dashing ? TURKEY.dashSpeed : TURKEY.runSpeed;
  }

  get feetY() {
    return this.y;
  }

  get topY() {
    return this.y - this.height;
  }

  jump(sounds) {
    if (this.dead || this.hidden) return false;
    if (this.onGround) {
      this.vy = TURKEY.jumpVelocity;
      this.onGround = false;
      this.ducking = false;
      if (sounds) sounds.jump();
      return true;
    }
    return false;
  }

  startDash(sounds) {
    if (this.dead || this.hidden || this.dashCooldown > 0) return false;
    this.dashing = true;
    this.dashTime = TURKEY.dashTime;
    this.dashCooldown = TURKEY.dashCooldown;
    if (sounds) sounds.dash();
    return true;
  }

  hide(sounds) {
    if (this.dead || !this.onGround || this.hidden) return false;
    this.hidden = true;
    this.hideTimer = 1.6;
    if (sounds) sounds.gobble();
    return true;
  }

  hurt() {
    this.hurtTimer = 0.9;
    this.vy = -420;
    this.onGround = false;
  }

  update(dt, input) {
    if (this.dead) return;
    this.runCycle += dt * (this.dashing ? 26 : 15);
    if (this.dashCooldown > 0) this.dashCooldown -= dt;
    if (this.hurtTimer > 0) this.hurtTimer -= dt;

    if (this.hidden) {
      this.hideTimer -= dt;
      if (this.hideTimer <= 0) this.hidden = false;
      return;
    }

    if (this.dashing) {
      this.dashTime -= dt;
      if (this.dashTime <= 0) this.dashing = false;
    }

    this.ducking = this.onGround && input.down('ArrowDown', 'KeyS');

    if (!this.onGround) {
      this.vy += TURKEY.gravity * dt;
      this.y += this.vy * dt;
      if (this.y >= GROUND_Y) {
        this.y = GROUND_Y;
        this.vy = 0;
        this.onGround = true;
      }
    }
  }

  // Axis-aligned box used for collisions with obstacles and pickups.
  box() {
    return {
      x: this.x - this.width / 2 + 6,
      y: this.topY + 4,
      w: this.width - 12,
      h: this.height - 6,
    };
  }

  // True while the turkey is briefly invulnerable after being hurt.
  get invulnerable() {
    return this.hurtTimer > 0;
  }
}
