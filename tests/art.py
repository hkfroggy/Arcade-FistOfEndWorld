"""Check transparent silhouettes and reject merged or empty animation cells."""
import json
from pathlib import Path
import numpy as np
from PIL import Image

root = Path(__file__).resolve().parents[1]
meta = json.loads((root/'assets/characters/manifest.json').read_text())
for name, s in meta.items():
    im = Image.open(root/s['path'])
    assert im.mode == 'RGBA', name
    assert np.mean(np.array(im.getchannel('A')) < 8) > .15, name
    if s['poses'] == 1:
        continue
    heights, areas = [], []
    for i in range(6):
        a = im.crop(((i%3)*s['cellW'], (i//3)*s['cellH'], (i%3+1)*s['cellW'], (i//3+1)*s['cellH'])).getchannel('A')
        box = a.getbbox()
        assert box is not None, (name, i)
        heights.append(box[3]-box[1])
        areas.append(np.count_nonzero(np.array(a)>8))
        assert box[0] > 0 and box[2] < s['cellW'], (name, i, 'horizontal crop')
    assert min(areas) > max(areas)*.35, (name, 'merged poses')
    assert min(heights) > max(heights)*.55, (name, 'partial figure')
print(f'PASS {len(meta)} transparent assets; every combat sheet has six separate complete silhouettes')

toki = json.loads((root/'assets/sprites/manifest.json').read_text())['sprites']
for key, s in toki.items():
    if not key.startswith(('toki_', 'rei_')):
        continue
    im = Image.open(root/s['sheet'])
    for x, y, w, h in s['regions']:
        alpha = im.crop((x,y,x+w,y+h)).getchannel('A')
        box = alpha.getbbox()
        assert box and box[0]>0 and box[2]<w, (key, 'clipped or empty pose')
        assert np.mean(np.array(alpha)<8)>.3, (key, 'background remains')
print('PASS All Rei and Toki action sequences contain complete transparent silhouettes')

knockdowns = json.loads((root/'assets/characters/knockdown-v1/manifest.json').read_text())
assert len(knockdowns) == 31
for name, s in knockdowns.items():
    im = Image.open(root/s['path'])
    assert im.mode == 'RGBA' and im.size == (s['cellW']*4, s['cellH']), name
    for i in range(4):
        a = im.crop((i*s['cellW'],0,(i+1)*s['cellW'],s['cellH'])).getchannel('A')
        box = a.getbbox()
        assert box and box[0] > 0 and box[2] < s['cellW'], (name,i,'cropped pose')
        assert box[3] == s['cellH']-8, (name,i,'ground alignment')
        assert np.mean(np.array(a)<8) > .2, (name,i,'background')
print('PASS 124 knockdown poses: transparent, separate, and aligned to the ground')
