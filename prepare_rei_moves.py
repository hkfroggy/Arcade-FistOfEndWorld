"""Pack Rei's twelve special-move silhouettes while preserving their body scale."""
import json
import sys
from pathlib import Path
from PIL import Image
from prepare_player_animation import extract

root=Path(__file__).resolve().parent/'assets/sprites/rei-moves-v1'
root.mkdir(exist_ok=True)
frames=extract(Path(sys.argv[1]),4,root/'source.png')
w=max(frame.width for frame,_ in frames)+24
h=max(frame.height for frame,_ in frames)+16
atlas=Image.new('RGBA',(w*4,h*3))
for i,(frame,_) in enumerate(frames):
    atlas.alpha_composite(frame,(i%4*w+(w-frame.width)//2,i//4*h+h-8-frame.height))
atlas.save(root/'moves.png')
geometry={'w':w,'h':h,'scale':176/frames[0][0].height}
(root/'geometry.json').write_text(json.dumps(geometry,indent=2)+'\n')
print(geometry)
