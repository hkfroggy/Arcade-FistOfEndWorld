"""Pack eight weapon poses per enemy, preserving body scale and source art."""
import sys
from pathlib import Path
from PIL import Image
from prepare_player_animation import extract
name,source=sys.argv[1:]
root=Path(__file__).resolve().parent/'assets/characters'
frames=extract(Path(source),4,root/'sources'/f'{name}-weapon-v1.png',8)
w=max(f.width for f,_ in frames)+16;h=max(f.height for f,_ in frames)+16
atlas=Image.new('RGBA',(w*4,h*2))
for i,(f,_) in enumerate(frames):atlas.alpha_composite(f,(i%4*w+(w-f.width)//2,i//4*h+h-8-f.height))
atlas.save(root/f'{name}-weapon-v1.png')
print(name,w,h)
