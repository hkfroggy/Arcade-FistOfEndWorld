# Game Design and AI Production

**Fist of the North Star: Wasteland Brawler**  
Design, implementation, assets, and production notes — October 2026

[Back to README](README.md) · [Play the demo](https://fist-wasteland-brawler.richard-wong-1903.chatgpt.site/)

## 1. A game made with AI

This project is an AI-made browser game, developed through an ongoing conversation between its creator and an AI coding assistant. AI was used to implement game systems, create and revise visual assets, prepare animation sheets, generate action sound effects, write tools and tests, and assist with publishing. The background music was made with **Suno**, as identified by the creator, and supplied to the project as two MP3 files.

The human role is central: The creator set the concept, chose characters and moves, provided references and music, played successive versions, identified problems, and approved the direction. Instructions ranged from broad goals—an arcade brawler with a wasteland atmosphere—to precise adjustments such as a three-metre dash, longer enemy stun, different boss heights, quieter music, and removing footsteps.

“Made with AI” describes the production process. It does not mean the game was produced perfectly in a single prompt, or that a language model runs the combat. The released game executes ordinary JavaScript and plays packaged media. It does not need an AI service or ComfyUI connection while playing.

### Contribution map

| Area | Human direction | AI contribution | Evidence in the repository |
| --- | --- | --- | --- |
| Concept and rules | Arcade references, combat feel, characters, feedback | Translated requests into systems and tuning | `index.html`, `campaign.js`, tests |
| Code | Feature requests and acceptance through play | Wrote and revised JavaScript, HTML, CSS, and Python | Runtime files and preparation scripts |
| Visual design | Wasteland aesthetic, character identity, scale and facing corrections | Generated and revised backgrounds, characters, props, and effects | `assets/`, art prompt documents |
| Animation | Requests for natural walking, extra poses, new moves | Generated poses, extracted silhouettes, packed sheets, implemented timing | `prepare_*.py`, animation manifests |
| SFX | Action realism, volume and coverage feedback | Generated local Stable Audio effects and connected them to events | `assets/audio/`, `ken-audio.js` |
| Music | Supplied two Suno tracks and requested mixing changes | Integrated playlist, autoplay handling, and special-move ducking | `assets/music/`, `music.js` |
| QA | In-game visual, audio, and feel evaluation | Wrote automated checks and fixed observed regressions | `tests/` |
| Delivery | Selected GitHub repository and public demo | Prepared source, static builds, and deployment | `.openai/hosting.json`, `build_site.py` |

The repository does not contain a complete record of every generation session. Exact image model versions, generation times, and all original prompts cannot be reconstructed for every asset. The Suno model, prompts, and generation settings were not recorded here. This document does not invent those details.

## 2. Creative direction

The core experience is a local cooperative, side-scrolling martial-arts brawler inspired by classic arcade games such as Double Dragon. The characters and story draw on *Fist of the North Star*. The intended feeling combines powerful, readable martial arts with a hostile post-apocalyptic road journey.

The creator requested a more energetic title presentation with Street Fighter Zero as a reference, plus wasteland props and supplies that fit a Mad Max-like environment. These are creative references, not claims of affiliation with those properties.

The main design priorities are:

- **Physical readability:** feet meet the ground, silhouettes stay clear, facing is correct, and strikes have recognizable preparation and follow-through.
- **Distinct fighters:** Ken uses forceful strikes and forward momentum; Rei uses open-hand cuts, vacuum waves, and bird-like aerial attacks.
- **Arcade immediacy:** press an attack button to join, continue at the current fight, and enter three initials for a qualifying high score.
- **Spectacle:** special-move names, short freezes or slowdown, impact flashes, camera shake, and music ducking emphasize major attacks.
- **Accessible delivery:** open a browser, connect a controller or use a keyboard, and play without installing an engine.

## 3. Game structure and campaign

The game is a 2D canvas presentation with a depth lane. Fighters move horizontally through the level and vertically within the lane; jumping uses a separate elevation value. Moving upward in the lane is therefore different from jumping.

The campaign follows nine stages:

| Stage | Setting | Main boss |
| --- | --- | --- |
| 1 | Wasteland Awakening | Spade |
| 2 | Ruined Village Siege | Heart |
| 3 | Southern Cross City | Shin |
| 4 | Desert Convoy Ambush | Jagi |
| 5 | Cassandra Prison | Uighur |
| 6 | Cult Stronghold | Devil Rebirth |
| 7 | Nanto Generals War | Souther |
| 8 | Capital and Raoh Territory | Ryuga |
| 9 | Final Battlefield | Raoh |

Routes contain ordinary encounters, minibosses, recovery stops, optional rescues, and finales. Later passes expanded travel distances and groups: most ordinary encounters contain six to eight enemies, with a smaller opening group. Encounter gates prevent progression from skipping an unfinished fight.

Enemies enter from beyond the camera edges. An entry state walks them into the arena before normal movement clamps and attack AI take over. This avoids both visible spawning and an offscreen enemy suddenly snapping to an arena boundary. Some enemies approach from behind or change depth lane to flank the player.

The final Raoh fight uses three phases without ordinary reinforcements. The campaign’s original reference included more ambitious traversal and cinematic goals; those should not be confused with completed features. See [LEVEL-DESIGN.md](LEVEL-DESIGN.md) for the adaptation history; some early implementation notes there predate the larger-group changes.

### Opening story

The current opening was simplified at the creator’s request:

1. Ken demands that Shin release Julia.
2. Julia tells Ken to run.
3. Shin approaches, delivers seven rapid strikes, and leaves Big Dipper-shaped wounds. The strikes play in a fast sequence instead of pausing between each one.
4. Ken falls to his knees and promises to rescue Julia, then gameplay begins.

The introduction combines prepared artwork with code-driven staging, captions, effects, and timing. It is not a single generated video. `opening.js` owns the opening sequence; story localization is maintained separately.

## 4. Players, controls, and combat

Ken and Rei are currently selectable. Toki’s assets and combat implementation remain in the project, but normal selection is disabled for now.

Input devices join in order rather than being tied permanently to player one or two. The main keyboard uses WASD, H for punch, K for kick, and U for jump. A second keyboard bank uses arrows and numpad buttons. Standard gamepads and mobile overlay controls feed the same abstract input system. A second player can join during gameplay and choose an available fighter through the HUD.

### Combat timing

Attacks have startup, active contact, and recovery periods. Damage is evaluated during active frames; a hit set prevents one swing from repeatedly damaging the same target. Recovery creates commitment, while late buffering allows the next action to start without requiring a perfectly timed new press.

Ken, Rei, and Toki can launch another punch approximately 20% sooner than another kick. Their aura extends ordinary punch reach by 10%, kick reach by 20%, and jumping kick reach by 30%. Their airborne time was extended by roughly 15%. These are deliberate gameplay rules, independent of the visible sprite’s exact outline.

| Contact zone | Damage multiplier | Damage-number color |
| --- | --- | --- |
| Head | 200% | Red |
| Upper body | 100% | Blue |
| Lower body | 70% | Green |

Hit-zone classification uses combat geometry and attack information. It is not a per-pixel simulation of skin, clothing, or limbs. Jump punches were adjusted to strike lower, so the contact region better follows a downward attack.

### Character techniques

| Character | Input | Design |
| --- | --- | --- |
| Ken | Airborne punch | Tucked legs and a downward chopping attack |
| Ken | Double-tap forward | Raised-knee forward glide, roughly three game metres, with invulnerability and phasing |
| Ken | Jump + kick | Two rotations: the first damages, the second launches nearby enemies |
| Rei | Double-tap forward | Crossed vacuum-wave net reaching roughly five game metres ahead |
| Rei | Jump + kick | 飛翔白麗: high rise, bird-like suspension, fast dive, and a powerful downward hand strike |
| All implemented heroes | Punch + kick / all three buttons | Character special tiers with energy costs and presentation effects |

“Metres” are design shorthand translated into game coordinates, not a calibrated real-world physics measurement.

### Enemies, guards, and defeat

Gunner fires one shotgun shot, then waits 15 seconds. Jagi fires a three-shot burst with a 15-second wait afterward. Knife throws a three-knife spread. Weapon poses distinguish preparation, firing or throwing, and recovery; shotgun reload audio follows the final shot.

Shield and Shield Captain can block frontal attacks for 5% damage, while their guard opens during relevant attack or recovery states. Jump attacks bypass guards. Block-capable enemies receive doubled stun when successfully staggered.

A nonlethal knockdown and a defeated body are different states. Knocked-down fighters can recover; defeated enemies fall, remain grounded for three seconds, then disappear. The player also uses a fall and grounded-death sequence. Respawn preserves the local position, and continuing an active run preserves the current encounter instead of restarting the campaign.

## 5. Visual assets and animation production

AI image generation produces candidate illustrations and poses. Those images require additional work before they become usable game assets. A visually attractive sheet can still have inconsistent scale, poor contact poses, overlapping silhouettes, incorrect facing, or feet at different heights.

### Asset families

| Family | Location | Role |
| --- | --- | --- |
| Playable fighters | `assets/sprites/` | Idle, walk, attacks, jump, specials, reactions |
| Enemies and bosses | `assets/characters/` | Combat sheets, weapons, knockdown art, portraits |
| Environments | `assets/backgrounds/` | Backgrounds and ground imagery |
| Props | `assets/props/` | Breakable and environmental objects |
| Story | `assets/story/` | Intro and narrative imagery |

Prompt records include [character art](assets/characters/ART-PROMPTS.md), [animation expansion](assets/sprites/ANIMATION-PROMPTS.md), and [background art](assets/backgrounds/ART-PROMPTS.md). These documents describe particular production passes; references to older sheets are historical, not necessarily the currently selected runtime art.

### From generated picture to runtime animation

1. **Reference identity:** use approved character art to preserve hair, costume, proportions, and rendering style.
2. **Describe poses:** request explicit phases such as contact, down, passing, and opposite-foot contact, rather than asking only for “smooth walking.”
3. **Generate candidates:** produce sheets with complete figures, consistent facing, and separated cells.
4. **Extract silhouettes:** remove unwanted backgrounds and isolate useful poses. Some passes use transparency; others use a removable flat background.
5. **Normalize and pack:** align feet, calculate body anchors, scale figures, and pack transparent PNG sheets.
6. **Write manifests:** record source rectangles, anchors, scale, and action mappings.
7. **Connect timing:** select poses from movement distance, attack phase, or airborne motion.
8. **Review in motion:** inspect the gallery and gameplay, then revise the art or playback logic.

Tools such as `prepare_player_animation.py`, `prepare_character_art.py`, `prepare_enemy_walk.py`, and `prepare_knockdown_art.py` implement repeatable asset preparation. Original sources are retained where available.

### Why walking needed several revisions

Early walking could feel like sliding, rapid stepping, or a repeated pose even after adding frames. More frames alone do not establish believable movement. The cycle needs alternating support legs, meaningful passing poses, stable body registration, and a relationship between stride and travel distance.

Ken and Rei now use rebuilt eight-pose walk sheets in `ken-walk-v3` and `rei-walk-v3`. `prepare_walk_cycles.py` aligns their ground baseline and estimates a body anchor from the silhouette. Runtime stride advances with actual travel, accounts for depth scaling, and stops at walls. Extra artificial bobbing was removed for these two fighters.

This illustrates the project’s workflow: the creator reported an unnatural result, AI inspected both the asset and its playback, replaced selected art, adjusted code, and added regression coverage. Automated checks establish consistency; human observation still judges whether the movement feels natural.

### Scale, ground contact, and image quality

The runtime uses Ken as a size reference. The implemented boss height ratios are Heart 1.30×, Devil Rebirth 1.80×, Uighur 1.50×, Spade 1.15×, Raoh 1.10×, and Fang Chief 1.20×. These ratios mean the total height relative to Ken, not that an additional 130–180% is added.

Ground anchors, shadows, depth scale, and separate jump elevation keep fighters and props attached to the scene. Ground rendering was revised to use full image tiles rather than distorted scanline transformations. Higher-resolution source art helps close-up presentation, but increasing file resolution alone cannot repair a weak pose or inconsistent alignment.

## 6. Sound effects made with local AI

The action-audio pipeline uses local **ComfyUI**, the `audio_stable_audio` workflow, and **Stable Audio Open 1.0**. The project contains 46 generated runtime clips across Ken, Rei, shared actions, and a completion set.

Recorded workflow graphs include generation prompts, seeds, and settings. The documented generation passes use 50 sampling steps and CFG 4.98. Source FLAC recordings and processing reports live alongside the runtime WAV files under `assets/audio/`.

The preparation scripts decode audio through FFmpeg, detect an audible onset, trim the recording to a responsive duration, remove DC offset, normalize peaks, add short fades, and write mono PCM WAV files. Completion clips are generally short—approximately 0.08 to 0.5 seconds—so attacks respond promptly.

### Audio follows the action

- Swishes play when an attack starts; contact sounds play when it connects.
- Rei’s net, ascent, dive, and landing have separate cues.
- Toki has distinct palm, swish, kick, and preparation sounds.
- Weapons, blocks, broken materials, falls, pickups, recovery, and menu actions have mapped effects.
- Shotgun reload plays once after the final shot, not throughout the cooldown.
- Playback uses duplicate suppression, gain control, compression, and a maximum of 12 simultaneous generated voices.
- Synthesized effects remain a fallback when generated audio is unavailable or not ready.
- Footstep files remain among the generated assets, but all gameplay footstep triggers were removed at the creator’s request.

Despite its filename, `ken-audio.js` is the shared generated-audio player for the full game. See [SFX-PLAN.md](SFX-PLAN.md) for the production coverage map. Its walking-audio entry describes the earlier coverage pass; the later removal of footsteps takes precedence.

## 7. Background music by Suno

The creator supplied two Suno-generated tracks originally named **Ashes Under Steel.mp3** and **Ashes Under Steel (1).mp3**. Their game filenames are:

- `assets/music/ashes-under-steel.mp3`
- `assets/music/ashes-under-steel-2.mp3`

`music.js` uses one audio player to alternate the two tracks and retain playlist continuity across menus, levels, and retries. Playback begins after browser interaction, pauses when the document is hidden, and resumes when appropriate.

The final normal volume setting is **0.25**, after the original 0.50 setting was reduced by another half. During special-move emphasis it ducks to **0.10**, helping action audio stand out. These are browser gain settings, not measured loudness targets.

Suno made the music; the coding assistant integrated it. The repository does not include the original Suno prompts, account export history, model version, stems, or music-generation session. Those details would need to be supplied by the creator to document the music’s full provenance.

## 8. How AI implemented the code

The implementation evolved through repeated, specific requests rather than a single large specification. A typical cycle was:

1. The creator described a feature or a problem observed while playing.
2. The assistant inspected the existing runtime and asset structure.
3. It translated the request into state transitions, timing, geometry, inputs, or asset requirements.
4. It edited the relevant files and generated or processed media when needed.
5. It ran targeted checks, reported the result, and prepared the next playable revision.
6. Human playtesting supplied the next correction.

Examples include correcting character facing, restoring high-resolution selection art, slowing walk playback, replacing walking poses, preventing airborne attacks from being blocked, extending campaign groups, removing attack-warning ground boxes, and changing enemies from visible spawning to offscreen entry.

### Runtime architecture

The engine remains deliberately simple: static HTML, JavaScript, CSS, and media files. `index.html` contains the main simulation and rendering code. Additional files separate campaign behavior, opening scenes, input presentation, localization, audio, analytics, and arcade UI.

The main flow covers title, joining and character selection, opening story, ordinary combat, boss encounters, level completion, and ending or game-over handling. Entity states such as walking, attacking, stunned, falling, grounded, and getting up drive both rules and presentation.

Rendering targets 30 FPS while combat advances at 60 simulation ticks per second. Keeping timing in simulation ticks allows startup, recovery, invulnerability, projectile bursts, and cooldowns to remain consistent across the intended rendering cadence. Brief hit-stop and special presentation deliberately alter perceived pacing.

Enemy “AI” here means scripted decision logic: target selection, approach, flanking, lane alignment, attack selection, recovery, and boss phases. It does not mean a generative model decides each enemy action.

### Persistence and platform support

Checkpoints and arcade records use browser-local storage. They are local to that browser profile rather than an online shared leaderboard or synchronized account save. Keyboard, gamepad, and touch inputs are normalized before combat logic consumes them. Localization separates displayed text from internal asset and combat identifiers.

## 9. Validation and its limits

The repository includes tests for combat, campaign progression, art geometry, audio playback, localization, mobile behavior, music, and analytics. The latest focused validation before this document included **75 combat checks** and **12 campaign checks**, plus audio and artwork checks.

| Check area | What it can establish |
| --- | --- |
| Combat | Attack windows, repeat-hit prevention, guards, special rules, reactions |
| Campaign | Stage order, encounters, checkpoints, boss progression, offscreen entries |
| Artwork | File dimensions, transparency, atlas bounds, pose selection, alignment constraints |
| Audio | File coverage, playback scheduling, throttling, voice limits, reload timing |
| Input and presentation | Keyboard mappings, simulated controller behavior, localization and layout rules |

These checks do not prove that every animation looks natural, that generated sounds are convincing on every speaker, or that a full campaign has the desired difficulty and duration. Physical controllers, mobile hardware, prolonged play, and subjective audiovisual quality still require human evaluation.

## 10. Source control and publication

The source repository is [hkfroggy/Arcade-FistOfEndWorld](https://github.com/hkfroggy/Arcade-FistOfEndWorld). The game is published separately through OpenAI Sites at the demo URL linked above.

`build_site.py` recreates `dist/`, copies runtime files, excludes selected offline art inputs, and converts PNG artwork to WebP. Playable-character artwork uses lossless WebP in the current build script. Source PNGs remain unchanged. A saved Sites version binds a pushed source commit to its packaged static output before deployment.

The latest confirmed public deployment at the time of writing was **version 5**. GitHub pushes and website deployments are separate actions; this documentation change alone does not update the hosted game.

## 11. Production lessons and remaining work

- **Precise feedback is more useful than “make it better.”** Contact height, cycle speed, body scale, facing, and grounded duration can be turned into inspectable rules.
- **Generated assets need engineering.** Extraction, anchors, scale, timing, compression, and manifests are part of the asset pipeline.
- **Consistency matters more than frame count alone.** Repeated or misregistered poses can remain unnatural at a higher playback rate.
- **Sound should describe the event.** A missed strike, a block, and a heavy contact need different cues; constant incidental noise can be removed if it distracts.
- **Human review closes the loop.** Tests prevent regressions, while playtesting decides whether the game feels good.

Further work can improve bespoke boss choreography, environmental variety, animation continuity, full-campaign balance, and performance on real mobile devices. Toki can be re-enabled after the creator’s review. Full provenance records for older image generations and the Suno sessions would make the production archive more complete.

## 12. Credits and provenance

**Creator and direction:** The creator.  
**Implementation and production assistance:** AI coding assistant through Codex.  
**Artwork:** AI-generated and AI-assisted visual production, with human references, selection, and feedback; individual generation records vary by asset.  
**Action sound generation:** local ComfyUI with Stable Audio Open 1.0.  
**Background music:** Suno, supplied by the creator as two *Ashes Under Steel* tracks.  
**Characters and story inspiration:** *Fist of the North Star*.  
**Arcade and visual references:** classic beat ’em ups, Double Dragon, Street Fighter Zero, and a Mad Max-like wasteland direction.

The repository includes a [license file](LICENSE). This production description records contributions and references; it does not establish ownership of third-party characters, trademarks, or source material.
