"""Extract the new Spade/Heart showcase art without altering combat sprites."""
import json
from pathlib import Path
from prepare_player_animation import extract
root=Path(__file__).resolve().parent
out=root/'assets/characters/sources';out.mkdir(exist_ok=True)
source=out/'spade-heart-showcase.png'
original=Path('/Users/richardwong/.codex/generated_images/01a083a6-ca57-7c23-825e-e4e9ef8743f9/exec-9bc9ffc4-f39a-4a0a-915a-c74bb4b76933.png')
frames=extract(source if source.exists() else original,2,out/'spade-heart-packed.png',2)
if not source.exists():source.write_bytes((out/'spade-heart-packed.png').read_bytes())
updates={}
for name,(im,anchor) in zip(['spade','heart'],frames):
 path=root/f'assets/characters/{name}-showcase.png';im.save(path)
 updates[name+'-showcase']={'path':str(path.relative_to(root)),'cellW':im.width,'cellH':im.height,'height':220,'poses':1}
for path in [root/'assets/characters/manifest.json',root/'assets/characters/manifest.js']:
 raw=path.read_text();data=json.loads(raw if path.suffix=='.json' else raw.split('=',1)[1].strip().rstrip(';'));data.update(updates)
 path.write_text(('window.CHARACTER_ART = ' if path.suffix=='.js' else '')+json.dumps(data,indent=2)+(';' if path.suffix=='.js' else '')+'\n')
