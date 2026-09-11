"""Prepare generated six-pose sheets for the game, retaining their alpha.

Usage: python3 prepare_character_art.py NAME SOURCE.png DISPLAY_HEIGHT
The original generated sheet is copied unchanged. Separate connected silhouettes
are packed into consistent cells, anchored at the feet, without stretching.
"""
import json
import shutil
import sys
from pathlib import Path

import numpy as np
from PIL import Image


def components(mask):
    """Four-connected components without an optional scientific dependency."""
    labels = np.zeros(mask.shape, dtype=np.int32)
    count = 0
    h, w = mask.shape
    for y, x in zip(*np.where(mask)):
        if labels[y, x]:
            continue
        count += 1
        labels[y, x] = count
        stack = [(int(y), int(x))]
        while stack:
            py, px = stack.pop()
            for ny, nx in ((py-1, px), (py+1, px), (py, px-1), (py, px+1)):
                if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not labels[ny, nx]:
                    labels[ny, nx] = count
                    stack.append((ny, nx))
    return labels, count

ROOT = Path(__file__).resolve().parent / 'assets' / 'characters'


def prepare(name, source, height, portrait=False):
    ROOT.mkdir(parents=True, exist_ok=True)
    raw = ROOT / 'sources'
    raw.mkdir(exist_ok=True)
    if Path(source).resolve() != (raw / f'{name}.png').resolve():
        shutil.copyfile(source, raw / f'{name}.png')
    image = Image.open(source).convert('RGBA')
    alpha = np.array(image.getchannel('A'))
    if np.mean(alpha < 8) < .15:
        raise ValueError(f'{name}: source does not have a transparent background')
    if portrait:
        box = image.getchannel('A').point(lambda a: 255 if a > 8 else 0).getbbox()
        atlas = image.crop(box)
        atlas.save(ROOT / f'{name}.png', optimize=True)
        save_manifest(name, atlas.width, atlas.height, height, 1)
        print(f'{name}: transparent story cutout')
        return
    labels, count = components(alpha > 8)
    sizes = np.bincount(labels.ravel())
    grid_y, grid_x = np.indices(labels.shape)
    centres_y = np.bincount(labels.ravel(), weights=grid_y.ravel()) / np.maximum(sizes, 1)
    centres_x = np.bincount(labels.ravel(), weights=grid_x.ravel()) / np.maximum(sizes, 1)
    primary = sorted(range(1, count + 1), key=lambda i: sizes[i], reverse=True)[:6]
    if len(primary) != 6 or min(sizes[i] for i in primary) < 2000:
        raise ValueError(f'{name}: could not identify six complete poses')
    centres = {i: (centres_y[i], centres_x[i]) for i in primary}
    # Sort the three top poses and then three bottom poses independently.
    by_y = sorted(primary, key=lambda i: centres[i][0])
    order = sorted(by_y[:3], key=lambda i: centres[i][1]) + sorted(by_y[3:], key=lambda i: centres[i][1])
    # Retain detached hair strands, chains, and other small foreground details.
    owner = np.zeros(count + 1, dtype=np.int32)
    for i in range(1, count + 1):
        if sizes[i] < 3:
            continue
        cy, cx = centres_y[i], centres_x[i]
        owner[i] = min(primary, key=lambda k: (centres[k][0]-cy)**2 + (centres[k][1]-cx)**2)
        # A thrown prop sits between the strike and recoil columns. It belongs
        # to the throwing pose, even when nearer the neighbouring silhouette.
        if name in ('jackal', 'bomber') and i not in primary and sizes[i] < 6000:
            if image.width*.55 < cx < image.width*.78 and image.height*.5 < cy < image.height*.75:
                owner[i] = order[4]
    assigned = owner[labels]
    frames = []
    for i in order:
        mask = assigned == i
        ys, xs = np.where(mask)
        box = (int(xs.min()), int(ys.min()), int(xs.max())+1, int(ys.max())+1)
        data = np.array(image)
        data[:, :, 3] = np.where(mask, data[:, :, 3], 0)
        frame = Image.fromarray(data).crop(box)
        # Base alignment follows the feet rather than an outstretched weapon.
        fy, fx = np.where(mask & (grid_y >= box[3] - max(24, (box[3]-box[1])*.12)))
        anchor = float(fx.min()+fx.max())/2 - box[0]
        frames.append((frame, anchor))
    areas = [np.count_nonzero(np.array(frame.getchannel('A')) > 8) for frame, _ in frames]
    heights = [frame.height for frame, _ in frames]
    if min(areas) < max(areas)*.35 or min(heights) < max(heights)*.55:
        raise ValueError(f'{name}: poses touch or a detached weapon was mistaken for a figure; revise the source layout')
    cell_w = max(int(max(anchor, frame.width-anchor)*2)+8 for frame, anchor in frames)
    cell_h = max(frame.height for frame, _ in frames)+8
    atlas = Image.new('RGBA', (cell_w*3, cell_h*2))
    for n, (frame, anchor) in enumerate(frames):
        atlas.alpha_composite(frame, (round((n%3)*cell_w+cell_w/2-anchor), (n//3+1)*cell_h-4-frame.height))
    atlas.save(ROOT / f'{name}.png', optimize=True)
    save_manifest(name, cell_w, cell_h, height, 6)
    print(f'{name}: six poses, {cell_w}×{cell_h} cells, transparent PNG')


def save_manifest(name, cell_w, cell_h, height, poses):
    meta_path = ROOT / 'manifest.json'
    meta = json.loads(meta_path.read_text()) if meta_path.exists() else {}
    meta[name] = {'path': f'assets/characters/{name}.png', 'cellW': cell_w,
                  'cellH': cell_h, 'height': int(height), 'poses': poses}
    meta_path.write_text(json.dumps(meta, indent=2)+'\n')
    (ROOT / 'manifest.js').write_text('window.CHARACTER_ART = '+json.dumps(meta, indent=2)+';\n')


if __name__ == '__main__':
    prepare(sys.argv[1], sys.argv[2], sys.argv[3], '--portrait' in sys.argv)
