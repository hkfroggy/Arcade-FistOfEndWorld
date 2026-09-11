"""Pack the twelve-frame walking cycle and synchronize its manifests."""
import json,re,sys
import numpy as np
from pathlib import Path
from PIL import Image
from prepare_player_animation import extract
root=Path(__file__).resolve().parent;out=root/'assets/sprites/ken-walk-v4'
source=Path(sys.argv[1]) if len(sys.argv)>1 else out/'source.png'
frames=extract(source,6,out/'packed-source.png',12)
(out/'source.png').write_bytes((out/'packed-source.png').read_bytes())
# Feet spread and cross during walking; anchoring to their midpoint makes the
# pelvis jump sideways. Align the belt/hip band instead, retaining foot baselines.
stable=[]
for f,_ in frames:
    alpha=np.asarray(f)[:,:,3]
    band=alpha[round(f.height*.43):round(f.height*.53)]>8
    centers=[]
    for row in band:
        xs=np.flatnonzero(row)
        if len(xs):centers.append((xs[0]+xs[-1])/2)
    stable.append((f,float(np.median(centers))))
frames=stable
k=240/frames[0][0].height
frames=[(f.resize((round(f.width*k),round(f.height*k)),Image.Resampling.LANCZOS),a*k) for f,a in frames]
cw=max(round(2*max(a,f.width-a))+16 for f,a in frames);ch=max(f.height for f,a in frames)+16
im=Image.new('RGBA',(cw*6,ch*2))
for i,(f,a) in enumerate(frames):im.alpha_composite(f,(round(i%6*cw+cw/2-a),(i//6+1)*ch-8-f.height))
im.save(out/'actions.png')
s={'sheet':'assets/sprites/ken-walk-v4/actions.png','regions':[[i%6*cw,i//6*ch,cw,ch] for i in range(12)],'anchors':[i%6*cw+cw/2 for i in range(12)],'scale':182/240,'dw':round(cw*182/240),'dh':182}
for p in [root/'index.html',root/'assets/sprites/manifest.json',root/'assets/sprites/sprites.js',root/'assets/sprites/player-animations.js']:
 raw=p.read_text();m=re.search(r'window\.(?:SPRITE_MANIFEST|PLAYER_ANIMATIONS)\s*=\s*(\{.*?\});',raw,re.S) if p.suffix!='.json' else None
 data=json.loads(m[1] if m else raw);data.get('sprites',data)['ken_walk']=s
 p.write_text(raw[:m.start(1)]+json.dumps(data,separators=(',',':'))+raw[m.end(1):] if m else json.dumps(data,indent=2)+'\n')
