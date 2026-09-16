// Exercise the production synthesizer with a recording Web Audio mock.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const sources=[],params=[];
const param=()=>({value:0,setValueAtTime(v,t){params.push([v,t]);},linearRampToValueAtTime(v,t){params.push([v,t]);},exponentialRampToValueAtTime(v,t){assert(v>0);params.push([v,t]);}});
const node=()=>({connect(){},disconnect(){this.disconnected=true;},gain:param(),frequency:param(),Q:param(),threshold:param(),ratio:param()});
const source=()=>{const n={...node(),start(t){this.startTime=t;},stop(t){this.stopTime=t;}};sources.push(n);return n;};
const a={currentTime:0,sampleRate:48000,state:'suspended',destination:{},resume(){this.state='running';return Promise.resolve();},createDynamicsCompressor:node,createGain:node,createBiquadFilter:node,createOscillator:source,createBufferSource:source,createBuffer:()=>({getChannelData:()=>new Float32Array(48000)})};
const env={audio:()=>a,Math,Map};vm.createContext(env);
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
vm.runInContext(html.slice(html.indexOf('let sfxBus='),html.indexOf('function sndHit()')),env);
for(const kind of ['punch-swish','kick-swish','jump-swish','punch','kick','jump','block','down','charge','release','wood','metal','glass']){
 a.currentTime+=1;const count=sources.length;env.combatSfx(kind);assert(sources.length>count,kind);
 const after=sources.length;env.combatSfx(kind);assert.equal(sources.length,after,'duplicate burst limited');
 for(const s of sources.slice(count)){assert(s.startTime>=a.currentTime);assert(s.stopTime>s.startTime);s.onended();assert(s.disconnected);}
}
assert.equal(a.state,'running');assert(params.every(values=>values.every(Number.isFinite)));
console.log('PASS All 13 SFX schedule valid layers, resume audio, limit duplicate bursts and release their nodes');
