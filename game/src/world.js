// Gobble Dash — the world the turkey runs through: fences, hay bales,
// rolling pumpkins, puddles, the oven's flame jets and thrown carving
// knives, plus corn and golden feathers to collect. Stages move from the
// farmyard, through the barn, into the kitchen, and out to the forest gate.

import { CANVAS_W, GROUND_Y, STAGES, ESCAPE_DISTANCE, SPAWN, SCORE } from './config.js';

export const OBSTACLE_KINDS = {
  fence: { w: 58, h: 74, jump: true, label: 'Fence' },
  haybale: { w: 84, h: 62, jump: true, label: 'Hay bale' },
  pumpkin: { w: 64, h: 58, jump: true, roll: true, label: 'Rolling pumpkin' },
  puddle: { w: 110, h: 18, jump: true, slip: true, label: 'Gravy puddle' },
  oven: { w: 120, h: 150, jump: false, flame: true, label: 'Hot oven' },
  knife: { w: 46, h: 46, jump: true, thrown: true, label: 'Carving knife' },
};

function pickKind(distance, rand) {
  const inKitchen = distance >= STAGES[2].from;
  const table = ['fence', 'fence', 'haybale', 'pumpkin', 'puddle'];
  if (distance > 250) table.push('haybale', 'pumpkin');
  if (inKitchen) table.push('oven', 'knife', 'knife');
  if (distance > SPAWN.knifeLeadIn) table.push('knife');
  return table[Math.floor(rand() * table.length)];
}

export class World {
  constructor(rand) {
    this.rand = rand;
    this.reset();
  }

  reset() {
    this.distance = 0;
    this.obstacles = [];
    this.pickups = [];
    this.haystacks = [];
    this.spawnTimer = 1.1;
    this.stageIndex = 0;
    this.stageFlash = '';
    this.stageFlashTimer = 0;
    this.decor = [];
    for (let i = 0; i < 26; i += 1) {
      this.decor.push({
        x: this.rand() * 2600,
        kind: Math.floor(this.rand() * 4),
        scale: 0.7 + this.rand() * 0.7,
      });
    }
  }

  get stage() {
    return STAGES[this.stageIndex];
  }

  get progress() {
    return Math.min(1, this.distance / ESCAPE_DISTANCE);
  }

  update(dt, speed, turkey) {
    this.distance += (speed * dt) / 15;
    const nextStage = STAGES.findIndex((s) => this.distance < s.to);
    const idx = nextStage === -1 ? STAGES.length - 1 : nextStage;
    if (idx !== this.stageIndex) {
      this.stageIndex = idx;
      this.stageFlash = STAGES[idx].name;
      this.stageFlashTimer = 2.4;
    }
    if (this.stageFlashTimer > 0) this.stageFlashTimer -= dt;

    const gap = SPAWN.firstGap + (SPAWN.lastGap - SPAWN.firstGap) * this.progress;
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = gap * (0.85 + this.rand() * 0.35);
      this.spawnOne();
    }

    const move = speed * dt;
    for (const obstacle of this.obstacles) {
      obstacle.x -= move;
      if (obstacle.kind === 'pumpkin') obstacle.roll += dt * 9;
      if (obstacle.kind === 'knife') {
        obstacle.t += dt;
        obstacle.y = GROUND_Y - 60 - Math.sin(Math.min(1, obstacle.t * 1.6)) * 150;
      }
      if (obstacle.kind === 'oven') obstacle.flame = 0.5 + 0.5 * Math.sin(obstacle.t * 6);
    }
    for (const pickup of this.pickups) {
      pickup.x -= move;
      pickup.bob += dt * 4;
    }
    for (const hay of this.haystacks) hay.x -= move;
    for (const d of this.decor) {
      d.x -= move * 0.35;
      if (d.x < -120) d.x = CANVAS_W + 60 + this.rand() * 300;
    }

    this.obstacles = this.obstacles.filter((o) => o.x > -220);
    this.pickups = this.pickups.filter((p) => p.x > -80 && !p.taken);
    this.haystacks = this.haystacks.filter((h) => h.x > -220);
  }

  spawnOne() {
    const kind = pickKind(this.distance, this.rand);
    const def = OBSTACLE_KINDS[kind];
    const x = CANVAS_W + 80 + this.rand() * 120;
    const obstacle = { kind, x, w: def.w, h: def.h, t: 0, roll: 0, flame: 0, hit: false };
    if (kind === 'knife') obstacle.y = GROUND_Y - 60;
    this.obstacles.push(obstacle);

    const roll = this.rand();
    if (roll < SPAWN.cornChance) {
      const n = 3 + Math.floor(this.rand() * 3);
      for (let i = 0; i < n; i += 1) {
        this.pickups.push({
          kind: 'corn', x: x + 130 + i * 46, y: GROUND_Y - 78, bob: this.rand() * 6, taken: false,
        });
      }
    } else if (roll < SPAWN.cornChance + SPAWN.featherChance) {
      this.pickups.push({
        kind: 'feather', x: x + 150, y: GROUND_Y - 190, bob: 0, taken: false,
      });
    }
    if (this.rand() < SPAWN.haystackChance) {
      this.haystacks.push({ x: x + 320 + this.rand() * 160, w: 110, h: 96 });
    }
  }

  // The nearest haystack the turkey can dive into, if any.
  haystackNear(turkey) {
    return this.haystacks.find((h) => Math.abs(h.x - turkey.x) < 95);
  }

  collect(turkey, sounds) {
    let gained = 0;
    const box = turkey.box();
    for (const pickup of this.pickups) {
      if (pickup.taken) continue;
      const px = pickup.x;
      const py = pickup.y + Math.sin(pickup.bob) * 6;
      if (px > box.x - 24 && px < box.x + box.w + 24 && py > box.y - 24 && py < box.y + box.h + 24) {
        pickup.taken = true;
        if (pickup.kind === 'corn') {
          gained += SCORE.corn;
          if (sounds) sounds.corn();
        } else {
          gained += SCORE.goldenFeather;
          if (sounds) sounds.feather();
        }
      }
    }
    return gained;
  }

  // Returns the obstacle the turkey just hit, or null.
  hitObstacle(turkey) {
    if (turkey.invulnerable || turkey.hidden) return null;
    const box = turkey.box();
    for (const obstacle of this.obstacles) {
      if (obstacle.hit) continue;
      const top = obstacle.kind === 'knife' ? obstacle.y - 23 : GROUND_Y - obstacle.h;
      const ox = obstacle.x - obstacle.w / 2;
      const ow = obstacle.w;
      const oh = obstacle.kind === 'knife' ? 46 : obstacle.h;
      const overlap = box.x < ox + ow - 8 && box.x + box.w > ox + 8
        && box.y < top + oh - 6 && box.y + box.h > top + 8;
      if (overlap) {
        obstacle.hit = true;
        return obstacle;
      }
    }
    return null;
  }

  // Remaining metres to the forest gate.
  get distanceLeft() {
    return Math.max(0, Math.ceil(ESCAPE_DISTANCE - this.distance));
  }
}
