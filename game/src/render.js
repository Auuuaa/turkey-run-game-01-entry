// Gobble Dash — everything the player sees, drawn on one canvas:
// the autumn farm, Giblet the turkey, Farmer Bram, the oven and knives,
// the HUD, and the title / pause / end screens. All art is original and
// drawn in code; no images are loaded.

import { CANVAS_W, CANVAS_H, GROUND_Y, START_LIVES } from './config.js';

const AUTUMN = {
  skyTop: '#f9c784',
  skyBottom: '#f7b267',
  hillFar: '#c98a4b',
  hillNear: '#a86a32',
  ground: '#8a5a2b',
  dirt: '#6e4520',
};

export function drawBackground(ctx, stage, decor, time) {
  const grad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  grad.addColorStop(0, stage.sky);
  grad.addColorStop(1, AUTUMN.skyBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, GROUND_Y);

  // Low autumn sun with a soft halo.
  const sunX = 1080;
  const sunY = 110;
  const halo = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 130);
  halo.addColorStop(0, 'rgba(255, 236, 170, 0.9)');
  halo.addColorStop(1, 'rgba(255, 236, 170, 0)');
  ctx.fillStyle = halo;
  ctx.fillRect(sunX - 130, sunY - 130, 260, 260);
  ctx.fillStyle = '#ffe9a8';
  ctx.beginPath();
  ctx.arc(sunX, sunY, 46, 0, Math.PI * 2);
  ctx.fill();

  // Drifting clouds.
  ctx.fillStyle = 'rgba(255, 244, 214, 0.85)';
  for (let i = 0; i < 3; i += 1) {
    const cx = ((time * 12 + i * 520) % (CANVAS_W + 320)) - 160;
    const cy = 70 + i * 46;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 74, 20, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 52, cy + 6, 52, 16, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Rolling hills and the farm fence line.
  ctx.fillStyle = AUTUMN.hillFar;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  for (let x = 0; x <= CANVAS_W; x += 40) {
    ctx.lineTo(x, GROUND_Y - 70 - Math.sin(x * 0.004 + 1.2) * 34);
  }
  ctx.lineTo(CANVAS_W, GROUND_Y);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = AUTUMN.hillNear;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  for (let x = 0; x <= CANVAS_W; x += 40) {
    ctx.lineTo(x, GROUND_Y - 26 - Math.sin(x * 0.006) * 18);
  }
  ctx.lineTo(CANVAS_W, GROUND_Y);
  ctx.closePath();
  ctx.fill();

  // Distant trees, barns and haystacks scrolling slowly past.
  for (const d of decor) {
    drawDistantProp(ctx, d, GROUND_Y - 30);
  }

  // The ground itself.
  ctx.fillStyle = stage.ground;
  ctx.fillRect(0, GROUND_Y, CANVAS_W, CANVAS_H - GROUND_Y);
  ctx.fillStyle = stage.accent;
  ctx.fillRect(0, GROUND_Y, CANVAS_W, 8);
  ctx.fillStyle = AUTUMN.dirt;
  for (let x = 0; x < CANVAS_W; x += 90) {
    const wobble = ((x * 7) % 23) - 11;
    ctx.fillRect(x + wobble, GROUND_Y + 34 + ((x * 13) % 50), 26, 5);
  }
}

function drawDistantProp(ctx, d, baseY) {
  const x = d.x;
  const s = d.scale;
  ctx.save();
  ctx.translate(x, baseY);
  ctx.scale(s, s);
  if (d.kind === 0) {
    // Oak tree.
    ctx.fillStyle = '#7a4a21';
    ctx.fillRect(-7, -64, 14, 64);
    ctx.fillStyle = '#c96f2e';
    ctx.beginPath();
    ctx.arc(0, -78, 34, 0, Math.PI * 2);
    ctx.arc(-26, -58, 22, 0, Math.PI * 2);
    ctx.arc(26, -58, 22, 0, Math.PI * 2);
    ctx.fill();
  } else if (d.kind === 1) {
    // Red barn.
    ctx.fillStyle = '#a63d2f';
    ctx.fillRect(-52, -66, 104, 66);
    ctx.fillStyle = '#7c2c21';
    ctx.beginPath();
    ctx.moveTo(-58, -66);
    ctx.lineTo(0, -104);
    ctx.lineTo(58, -66);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f4e3c2';
    ctx.fillRect(-14, -40, 28, 40);
  } else if (d.kind === 2) {
    // Haystack.
    ctx.fillStyle = '#e0a83c';
    ctx.beginPath();
    ctx.moveTo(-40, 0);
    ctx.quadraticCurveTo(0, -72, 40, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#b57f22';
    ctx.lineWidth = 2;
    for (let i = -24; i <= 24; i += 12) {
      ctx.beginPath();
      ctx.moveTo(i, -8);
      ctx.lineTo(i * 0.7, -52);
      ctx.stroke();
    }
  } else {
    // Windmill.
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(-10, -90, 20, 90);
    ctx.strokeStyle = '#f4e3c2';
    ctx.lineWidth = 5;
    for (let i = 0; i < 4; i += 1) {
      const a = i * Math.PI / 2 + 0.6;
      ctx.beginPath();
      ctx.moveTo(0, -96);
      ctx.lineTo(Math.cos(a) * 34, -96 + Math.sin(a) * 34);
      ctx.stroke();
    }
  }
  ctx.restore();
}

export function drawTurkey(ctx, turkey, time) {
  const x = turkey.x;
  const y = turkey.y;
  const duck = turkey.ducking;
  const hidden = turkey.hidden;
  const flicker = turkey.invulnerable && Math.floor(time * 14) % 2 === 0;
  ctx.save();
  ctx.translate(x, y);
  if (flicker) ctx.globalAlpha = 0.45;
  if (hidden) ctx.globalAlpha = 0.0;

  const legSwing = Math.sin(turkey.runCycle) * (turkey.onGround ? 10 : 2);
  const bodyY = duck ? -26 : -34;

  // Legs.
  ctx.strokeStyle = '#e07a3f';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-8, bodyY + 22);
  ctx.lineTo(-8 + legSwing, -2);
  ctx.moveTo(8, bodyY + 22);
  ctx.lineTo(8 - legSwing, -2);
  ctx.stroke();

  // Fan tail.
  ctx.fillStyle = '#7a4a21';
  for (let i = -2; i <= 2; i += 1) {
    ctx.save();
    ctx.translate(-26, bodyY + 6);
    ctx.rotate(i * 0.34 - 0.15);
    ctx.beginPath();
    ctx.ellipse(-16, 0, 22, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = '#a86a32';
  for (let i = -2; i <= 2; i += 1) {
    ctx.save();
    ctx.translate(-26, bodyY + 6);
    ctx.rotate(i * 0.34 - 0.15);
    ctx.beginPath();
    ctx.ellipse(-13, 0, 15, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Plump body.
  ctx.fillStyle = '#8a5a2b';
  ctx.beginPath();
  ctx.ellipse(0, bodyY, 34, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#a9713d';
  ctx.beginPath();
  ctx.ellipse(4, bodyY + 4, 26, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wing, flapping while running.
  const flap = turkey.onGround ? Math.sin(turkey.runCycle * 1.4) * 6 : -14;
  ctx.fillStyle = '#6e4520';
  ctx.beginPath();
  ctx.ellipse(-4, bodyY - 2 + flap * 0.4, 22, 12, -0.5 + flap * 0.02, 0, Math.PI * 2);
  ctx.fill();

  // Head, beak and wattle.
  const headX = 30;
  const headY = bodyY - 26;
  ctx.fillStyle = '#8a5a2b';
  ctx.beginPath();
  ctx.arc(headX, headY, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e8963c';
  ctx.beginPath();
  ctx.moveTo(headX + 10, headY - 2);
  ctx.lineTo(headX + 26, headY + 3);
  ctx.lineTo(headX + 10, headY + 7);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#d23b2e';
  ctx.beginPath();
  ctx.ellipse(headX + 12, headY + 12, 5, 8, 0.3, 0, Math.PI * 2);
  ctx.fill();
  // Worried eye.
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(headX + 4, headY - 4, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1d1d1d';
  ctx.beginPath();
  ctx.arc(headX + 6, headY - 4, 2.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function drawFarmer(ctx, farmer, time) {
  const x = farmer.x;
  const y = GROUND_Y;
  const searching = farmer.searching;
  ctx.save();
  ctx.translate(x, y);

  const swing = searching ? 2 : Math.sin(farmer.runCycle) * 12;
  // Legs and boots.
  ctx.strokeStyle = '#3a2a1a';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-8, -58);
  ctx.lineTo(-8 + swing, -2);
  ctx.moveTo(8, -58);
  ctx.lineTo(8 - swing, -2);
  ctx.stroke();

  // Overalls and shirt.
  ctx.fillStyle = '#33507a';
  ctx.fillRect(-16, -92, 32, 40);
  ctx.fillStyle = '#c94f3d';
  ctx.fillRect(-18, -112, 36, 24);
  ctx.fillStyle = '#33507a';
  ctx.fillRect(-14, -92, 6, 18);
  ctx.fillRect(8, -92, 6, 18);

  // Arms reaching forward, grabbing for the turkey.
  ctx.strokeStyle = '#c94f3d';
  ctx.lineWidth = 8;
  const reach = searching ? 4 : Math.sin(farmer.runCycle) * 6;
  ctx.beginPath();
  ctx.moveTo(12, -104);
  ctx.lineTo(34 + reach, -88);
  ctx.moveTo(12, -100);
  ctx.lineTo(32 - reach, -76);
  ctx.stroke();

  // Head with straw hat.
  ctx.fillStyle = '#e8b98a';
  ctx.beginPath();
  ctx.arc(4, -124, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e0a83c';
  ctx.beginPath();
  ctx.ellipse(4, -134, 30, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#c98f2e';
  ctx.beginPath();
  ctx.arc(4, -136, 13, Math.PI, 0);
  ctx.fill();
  // Angry eyes and moustache.
  ctx.fillStyle = '#1d1d1d';
  ctx.fillRect(10, -128, 4, 4);
  ctx.fillStyle = '#7a4a21';
  ctx.fillRect(8, -116, 14, 4);

  if (searching) {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 26px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('?', 8, -168);
  }
  ctx.restore();
}

export function drawObstacle(ctx, obstacle, time) {
  const x = obstacle.x;
  const top = obstacle.kind === 'knife' ? obstacle.y - 23 : GROUND_Y - obstacle.h;
  ctx.save();
  if (obstacle.kind === 'fence') {
    ctx.fillStyle = '#7a4a21';
    ctx.fillRect(x - 29, top, 8, 74);
    ctx.fillRect(x + 21, top, 8, 74);
    ctx.fillRect(x - 32, top + 12, 64, 9);
    ctx.fillRect(x - 32, top + 40, 64, 9);
    ctx.fillStyle = '#a86a32';
    ctx.beginPath();
    ctx.moveTo(x - 29, top);
    ctx.lineTo(x - 25, top - 10);
    ctx.lineTo(x - 21, top);
    ctx.moveTo(x + 21, top);
    ctx.lineTo(x + 25, top - 10);
    ctx.lineTo(x + 29, top);
    ctx.fill();
  } else if (obstacle.kind === 'haybale') {
    ctx.fillStyle = '#d9a441';
    ctx.beginPath();
    ctx.ellipse(x, GROUND_Y - 30, 44, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#a87c22';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(x, GROUND_Y - 30, 30, 20, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else if (obstacle.kind === 'pumpkin') {
    ctx.save();
    ctx.translate(x, GROUND_Y - 28);
    ctx.rotate(obstacle.roll);
    ctx.fillStyle = '#e07a1f';
    ctx.beginPath();
    ctx.ellipse(0, 0, 32, 28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b85c10';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, 20, 28, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#5d8a2a';
    ctx.fillRect(-3, -34, 6, 10);
    ctx.restore();
  } else if (obstacle.kind === 'puddle') {
    ctx.fillStyle = '#8a5a2b';
    ctx.beginPath();
    ctx.ellipse(x, GROUND_Y - 6, 56, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 220, 150, 0.5)';
    ctx.beginPath();
    ctx.ellipse(x - 12, GROUND_Y - 8, 26, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 15px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('GRAVY!', x, GROUND_Y - 26);
  } else if (obstacle.kind === 'oven') {
    // A farmhouse oven, door glowing, flames licking out.
    ctx.fillStyle = '#4a4a52';
    ctx.fillRect(x - 60, top, 120, 150);
    ctx.fillStyle = '#2e2e34';
    ctx.fillRect(x - 60, top, 120, 18);
    ctx.fillStyle = '#ff7a1f';
    const flame = obstacle.flame || 0;
    ctx.beginPath();
    ctx.ellipse(x, top + 78, 34, 44 + flame * 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd23c';
    ctx.beginPath();
    ctx.ellipse(x, top + 86, 20, 28 + flame * 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1d1d1d';
    ctx.lineWidth = 4;
    ctx.strokeRect(x - 48, top + 34, 96, 84);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 17px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('HOT!', x, top + 148);
  } else if (obstacle.kind === 'knife') {
    ctx.save();
    ctx.translate(x, obstacle.y);
    ctx.rotate(Math.sin(time * 5 + obstacle.t) * 0.5 + 0.6);
    ctx.fillStyle = '#c8ccd4';
    ctx.beginPath();
    ctx.moveTo(-6, -22);
    ctx.lineTo(6, -22);
    ctx.lineTo(0, 14);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#4a2c14';
    ctx.fillRect(-7, -30, 14, 10);
    ctx.restore();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('!', x, obstacle.y - 44);
  }
  ctx.restore();
}

export function drawPickup(ctx, pickup) {
  const y = pickup.y + Math.sin(pickup.bob) * 6;
  ctx.save();
  ctx.translate(pickup.x, y);
  if (pickup.kind === 'corn') {
    ctx.fillStyle = '#ffd23c';
    ctx.beginPath();
    ctx.ellipse(0, 0, 13, 19, 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e8a812';
    for (let r = -1; r <= 1; r += 1) {
      ctx.beginPath();
      ctx.ellipse(r * 6, 0, 3, 16, 0.25, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#5d8a2a';
    ctx.beginPath();
    ctx.moveTo(-6, 16);
    ctx.lineTo(0, 28);
    ctx.lineTo(6, 16);
    ctx.closePath();
    ctx.fill();
  } else {
    // Golden feather, worth more and floating high.
    ctx.fillStyle = '#ffd23c';
    ctx.beginPath();
    ctx.ellipse(0, 0, 9, 22, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff3b0';
    ctx.beginPath();
    ctx.ellipse(-2, -4, 4, 14, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b8860b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.lineTo(8, 20);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawHaystack(ctx, hay) {
  ctx.save();
  ctx.translate(hay.x, GROUND_Y);
  ctx.fillStyle = '#e0a83c';
  ctx.beginPath();
  ctx.moveTo(-55, 0);
  ctx.quadraticCurveTo(0, -96, 55, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#b57f22';
  ctx.lineWidth = 3;
  for (let i = -36; i <= 36; i += 18) {
    ctx.beginPath();
    ctx.moveTo(i, -6);
    ctx.lineTo(i * 0.7, -72);
    ctx.stroke();
  }
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 15px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('HIDE!  (H)', 0, -106);
  ctx.restore();
}

export function drawButton(ctx, rect, label, hovered) {
  ctx.save();
  ctx.fillStyle = hovered ? '#ffd23c' : '#e8963c';
  ctx.strokeStyle = '#7a4a21';
  ctx.lineWidth = 3;
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 12);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#3a2410';
  ctx.font = 'bold 24px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2 + 1);
  ctx.restore();
}

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawHud(ctx, game) {
  const { score, distance, lives, corn, stage, farmer, world } = game;
  ctx.save();
  // Top bar.
  ctx.fillStyle = 'rgba(58, 36, 16, 0.82)';
  roundRect(ctx, 16, 12, CANVAS_W - 32, 64, 14);
  ctx.fill();

  ctx.fillStyle = '#ffd23c';
  ctx.font = 'bold 26px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`SCORE ${Math.floor(score)}`, 36, 44);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 22px Georgia, serif';
  ctx.fillText(`${Math.floor(distance)} m  ·  ${world.distanceLeft} m to the forest`, 300, 44);

  // Hearts for lives.
  for (let i = 0; i < START_LIVES; i += 1) {
    const hx = 760 + i * 40;
    const hy = 44;
    ctx.fillStyle = i < lives ? '#e63946' : 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.moveTo(hx, hy + 8);
    ctx.bezierCurveTo(hx - 14, hy - 6, hx - 4, hy - 16, hx, hy - 8);
    ctx.bezierCurveTo(hx + 4, hy - 16, hx + 14, hy - 6, hx, hy + 8);
    ctx.fill();
  }

  ctx.fillStyle = '#ffd23c';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.fillText(`CORN ${corn}`, 900, 44);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 18px Georgia, serif';
  ctx.textAlign = 'right';
  ctx.fillText(stage.name, CANVAS_W - 36, 44);
  ctx.textAlign = 'left';

  // Farmer proximity meter.
  const barX = 16;
  const barY = 88;
  const barW = 300;
  ctx.fillStyle = 'rgba(58, 36, 16, 0.82)';
  roundRect(ctx, barX, barY, barW, 26, 8);
  ctx.fill();
  const danger = farmer.danger;
  ctx.fillStyle = danger > 0.66 ? '#e63946' : danger > 0.4 ? '#e8963c' : '#5d8a2a';
  roundRect(ctx, barX + 4, barY + 4, Math.max(8, (barW - 8) * danger), 18, 6);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 15px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText(farmer.searching ? 'FARMER IS SEARCHING…' : 'FARMER', barX + 8, barY + 13);

  // Stage flash banner.
  if (world.stageFlashTimer > 0) {
    ctx.globalAlpha = Math.min(1, world.stageFlashTimer);
    ctx.fillStyle = 'rgba(58, 36, 16, 0.8)';
    roundRect(ctx, CANVAS_W / 2 - 260, 150, 520, 56, 14);
    ctx.fill();
    ctx.fillStyle = '#ffd23c';
    ctx.font = 'bold 30px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(world.stageFlash, CANVAS_W / 2, 180);
    ctx.globalAlpha = 1;
  }

  // Dash cooldown pip.
  ctx.fillStyle = 'rgba(58, 36, 16, 0.82)';
  roundRect(ctx, CANVAS_W - 190, 88, 174, 26, 8);
  ctx.fill();
  ctx.fillStyle = game.turkey.dashCooldown > 0 ? 'rgba(255,255,255,0.4)' : '#7ee081';
  ctx.font = 'bold 15px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(game.turkey.dashCooldown > 0 ? 'DASH…' : 'DASH READY (Shift)', CANVAS_W - 103, 101);
  ctx.restore();
}

export function drawSpotted(ctx, game, time) {
  if (game.farmer.gap > 150 || game.farmer.searching) return;
  const pulse = 0.6 + 0.4 * Math.sin(time * 10);
  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.fillStyle = '#e63946';
  ctx.font = 'bold 44px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('SPOTTED! RUN!', CANVAS_W / 2, 150);
  ctx.restore();
}
