# Ken walking and attack variations

Built-in imagegen generated `attacks-source.png` and `walk-source.png`, referenced from the original `ken_S1.png`. The existing chroma extraction pipeline packs them into `actions.png`. Run `python3 prepare_ken_variations.py` to reproduce the atlas and manifest updates; run `python3 tests/ken-art.py` to verify.

The eight-slot walk combines wide contact/reach poses and narrow passing poses. The stride covers 120 world pixels. Grounded punches and kicks independently cycle middle, high, low, middle. Six-pose variants preserve the existing startup/contact/recovery durations and damage. Height differences are visual; this does not introduce a new high/low blocking mechanic. Original title and selection portraits and aerial kick are retained.

## Generation prompts

Attack sheet: Production animation sprites matching Kenshiro dark blue clothing and silver shoulder plates. Flat chroma green #00ff00. Six columns, five rows, 30 separated full-body figures facing right with consistent size and baseline. Row 1 sequential contact/passing walking cycle with alternating arms and legs. Row 2 high punch from guard through windup, extension to face height, retraction and guard. Row 3 low body punch with knees bent and fist aimed at belly/waist. Row 4 grounded high side kick aimed at head height. Row 5 grounded low side kick aimed at thigh/knee height. Supporting foot planted throughout kicks. Crisp arcade illustration matching the original reference, no text.

Passing-pose refinement: Four full-body right-facing walking keyframes, flat green background, matching original Kenshiro. Frame 1 left-foot-forward contact, right leg behind. Frame 2 narrow passing pose, supporting leg vertical under pelvis and other knee bent with foot raised beside shin. Frame 3 opposite-foot contact. Frame 4 opposite-foot passing pose. Frames 2 and 4 must be narrow silhouettes, not wide lunges. Natural upright walking, consistent scale and baseline, no text.
