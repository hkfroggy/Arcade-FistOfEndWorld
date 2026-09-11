# Ken expanded animation set

Generated with the built-in imagegen tool, using `assets/sprites/ken_S1.png` as the identity/costume reference. `source.png` is the selected generation; `actions.png` is its transparent, foot-aligned engine atlas. Rebuild with `python3 prepare_ken_animation.py` and validate with `python3 tests/ken-art.py`.

56 authored source poses. Idle, walk, punch, grounded side kick, jump and barrage each use eight animation slots. Side kick holds its fully extended pose over both active slots. Landing, hit reaction, knockdown and get-up have dedicated shorter sequences. The existing `ken_jumpkick` art remains the aerial attack. Damage frames take priority over action frames. Attack startup, contact and recovery determine the displayed pose.

The generator returned seven rows, combining the requested airborne row into the jump row. The original aerial attack is therefore retained rather than relabeling the new grounded kick as an aerial attack.

## Prompt set

Initial request: Create a production sprite atlas for Kenshiro matching the attached dark blue outfit, silver shoulder pads, black spiky hair and detailed arcade illustration. Transparent background. Uniform eight-column layout, separate full-body sprites, no text, grid lines or shadows, all facing right. Sequential distinct poses for idle breathing, walking, grounded punch, grounded side kick with one boot planted, jump, airborne flying kick, alternating fist barrage, and damage/recovery. Preserve identity, costume and scale, with complete separated silhouettes.

Transparency correction: Preserve the exact figures, poses, positions, costumes and scale; replace the checkerboard with true transparent alpha. This attempt still contained a visible checkerboard and was not selected.

Final correction: Replace checkerboard background with perfectly flat uniform chroma green #00ff00. Preserve exact 56 sprites, same 8 columns and 7 rows, poses, identity, scale, costume. No checker, no texture in background, no shadows. Keep green out of character bodies. Sprite atlas for automated engine extraction.

The existing `prepare_player_animation.extract` pipeline removes the chroma background and isolates each complete silhouette. The packer preserves a common body scale and aligns each supporting foot to the same baseline.
