"""Stage the static game for Sites; exclude offline art-generation inputs."""
from pathlib import Path
import shutil
root=Path(__file__).resolve().parent
out=root/'dist'
if out.exists(): shutil.rmtree(out)
out.mkdir()
for pattern in ('*.html','*.js'):
 for source in root.glob(pattern): shutil.copy2(source,out/source.name)
def ignore(path,names):
 return [n for n in names if n in ('sources','source.png','packed-source.png','.DS_Store') or n.endswith(('.md','.py'))]
shutil.copytree(root/'assets',out/'assets',ignore=ignore)
print('Static game staged in dist')
