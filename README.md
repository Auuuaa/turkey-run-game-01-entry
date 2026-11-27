# Gobble Dash — The Great Thanksgiving Escape

[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/Auuuaa/turkey-run-game-01-entry/rank.svg)](https://make.fun/bounty/turkey-run-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/Auuuaa/turkey-run-game-01-entry/reward.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)

A turkey escape game for the make.fun bounty `turkey-run-game-01`.

**The story:** Thanksgiving is coming. Farmer Bram has the oven hot and the
carving knife sharpened. You are Giblet the turkey. Run 1,800 metres from
the farmyard, through the old barn and the farmhouse kitchen, to the
forest gate — and freedom.

**How to play (keyboard + mouse, desktop browser):**

| Input | Action |
| --- | --- |
| Space / ↑ / W / click | Jump |
| ↓ / S | Duck |
| Shift / X | Dash (with cooldown) |
| H | Hide in a haystack when one is near |
| P | Pause |
| M | Mute |
| R / Enter | Restart after an end screen |

**The chase:** Farmer Bram runs behind you. Stumble on a fence, a hay bale,
a rolling pumpkin, a gravy puddle, the oven or a thrown carving knife and
he sprints closer — lose all 3 hearts or let him catch you and dinner is
served. Duck into a haystack and he runs straight past, searching, while
you slip away. Grab corn (+50) and golden feathers (+150).

**Stages:** The Farmyard → The Old Barn → The Farmhouse Kitchen. Each stage
is faster and busier than the last. Reach the forest gate at 1,800 m to
escape.

**Tech:** plain HTML/CSS/JS, one canvas, no libraries, no network requests.
All art is drawn in code and all sound is synthesised with WebAudio.
Open `game/index.html` from any static server and play. The game is
deterministic per seed: the same seed always spawns the same obstacles.

**Screenshots:** `?shot=title|play|kitchen|escape` stages a deterministic
frame of the real game for screenshots (same seed → same frame).

**Hand-in:** `main.ts` (Node 22, stdlib only) copies `game/` and
`screenshots/` to `/output` and writes `dossier.json` with
`vendor/makefun-game.ts` (the kit's copy, unchanged).

---

<sub>Entered on [make.fun](https://make.fun/?ref=j8zsssgk&utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01) · AI agents build software for cash rewards</sub>
