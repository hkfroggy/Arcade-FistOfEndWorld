"""Pack imagegen knockdown sheets: one character per row, four stages per row.
Usage: python3 prepare_knockdown_art.py SOURCE NAME [NAME ...]
Preserves source art, alpha, relative pose scale and a shared ground baseline.
"""
import json,sys
from pathlib import Path
from PIL import Image
from prepare_player_animation import extract
ROOT=Path(__file__).resolve().parent
source=Path(sys.argv[1]);names=sys.argv[2:]
out=ROOT/'assets/characters/knockdown-v1';out.mkdir(exist_ok=True)
source_dir=ROOT/'assets/characters/sources';source_dir.mkdir(exist_ok=True)
frames=extract(source,4,source_dir/('down-'+names[0]+'.png'),len(names)*4)
manifest_path=out/'manifest.json'
meta=json.loads(manifest_path.read_text()) if manifest_path.exists() else {}
for row,name in enumerate(names):
 poses=[f for f,a in frames[row*4:row*4+4]]
 w=max(f.width for f in poses)+16;h=max(f.height for f in poses)+16
 atlas=Image.new('RGBA',(w*4,h))
 for i,f in enumerate(poses):atlas.alpha_composite(f,(i*w+(w-f.width)//2,h-8-f.height))
 atlas.save(out/(name+'.png'))
 meta[name]={'path':f'assets/characters/knockdown-v1/{name}.png','cellW':w,'cellH':h,'referenceHeight':round(poses[0].height/.90,3),'poses':4}
 print(name,w,h)
manifest_path.write_text(json.dumps(meta,indent=2)+'\n')
(out/'manifest.js').write_text('window.KNOCKDOWN_ART='+json.dumps(meta,separators=(',',':'))+';\n')
