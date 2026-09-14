"""Validate Ken's expanded atlas, manifest agreement and stable foot baseline."""
import json,re
from pathlib import Path
import numpy as np
from PIL import Image
root=Path(__file__).resolve().parent.parent
manifest=json.loads((root/'assets/sprites/manifest.json').read_text())['sprites']
inline=json.loads(re.search(r'window.SPRITE_MANIFEST = (\{.*?\});',(root/'index.html').read_text(),re.S)[1])['sprites']
preview=json.loads((root/'assets/sprites/player-animations.js').read_text().split('=',1)[1].strip().rstrip(';'))
for action,count in {'idle':8,'walk':12,'punch':8,'kick':8,'jump':8,'special':8,'stunned':3,'knockdown':2,'getup':3,'landing':3,'punch_high':6,'punch_low':6,'kick_high':6,'kick_low':6}.items():
 key='ken_'+action;s=manifest[key];assert s==inline[key]==preview[key];assert len(s['regions'])==count
 im=Image.open(root/s['sheet']);assert im.mode=='RGBA'
 for x,y,w,h in s['regions']:
  assert x>=0 and y>=0 and x+w<=im.width and y+h<=im.height
  a=np.array(im.crop((x,y,x+w,y+h)));mask=a[:,:,3]>8
  assert mask.sum()>1500 and np.mean(~mask)>.35
  assert not mask[0].any() and not mask[-1].any() and not mask[:,0].any() and not mask[:,-1].any()
  assert np.where(mask)[0].max()>=h-10
assert (manifest['ken_kick']['sheet'],manifest['ken_kick']['regions'])!=(manifest['ken_jumpkick']['sheet'],manifest['ken_jumpkick']['regions'])
assert all(manifest['ken_'+action]['dh']==176 for action in ['idle','walk','punch','kick','jumpkick'])
print('PASS Ken expanded atlas: matching manifests, complete transparent frames, grounded anchors and distinct aerial kick')
