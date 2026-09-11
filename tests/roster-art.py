"""Validate Rei and Toki's expanded atlases, manifest agreement and stable foot baseline."""
import json,re
from pathlib import Path
import numpy as np
from PIL import Image
root=Path(__file__).resolve().parent.parent
manifest=json.loads((root/'assets/sprites/manifest.json').read_text())['sprites']
inline=json.loads(re.search(r'window.SPRITE_MANIFEST = (\{.*?\});',(root/'index.html').read_text(),re.S)[1])['sprites']
preview=json.loads((root/'assets/sprites/player-animations.js').read_text().split('=',1)[1].strip().rstrip(';'))
for hero in ('rei','toki'):
 for action,count in {'walk':12,'punch_high':6,'punch_low':6,'kick_high':6,'kick_low':6}.items():
  key=hero+'_'+action;s=manifest[key];assert s==inline[key]==preview[key];assert len(s['regions'])==count
  im=Image.open(root/s['sheet']);assert im.mode=='RGBA'
  for x,y,w,h in s['regions']:
   assert x>=0 and y>=0 and x+w<=im.width and y+h<=im.height
   a=np.array(im.crop((x,y,x+w,y+h)));mask=a[:,:,3]>8
   assert mask.sum()>1500 and np.mean(~mask)>.35
   assert not mask[0].any() and not mask[-1].any() and not mask[:,0].any() and not mask[:,-1].any()
   assert np.where(mask)[0].max()>=h-10
 assert manifest[hero+'_idle']['sheet'].startswith('assets/sprites/'+hero+'-v3/')
 assert manifest[hero+'_jumpkick']['sheet']!=manifest[hero+'_kick_high']['sheet']
print('PASS Rei/Toki atlases: manifest agreement, frame counts, transparency, baseline and preserved portraits/aerial kicks')
