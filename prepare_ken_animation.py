"""Pack Ken's generated poses and synchronize game/preview manifests.
Usage: python3 prepare_ken_animation.py path/to/generated-sheet.png
"""
import json,re,sys
from pathlib import Path
from PIL import Image
from prepare_player_animation import extract
ROOT=Path(__file__).resolve().parent
out=ROOT/'assets/sprites/ken-v2';out.mkdir(exist_ok=True)
source=Path(sys.argv[1]) if len(sys.argv)>1 else out/'source.png'
# extract copies its source; keep a separate extraction destination on rebuild.
frames=extract(source,8,out/'packed-source.png',56)
scale=240/frames[0][0].height
frames=[(f.resize((round(f.width*scale),round(f.height*scale)),Image.Resampling.LANCZOS),a*scale) for f,a in frames]
cw=max(round(2*max(a,f.width-a))+16 for f,a in frames);ch=max(f.height for f,a in frames)+16
atlas=Image.new('RGBA',(cw*8,ch*7))
for i,(f,a) in enumerate(frames):atlas.alpha_composite(f,(round(i%8*cw+cw/2-a),(i//8+1)*ch-8-f.height))
atlas.save(out/'actions.png',optimize=True)
seq={'idle':list(range(8)),'walk':list(range(8,16)),
'punch':[16,17,18,19,20,21,22,23],
'kick':[24,25,26,28,28,29,30,31],
'jump':list(range(32,40)),'special':list(range(40,48)),
'stunned':[48,49,50],'knockdown':[51,52],'getup':[53,54,55],'landing':[38,39,0]}
updates={'ken_'+state:{'sheet':'assets/sprites/ken-v2/actions.png','regions':[[i%8*cw,i//8*ch,cw,ch] for i in ids],
'anchors':[i%8*cw+cw/2 for i in ids],'scale':182/240,'dw':round(cw*182/240),'dh':182} for state,ids in seq.items()}
pattern=r'window\.SPRITE_MANIFEST\s*=\s*(\{.*?\});'
for p in [ROOT/'index.html',ROOT/'assets/sprites/manifest.json',ROOT/'assets/sprites/sprites.js']:
 raw=p.read_text();m=re.search(pattern,raw,re.S) if p.suffix!='.json' else None
 data=json.loads(m.group(1) if m else raw);data['sprites'].update(updates)
 p.write_text(raw[:m.start(1)]+json.dumps(data,separators=(',',':'))+raw[m.end(1):] if m else json.dumps(data,indent=2)+'\n')
p=ROOT/'assets/sprites/player-animations.js';raw=p.read_text();data=json.loads(raw.split('=',1)[1].strip().rstrip(';'));data.update(updates);p.write_text('window.PLAYER_ANIMATIONS = '+json.dumps(data)+';\n')
print('Packed 56 authored poses; preserved original aerial kick. Cell:',cw,ch)
