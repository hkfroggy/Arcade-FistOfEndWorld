"""Pack eight enemy walk poses with the accepted scavenger hip alignment."""
import sys
from pathlib import Path
import numpy as np
from PIL import Image
from prepare_player_animation import extract

name, source = sys.argv[1:]
out = Path(__file__).resolve().parent / 'assets/characters'
frames = extract(Path(source), 4, out/'sources'/f'{name}-walk-v3.png', 8)
poses = []
for frame, _ in frames:
    alpha = np.array(frame.getchannel('A'))
    _, xs = np.where(alpha[int(frame.height*.48):int(frame.height*.55)] > 128)
    anchor = float(np.median(xs))
    factor = 400/frame.height
    frame = frame.resize((round(frame.width*factor),400), Image.Resampling.LANCZOS)
    poses.append((frame,anchor*factor))
w = max(round(2*max(a,f.width-a))+24 for f,a in poses)
h = 416
atlas = Image.new('RGBA',(w*4,h*2))
for i,(frame,anchor) in enumerate(poses):
    atlas.alpha_composite(frame,(round(i%4*w+w/2-anchor),i//4*h+8))
atlas.save(out/f'{name}-walk-v3.png')
print(f'{name}: eight hip-aligned poses, {w} x {h} cells')
