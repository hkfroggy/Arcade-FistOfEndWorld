const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const events={},visibility={};let player;
class AudioMock{
 constructor(){player=this;this.paused=true;this.events={};this.calls=0;}
 addEventListener(k,fn){this.events[k]=fn;}
 play(){this.calls++;this.paused=false;return Promise.resolve();}
 pause(){this.paused=true;}
}
const document={hidden:false,addEventListener:(k,fn)=>visibility[k]=fn};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../music.js'),'utf8'),{Audio:AudioMock,Promise,window:{addEventListener:(k,fn)=>events[k]=fn},document});
(async()=>{
 assert.equal(player.volume,.5);assert.equal(player.calls,0);
 events.keydown();events.pointerdown();await new Promise(setImmediate);assert.equal(player.calls,1);
 player.paused=true;player.events.ended();await new Promise(setImmediate);assert(player.src.endsWith('steel-2.mp3'));
 player.paused=true;player.events.ended();await new Promise(setImmediate);assert(player.src.endsWith('steel.mp3'));
 document.hidden=true;visibility.visibilitychange();assert(player.paused);
 document.hidden=false;visibility.visibilitychange();await new Promise(setImmediate);assert(!player.paused);
 for(const file of ['ashes-under-steel.mp3','ashes-under-steel-2.mp3'])assert(fs.statSync(path.join(__dirname,'../assets/music',file)).size>1000000);
 console.log('PASS Music starts on input, stays at 50%, alternates and loops both tracks, and pauses when hidden');
})().catch(e=>{console.error(e);process.exitCode=1;});
