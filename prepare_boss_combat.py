"""Pack six separated boss poses using the game's existing sprite extraction."""
import sys
from pathlib import Path
from PIL import Image
from prepare_player_animation import extract
from prepare_character_art import save_manifest

name, source, height = sys.argv[1:]
assert name in ('spade', 'heart')
root = Path(__file__).resolve().parent / 'assets/characters'
frames = extract(Path(source), 3, root / 'sources' / f'{name}-combat-source.png', 6)
w = max(round(2 * max(a, f.width-a)) + 16 for f, a in frames)
h = max(f.height for f, a in frames) + 8
atlas = Image.new('RGBA', (w*3, h*2))
for i, (frame, anchor) in enumerate(frames):
    atlas.alpha_composite(frame, (round(i%3*w+w/2-anchor), (i//3+1)*h-4-frame.height))
atlas.save(root / f'{name}.png')
save_manifest(name, w, h, int(height), 6)
print(f'{name}: six native-resolution combat poses packed')
