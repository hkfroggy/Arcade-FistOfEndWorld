"""Pack Rei/Toki walking and attack variations; preserve portraits and legacy actions."""
import json,re,sys
from pathlib import Path
import numpy as np
from PIL import Image
from prepare_player_animation import extract
root=Path(__file__).resolve().parent
hero=sys.argv[1];assert hero in ('rei','toki')
out=root/f'assets/sprites/{hero}-v4';out.mkdir(exist_ok=True)
source=Path(sys.argv[2]) if len(sys.argv)>2 else out/'source.png'
frames=extract(source,6,out/'packed-source.png',36)
(out/'source.png').write_bytes((out/'packed-source.png').read_bytes())
scale=240/frames[0][0].height
packed=[]
for i,(f,anchor) in enumerate(frames):
 if i<12:
  band=np.asarray(f)[:,:,3][round(f.height*.43):round(f.height*.53)]>8
  centers=[(np.flatnonzero(row)[0]+np.flatnonzero(row)[-1])/2 for row in band if row.any()]
  anchor=float(np.median(centers))
 packed.append((f.resize((round(f.width*scale),round(f.height*scale)),Image.Resampling.LANCZOS),anchor*scale))
cw=max(round(2*max(a,f.width-a))+16 for f,a in packed);ch=max(f.height for f,a in packed)+16
im=Image.new('RGBA',(cw*6,ch*6))
for i,(f,a) in enumerate(packed):im.alpha_composite(f,(round(i%6*cw+cw/2-a),(i//6+1)*ch-8-f.height))
im.save(out/'actions.png')
sequences={'walk':list(range(12)),'punch_high':list(range(12,18)),'punch_low':list(range(18,24)),'kick_high':list(range(24,30)),'kick_low':list(range(30,36))}
updates={hero+'_'+state:{'sheet':f'assets/sprites/{hero}-v4/actions.png','regions':[[i%6*cw,i//6*ch,cw,ch] for i in seq],'anchors':[i%6*cw+cw/2 for i in seq],'scale':176/240,'dw':round(cw*176/240),'dh':176} for state,seq in sequences.items()}
for p in [root/'index.html',root/'assets/sprites/manifest.json',root/'assets/sprites/sprites.js',root/'assets/sprites/player-animations.js']:
 raw=p.read_text();m=re.search(r'window\.(?:SPRITE_MANIFEST|PLAYER_ANIMATIONS)\s*=\s*(\{.*?\});',raw,re.S) if p.suffix!='.json' else None
 data=json.loads(m[1] if m else raw);data.get('sprites',data).update(updates)
 p.write_text(raw[:m.start(1)]+json.dumps(data,separators=(',',':'))+raw[m.end(1):] if m else json.dumps(data,indent=2)+'\n')
print(hero,': 12 walking frames and four 6-frame variations packed')
