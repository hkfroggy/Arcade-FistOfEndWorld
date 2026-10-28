# Action sound completion plan

Use the local ComfyUI `audio_stable_audio.json` workflow, Stable Audio Open 1.0,
50 steps, CFG 4.98. Preserve source recordings and exact generation graphs.

1. Audit all runtime sound calls and silent animation events.
2. Generate missing Toki strikes, reload, get-up, recovery, pickup, heavy-impact,
   and menu feedback recordings. Reuse existing generated effects where the
   physical action is the same, rather than making a separate file per enemy.
3. Trim silence, peak-limit and fade recordings; connect sound to animation
   release/contact instead of rendering frames. Keep lightweight synthesis only
   as fallback before browser audio unlock or if a file fails.
4. Validate every sound key has a file, load/decode/playback paths, move timing,
   once-only events, existing combat rules, and a cap on simultaneous voices.

## Completion

Implemented: 46 generated clips, including 12 new completion effects. Sources,
workflow graphs and processing reports are preserved under assets/audio.
Audio loading/playback, voice limits, reload timing, combat and campaign
regressions are checked automatically. Listening quality still needs in-game
audition on the player’s speakers.

## Coverage

| Event | Generated family |
|---|---|
| Ken punches, kicks, aerial chops, charge/release | ken-stable-audio |
| Rei palms, kicks, chops, net, leap/dive/landing, specials | rei-stable-audio |
| Toki palms, swings, kicks, preparation | completion-stable-audio |
| Toki special release | actions-stable-audio/toki |
| All walking, jumping, landing, dash, spin | actions-stable-audio |
| Shotgun shots, thrown knives, spear, whip, bombs | actions-stable-audio |
| Shotgun reload | completion-stable-audio/reload |
| Heavy hit contact (20+ damage) | completion-stable-audio/heavy-hit |
| Knockdown, defeat, shield blocks, destroyed containers | actions-stable-audio |
| Get-up, respawn, pickups and rescued survivor recovery | completion-stable-audio |
| Selection, confirmation, joining | completion-stable-audio |
| Intro strikes and legacy cinematic cues | generated impact/movement families |

Idle and waiting states remain quiet. An air swing has no target impact unless
it connects. Pauses and hit-stop must not replay event sounds.
