// Run with node tests/campaign.cjs. Uses the production campaign and game logic.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const noop=()=>{},storage=new Map();
const ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop}),measureText:()=>({width:10})},{get:(o,k)=>k in o?o[k]:noop});
const canvas={getContext:()=>ctx,style:{},addEventListener:noop};
const env={console,Math,Uint8Array,Set,performance:{now:()=>0},window:{addEventListener:noop},
  document:{getElementById:()=>canvas,createElement:()=>canvas},navigator:{},Image:class{},
  requestAnimationFrame:noop,setTimeout:noop,assert,
  localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)}};
vm.createContext(env);
vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../arcade.js'),'utf8'),env);
for(const file of ['i18n.js','i18n-story.js'])vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../'+file),'utf8'),env);
vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../opening.js'),'utf8'),env);
vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../fighter-select.js'),'utf8'),env);
const root=path.join(__dirname,'..');
vm.runInContext(fs.readFileSync(path.join(root,'campaign.js'),'utf8'),env);
vm.runInContext(fs.readFileSync(path.join(root,'index.html'),'utf8').split('<script>').at(-1).split('</script>')[0],env);
let count=0;
function test(name,body){vm.runInContext(`resetCampaign();GS.mode='1p';P1.inactive=false;P1.lives=3;P1.hp=100;P2.inactive=true;startLevel(0);{${body}}`,env);console.log('PASS',name);count++;}
test('Exact nine-stage order, bounded routes and registered enemy/boss roles',`
 assert.equal(LEVELS.length,9);
 assert.equal(LEVELS.map(l=>l.bossName).join(','),'Spade,Heart,Shin,Jagi,Uighur,Devil Rebirth,Souther,Ryuga,Raoh');
 for(const l of LEVELS){assert(l.bossX<LEVEL_W-400);assert.equal(l.route.at(-1).kind,'boss');
  for(const n of l.route){if(n.roles){assert(n.roles.length<=8);n.roles.forEach(r=>assert(EDEFS[r]));}if(n.boss)assert(BOSS_PROFILES[n.boss]);}}
`);
test('Progression through every encounter and all nine finales',`
 for(let chapter=0;chapter<9;chapter++){
  startLevel(chapter);let guard=0;
  while(GS.state!=='levelclear'&&guard++<100){
   const n=LEVELS[chapter].route[GS.nodeIndex];assert(n);P1.x=n.x;GS.routeDelay=0;
   updateCampaignRoute();assert(GS.encounterActive||n.kind==='rest');
   if(n.kind==='fight'){assert(GS.enemies.length<=8);GS.enemies=[];updateCampaignRoute();}
   else if(n.kind==='boss'||n.kind==='mini'){
    assert.equal(GS.boss.name,n.boss);GS.boss.dead=true;GS.boss.dyingT=1;updateBoss(GS.boss);
    if(n.kind==='mini')assert.equal(GS.state,'playing');
   }
  }
  assert(guard<100);assert.equal(GS.state,'levelclear');
 }
 assert.equal(GS.story.juliaKnown,'reunited');assert(GS.story.raohDefeated);assert(GS.story.reiFarewell);assert(GS.story.tokiRescued);
`);
test('Encounter gates stop future waves and boss remains in the reachable arena',`
 P1.x=420;updateCampaignRoute();assert.equal(GS.enemies.length,4);const first=GS.nodeIndex;
 P1.x=1800;updateCampaignRoute();assert.equal(GS.nodeIndex,first);assert.equal(GS.enemies.length,4);
 GS.enemies=[];completeEncounter();GS.nodeIndex=LEVELS[0].route.length-1;GS.routeDelay=0;P1.x=LEVELS[0].bossX;
 updateCampaignRoute();assert(GS.boss.x<GS.arena.right-35);assert(GS.boss.x>GS.arena.left+100);
 const before=P1.x;updatePlayer(P1,0,{right:true},cam.x,GS.arena.right);assert(P1.x<=GS.arena.right-30);
`);
test('Rescue is optional, rewards once and is not required for essential story flags',`
 GS.nodeIndex=LEVELS[0].route.findIndex(n=>n.rescue);const rescueIndex=GS.nodeIndex;GS.encounterActive=true;completeEncounter();assert.equal(GS.nodeIndex,rescueIndex+1);assert.equal(GS.pickups.length,1);
 const pickup=GS.pickups[0];P1.hp=30;P1.x=pickup.x;P1.y=pickup.y;updateCampaignRoute();
 assert.equal(P1.hp,60);assert.equal(GS.story.rescues.length,1);updateCampaignRoute();assert.equal(P1.hp,60);
 GS.story.rescues=[];GS.lvlIdx=4;finishCampaignLevel();assert(GS.story.tokiRescued);assert(GS.story.reiInjured);
`);
test('Boss checkpoint retries restart the correct fight with fair resources',`
 GS.nodeIndex=LEVELS[0].route.length-1;P1.x=LEVELS[0].bossX;updateCampaignRoute();
 const cp=GS.checkpoint;assert.equal(cp.nodeIndex,LEVELS[0].route.length-1);
 P1.hp=0;P1.inactive=true;P1.lives=0;GS.state='gameover';assert(restoreCheckpoint());
 assert.equal(GS.nodeIndex,cp.nodeIndex);assert.equal(P1.hp,100);assert.equal(P1.special,40);assert.equal(P1.lives,3);assert(!P1.inactive);
 updateCampaignRoute();assert.equal(GS.boss.name,'Spade');
`);
test('Saved checkpoint survives reload and malformed saves are rejected',`
 startLevel(7);captureCheckpoint(3,2100);GS.checkpoint=null;assert(loadCampaignSave());assert.equal(GS.lvlIdx,7);assert.equal(GS.nodeIndex,3);
 localStorage.setItem('fist-campaign-checkpoint','{"version":1,"lvlIdx":800}');assert(!loadCampaignSave());
`);
test('Raoh is a three-phase solo duel; no ordinary reinforcements',`
 startLevel(8);GS.nodeIndex=LEVELS[8].route.length-1;P1.x=LEVELS[8].bossX;updateCampaignRoute();assert.equal(GS.boss.name,'Raoh');assert.equal(GS.enemies.length,0);
 const b=GS.boss;b.state='approach';b.introT=0;b.hp=b.maxHp*.6;updateBoss(b);assert.equal(b.phase,2);
 b.hp=b.maxHp*.25;b.attack=null;updateBoss(b);assert.equal(b.phase,3);
 for(let i=0;i<20;i++)updateCampaignRoute();assert.equal(GS.enemies.length,0);
`);
test('Every boss move has a warning and active/recovery interval with valid geometry',`
 for(const [name,profile] of Object.entries(BOSS_PROFILES)){
  const b=mkBoss(name,400);b.state='approach';GS.boss=b;GS.arena={left:0,right:1280};P1.x=320;P1.y=GROUND_Y;P1.z=0;P1.invincible=0;P1.downT=0;P1.riseT=0;
  for(let i=0;i<profile.moves.length;i++){
   const a=selectBossMove(b);assert(a.startup>=20);assert(a.active>0);assert(a.recovery>=25);assert(a.range>0);
  }
  updateBoss(b);assert(b.attack);const hp=P1.hp;assert.equal(P1.hp,hp);drawFighter(b,0);
 }
`);
test('Guard feedback reduces damage without silently blocking normal attacks',`
 const b=mkBoss('Heart',200);b.state='idle';GS.boss=b;P1.x=150;const hp=b.hp;
 hitBoss(P1,b,20);assert(b.hp<hp);assert(b.hp>hp-20);
 b.attack={elapsed:45,startup:34,active:6,recovery:44};const hp2=b.hp;hitBoss(P1,b,20);assert.equal(b.hp,hp2-20);
`);
test('Expanded routes spawn complete larger groups with safe arena placement',`
 for(let chapter=0;chapter<9;chapter++){
  startLevel(chapter);const level=LEVELS[chapter];assert(level.bossX>=4920);
  for(const n of level.route.filter(n=>n.kind==='fight')){
   GS.enemies=[];beginEncounter(n);assert.equal(GS.enemies.length,n.roles.length);
   assert(n.roles.length>=(chapter===0&&n.originalIndex===0?4:6));
   for(const e of GS.enemies){assert(e.x>GS.arena.left&&e.x<GS.arena.right);assert(e.y>=LANE_BACK&&e.y<=LANE_FRONT);}
  }
 }
 assert(LEVELS[8].route.at(-2).fullHeal);
`);
test('Old saves migrate to matching encounters and longer-route checkpoints reload',`
 startLevel(0);captureCheckpoint(5,3290);const cp=JSON.parse(localStorage.getItem('fist-campaign-checkpoint'));cp.version=1;cp.nodeIndex=5;cp.x=3290;
 localStorage.setItem('fist-campaign-checkpoint',JSON.stringify(cp));assert(loadCampaignSave());
 assert.equal(LEVELS[0].route[GS.nodeIndex].boss,'Spade');assert.equal(GS.checkpoint.version,2);assert(GS.checkpoint.x>4800);
 captureCheckpoint(GS.nodeIndex,GS.checkpoint.x);assert(loadCampaignSave());
`);
console.log(count+' campaign checks passed.');
