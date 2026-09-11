"""Pack 12-frame movement/action references without changing earlier artwork.
Usage: python3 prepare_player_animation.py HERO MOVEMENT COMBAT [COMBAT_COLUMNS]
"""
import json
import re
import shutil
import sys
from pathlib import Path
import numpy as np
from PIL import Image
from prepare_character_art import components

ROOT=Path(__file__).resolve().parent

def extract(source, columns, dest, count_frames=12):
    shutil.copyfile(source,dest)
    im=Image.open(source).convert('RGBA');data=np.array(im)
    rgb=data[:,:,:3].astype(int)
    green=(rgb[:,:,1]>rgb[:,:,0]+40)&(rgb[:,:,1]>rgb[:,:,2]+40)
    if np.mean(green)>.15:
        data[green,3]=0
    elif np.mean(data[:,:,3]<8)<.15:
        rgb=data[:,:,:3].astype(int)
        bg=(rgb.min(axis=2)>222)&(np.ptp(rgb,axis=2)<16)
        # Extract the two neutral checker colors from the empty top-left area.
        patch=rgb[:8,:40].reshape(-1,3);colors,freq=np.unique(patch,axis=0,return_counts=True)
        for color in colors[np.argsort(freq)[-2:]]:
            if np.ptp(color)<8:bg|=(np.max(np.abs(rgb-color),axis=2)<5)
        if np.median(patch)<220:
            bg|=(np.ptp(rgb,axis=2)<12)&(rgb.min(axis=2)>110)&(rgb.max(axis=2)<218)
        labels,_=components(bg)
        border=np.unique(np.concatenate([labels[0],labels[-1],labels[:,0],labels[:,-1]]))
        data[np.isin(labels,border[border!=0]),3]=0
    labels,count=components(data[:,:,3]>8)
    sizes=np.bincount(labels.ravel());yy,xx=np.indices(labels.shape)
    cy=np.bincount(labels.ravel(),weights=yy.ravel())/np.maximum(sizes,1)
    cx=np.bincount(labels.ravel(),weights=xx.ravel())/np.maximum(sizes,1)
    main=sorted(range(1,count+1),key=lambda i:sizes[i],reverse=True)[:count_frames]
    if len(main)!=count_frames or min(sizes[i] for i in main)<1500:raise ValueError('Need complete figures')
    rows=sorted(main,key=lambda i:cy[i]);order=[]
    for row in range(0,count_frames,columns):order+=sorted(rows[row:row+columns],key=lambda i:cx[i])
    owner=np.zeros(count+1,dtype=np.int32)
    # Keep the twelve/sixteen connected full-body silhouettes; discard floating
    # checkerboard residue, not reassign it to the nearest fighter.
    for i in main:owner[i]=i
    assigned=owner[labels];frames=[]
    for i in order:
        mask=assigned==i;y,x=np.where(mask);box=(x.min(),y.min(),x.max()+1,y.max()+1)
        pixels=data.copy();pixels[:,:,3]=np.where(mask,data[:,:,3],0)
        frame=Image.fromarray(pixels).crop(box)
        fy,fx=np.where(mask&(yy>=box[3]-max(15,frame.height*.1)))
        anchor=(fx.min()+fx.max())/2-box[0]
        frames.append((frame,anchor))
    return frames

def main(hero,movement,combat,cols='3'):
    if hero not in ('rei','toki'):raise ValueError(hero)
    dest=ROOT/'assets/sprites'/f'{hero}-v3';dest.mkdir(exist_ok=True)
    groups=[extract(movement,4,dest/'movement-source.png'),extract(combat,int(cols),dest/'combat-source.png',16 if hero=='toki' else 12)]
    if hero=='toki':groups[1]=[groups[1][i] for i in [0,1,2,3,4,5,8,9,10,12,14,15]]
    frames=[]
    for group in groups:
        scale=240/group[0][0].height
        for frame,anchor in group:
            frames.append((frame.resize((round(frame.width*scale),round(frame.height*scale)),Image.Resampling.LANCZOS),anchor*scale))
    cw=max(round(2*max(a,f.width-a))+12 for f,a in frames);ch=max(f.height for f,a in frames)+12
    atlas=Image.new('RGBA',(cw*4,ch*6))
    for i,(f,a) in enumerate(frames):atlas.alpha_composite(f,(round((i%4)*cw+cw/2-a),(i//4+1)*ch-4-f.height))
    atlas.save(dest/'actions.png',optimize=True)
    sequences={'idle':[0,1,0,1], 'walk':[2,3,4,5,6,7], 'jump':[8,9,10,10,11,8],
       'punch':[0,12,13,13,14,0], 'kick':[0,15,16,16,17,0],
       'jumpkick':[9,18,19,19,20,11], 'special':[21,21,22,22,23,0]}
    updates={hero+'_'+state:{'sheet':f'assets/sprites/{hero}-v3/actions.png',
      'regions':[[(i%4)*cw,(i//4)*ch,cw,ch] for i in seq],
      'anchors':[(i%4)*cw+cw/2 for i in seq],'scale':176/240,'dw':round(cw*176/240),'dh':176} for state,seq in sequences.items()}
    updates['ken_jumpkick']={'sheet':'assets/sprites/ken_S2.png',
      'regions':[[337,48,178,263],[338,427,149,225],[541,390,206,168],[778,401,241,230],[775,25,201,247],[1273,156,181,174]],
      'anchors':[430,420,620,870,865,1360],'scale':182/256,'dw':122,'dh':182}
    pattern=r'window\.SPRITE_MANIFEST\s*=\s*(\{.*?\});'
    for path in [ROOT/'index.html',ROOT/'assets/sprites/manifest.json',ROOT/'assets/sprites/sprites.js']:
        raw=path.read_text();match=re.search(pattern,raw,re.S) if path.suffix!='json' else None
        if path.suffix=='.json':data=json.loads(raw)
        else:data=json.loads(match.group(1))
        data['sprites'].update(updates)
        if path.suffix=='.json':path.write_text(json.dumps(data,indent=2)+'\n')
        else:path.write_text(raw[:match.start(1)]+json.dumps(data,separators=(',',':'))+raw[match.end(1):])
    html=(ROOT/'index.html').read_text()
    def table(name):
        raw=re.search(r'const '+name+r' = (\{.*?\});',html,re.S).group(1)
        raw=re.sub(r'(\w+)\s*:',r'"\1":',raw)
        return json.loads(re.sub(r',\s*}', '}', raw))
    regions,anchors=table('KEN_REGIONS'),table('KEN_ANCHORS')
    preview={k:v for k,v in data['sprites'].items() if k.startswith(('ken_','rei_','toki_'))}
    for key,rects in regions.items():
        if preview[key].get('regions'):continue
        preview[key]={**preview[key],'regions':rects,'anchors':anchors[key],'scale':182/256}
    (ROOT/'assets/sprites/player-animations.js').write_text('window.PLAYER_ANIMATIONS = '+json.dumps(preview)+';\n')
    print(f'{hero}: 24 new poses, seven animation sequences, cells {cw} x {ch}')

if __name__=='__main__':main(*sys.argv[1:])
