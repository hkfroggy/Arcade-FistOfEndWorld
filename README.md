# Fist of the North Star: Wasteland Brawler

A browser-based, side-scrolling beat ’em up inspired by classic arcade brawlers. Built with HTML5 Canvas and JavaScript, with AI-assisted artwork and locally generated action audio.

**[Play the live demo](https://fist-wasteland-brawler.richard-wong-1903.chatgpt.site/)**

## Run locally

Requires Python 3 and a modern browser. No npm install or build step is needed.

```bash
git clone git@github.com:hkfroggy/Arcade-FistOfEndWorld.git
cd Arcade-FistOfEndWorld
python3 -m http.server 8000
```

Open [localhost:8000](http://localhost:8000/index.html). Serve over HTTP rather than opening the HTML file directly. Click or press a key to enable browser audio. All game assets are included; ComfyUI is not required to play.

## Controls

Press punch or kick to join. Devices are assigned to player slots in join order. A second player can join during gameplay and select an available fighter through the HUD.

| Action | Keyboard 1 | Keyboard 2 | Standard gamepad |
| --- | --- | --- | --- |
| Move | W / A / S / D | Arrow keys | D-pad / left stick |
| Punch | H | Numpad 1 | Bottom face button (A / Cross) |
| Kick | K | Numpad 2 | Right face button (B / Circle) |
| Jump | U | Numpad 3 | Left face button (X / Square) |
| Special 1 | H + K | Numpad 1 + 2 | Punch + kick |
| Special 2 | H + K + U | Numpad 1 + 2 + 3 | Punch + kick + jump |

- **Double-tap forward:** Ken’s invincible dash or Rei’s vacuum-wave attack.
- **Jump + kick together:** Ken’s spinning attack or Rei’s aerial dive.
- **Punch while airborne:** jump punch.
- **Q:** skip the story opening.
- **T on the title screen:** settings.

Character techniques consume special energy where applicable. Mobile devices have on-screen controls in landscape and portrait orientations.

## Features

- Nine-stage campaign with encounters, rescues, checkpoints, and boss fights.
- Ken and Rei are selectable; Toki’s implementation is retained but selection is currently disabled.
- Local two-player play with keyboard and gamepad support.
- Enemies enter from outside the camera view and can flank players.
- Shotguns, thrown knives, shield guards, breakable scenery, and supply drops.
- Head, upper-body, and lower-body damage multipliers.
- Knockdown and recovery animations, in-place respawning, arcade continues, and a local top-20 score table.
- English, Japanese, and Traditional Chinese presentation.
- 30 FPS rendering with a 60 Hz combat simulation.
- Generated combat and environmental SFX; footsteps are intentionally silent.

## Development

Edit source files and reload the browser. No development bundler is required.

| File or directory | Purpose |
| --- | --- |
| `index.html` | Engine, input, combat, camera, and rendering |
| `campaign.js` | Campaign route, encounters, checkpoints, and boss behaviors |
| `opening.js` | Story introduction |
| `fighter-select.js` | Character selection |
| `mobile-controls.js` | Touch controls and mobile layout |
| `i18n.js`, `i18n-story.js` | Interface and story translations |
| `ken-audio.js` | Shared generated SFX playback for all fighters and actions |
| `music.js` | Background music |
| `assets/` | Artwork, sprite manifests, music, and SFX |
| `scripts/` | Offline audio preparation tools |
| `tests/` | Regression checks |

Local previews:

- [Animation gallery](http://localhost:8000/animations.html)
- [Enemy roster](http://localhost:8000/enemy-roster.html)
- [Character art](http://localhost:8000/characters.html)

### Checks

Install Node.js for JavaScript checks. Python artwork checks require Pillow and NumPy.

```bash
for test in tests/*.cjs; do node "$test" || exit 1; done

python3 -m venv /tmp/arcade-art-venv
source /tmp/arcade-art-venv/bin/activate
pip install pillow numpy
python tests/art.py
```

### Artwork and audio

Procedural renderers provide a fallback when sprite images are unavailable. When changing sprites, keep the inline manifest in `index.html` and manifests under `assets/sprites/` synchronized. Character art also uses `assets/characters/manifest.js`.

Generated audio uses the local ComfyUI `audio_stable_audio` workflow. The game plays included WAV files; source recordings, workflow graphs, and processing reports are preserved under `assets/audio/`. Audio preparation scripts require FFmpeg and NumPy. See [SFX-PLAN.md](SFX-PLAN.md) for coverage.

### Static release

With Pillow installed:

```bash
python3 build_site.py
python3 -m http.server 8001 --directory dist
```

The build recreates `dist/`, excludes offline artwork inputs, and converts PNG artwork to WebP. Preview at [localhost:8001](http://localhost:8001), then upload the contents of `dist/` to a static host. A GitHub push alone does not deploy the game website.

## Project documentation

- [Game design and AI production](DESIGN-AND-AI-PRODUCTION.md) — detailed design, AI coding workflow, artwork and animation pipeline, local sound generation, and Suno music credits.

- [Level design](LEVEL-DESIGN.md)
- [Repository guidance](AGENTS.md)
- [Sound-effect coverage](SFX-PLAN.md)
- [License](LICENSE)
