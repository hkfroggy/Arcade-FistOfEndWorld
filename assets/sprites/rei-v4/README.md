# Rei expanded movement and attack poses

Generated with built-in imagegen using `../rei-v3/actions.png` as the identity reference. `source.png` retains the extraction source; `actions.png` is the transparent engine atlas.

Prompt summary: 36 isolated right-facing full-body poses in six columns and six rows. Twelve sequential walking poses with opposing arm swing, contact, weight transfer and passing steps; six poses each for high and low hand attacks and high and low grounded kicks. Preserve costume, character identity and scale. Rei uses hand-blade strikes; Toki uses palm strikes. No text, shadows or overlapping figures.

Rebuild: `python3 prepare_roster_animation.py rei`. Verify: `python3 tests/roster-art.py` and `node tests/combat.cjs`.

Walk frames align around the hip band with a shared ground baseline. Both fighters use Ken's slower distance-driven stride cadence, acceleration, jump and landing motion. Attack poses follow startup, active and recovery windows. Existing idle portraits, specials and aerial kicks are preserved.
