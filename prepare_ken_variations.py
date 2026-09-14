"""Pack authored attack variations and contact/passing walk poses."""
import json,re
from pathlib import Path
from PIL import Image
from prepare_player_animation import extract
ROOT=Path(__file__).resolve().parent
out=ROOT/'assets/sprites/ken-v3';out.mkdir(exist_ok=True)
base=Path('/Users/richardwong/.codex/generated_images/01a083a6-ca57-7c23-825e-e4e9ef8743f9')
def group(filename,columns,count,dest):
 source=out/dest
 frames=extract(source if source.exists() else base/filename,columns,out/('packed-'+dest),count)
 if not source.exists():source.write_bytes((out/('packed-'+dest)).read_bytes())
 scale=240/frames[0][0].height
 return [(f.resize((round(f.width*scale),round(f.height*scale)),Image.Resampling.LANCZOS),a*scale) for f,a in frames]
a=group('exec-cdc49a14-abb7-4362-a12e-a4d3e34049da.png',6,30,'attacks-source.png')
w=group('exec-395cfd16-6d19-4c4c-9da1-e32aa43814e7.png',4,4,'walk-source.png')
frames=a+w
cw=max(round(2*max(anchor,f.width-anchor))+16 for f,anchor in frames);ch=max(f.height for f,anchor in frames)+16
atlas=Image.new('RGBA',(cw*6,ch*6))
for i,(f,anchor) in enumerate(frames):atlas.alpha_composite(f,(round(i%6*cw+cw/2-anchor),(i//6+1)*ch-8-f.height))
atlas.save(out/'actions.png')
seq={'walk':[30,0,31,2,32,3,33,5], 'punch_high':list(range(6,12)),'punch_low':list(range(12,18)), 'kick_high':list(range(18,24)),'kick_low':list(range(24,30))}
updates={'ken_'+state:{'sheet':'assets/sprites/ken-v3/actions.png','regions':[[i%6*cw,i//6*ch,cw,ch] for i in ids],'anchors':[i%6*cw+cw/2 for i in ids],'scale':176/240,'dw':round(cw*176/240),'dh':176} for state,ids in seq.items()}
for p in [ROOT/'index.html',ROOT/'assets/sprites/manifest.json',ROOT/'assets/sprites/sprites.js',ROOT/'assets/sprites/player-animations.js']:
 raw=p.read_text();pattern=r'window\.(?:SPRITE_MANIFEST|PLAYER_ANIMATIONS)\s*=\s*(\{.*?\});';m=re.search(pattern,raw,re.S) if p.suffix!='.json' else None
 data=json.loads(m[1] if m else raw);target=data.get('sprites',data);target.update(updates)
 p.write_text(raw[:m.start(1)]+json.dumps(data,separators=(',',':'))+raw[m.end(1):] if m else json.dumps(data,indent=2)+'\n')
