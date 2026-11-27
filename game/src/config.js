// Gobble Dash — tuning constants for the turkey escape.
// All speeds are pixels per second, all distances in metres of the run.

export const CANVAS_W = 1280;
export const CANVAS_H = 720;
export const GROUND_Y = 612;

export const TURKEY = {
  x: 300,
  runSpeed: 330,
  dashSpeed: 560,
  dashTime: 0.55,
  dashCooldown: 2.4,
  jumpVelocity: -880,
  gravity: 2350,
  width: 74,
  height: 62,
};

export const FARMER = {
  baseSpeed: 296,
  sprintSpeed: 372,
  catchGap: 26,
  maxGap: 560,
};

// One stage per stretch of the farm. The kitchen is the last stretch
// before the forest gate, where the turkey finally escapes.
export const STAGES = [
  { name: 'THE FARMYARD', from: 0, to: 600, sky: '#f7b267', ground: '#8a5a2b', accent: '#e07a3f' },
  { name: 'THE OLD BARN', from: 600, to: 1200, sky: '#e8965a', ground: '#6e4520', accent: '#c96f2e' },
  { name: 'THE FARMHOUSE KITCHEN', from: 1200, to: 1800, sky: '#d97b4f', ground: '#5d3a1e', accent: '#b4502a' },
];

export const ESCAPE_DISTANCE = 1800;
export const START_LIVES = 3;

export const SCORE = {
  corn: 50,
  goldenFeather: 150,
  perMetre: 5,
  stageBonus: 250,
  hideBonus: 100,
};

export const SPAWN = {
  // Seconds between obstacle spawns, shrinking as the run goes on.
  firstGap: 1.35,
  lastGap: 0.72,
  cornChance: 0.42,
  featherChance: 0.10,
  haystackChance: 0.16,
  knifeLeadIn: 950,
};

// How close the farmer must get before the "SPOTTED!" warning flashes.
export const SPOTTED_GAP = 150;
