"""Pack the two reference-based Toki sheets and synchronize sprite manifests.

Usage: python3 prepare_toki_art.py MOVEMENT.png COMBAT.png [toki|rei]
Existing artwork is retained. Requires the same Pillow/NumPy setup as the roster tool.
"""
import json
import re
import shutil
import sys
from pathlib import Path

import numpy as np
from PIL import Image
import prepare_character_art as art

ROOT = Path(__file__).resolve().parent
DEST = ROOT / 'assets' / 'sprites' / 'toki-v2'


def main(movement, combat, hero="toki"):
    global DEST
    if hero not in ("toki", "rei"):
        raise ValueError("Supported heroes: toki, rei")
    DEST = ROOT / "assets" / "sprites" / f"{hero}-v2"
    DEST.mkdir(parents=True, exist_ok=True)
    art.ROOT = DEST
    metadata = {}
    art.save_manifest = lambda name, w, h, height, poses: metadata.update({name: (w, h)})
    for name, source in [('movement', movement), ('combat', combat)]:
        original = DEST / f'{name}-original.png'
        if Path(source).resolve() != original.resolve():
            shutil.copyfile(source, original)
        image = Image.open(source).convert('RGBA')
        data = np.array(image)
        if np.mean(data[:, :, 3] < 8) < .15:
            # Some generated sheets bake a light checkerboard into an opaque
            # image. Remove only neutral light pixels connected to the border,
            # retaining enclosed white costume/hair highlights.
            rgb = data[:, :, :3].astype(int)
            background = (rgb.min(axis=2) > 222) & (np.ptp(rgb, axis=2) < 16)
            labels, _ = art.components(background)
            border = np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))
            data[np.isin(labels, border[border != 0]), 3] = 0
            image = Image.fromarray(data)
        image.save(DEST / f'{name}-transparent.png')
        art.prepare(name, DEST / f'{name}-transparent.png', 176)
    poses = []
    # Both sheets share body scale, measured from an upright standing pose.
    for name, standing in [('movement', 0), ('combat', 0)]:
        image = Image.open(DEST / f'{name}.png')
        w, h = metadata[name]
        frames = [image.crop(((i % 3)*w, (i//3)*h, (i%3+1)*w, (i//3+1)*h)) for i in range(6)]
        box = frames[standing].getchannel('A').getbbox()
        scale = 240 / (box[3]-box[1])
        for frame in frames:
            poses.append(frame.resize((round(w*scale), round(h*scale)), Image.Resampling.LANCZOS))
    cw = max(p.width for p in poses)+8
    ch = max(p.height for p in poses)+8
    atlas = Image.new('RGBA', (cw*3, ch*4))
    for i, frame in enumerate(poses):
        atlas.alpha_composite(frame, ((i%3)*cw+(cw-frame.width)//2, (i//3+1)*ch-frame.height))
    atlas.save(DEST/f'{hero}-actions.png', optimize=True)
    sequences = {
        'idle': [0], 'walk': [1, 0, 2, 0],
        'punch': [0, 6, 7, 7, 6, 0], 'kick': [0, 8, 9, 9, 8, 0],
        'jump': [3, 4, 4, 4, 3, 0], 'special': [10, 10, 11, 11, 11, 0],
        'stunned': [5],
    }
    overrides = {}
    for state, indices in sequences.items():
        overrides[hero+'_'+state] = {
            'sheet': f'assets/sprites/{hero}-v2/{hero}-actions.png',
            'regions': [[(i%3)*cw, (i//3)*ch, cw, ch] for i in indices],
            'anchors': [(i%3)*cw+cw/2 for i in indices],
            'scale': 176/240, 'dw': round(cw*176/240), 'dh': 176,
        }
    # Runtime and both offline copies must agree for Toki.
    html_path = ROOT/'index.html'
    html = html_path.read_text()
    pattern = r'window\.SPRITE_MANIFEST\s*=\s*(\{.*?\});'
    match = re.search(pattern, html, re.S)
    manifest = json.loads(match.group(1))
    manifest['sprites'].update(overrides)
    html_path.write_text(html[:match.start(1)]+json.dumps(manifest, separators=(',', ':'))+html[match.end(1):])
    for path in [ROOT/'assets/sprites/manifest.json', ROOT/'assets/sprites/sprites.js']:
        raw = path.read_text()
        data = json.loads(raw if path.suffix == '.json' else re.search(pattern, raw, re.S).group(1))
        data['sprites'].update(overrides)
        path.write_text((json.dumps(data, indent=2)+'\n') if path.suffix == '.json' else 'window.SPRITE_MANIFEST = '+json.dumps(data, indent=2)+';\n')
    preview = Image.new('RGBA', (cw*3, ch*2))
    for n, i in enumerate([0, 1, 2, 6, 7, 5]):
        preview.alpha_composite(atlas.crop(((i%3)*cw, (i//3)*ch, (i%3+1)*cw, (i//3+1)*ch)), ((n%3)*cw, (n//3)*ch))
    preview.save(DEST/'preview.png', optimize=True)
    (DEST/'gallery.js').write_text(f'window.{hero.upper()}_ART = '+json.dumps({'path': f'assets/sprites/{hero}-v2/preview.png', 'cellW': cw, 'cellH': ch, 'poses': 6})+';\n')
    print(f'{hero.title()}: 12 poses, {cw}×{ch} cells; seven actions synchronized across all manifests')


if __name__ == '__main__':
    main(*sys.argv[1:])
