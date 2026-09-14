"""Pack native-resolution Ken redraws without reducing their image detail."""
import json,re,sys
from pathlib import Path
from PIL import Image
from prepare_player_animation import extract

root=Path(__file__).resolve().parent
hero=sys.argv[1] if len(sys.argv)>1 else 'ken'
assert hero in ('ken','rei','toki')
out=root/f'assets/sprites/{hero}-hd-v1'
updates={}
sequences={
 'walk':{'walk':list(range(12))},
 'body':{'idle':[0,1,2,3,3,2,1,0],'jump':[4,5,5,6,6,7,7,0],
         'stunned':[8,8,8],'knockdown':[9,10],'getup':[10,11,0],'landing':[7,7,0]},
 'punch':{'punch':[0,0,1,2,2,3,3,0],'punch_high':[4,5,6,6,7,4],
          'punch_low':[8,9,10,10,11,8],'special':[0,1,2,2,3,1,2,0]},
 'kick':{'kick':[0,0,1,2,2,3,3,0],'kick_high':[0,1,2,2,3,0],
         'kick_low':[4,5,6,6,7,4],'jumpkick':[8,9,10,10,11,8]},
}
for sheet,actions in sequences.items():
 frames=extract(out/(sheet+'-source.png'),4,out/(sheet+'-packed-source.png'),12)
 # Each sheet starts with a standing or near-standing pose; airborne kicks use
 # the same reference scale as the grounded kicks in their sheet.
 height=frames[0][0].height
 cw=max(round(2*max(a,f.width-a))+24 for f,a in frames)
 ch=max(f.height for f,a in frames)+24
 atlas=Image.new('RGBA',(cw*4,ch*3))
 for i,(frame,anchor) in enumerate(frames):
  atlas.alpha_composite(frame,(round(i%4*cw+cw/2-anchor),(i//4+1)*ch-8-frame.height))
 atlas.save(out/(sheet+'.png'))
 for action,ids in actions.items():
  updates[hero+'_'+action]={'sheet':f'assets/sprites/{hero}-hd-v1/{sheet}.png',
   'regions':[[i%4*cw,i//4*ch,cw,ch] for i in ids],
   'anchors':[i%4*cw+cw/2 for i in ids],'scale':176/height,'dh':176,'dw':round(cw*176/height)}
for name in ['index.html','assets/sprites/manifest.json','assets/sprites/sprites.js','assets/sprites/player-animations.js']:
 p=root/name;raw=p.read_text()
 m=re.search(r'window\.(?:SPRITE_MANIFEST|PLAYER_ANIMATIONS)\s*=\s*(\{.*?\});',raw,re.S)
 data=json.loads(m[1] if m else raw);data.get('sprites',data).update(updates)
 p.write_text(raw[:m.start(1)]+json.dumps(data,separators=(',',':'))+raw[m.end(1):] if m else json.dumps(data,indent=2)+'\n')
print(hero+' HD: all gameplay states packed at native resolution, 176px display height')
