// Gobble Dash — bootstrap: find the canvas, build the game, stage a
// screenshot when the URL asks for one, and start the frame loop.

import { CANVAS_W, CANVAS_H } from './config.js';
import { GobbleDash } from './game.js';
import { readShotParams, stageShot } from './shots.js';

const canvas = document.getElementById('game');
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;

const game = new GobbleDash(canvas);
window.__gobbleDash = game;

const { shot, seed } = readShotParams(window.location.search);
if (stageShot(game, shot, seed)) {
  // Let one frame render, then tell the screenshot harness we are ready.
  game.render();
  window.__shotReady = true;
} else {
  game.start();
  window.__shotReady = true;
}

// Mute toggle is also handy from the console while testing.
window.__toggleMute = () => game.sounds.toggleMute();
