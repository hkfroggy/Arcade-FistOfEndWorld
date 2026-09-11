# Twelve-frame Ken walk

Built-in imagegen output: `source.png`; extracted transparent engine atlas: `actions.png`. Rebuild with `python3 prepare_ken_walk.py`. Validated by `python3 tests/ken-art.py`.

Prompt: Expand the referenced Kenshiro walk into 12 sequential full-body poses, six columns by two rows, on pure green. Preserve costume, identity, right facing and scale. Show contact, weight transfer, swing, narrow passing, forward reach and heel contact for each leg, with gradual changes and opposing arm swing. No text or shadows.

Refinement prompt: Preserve the exact twelve poses but reduce each figure inside its cell, leaving at least 50 pixels of green between figures; no touching feet or cropped edges.

Cycle rate is 70% of the previous rate (stride distance 120 / 0.7). Frame count is read from the loaded atlas, keeping cycle rate independent of frame count. Walking speed and attack timing are unchanged. The animation gallery uses the same full-speed cycle duration.

Natural-motion pass: frames align around the hip/belt band instead of the changing midpoint between the feet. Ground baseline and scale are preserved. Walking lean fades in, vertical bounce is reduced to one rise per passing foot, and reversing direction clears opposing movement momentum.
