"""Stage the static game for Sites; exclude offline art-generation inputs."""
from pathlib import Path
import shutil
root=Path(__file__).resolve().parent
out=root/'dist'
if out.exists(): shutil.rmtree(out)
out.mkdir()
for pattern in ('*.html','*.js','*.css'):
 for source in root.glob(pattern): shutil.copy2(source,out/source.name)
def ignore(path,names):
 return [n for n in names if n in ('sources','source.png','packed-source.png','.DS_Store') or n.endswith(('.md','.py'))]
shutil.copytree(root/'assets',out/'assets',ignore=ignore)
print('Static game staged in dist')
# WebP keeps the hosted download small while preserving the original PNG artwork.
from PIL import Image
import json
for source in list(out.rglob('*.png')):
 with Image.open(source) as img:
  fighter=source.relative_to(out).as_posix().startswith(('assets/sprites/ken','assets/sprites/rei','assets/sprites/toki'))
  img.save(source.with_suffix('.webp'),'WEBP',lossless=fighter,quality=92,method=4)
 source.unlink()
for source in out.rglob('*'):
 if source.suffix in ('.html','.js','.json'):
  source.write_text(source.read_text().replace('.png','.webp'))
print('Hosted artwork optimized as WebP; local originals unchanged')
