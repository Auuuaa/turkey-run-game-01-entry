// Gobble Dash — the hand-in program for turkey-run-game-01 (Node 22,
// standard library only). It copies this repository's game/ and
// screenshots/ into the output directory and writes /output/dossier.json
// with the vendored make.fun library, exactly as the gate expects.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const gameOut = join(outputDir, 'game');
const shotsOut = join(outputDir, 'screenshots');

mkdirSync(outputDir, { recursive: true });
rmSync(gameOut, { recursive: true, force: true });
rmSync(shotsOut, { recursive: true, force: true });
cpSync(join(repoRoot, 'game'), gameOut, { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), shotsOut, { recursive: true });
} else {
  mkdirSync(shotsOut, { recursive: true });
}
if (!existsSync(join(gameOut, 'index.html'))) {
  throw new Error('game/index.html is missing from the repository');
}

// Caps from the gate (reference/gate.json): the dossier text cap shapes
// the bytes; the rest refuse an entry the scorer would refuse — more than
// 4 screenshots or one over 256 KiB, more than 993 files in game/ or
// 48 MiB of game files in all, or a path under game/ over 1000 bytes.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
