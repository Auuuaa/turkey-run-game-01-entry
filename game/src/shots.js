// Gobble Dash — deterministic screenshot staging.
// A URL like ?shot=play&seed=7 freezes the game in a composed state so
// the screenshots are reproducible: the same seed always renders the same
// frame. The states mirror real play — the title screen, a mid-run chase
// through the farmyard, a knife dodge in the kitchen, and the escape —
// never a mockup: every pixel is drawn by the game's own render code.

import { GROUND_Y } from './config.js';

export function readShotParams(search) {
  const params = new URLSearchParams(search);
  return {
    shot: params.get('shot'),
    seed: Number(params.get('seed') || 7),
  };
}

// Stage the game for a screenshot. Returns true when a shot was staged.
export function stageShot(game, shot, seed) {
  if (!shot) return false;
  game.seed = seed;
  game.startRun(seed);
  const { turkey, farmer, world } = game;
  if (shot === 'title') {
    game.state = 'title';
    return true;
  }
  if (shot === 'play') {
    game.state = 'playing';
    game.score = 1240;
    game.corn = 7;
    world.distance = 342;
    game.distance = 342;
    world.stageIndex = 0;
    world.obstacles = [
      { kind: 'fence', x: 820, w: 58, h: 74, t: 0, roll: 0, flame: 0, hit: false },
      { kind: 'haybale', x: 1060, w: 84, h: 62, t: 0, roll: 0, flame: 0, hit: false },
      { kind: 'pumpkin', x: 640, w: 64, h: 58, t: 0, roll: 1.2, flame: 0, hit: false },
    ];
    world.pickups = [
      { kind: 'corn', x: 560, y: GROUND_Y - 78, bob: 0.4, taken: false },
      { kind: 'corn', x: 606, y: GROUND_Y - 78, bob: 1.1, taken: false },
      { kind: 'corn', x: 652, y: GROUND_Y - 78, bob: 2.0, taken: false },
      { kind: 'feather', x: 950, y: GROUND_Y - 190, bob: 0, taken: false },
    ];
    world.haystacks = [{ x: 1180, w: 110, h: 96 }];
    farmer.gap = 132;
    turkey.y = GROUND_Y - 120;
    turkey.vy = -220;
    turkey.onGround = false;
    turkey.runCycle = 2.4;
    return true;
  }
  if (shot === 'kitchen') {
    game.state = 'playing';
    game.score = 3890;
    game.corn = 18;
    world.distance = 1450;
    game.distance = 1450;
    world.stageIndex = 2;
    world.stageFlash = 'THE FARMHOUSE KITCHEN';
    world.stageFlashTimer = 2.0;
    world.obstacles = [
      { kind: 'oven', x: 900, w: 120, h: 150, t: 0.8, roll: 0, flame: 0.8, hit: false },
      { kind: 'knife', x: 700, w: 46, h: 46, t: 0.9, roll: 0, flame: 0, hit: false, y: GROUND_Y - 170 },
      { kind: 'fence', x: 1150, w: 58, h: 74, t: 0, roll: 0, flame: 0, hit: false },
    ];
    world.pickups = [
      { kind: 'corn', x: 560, y: GROUND_Y - 78, bob: 0.2, taken: false },
      { kind: 'corn', x: 606, y: GROUND_Y - 78, bob: 0.9, taken: false },
    ];
    world.haystacks = [];
    farmer.gap = 96;
    turkey.y = GROUND_Y;
    turkey.onGround = true;
    turkey.dashing = true;
    turkey.dashTime = 0.3;
    turkey.runCycle = 5.1;
    return true;
  }
  if (shot === 'escape') {
    game.state = 'escaped';
    game.score = 5240;
    game.corn = 24;
    game.distance = 1800;
    world.distance = 1800;
    world.stageIndex = 2;
    game.endReason = 'Giblet slipped through the forest gate — Thanksgiving is cancelled!';
    game.endStats = 'Score 5240  ·  Distance 1800 m  ·  Corn 24  ·  Best 5240';
    turkey.y = GROUND_Y;
    turkey.onGround = true;
    farmer.gap = 480;
    return true;
  }
  if (shot === 'caught') {
    game.state = 'over';
    game.score = 1870;
    game.corn = 9;
    game.distance = 512;
    world.distance = 512;
    world.stageIndex = 0;
    game.lives = 0;
    game.endReason = 'Farmer Bram grabbed Giblet by the tail feathers!';
    game.endStats = 'Score 1870  ·  Distance 512 m  ·  Corn 9  ·  Best 1870';
    turkey.y = GROUND_Y;
    turkey.onGround = true;
    farmer.gap = 26;
    farmer.caught = true;
    return true;
  }
  return false;
}
