// Locally generated with ComfyUI audio_stable_audio. No runtime server dependency.
const KEN_ACTION_AUDIO=(()=>{
 const core=['swish','punch','kick','jump','down','charge','release'];
 const extra=['block','wood','metal','glass','shotgun','knife','whip','spear','step','takeoff','landing','dash','spin','rei','toki','death','explosion'];
 const rei=['hand','palm','kick','chop','net','rise','dive','land','charge','release'].map(n=>'rei-'+n);
 const completion=['toki-palm','toki-swish','toki-kick','toki-charge','reload','getup','pickup','recover','heavy-hit','cursor','confirm','join'];
 const names=[...core,...extra,...rei,...completion];
 const voices=[];
 const bytes={},buffers={},last=new Map();let loading=null,bus=null;
 const downloads=Promise.all(names.map(async name=>{
  try{const response=await fetch(`assets/audio/${completion.includes(name)?'completion-stable-audio':name.startsWith('rei-')?'rei-stable-audio':core.includes(name)?'ken-stable-audio':'actions-stable-audio'}/${name}.wav`);if(response.ok)bytes[name]=await response.arrayBuffer();}catch{}
 }));
 async function warm(){
  try{
   const context=audio();if(context.state==='suspended')await context.resume();
   if(!loading)loading=downloads.then(()=>Promise.all(names.map(async name=>{
    if(bytes[name])try{buffers[name]=await context.decodeAudioData(bytes[name].slice(0));}catch{}
   })));
   await loading;
  }catch{}
 }
 window.addEventListener('keydown',warm);window.addEventListener('pointerdown',warm);
 function play(kind){
  const name=names.includes(kind)?kind:kind.endsWith('-swish')?'swish':kind;
  if(!buffers[name]){warm();return false;}
  try{
   const context=audio();if(context.state!=='running'){warm();return false;}
   const now=context.currentTime;if(now-(last.get(kind)??-1)<(['step','cursor','getup'].includes(name)?.12:.045))return true;
   if(!bus){bus=context.createDynamicsCompressor();bus.threshold.value=-18;bus.ratio.value=6;bus.connect(context.destination);}
   const source=context.createBufferSource(),gain=context.createGain();source.buffer=buffers[name];
   source.playbackRate.value=kind==='punch-swish'?1.15:kind==='kick-swish'?.85:1;
   gain.gain.value=['step','cursor','getup'].includes(name)?.12:name==='takeoff'||name==='landing'?.22:name==='swish'||name==='rei-hand'?.26:name==='charge'||name==='rei-charge'||name==='rei-rise'?.32:name==='rei-net'||name==='rei-dive'?.4:.5;
   source.connect(gain);gain.connect(bus);source.onended=()=>{source.disconnect();gain.disconnect();const i=voices.indexOf(source);if(i>=0)voices.splice(i,1);};
   if(voices.length>=12){const oldest=voices.shift();oldest.stop();}voices.push(source);
   source.start(now);last.set(kind,now);return true;
  }catch{return false;}
 }
 return {play,warm};
})();
