import sys,json,re
from pathlib import Path
from PIL import Image
import numpy as np
sys.path.insert(0,str(Path.cwd()))
from prepare_player_animation import extract
hero=sys.argv[1]
assert hero in ('ken','rei')
out=Path('assets/sprites')/(hero+'-walk-v3');out.mkdir(exist_ok=True)
frames=extract(Path(sys.argv[2]),4,out/'source.png',8)
w=max(f.width for f,a in frames)+16;h=max(f.height for f,a in frames)+16
sheet=Image.new('RGBA',(w*4,h*2));regions=[];anchors=[]
for i,(f,a) in enumerate(frames):
 x=(i%4)*w;y=(i//4)*h;left=(w-f.width)//2
 sheet.alpha_composite(f,(x+left,y+h-f.height))
 regions.append([x,y,w,h]);
 mask=np.array(f.getchannel('A'))[round(f.height*.45)]>8
 edges=np.flatnonzero(np.diff(np.r_[False,mask,False]));runs=list(zip(edges[::2],edges[1::2]));lo,hi=max(runs,key=lambda r:r[1]-r[0])
 anchors.append(x+left+(lo+hi)/2)
sheet.save(out/'walk.png')
entry={'sheet':str(out/'walk.png'),'regions':regions,'anchors':anchors,'scale':176/max(f.height for f,a in frames),'dh':176,'dw':round(w*176/max(f.height for f,a in frames))}
p=Path('assets/sprites/manifest.json');m=json.loads(p.read_text());m['sprites'][hero+'_walk']=entry;p.write_text(json.dumps(m,indent=2)+'\n')
Path('assets/sprites/sprites.js').write_text('window.SPRITE_MANIFEST = '+json.dumps(m,separators=(',',':'))+';\n')
p=Path('index.html');s=p.read_text();match=re.search(r'window.SPRITE_MANIFEST\s*=\s*(\{.*?\});',s,re.S);inline=json.loads(match[1]);inline['sprites'][hero+'_walk']=entry;s=s[:match.start(1)]+json.dumps(inline,separators=(',',':'))+s[match.end(1):];p.write_text(s)
print(w,h)

p=Path('assets/sprites/player-animations.js')
t=p.read_text();gallery=json.loads(t[t.index('{'):t.rindex('}')+1]);gallery[hero+'_walk']=entry
p.write_text('window.PLAYER_ANIMATIONS = '+json.dumps(gallery,separators=(',',':'))+';\n')
