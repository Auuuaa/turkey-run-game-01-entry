// Gobble Dash — the game itself: states, the loop, collisions, scoring
// and the title / pause / end screens. Giblet the turkey must run 1,800 m
// from the farmyard, through the barn and the kitchen, to the forest gate.

import { CANVAS_W, CANVAS_H, GROUND_Y, START_LIVES, ESCAPE_DISTANCE, SCORE, SPOTTED_GAP } from './config.js';
import { Turkey } from './turkey.js';
import { Farmer } from './farmer.js';
import { World } from './world.js';
import { SoundBank } from './audio.js';
import { Input } from './input.js';
import {
  drawBackground, drawTurkey, drawFarmer, drawObstacle, drawPickup,
  drawHaystack, drawHud, drawSpotted, drawButton, roundRect,
} from './render.js';

function makeRandom(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export class GobbleDash {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.input = new Input(canvas);
    this.sounds = new SoundBank();
    this.state = 'title';
    this.score = 0;
    this.distance = 0;
    this.lives = START_LIVES;
    this.corn = 0;
    this.best = 0;
    this.seed = 7;
    this.time = 0;
    this.endReason = '';
    this.endStats = '';
    this.paused = false;
    this.stumbleFlash = 0;
    this.alarmPlayed = false;
    this.turkey = new Turkey();
    this.farmer = new Farmer();
    this.world = new World(makeRandom(this.seed));
    this.lastTick = 0;
    this.raf = 0;
    this.shotReady = false;

    this.input.onKey = (code) => this.handleKey(code);
  }

  get stage() {
    return this.world.stage;
  }

  startRun(seed) {
    this.seed = seed ?? Math.floor(Math.random() * 100000);
    this.world = new World(makeRandom(this.seed));
    this.turkey.reset();
    this.farmer.reset();
    this.score = 0;
    this.distance = 0;
    this.lives = START_LIVES;
    this.corn = 0;
    this.state = 'playing';
    this.paused = false;
    this.endReason = '';
    this.alarmPlayed = false;
    this.sounds.gobble();
  }

  handleKey(code) {
    if (code === 'KeyM') {
      this.sounds.toggleMute();
      return;
    }
    if (this.state === 'title') {
      if (code === 'Enter' || code === 'Space') this.startRun();
      return;
    }
    if (this.state === 'playing') {
      if (code === 'KeyP' || code === 'Escape') {
        this.paused = !this.paused;
        return;
      }
      if (this.paused) return;
      if (code === 'Space' || code === 'ArrowUp' || code === 'KeyW') this.turkey.jump(this.sounds);
      if (code === 'ShiftLeft' || code === 'ShiftRight' || code === 'KeyX') this.turkey.startDash(this.sounds);
      if (code === 'KeyH') this.tryHide();
      return;
    }
    if (this.state === 'over' || this.state === 'escaped') {
      if (code === 'KeyR' || code === 'Enter' || code === 'Space') this.startRun();
    }
  }

  tryHide() {
    const hay = this.world.haystackNear(this.turkey);
    if (!hay) return;
    if (this.turkey.hide(this.sounds)) {
      this.farmer.loseTrail();
      this.score += SCORE.hideBonus;
    }
  }

  loseLife(obstacle) {
    this.lives -= 1;
    this.turkey.hurt();
    this.sounds.thud();
    this.stumbleFlash = 0.5;
    if (this.lives <= 0) this.endRun(false, `caught by Farmer Bram after ${Math.floor(this.distance)} m`);
  }

  endRun(escaped, reason) {
    this.state = escaped ? 'escaped' : 'over';
    this.endReason = reason;
    if (escaped) this.score += SCORE.stageBonus * 3;
    this.score = Math.round(this.score);
    this.best = Math.max(this.best, this.score);
    this.endStats = `Score ${this.score}  ·  Distance ${Math.floor(this.distance)} m  ·  Corn ${this.corn}  ·  Best ${this.best}`;
    if (escaped) this.sounds.escaped();
    else this.sounds.caught();
  }

  update(dt) {
    this.time += dt;
    if (this.state !== 'playing' || this.paused) return;
    if (this.stumbleFlash > 0) this.stumbleFlash -= dt;

    const input = this.input;
    if (input.wasPressed('Space', 'ArrowUp', 'KeyW')) this.turkey.jump(this.sounds);
    if (input.wasPressed('ShiftLeft', 'ShiftRight', 'KeyX')) this.turkey.startDash(this.sounds);
    if (input.wasPressed('KeyH')) this.tryHide();
    const click = input.takeAnyClick();
    if (click && click.y > 130) this.turkey.jump(this.sounds);

    this.turkey.update(dt, input);
    const stumbled = this.turkey.hurtTimer > 0.4;
    this.farmer.update(dt, this.turkey, stumbled);
    this.world.update(dt, this.turkey.speed, this.turkey);

    this.distance = this.world.distance;
    this.score += SCORE.perMetre * dt;

    const gained = this.world.collect(this.turkey, this.sounds);
    if (gained > 0) {
      this.score += gained;
      if (gained === SCORE.corn) this.corn += 1;
    }

    const hit = this.world.hitObstacle(this.turkey);
    if (hit) this.loseLife(hit);

    if (this.farmer.caught) {
      this.endRun(false, 'Farmer Bram grabbed Giblet by the tail feathers!');
      return;
    }
    if (!this.alarmPlayed && this.farmer.gap < SPOTTED_GAP) {
      this.alarmPlayed = true;
      this.sounds.alarm();
    }
    if (this.alarmPlayed && this.farmer.gap > SPOTTED_GAP + 120) this.alarmPlayed = false;

    if (this.distance >= ESCAPE_DISTANCE) {
      this.endRun(true, 'Giblet slipped through the forest gate — Thanksgiving is cancelled!');
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    drawBackground(ctx, this.world.stage, this.world.decor, this.time);

    for (const hay of this.world.haystacks) drawHaystack(ctx, hay);
    for (const obstacle of this.world.obstacles) drawObstacle(ctx, obstacle, this.time);
    for (const pickup of this.world.pickups) drawPickup(ctx, pickup);

    if (this.state !== 'title') {
      drawFarmer(ctx, this.farmer, this.time);
      drawTurkey(ctx, this.turkey, this.time);
    }

    if (this.state === 'title') this.renderTitle(ctx);
    else if (this.state === 'playing') {
      drawHud(ctx, this);
      drawSpotted(ctx, this, this.time);
      if (this.paused) this.renderPaused(ctx);
      if (this.stumbleFlash > 0) {
        ctx.fillStyle = `rgba(230, 57, 70, ${this.stumbleFlash * 0.5})`;
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      }
    } else {
      drawHud(ctx, this);
      this.renderEnd(ctx);
    }
  }

  renderTitle(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(58, 36, 16, 0.32)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    ctx.fillStyle = '#ffd23c';
    ctx.font = 'bold 84px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('GOBBLE DASH', CANVAS_W / 2, 150);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 34px Georgia, serif';
    ctx.fillText('The Great Thanksgiving Escape', CANVAS_W / 2, 205);

    // Giblet on the left, Farmer Bram closing in on the right.
    const standIn = { x: 175, y: GROUND_Y - 40, runCycle: 0.8, onGround: true, ducking: false, hidden: false, invulnerable: false, hurtTimer: 0 };
    drawTurkey(ctx, standIn, this.time);
    drawFarmer(ctx, { x: 1115, runCycle: 0.8, searching: false }, this.time);

    ctx.fillStyle = '#fff';
    ctx.font = '26px Georgia, serif';
    ctx.fillText('Thanksgiving is coming. Farmer Bram has the oven hot and the', CANVAS_W / 2, 300);
    ctx.fillText('carving knife sharpened. Run 1,800 m to the forest gate!', CANVAS_W / 2, 336);

    ctx.font = 'bold 22px Georgia, serif';
    ctx.fillStyle = '#ffd23c';
    ctx.fillText('SPACE / CLICK — jump      DOWN — duck      SHIFT — dash      H — hide in hay', CANVAS_W / 2, 400);
    ctx.fillText('Dodge fences, pumpkins, the oven and thrown knives. Grab corn. Don\'t get caught!', CANVAS_W / 2, 432);

    const btn = { x: CANVAS_W / 2 - 150, y: 480, w: 300, h: 64 };
    drawButton(ctx, btn, 'START THE ESCAPE', this.input.hovering(btn));
    if (this.input.takeClickIn(btn)) this.startRun();
    ctx.fillStyle = '#fff';
    ctx.font = '20px Georgia, serif';
    ctx.fillText('or press ENTER', CANVAS_W / 2, 580);
    ctx.restore();
  }

  renderPaused(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(58, 36, 16, 0.6)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = '#ffd23c';
    ctx.font = 'bold 64px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', CANVAS_W / 2, 330);
    ctx.fillStyle = '#fff';
    ctx.font = '26px Georgia, serif';
    ctx.fillText('Press P to keep running — the farmer is catching his breath too.', CANVAS_W / 2, 380);
    ctx.restore();
  }

  renderEnd(ctx) {
    const escaped = this.state === 'escaped';
    ctx.save();
    ctx.fillStyle = escaped ? 'rgba(46, 90, 40, 0.55)' : 'rgba(90, 20, 16, 0.55)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    ctx.fillStyle = escaped ? '#7ee081' : '#ff8a7a';
    ctx.font = 'bold 72px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(escaped ? 'ESCAPED!' : 'CAUGHT!', CANVAS_W / 2, 210);
    ctx.fillStyle = '#fff';
    ctx.font = '28px Georgia, serif';
    ctx.fillText(this.endReason, CANVAS_W / 2, 268);
    ctx.font = 'bold 26px Georgia, serif';
    ctx.fillText(this.endStats, CANVAS_W / 2, 320);

    if (escaped) {
      ctx.font = '24px Georgia, serif';
      ctx.fillText('Giblet is free — and somewhere, a vegetarian Thanksgiving just got a lot easier.', CANVAS_W / 2, 368);
    } else {
      ctx.font = '24px Georgia, serif';
      ctx.fillText('The oven was already warm. Better luck next Thanksgiving…', CANVAS_W / 2, 368);
    }

    const btn = { x: CANVAS_W / 2 - 150, y: 420, w: 300, h: 64 };
    drawButton(ctx, btn, 'RUN AGAIN  (R)', this.input.hovering(btn));
    if (this.input.takeClickIn(btn)) this.startRun();
    ctx.fillStyle = '#fff';
    ctx.font = '20px Georgia, serif';
    ctx.fillText('or press R / ENTER', CANVAS_W / 2, 520);
    ctx.restore();
  }

  frame(now) {
    const dt = Math.min(0.05, (now - this.lastTick) / 1000 || 0.016);
    this.lastTick = now;
    this.update(dt);
    this.render();
    this.input.endFrame();
    this.raf = requestAnimationFrame((t) => this.frame(t));
  }

  start() {
    this.lastTick = performance.now();
    this.raf = requestAnimationFrame((t) => this.frame(t));
  }
}
