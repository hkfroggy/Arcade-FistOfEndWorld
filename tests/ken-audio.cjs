const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),names=['swish','punch','kick','jump','down','charge','release'];
const extra=['block','wood','metal','glass','shotgun','knife','whip','spear','step','takeoff','landing','dash','spin','rei','toki','death','explosion'];
const rei=['hand','palm','kick','chop','net','rise','dive','land','charge','release'].map(n=>'rei-'+n);
const completion=['toki-palm','toki-swish','toki-kick','toki-charge','reload','getup','pickup','recover','heavy-hit','cursor','confirm','join'];
const all=[...names,...extra,...rei,...completion];
let starts=0,active=0,maxActive=0;const nodes=[];
const node=()=>({connect(){},disconnect(){},threshold:{},ratio:{},gain:{},playbackRate:{},start(){starts++;active++;maxActive=Math.max(maxActive,active);},stop(){active--;this.onended?.();}});
const context={state:'running',currentTime:1,destination:{},createDynamicsCompressor:node,createGain:node,createBufferSource(){const n=node();nodes.push(n);return n;},decodeAudioData:async bytes=>({length:bytes.byteLength})};
const env={console,Map,audio:()=>context,window:{addEventListener(){}},fetch:async url=>({ok:true,arrayBuffer:async()=>{const b=fs.readFileSync(path.join(root,url));return b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength);}})};
vm.createContext(env);vm.runInContext(fs.readFileSync(path.join(root,'ken-audio.js'),'utf8'),env);
(async()=>{
 assert.equal(vm.runInContext("KEN_ACTION_AUDIO.play('punch')",env),false);
 await vm.runInContext('KEN_ACTION_AUDIO.warm()',env);
 for(const name of all){
  const bytes=fs.readFileSync(path.join(root,`assets/audio/${completion.includes(name)?'completion-stable-audio':name.startsWith('rei-')?'rei-stable-audio':names.includes(name)?'ken-stable-audio':'actions-stable-audio'}/${name}.wav`));
  assert.equal(bytes.toString('ascii',0,4),'RIFF');assert(bytes.length>4000);
  context.currentTime++;
  assert(vm.runInContext(`KEN_ACTION_AUDIO.play('${name}')`,env));
  const count=starts;assert(vm.runInContext(`KEN_ACTION_AUDIO.play('${name}')`,env));assert.equal(starts,count);
 }
 assert.equal(starts,46);assert.equal(maxActive,12);
 context.currentTime++;vm.runInContext("KEN_ACTION_AUDIO.play('kick-swish')",env);assert.equal(nodes.at(-1).playbackRate.value,.85);
 context.state='suspended';assert.equal(vm.runInContext("KEN_ACTION_AUDIO.play('punch')",env),false);
 console.log('PASS All 46 generated action audio files load, decode, play, limit repeats and fall back before readiness');
})().catch(e=>{console.error(e);process.exitCode=1;});
