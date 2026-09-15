const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
assert.match(html,/googletagmanager\.com\/gtag\/js\?id=G-8RVNFE3R2G/,'GA4 tag is loaded on the game page');
assert.match(html,/gtag\('config', 'G-8RVNFE3R2G'\)/,'all environments use the requested stream');
let clock=0,hidden=false;
const events=[],listeners={},documentListeners={};
const window={
  gtag:(...args)=>events.push(args),
  addEventListener:(name,handler)=>{listeners[name]=handler;}
};
const document={
  get hidden(){return hidden;},
  addEventListener:(name,handler)=>{documentListeners[name]=handler;}
};
vm.runInNewContext(fs.readFileSync('analytics.js','utf8'),{
  window,document,performance:{now:()=>clock},Map,Set,Math
});
const analytics=window.GAME_ANALYTICS;
analytics.observe('title');
clock=100;analytics.observe('playing',{mode:'1p',playerCount:1,levelNumber:1,fighter:'Kenshiro'});
clock=5100;hidden=true;documentListeners.visibilitychange();
clock=15100;hidden=false;documentListeners.visibilitychange();
clock=18100;analytics.observe('levelclear',{levelNumber:1});
clock=20000;analytics.observe('playing',{mode:'1p',playerCount:1,levelNumber:2,fighter:'Kenshiro'});
clock=22000;analytics.observe('victory',{levelNumber:9});
const starts=events.filter(([,name])=>name==='game_start');
const endings=events.filter(([,name])=>name==='game_end');
assert.equal(starts.length,1,'one game_start is emitted for the full run');
assert.deepEqual(JSON.parse(JSON.stringify(starts[0][2])),{send_to:'G-8RVNFE3R2G',game_mode:'1p',player_count:1,level_number:1,fighter:'Kenshiro'});
assert.equal(endings.length,1);
assert.equal(endings[0][2].game_result,'victory');
assert.equal(endings[0][2].final_level_number,9);
assert.equal(endings[0][2].play_time_seconds,10,'hidden and inter-stage time is excluded');
clock=23000;analytics.observe('playing',{mode:'2p',playerCount:2,levelNumber:1,fighter:'Rei'});
clock=25000;listeners.pagehide();
assert.equal(events.filter(([,name])=>name==='game_start').length,2,'a later run is counted separately');
const exit=events.filter(([,name])=>name==='game_end').at(-1)[2];
assert.equal(exit.game_result,'page_exit');
assert.equal(exit.play_time_seconds,2);
assert.equal(exit.transport_type,'beacon');
console.log('PASS GA4 game starts, results, active play duration, visibility pauses and page exit');
