# Knockdown artwork

Four transparent poses for each of the 31 enemy and boss characters: recoil,
airborne fall, ground impact, and resting. Sources are preserved in
`../sources/down-*.png`. The three playable heroes use their existing HD body
atlases, now selecting airborne/grounded poses from physical state.

Repack a source sheet with one character per row and four poses per row:

    python3 prepare_knockdown_art.py SOURCE NAME [NAME ...]

The packer preserves relative pose size and uses a shared baseline eight pixels
above each cell's bottom. `referenceHeight` normalizes the bent-knee recoil pose
to the character's gameplay height. Both manifests must remain together.

Runtime selects recoil for the first five simulation ticks, airborne fall until
landing, impact for seven ticks, then rest. Defeated enemies stay grounded for
180 simulation ticks (three seconds), fading during the final 24 ticks.
Simulation runs at 60 Hz and presentation at 30 FPS. Missing images retain the
previous procedural/rotated-art fallback.

Validation: `node tests/art.cjs`, `python3 tests/art.py`, and
`node tests/combat.cjs` cover roster coverage, pose selection, transparent cell
geometry, ground alignment, recovery and defeat timing.
