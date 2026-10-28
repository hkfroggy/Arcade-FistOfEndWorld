"""Trim local Stable Audio outputs into responsive, peak-limited game effects."""
from pathlib import Path
import subprocess,wave,json
import numpy as np
root=Path(__file__).resolve().parents[1]/'assets/audio/actions-stable-audio'
report={}
for name,duration in {'block':.4,'wood':.5,'metal':.6,'glass':.6,'shotgun':.45,'knife':.35,'whip':.25,'spear':.28,'step':.18,'takeoff':.25,'landing':.3,'dash':.4,'spin':.65,'rei':.65,'toki':.65,'death':.65,'explosion':.7}.items():
    source=next((root/'sources').glob('action-'+name+'_*.flac'))
    cmd=['ffmpeg','-v','error','-i',str(source)]
    if name=='charge':cmd+=['-af','atempo=2,atempo=2,atempo=1.25']
    raw=subprocess.check_output(cmd+['-f','f32le','-ac','1','-ar','44100','pipe:1'])
    data=np.frombuffer(raw,dtype='<f4').copy();sr=44100
    peak=float(np.max(np.abs(data)));assert peak>.0001,(name,'silent generation')
    # First audible onset, with a tiny pre-roll; avoid delayed responses.
    window=220;energy=np.sqrt(np.mean(data[:len(data)//window*window].reshape(-1,window)**2,axis=1))
    start=max(0,int(np.flatnonzero(energy>energy.max()*.12)[0])*window-220)
    data=data[start:start+round(duration*sr)].copy()
    data-=data.mean();data*=.75/max(float(np.max(np.abs(data))),.001)
    fade=min(len(data)//2,round(.025*sr));data[-fade:]*=np.linspace(1,0,fade)
    data[:88]*=np.linspace(0,1,88)
    with wave.open(str(root/(name+'.wav')),'wb') as f:
        f.setnchannels(1);f.setsampwidth(2);f.setframerate(sr);f.writeframes((data*32767).astype('<i2').tobytes())
    report[name]={'source':source.name,'trimStart':round(start/sr,4),'duration':round(len(data)/sr,4),'peak':round(float(np.max(np.abs(data))),4)}
(root/'processing.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
