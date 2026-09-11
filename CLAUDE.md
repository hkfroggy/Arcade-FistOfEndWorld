# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A self-contained HTML5 canvas beat-'em-up (*Fist of the North Star: Wasteland Brawler*) — a 2-player side-scrolling brawler with gamepad support. There is **no build system, no package manager, no test suite, and no framework**. The entire game is one file: `index.html` (~3,350 lines, all game logic in an inline `<script>`). `generate_sprites.py` is a separate offline tool that produces the PNG art via a local Stable Diffusion backend.

## Running the game

It's a static page, but it loads PNG sprites via `Image.src`, so `file://` can cause canvas-tainting/CORS issues. Serve over HTTP:

```bash
python3 -m http.server 8000   # then open http://localhost:8000/index.html
```

The game **runs immediately in canvas-only mode** even with zero sprites present — every character has a procedural canvas-drawn fallback (see Rendering below). Missing PNGs degrade gracefully, they do not break the game.

Controls: P1 = WASD/arrows + Z/X/C, P2 = IJKL + U/O/P, plus gamepads. Specials are button **combinations** (e.g. Kick+Punch = Special 1). Full mapping is in the `#hint` div and the input section.

## Regenerating sprites

`generate_sprites.py` talks to a **local** image-generation backend (auto-detected), not a cloud API:
- ComfyUI on `http://127.0.0.1:8188`
- Automatic1111 on `http://127.0.0.1:7860`

```bash
python3 generate_sprites.py                 # generate only missing sprites
python3 generate_sprites.py --regen         # redo ALL sprites
python3 generate_sprites.py --only ken      # name filter
python3 generate_sprites.py --backend a1111 # force a backend
python3 generate_sprites.py --lora none     # skip LoRA
pip install pillow                          # optional: needed for black-bg removal
```

Output goes to `assets/sprites/`. The script writes **two** manifest files: `manifest.json` and `sprites.js` (`window.SPRITE_MANIFEST`).

### Critical gotcha: the manifest is inlined three times

`index.html` does **not** load `sprites.js` or `manifest.json` at runtime. It has its **own hand-pasted copy** of `window.SPRITE_MANIFEST` inlined near the top (around line 30). So there are three copies that can drift:
1. `assets/sprites/manifest.json` — written by the generator (single-frame `path` entries).
2. `assets/sprites/sprites.js` — written by the generator.
3. The inline `SPRITE_MANIFEST` in `index.html` — **the only one the game actually reads.**

After regenerating sprites, you must manually update the inline block in `index.html` to match. Note the two manifest entry shapes the loader understands:
- Single image: `{ "path": "...png", "dw":W, "dh":H }`
- Spritesheet row: `{ "sheet": "...png", "frameW":F, "sy":Y, "frameH":H, "cols":N, "dw":W, "dh":H }` (used for the `ken_*` sheets `ken_S1.png`/`ken_S2.png`).

`CANVAS_W`/`CANVAS_H` in `generate_sprites.py` (1280×720) must stay in sync with `W`/`H` in `index.html`.

## Architecture of `index.html`

The script is one flat IIFE-free top-level scope, organized by banner-comment sections. Key landmarks:

- **Global frame of reference** (top): `W=1280, H=720`, `GROUND_Y=544`, `LEVEL_W=5120`. Everything is in world coordinates; the camera (`cam`) scrolls horizontally.
- **Sprite system** (`loadSprites`, `drawSpr`, `stateKey`): `drawSpr(key, ...)` looks up a loaded image in `SPR{}`; if it isn't ready it calls a **procedural canvas fallback function** instead. This dual path is why the game works with no art. `ANIM_STEPS` maps each action state (`idle/walk/punch/kick/special/jump/...`) to how many game frames each animation frame is held.
- **Input** (`KEYBOARD` / `GAMEPAD` / `ABSTRACT INPUT PER PLAYER`): raw keys/gamepad are normalized into per-player `punchP/kickP/jumpP` (just-pressed) and `...H` (held) booleans. Special moves are detected as **simultaneous held combinations** of these, not separate keys.
- **Character drawing** (`drawKen`, `drawRei`, `drawToki`, ~lines 445–1395): large procedural canvas renderers — the fallbacks for each playable character. This is the bulk of the file.
- **Data tables** — edit these to tune/extend content:
  - `CHAR_DEFS` (~1057): the 3 playable characters (Kenshiro/Rei/Toki) — names, special-move names/cost/damage/range/duration, colors, particle fn, and `drawFn`.
  - `EDEFS` (~1552): enemy type definitions (`thug`, `scavenger`, `heavy`, `gang`).
  - `LEVELS` (~1905): two stages, each with timed enemy `waves` (triggered by camera `trigX`), a boss, and mid-level story messages.
- **State machine**: `GS.state` is the single top-level game state, dispatched in `render()`/`update()`. Flow: `title → modeselect → charselect → intro → playing → boss → levelclear → (next level | victory) `, plus `gameover`. `GS.mode` is `'1p'`/`'2p'`.
- **Entities**: `PLAYERS` (`P1`,`P2`) built by the player factory (~1566); enemies/boss live in `GS.enemies`/`GS.boss`. Each entity has a `state` string (`idle/walk/punch/kick/special/jump/stunned/dying/approach/attack/intro`) driving both logic and which sprite/animation plays.
- **AI**: enemy AI (~1803) and boss AI (~1852) both target the nearest active player.
- **Game loop** (bottom): `loop()` = `update(); render(); clearKeys(); requestAnimationFrame`. `loadSprites()` is kicked off async at startup; the loop starts immediately regardless.

### Where to make common changes

- New attack/balance tuning → `CHAR_DEFS` / `EDEFS`.
- New enemy wave or level → `LEVELS` (and `EDEFS` if a new enemy type).
- New animation timing → `ANIM_STEPS`.
- New character art → add PNGs, update the inline `SPRITE_MANIFEST` in `index.html`, and provide a `drawFn` fallback in `CHAR_DEFS`.
