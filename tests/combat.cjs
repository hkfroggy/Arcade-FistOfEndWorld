// Run with node tests/combat.cjs. Tests actual inline game code; no dependencies.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const noop=()=>{};
const ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop}),measureText:()=>({width:10})},{get:(o,k)=>k in o?o[k]:noop});
const canvas={getContext:()=>ctx,style:{},addEventListener:noop};
const env={console,Math,Uint8Array,Set,performance:{now:()=>0},window:{addEventListener:noop},document:{getElementById:()=>canvas,createElement:()=>canvas},navigator:{},Image:class{},requestAnimationFrame:noop,setTimeout:noop};
vm.createContext(env);
vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../arcade.js'),'utf8'),env);
for(const file of ['i18n.js','i18n-story.js'])vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../'+file),'utf8'),env);
vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../opening.js'),'utf8'),env);
vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../fighter-select.js'),'utf8'),env);
vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../campaign.js'),'utf8'),env);
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
vm.runInContext(html.split('<script>').at(-1).split('</script>')[0],env);
let passed=0;
function test(name,body){vm.runInContext(`
GS.state='playing';GS.mode='1p';GS.projectiles=[];GS.enemies=[];GS.boss=null;hitStop=0;cam.x=0;
GS.arena=null;GS.nodeIndex=0;GS.pickups=[];GS.routeDelay=0;GS.encounterActive=false;
P1.charIdx=0;P2.charIdx=1;resetPlayer(P1,100);resetPlayer(P2,210);P1.inactive=false;P1.invincible=0;P1.hp=100;P1.lives=3;P2.inactive=true;
`,env);env.assert=assert;vm.runInContext(`{${body}}`,env);console.log('PASS',name);passed++;}
test('Startup delays damage; active swing hits once and locks feet/facing',`
 const e=mkEnemy('heavy',150,GROUND_Y);GS.enemies=[e];const hp=e.hp;
 updatePlayer(P1,0,{punchP:true,right:true},0,1000);
 assert.equal(e.hp,hp);assert.equal(P1.x,100);
 for(let i=0;i<5;i++)updatePlayer(P1,0,{left:true},0,1000);
 assert.equal(e.hp,hp);assert.equal(P1.dir,1);
 updatePlayer(P1,0,{},0,1000);assert.equal(e.hp,hp-12);
 for(let i=0;i<18;i++)updatePlayer(P1,0,{},0,1000);
 assert.equal(e.hp,hp-12);assert.equal(P1.attack,null);
`);
test('Kick has a longer committed recovery; only a late press buffers',`
 updatePlayer(P1,0,{kickP:true},0,1000);
 updatePlayer(P1,0,{punchP:true},0,1000);assert.equal(P1.buffer,null);
 while(P1.atkTimer>6)updatePlayer(P1,0,{},0,1000);
 updatePlayer(P1,0,{punchP:true},0,1000);
 while(P1.attack)updatePlayer(P1,0,{},0,1000);
 updatePlayer(P1,0,{},0,1000);assert.equal(P1.attack.kind,'punch');
`);
test('Lane and facing checks prevent hits behind or on another depth lane',`
 const e=mkEnemy('heavy',150,GROUND_Y-40),b=mkEnemy('heavy',70,GROUND_Y);GS.enemies=[e,b];
 updatePlayer(P1,0,{punchP:true},0,1000);
 for(let i=0;i<24;i++)updatePlayer(P1,0,{},0,1000);
 assert.equal(e.hp,e.maxHp);assert.equal(b.hp,b.maxHp);
`);
test('Jump keeps lane, has committed horizontal velocity and landing recovery',`
 P1.y=GROUND_Y-35;updatePlayer(P1,0,{jumpP:true,right:true},0,1000);
 const lane=P1.y;for(let i=0;i<10;i++)updatePlayer(P1,0,{left:true,down:true},0,1000);
 assert.equal(P1.y,lane);assert(P1.x>100);assert(P1.z>0);assert.equal(P1.dir,1);
 let ticks=0;while(!P1.onGround&&ticks++<100)updatePlayer(P1,0,{},0,1000);
 assert.equal(P1.y,lane);assert.equal(P1.z,0);assert(P1.landT>0);
 const x=P1.x;updatePlayer(P1,0,{right:true},0,1000);assert.equal(P1.x,x);
`);
test('Damage cancels attack and special, staggers, and rejects actions until recovery',`
 updatePlayer(P1,0,{punchP:true},0,1000);P1.specialActive=true;
 assert(damagePlayer(P1,8,{x:150}));assert.equal(P1.attack,null);assert(!P1.specialActive);
 assert.equal(P1.state,'stunned');const hp=P1.hp;assert(!damagePlayer(P1,8));assert.equal(P1.hp,hp);
 for(let i=0;i<18;i++){updatePlayer(P1,0,{punchP:true},0,1000);assert.equal(P1.attack,null);}
 assert.equal(P1.stun,0);
 updatePlayer(P1,0,{punchP:true},0,1000);assert(P1.attack);
`);
test('Heavy damage knocks down, blocks actions, then grants protected get-up',`
 damagePlayer(P1,22,{x:150});assert.equal(P1.state,'knockdown');
 let ticks=0;while((P1.downT||P1.riseT)&&ticks++<150){updatePlayer(P1,0,{kickP:true},0,1000);assert.equal(P1.attack,null);}
 assert(ticks<150);assert.equal(P1.state,'idle');assert(P1.invincible>=30);
`);
test('A connected third strike is a knockdown finisher; a whiff resets the chain',`
 const e=mkEnemy('heavy',150,GROUND_Y);GS.enemies=[e];
 for(let n=0;n<3;n++){
  e.x=150;e.stun=0;updatePlayer(P1,0,{punchP:true},0,1000);
  for(let i=0;i<24;i++)updatePlayer(P1,0,{},0,1000);
 }
 assert(e.downT>0);assert.equal(P1.comboN,0);
 P1.comboN=1;P1.comboT=60;GS.enemies=[];
 updatePlayer(P1,0,{punchP:true},0,1000);for(let i=0;i<24;i++)updatePlayer(P1,0,{},0,1000);
 assert.equal(P1.comboN,0);
`);
test('Enemy telegraphs and cannot turn or track a sidestep during its attack',`
 const e=mkEnemy('thug',145,GROUND_Y);GS.enemies=[e];updateEnemy(e);assert(e.attack);
 const dir=e.dir,x=e.x;P1.y-=40;
 for(let i=0;i<46;i++)updateEnemy(e);
 assert.equal(P1.hp,100);assert.equal(e.dir,dir);assert.equal(e.x,x);assert(e.cooldown>0);
`);
test('Enemy hits once, can be interrupted, and only one grunt winds up per target',`
 const e=mkEnemy('thug',145,GROUND_Y),f=mkEnemy('thug',60,GROUND_Y);GS.enemies=[e,f];
 updateEnemy(e);updateEnemy(f);assert(e.attack);assert.equal(f.attack,null);
 for(let i=0;i<17;i++)updateEnemy(e);assert.equal(P1.hp,92);
 for(let i=0;i<3;i++)updateEnemy(e);assert.equal(P1.hp,92);
 hitEnemy(P1,e,12,'#fff');assert.equal(e.attack,null);assert.equal(e.state,'stunned');
`);
test('Jump elevation can evade an enemy ground strike',`
 const e=mkEnemy('thug',145,GROUND_Y);GS.enemies=[e];updateEnemy(e);P1.z=60;P1.onGround=false;
 for(let i=0;i<22;i++)updateEnemy(e);assert.equal(P1.hp,100);
`);
test('Hit stop freezes combat and is cleared when a new level starts',`
 impact(4);const x=P1.x;const fr=P1.fr;
 for(let i=0;i<4;i++)update();assert.equal(P1.x,x);assert.equal(P1.fr,fr);assert.equal(hitStop,0);
 impact(6);startLevel(0);assert.equal(hitStop,0);assert.equal(P1.z,0);assert.equal(P1.attack,null);
`);
test('Keyboard movement is independent for P1 and P2',`
 keys.KeyA=true;assert(getInput(0).left);assert(!getInput(1).left);delete keys.KeyA;
 keys.ArrowLeft=true;assert(getInput(1).left);assert(!getInput(0).left);delete keys.ArrowLeft;
`);
test('Both boss types use interruptible telegraphed strikes and recover',`
 for(const name of ['Spade','Heart']){
  const b=mkBoss(name,170);b.state='approach';GS.boss=b;P1.invincible=0;P1.downT=0;P1.riseT=0;P1.z=0;P1.hp=100;
  updateBoss(b);assert(b.attack);const startup=b.attack.startup;for(let i=0;i<startup;i++)updateBoss(b);assert(P1.hp<100);
  if(b.name==='Heart'){b.attack.elapsed=b.attack.startup+b.attack.active;}
  hitBoss(P1,b,12);assert.equal(b.attack,null);assert.equal(b.state,'stunned');
 }
`);
test('Rei and Toki use smooth acceleration, normalized diagonals and precise stops',`
 for(const charIdx of [1,2]) {
  P1.charIdx=charIdx;resetPlayer(P1,100);
  updatePlayer(P1,0,{right:true},0,1000);assert.equal(P1.x,100+KEN_MOTION.accel);
  const x=P1.x;updatePlayer(P1,0,{},0,1000);assert.equal(P1.x,x);
  resetPlayer(P1,100);for(let i=0;i<8;i++)updatePlayer(P1,0,{right:true,up:true},0,1000);
  assert(Math.abs(P1.moveX-KEN_MOTION.walkX*Math.SQRT1_2)<1e-9);
 }
`);
test('Render uses original character draw functions for stagger, fall, rise and attacks',`
 const original=CHAR_DEFS[0].drawFn;let seen=[];CHAR_DEFS[0].drawFn=(...a)=>seen.push(a);
 for(const state of ['stunned','knockdown','getup']){P1.state=state;P1.riseT=8;drawFighter(P1,0);}
 assert(seen.every(a=>a[3]==='idle'));
 startPlayerAttack(P1,'punch');P1.attack.elapsed=6;drawFighter(P1,0);
 assert.equal(seen.at(-1)[4],2*aStep('punch'));CHAR_DEFS[0].drawFn=original;
`);
test('Combat stays at 60 ticks while gameplay renders at display refresh',`
 const oldUpdate=update,oldRender=render;let ticks=0,frames=0;
 update=()=>ticks++;render=()=>frames++;
 for(const hz of [60,120,144]){
  lastTick=null;accumulatedTime=0;ticks=0;frames=0;
  for(let i=0;i<=hz;i++)loop(i*1000/hz);
  assert(ticks>=59&&ticks<=60);assert.equal(frames,hz+1);
  GS.state='title';lastTick=null;accumulatedTime=0;ticks=0;frames=0;
  for(let i=0;i<=hz;i++)loop(i*1000/hz);
  assert(ticks>=59&&ticks<=60);assert(frames>=59&&frames<=60);GS.state='playing';
 }
 update=oldUpdate;render=oldRender;
`);
test('Keyboard and up to two sparse-index controllers have separate ownership',`
 const a={index:2,connected:true,axes:[1,0],buttons:Array.from({length:16},()=>({pressed:false}))};
 const b={index:5,connected:true,axes:[-1,0],buttons:Array.from({length:16},()=>({pressed:false}))};
 navigator.getGamepads=()=>[null,null,a];GS.mode='2p';INPUT_SETTINGS.p1Pad=-1;INPUT_SETTINGS.p2Pad=-1;
 assert.equal(playerPad(0),-1);assert.equal(playerPad(1),0);
 assert(!getInput(0).right);assert(getInput(1).right);
 navigator.getGamepads=()=>[null,null,a,null,null,b];
 assert.equal(playerPad(0),0);assert.equal(playerPad(1),1);
 a.buttons[0].pressed=true;assert(getInput(0).punchP);assert(!getInput(1).punchP);
 updateGpPrev();assert(!getInput(0).punchP);
 b.buttons[0].pressed=true;assert(anyGpPress());updateGpPrev();assert(!anyGpPress());
 a.connected=false;updateGpPrev();a.connected=true;assert(gpJustPressed(0,0));
 navigator.getGamepads=()=>[];
`);
test('Map 1 opening renders all script beats and completes or skips to gameplay',`
 startOpening();assert.equal(GS.lvlIdx,0);assert.equal(GS.state,'intro');
 const x=P1.x;update();assert.equal(P1.x,x);
 for(let i=0;i<OPENING_BEATS.length;i++){OPENING.beat=i;OPENING.t=40;drawOpening();}
 assert.equal(OPENING_BEATS.filter(b=>b[0]==='strike').length,7);
 assert.deepEqual(OPENING_BEATS.slice(0,3).map(b=>b[0]),['restrained','captive','arrival']);
 assert(OPENING_TIMES.strike*7<=70);assert.equal(OPENING_STARS.length,7);
 for(const key of Object.keys(OPENING_ART_FILES))OPENING_ART[key]={complete:true,naturalWidth:1672,naturalHeight:941};
 for(let i=0;i<OPENING_BEATS.length;i++){OPENING.beat=i;OPENING.t=4;drawOpening();}
 for(const key of Object.keys(OPENING_ART_FILES))delete OPENING_ART[key];

 OPENING.beat=OPENING_BEATS.length-1;OPENING.t=10000;updateOpening();assert.equal(GS.state,'playing');assert.equal(GS.lvlIdx,0);
 startOpening();jp.KeyQ=true;updateOpening();assert.equal(GS.state,'playing');assert(!jp.KeyQ);
`);
test('Playable animation follows airborne motion and the full special duration',`
 for(let charIdx=0;charIdx<3;charIdx++) {
  const speed=motionFor({charIdx}).jumpSpeed;
  const r={charIdx,onGround:false,vz:speed,fr:0};
  assert.equal(playerVisual(r,'jump',0).fr,0);
  r.vz=0;assert.equal(playerVisual(r,'jump',0).fr,3*aStep('jump'));
  r.vz=-speed;assert.equal(playerVisual(r,'jump',0).fr,5*aStep('jump'));
  r.attack={...COMBAT.jumpkick,kind:'jumpkick',elapsed:5};
  const v=playerVisual(r,'kick',0);assert.equal(v.state,'jumpkick');assert.equal(v.fr,2*aStep('jumpkick'));
  r.attack=null;r.specialActive=true;r.specialTier=1;r.specialT=48;
  assert.equal(playerVisual(r,'special',400).fr,3*aStep('special'));
  r.specialT=42;assert.notEqual(playerVisual(r,'special',406).fr,3*aStep('special'));
  r.specialT=2;assert.equal(playerVisual(r,'special',446).fr,5*aStep('special'));
 }
`);
test('Road stays fixed to fighters throughout the lane and depth speeds remain continuous',`
 for(let y=LANE_BACK;y<=LANE_FRONT;y++)assert.equal(groundScrollSpeed(y),1);
 const cameraTravel=320;
 assert.equal(cameraTravel*groundScrollSpeed(P1.y),cameraTravel);
 for(let y=450;y<720;y++){
  assert.ok(groundScrollSpeed(y+1)>=groundScrollSpeed(y));
  assert.ok(groundScrollSpeed(y+1)-groundScrollSpeed(y)<.04);
 }
 assert.ok(groundScrollSpeed(474)<1);
 assert.equal(groundScrollSpeed(720),1.25);
`);
test('Expanded depth lane lets fighters move away from and toward the camera',`
 for(let i=0;i<180;i++)updatePlayer(P1,0,{up:true},0,1000);
 assert.equal(P1.y,LANE_BACK);
 for(let i=0;i<180;i++)updatePlayer(P1,0,{down:true},0,1000);
 assert.equal(P1.y,LANE_FRONT);
 assert.equal(LANE_FRONT-LANE_BACK,126);
 assert.ok(fighterDepthScale(LANE_BACK)<fighterDepthScale(GROUND_Y));
 assert.ok(fighterDepthScale(GROUND_Y)<fighterDepthScale(LANE_FRONT));
`);
test('Join order assigns keyboard banks exclusively and reserves different fighters',`
 beginJoining();GS.state='charselect';clearKeys();jp.Numpad2=true;pollJoins();
 assert.equal(JOIN.sources[0].id,1);assert.equal(JOIN.sources[1],null);
 clearKeys();jp.Numpad1=true;assert.equal(getInput(0).punchP,true);assert.equal(getInput(1).punchP,false);
 jp.KeyH=true;pollJoins();assert.equal(JOIN.sources[1].id,0);
 assert.notEqual(CS.cursors[0],CS.cursors[1]);
 clearKeys();JOIN.enabled=false;
`);
test('Mid-game joining waits for HUD confirmation and preserves player one',`
 beginJoining();JOIN.sources[0]={type:'keyboard',id:0};P1.charIdx=0;P1.hp=67;
 clearKeys();jp.Numpad2=true;pollJoins(true);
 assert.equal(JOIN.selecting[1],true);assert.equal(P2.inactive,true);assert.notEqual(CS.cursors[1],0);
 clearKeys();CS.inputDelay[1]=0;jp.Numpad1=true;selectJoinedPlayer(1,true);
 assert.equal(P2.inactive,false);assert.equal(GS.mode,'2p');assert.equal(P1.hp,67);
 assert.notEqual(P2.charIdx,P1.charIdx);assert.equal(P2.invincible,90);
 clearKeys();JOIN.enabled=false;
`);
test('Ken jumps higher, lands cleanly and preserves the depth lane',`
 const lane=P1.y;updatePlayer(P1,0,{jumpP:true,right:true},0,1000);
 let peak=0,ticks=0;
 while(!P1.onGround&&ticks++<100){updatePlayer(P1,0,{},0,1000);peak=Math.max(peak,P1.z);assert.equal(P1.y,lane);}
 assert(peak>150&&peak<165);assert(ticks>=49&&ticks<=53);
 assert.equal(P1.z,0);assert.equal(P1.vz,0);assert.equal(P1.vx,0);assert(P1.landingVisual>0);
`);
test('Ken accelerates over four ticks, stops precisely and strides only when moving',`
 const speeds=[];for(let i=0;i<4;i++){const x=P1.x;updatePlayer(P1,0,{right:true},0,1000);speeds.push(P1.x-x);}
 assert(speeds[0]<speeds[1]&&speeds[1]<speeds[2]);assert(Math.abs(speeds[3]-KEN_MOTION.walkX)<1e-9);
 const x=P1.x,stride=P1.stride;updatePlayer(P1,0,{},0,1000);assert.equal(P1.x,x);assert.equal(P1.stride,stride);
 P1.x=970;updatePlayer(P1,0,{right:true},0,1000);assert.equal(P1.stride,stride);
 resetPlayer(P1,100);for(let i=0;i<8;i++)updatePlayer(P1,0,{right:true,up:true},0,1000);
 assert(Math.abs(P1.moveX-KEN_MOTION.walkX*Math.SQRT1_2)<1e-9);
 const attackX=P1.x;updatePlayer(P1,0,{punchP:true},0,1000);for(let i=0;i<4;i++)updatePlayer(P1,0,{right:true},0,1000);assert.equal(P1.x,attackX);
`);

test('Expanded Ken poses follow real hit windows and keep the aerial kick separate',`
 const previous=SPR.ken_idle;SPR.ken_idle={poses:Array(8).fill({})};
 startPlayerAttack(P1,'kick');P1.attack.elapsed=0;
 assert.equal(playerVisual(P1,'kick',0).fr,0);
 P1.attack.elapsed=COMBAT.kick.startup;
 assert.equal(playerVisual(P1,'kick',0).fr,3*aStep('kick'));
 P1.attack.elapsed=COMBAT.kick.startup+COMBAT.kick.active;
 assert.equal(playerVisual(P1,'kick',0).fr,5*aStep('kick'));
 P1.attack=null;P1.onGround=false;P1.z=80;P1.vz=2;updatePlayer(P1,0,{kickP:true},0,1000);
 assert.equal(P1.attack.kind,'jumpkick');assert.equal(playerVisual(P1,'kick',0).state,'jumpkick');
 P1.attack=null;P1.state='stunned';P1.fr=7;
 assert.equal(playerVisual(P1,'idle',0).state,'stunned');
 P1.state='getup';P1.riseT=2;assert.equal(playerVisual(P1,'idle',0).fr,2*aStep('getup'));
 if(previous)SPR.ken_idle=previous;else delete SPR.ken_idle;
`);

test('Ken cycles attack heights independently without changing hit timing',`
 const previous=SPR.ken_idle;SPR.ken_idle={poses:Array(8).fill({})};
 for(const kind of ['punch','kick']) {
  const variants=[];
  for(let n=0;n<4;n++) {
   startPlayerAttack(P1,kind);variants.push(P1.attack.variant);
   assert.equal(P1.atkTimer,COMBAT[kind].startup+COMBAT[kind].active+COMBAT[kind].recovery);
   if(n===1||n===2){const state=kind+'_'+P1.attack.variant;SPR['ken_'+state]={poses:Array(6).fill({})};
    P1.attack.elapsed=COMBAT[kind].startup;const v=playerVisual(P1,kind,0);
    assert.equal(v.state,state);assert.equal(v.fr,2*aStep(kind));delete SPR['ken_'+state];}
  }
  assert.deepEqual(variants,['middle','high','low','middle']);
 }
 startPlayerAttack(P1,'jumpkick');assert.equal(P1.attack.variant,'middle');
 if(previous)SPR.ken_idle=previous;else delete SPR.ken_idle;
`);

test('Ken turns without drifting against the new facing and eases into walking posture',`
 for(let i=0;i<8;i++)updatePlayer(P1,0,{right:true},0,1000);
 assert.equal(P1.walkBlend,1);const x=P1.x;
 updatePlayer(P1,0,{left:true},0,1000);assert(P1.x<x);assert.equal(P1.dir,-1);
 const stopped=P1.x;updatePlayer(P1,0,{},0,1000);assert.equal(P1.x,stopped);
 assert(P1.walkBlend>0&&P1.walkBlend<1);
 for(let i=0;i<8;i++)updatePlayer(P1,0,{},0,1000);assert.equal(P1.walkBlend,0);
`);

test('Rei and Toki cycle attack heights with poses synchronized to hit windows',`
 for(const charIdx of [1,2]) {
  P1.charIdx=charIdx;resetPlayer(P1,100);const hero=PLAYER_ART_KEYS[charIdx];
  for(const kind of ['punch','kick']) {
   const variants=[];
   for(let n=0;n<4;n++) {
    startPlayerAttack(P1,kind);variants.push(P1.attack.variant);
    assert.equal(P1.atkTimer,COMBAT[kind].startup+COMBAT[kind].active+COMBAT[kind].recovery);
    if(n===1||n===2) {
     const state=kind+'_'+P1.attack.variant,key=hero+'_'+state;SPR[key]={poses:Array(6).fill({})};
     P1.attack.elapsed=COMBAT[kind].startup;
     assert.equal(playerVisual(P1,kind,0).state,state);
     assert.equal(playerVisual(P1,kind,0).fr,2*aStep(kind));
     P1.attack.elapsed=COMBAT[kind].startup+COMBAT[kind].active;
     assert.equal(playerVisual(P1,kind,0).fr,4*aStep(kind));delete SPR[key];
    }
   }
   assert.deepEqual(variants,['middle','high','low','middle']);
  }
  startPlayerAttack(P1,'jumpkick');assert.equal(P1.attack.variant,'middle');
  P1.attack=null;P1.state='walk';SPR[hero+'_walk']={poses:Array(12).fill({})};
  P1.stride=motionFor(P1).strideDistance/2;
  assert.equal(playerVisual(P1,'walk',0).fr,6*aStep('walk'));delete SPR[hero+'_walk'];
 }
`);

test('Debug destinations initialize every map and boss with a playable party',`
 for(let i=0;i<LEVELS.length;i++) {
  DEBUG_START.map=i;JOIN.enabled=false;debugWarp(false);
  assert.equal(GS.lvlIdx,i);assert.equal(GS.nodeIndex,0);assert.equal(GS.state,'playing');
  assert.equal(P1.inactive,false);assert.equal(P2.inactive,true);assert.equal(JOIN.sources[0].id,0);
  debugWarp(true);assert.equal(GS.state,'boss');assert(GS.bossActive&&GS.boss);
  assert.equal(LEVELS[i].route[GS.nodeIndex].kind,'boss');
  assert(P1.x>GS.arena.left&&P1.x<GS.arena.right);
  assert.equal(GS.checkpoint.nodeIndex,GS.nodeIndex);
  const bossIndex=GS.nodeIndex;completeEncounter();assert.equal(GS.nodeIndex,bossIndex+1);
 }
 JOIN.sources[1]={type:'keyboard',id:1};P1.charIdx=2;P2.charIdx=1;
 debugWarp(true);assert.equal(GS.mode,'2p');assert.equal(P2.inactive,false);
 assert.equal(P1.charIdx,2);assert.equal(P2.charIdx,1);DEBUG_START.map=0;JOIN.enabled=false;
`);

test('H/K/U keyboard actions do not move or join a second player',`
 beginJoining();JOIN.sources[0]={type:'keyboard',id:0};
 for(const [code,action] of [['KeyH','punchP'],['KeyK','kickP'],['KeyU','jumpP']]) {
  clearKeys();jp[code]=true;keys[code]=true;
  assert.equal(getInput(0)[action],true);pollJoins(true);assert.equal(JOIN.sources[1],null);
  const other=getInput(1);assert(!other.left&&!other.right&&!other.up&&!other.down);
  delete keys[code];
 }
 clearKeys();keys.KeyH=true;jp.KeyK=true;assert(getInput(0).special1P);
 keys.KeyU=true;assert(getInput(0).special2P);
 delete keys.KeyH;delete keys.KeyU;clearKeys();JOIN.enabled=false;
`);
test('Retina rendering increases backing resolution without changing world size',`
 window.devicePixelRatio=2;resizeGameCanvas();assert.equal(canvas.width,2560);assert.equal(canvas.height,1440);
 assert.equal(W,1280);assert.equal(H,720);
 window.devicePixelRatio=1;resizeGameCanvas();assert.equal(canvas.width,1280);assert.equal(canvas.height,720);
`);
test('Playable fighters draw without blur filtering',`
 const saved=CHAR_DEFS.map(c=>c.drawFn);
 for(let i=0;i<3;i++){
  P1.charIdx=i;let drawn=false;
  CHAR_DEFS[i].drawFn=()=>{drawn=true;assert.equal(ctx.imageSmoothingEnabled,false);};
  drawFighter(P1,0);assert(drawn);CHAR_DEFS[i].drawFn=saved[i];
 }
`);
test('Knocked-down enemies remain invulnerable for three seconds after landing, then disappear',`
 const e=mkEnemy('thug',150,GROUND_Y);assert.equal(e.maxHp,68);
 hitEnemy(P1,e,20,'#fff',true);const hp=e.hp;
 hitEnemy(P1,e,999,'#fff');assert.equal(e.hp,hp);
 GS.enemies=[e];doAreaDmg(P1,300,999,'#fff');assert.equal(e.hp,hp);
 let ticks=0;while(!e.onGround&&ticks++<120)updateEnemy(e);
 assert(ticks<120);assert.equal(e.groundDownT,180);
 for(let i=0;i<179;i++){updateEnemy(e);assert(!e.dead);}
 updateEnemy(e);assert(e.dead);assert.equal(e.hp,hp);
`);
test('Map containers reveal meaningful supplies and collect only once',`
 startLevel(0);const box=GS.supplies[0];assert.equal(box.kind,'water');assert.equal(box.container,'barrel');
 P1.x=box.x-35;P1.y=box.y;P1.dir=1;P1.hp=30;
 const random=Math.random;Math.random=()=>.1;
 try{startPlayerAttack(P1,'kick');doSwingAtk(P1,20,84,'#fff');}finally{Math.random=random;}assert(box.broken);assert(box.revealT>0);
 P1.x=box.x;const hp=P1.hp;updateCampaignRoute();assert.equal(P1.hp,hp);
 box.revealT=0;updateCampaignRoute();assert(box.taken);assert.equal(P1.hp,hp+25);
 updateCampaignRoute();assert.equal(P1.hp,hp+25);
 assert.equal(containerForMap(4),'cabinet');assert.equal(supplyForMap(4,0),'medkit');
`);
test('All fighters punch in the air with a distinct move and one hit per swing',`
 for(let hero=0;hero<3;hero++){
  resetPlayer(P1,100);P1.charIdx=hero;P1.inactive=false;P1.onGround=false;P1.z=40;P1.vz=0;
  const e=mkEnemy('heavy',145,GROUND_Y);GS.enemies=[e];const hp=e.hp;
  updatePlayer(P1,0,{punchP:true},0,1000);
  assert.equal(P1.attack.kind,'jumppunch');assert.equal(e.hp,hp);
  assert.equal(playerVisual(P1,P1.state,0).state,'punch_low');
  for(let i=0;i<9;i++)updatePlayer(P1,0,{},0,1000);
  assert.equal(e.hp,hp-COMBAT.jumppunch.damage*2);
  assert.equal(P1.attack.hits.size,1);
  resetPlayer(P1,100);P1.onGround=false;P1.z=40;
  updatePlayer(P1,0,{kickP:true},0,1000);assert.equal(P1.attack.kind,'jumpkick');
 }
`);
test('Movement is 20 percent faster and enemy hit stun lasts 50 percent longer',`
 assert.equal(KEN_MOTION.walkX,3.72);assert.equal(KEN_MOTION.walkY,1.98);
 const e=mkEnemy('thug',150,GROUND_Y);GS.enemies=[e];hitEnemy(P1,e,1,'#fff',false);
 assert.equal(e.stun,35);
 for(let i=0;i<34;i++)tickEnemyReaction(e);
 assert.equal(e.state,'stunned');tickEnemyReaction(e);assert.equal(e.state,'approach');
 for(const revealT of [28,21,14,7,0])drawSupplyBreak({container:'crate',revealT});
`);
test('Every regular enemy travels with grounded, distance-driven animation',`
 for(const type of Object.keys(EDEFS)) {
  const e=mkEnemy(type,650,GROUND_Y);GS.enemies=[e];e.cooldown=999;
  const x=e.x;updateEnemy(e);
  assert(e.x<x,type);assert(Math.abs(e.x-x)<=ENEMY_MOTION.accel+.0001,type);
  assert(e.stride>0);assert(e.walkBlend>0);
  const stride=e.stride;e.state='idle';e.walkBlend=0;
  assert.equal(characterArtPose(e),0);
  e.state='walk';e.walkBlend=1;e.stride=24;const pose=characterArtPose(e);
  e.fr+=100;assert.equal(characterArtPose(e),pose,'time alone must not advance feet');
  e.attack={elapsed:0,startup:17,active:4,recovery:24,target:P1};
  const before=e.stride;updateEnemy(e);assert.equal(e.stride,before,'attacks plant feet');
 }
`);
test('Arcade timeout, initials, ranking cap and checkpoint continue',`
 const oldInput=arcadeInput,oldRestore=restoreCheckpoint;arcadeInput=()=>({});
 P1.score=900;startArcadeContinue();
 for(let i=0;i<599;i++)updateArcade();assert.equal(GS.state,'gameover');
 updateArcade();assert.equal(GS.state,'nameentry');assert.equal(arcade.queue[0].score,900);
 arcadeInput=()=>({up:true});updateArcade();assert.equal(arcade.letters[0],1);
 arcadeInput=()=>({confirm:true});updateArcade();updateArcade();updateArcade();
 assert.equal(GS.state,'highscores');assert.equal(arcade.board[0].name,'BAA');
 assert.equal(arcade.board[0].score,900);
 startArcadeContinue();arcade.board=Array.from({length:20},(_,i)=>({name:'AAA',score:2000-i}));
 P1.score=1;qualifyArcadeScores();assert.equal(GS.state,'highscores');assert.equal(arcade.board.length,20);
 let restored=false;restoreCheckpoint=()=>{restored=true;GS.state='playing';return true;};
 startArcadeContinue();updateArcade();assert(restored);assert.equal(GS.state,'playing');assert.equal(arcade,null);
 arcadeInput=oldInput;restoreCheckpoint=oldRestore;
`);
test('All boss profiles use distance-driven poses and rendering interpolates safely',`
 for(const name of Object.keys(BOSS_PROFILES)){
  const b=mkBoss(name,600);b.state='walk';b.walkBlend=1;b.stride=12;
  const pose=characterArtPose(b);b.fr+=30;assert.equal(characterArtPose(b),pose);
  b.state='idle';assert.equal(characterArtPose(b),0);
 }
 const e=mkEnemy('thug',200,GROUND_Y);e.state='walk';
 e.visualPrevious={x:198,state:'walk',dir:e.dir};smoothRender=true;renderAlpha=.5;
 assert.equal(visualValue(e,'x'),199);e.state='stunned';assert.equal(visualValue(e,'x'),200);
 smoothRender=false;
`);
test('Ken double-tap dash travels three metres, phases through fighters and resists damage',`
 updatePlayer(P1,0,{right:true},0,2000);updatePlayer(P1,0,{},0,2000);
 updatePlayer(P1,0,{right:true},0,2000);assert.equal(P1.kenMove.kind,'dash');const x=P1.x;
 const e=mkEnemy('thug',P1.x,GROUND_Y);GS.enemies=[e];separateFighters();assert.equal(P1.x,x);
 for(let i=0;i<32;i++){assert.equal(damagePlayer(P1,30,e),false);updatePlayer(P1,0,{},0,2000);}
 assert.equal(P1.x,x+240);assert.equal(P1.kenMove,null);assert.equal(P1.z,0);
`);
test('Ken spin damages once in first revolution and launches on second revolution',`
 P1.special=40;const e=mkEnemy('heavy',150,GROUND_Y);GS.enemies=[e];const hp=e.hp;
 updatePlayer(P1,0,{jumpP:true,kickP:true},0,2000);assert.equal(P1.kenMove.kind,'spin');assert.equal(P1.special,0);
 for(let i=0;i<12;i++)updatePlayer(P1,0,{},0,2000);assert.equal(e.hp,hp-28);
 for(let i=0;i<24;i++)updatePlayer(P1,0,{},0,2000);assert.equal(e.hp,0);assert.equal(e.state,'knockdown');assert.equal(e.vx,8);
 for(let i=0;i<12;i++)updatePlayer(P1,0,{},0,2000);assert.equal(P1.kenMove,null);assert(P1.onGround);
`);
test('Ken moves reset and spin remains interruptible; Rei does not acquire Ken dash',`
 P1.special=40;updatePlayer(P1,0,{spinP:true},0,2000);damagePlayer(P1,5);assert.equal(P1.kenMove,null);
 resetPlayer(P1,100);P1.charIdx=1;updatePlayer(P1,0,{right:true},0,2000);updatePlayer(P1,0,{},0,2000);updatePlayer(P1,0,{right:true},0,2000);assert.equal(P1.kenMove,null);
`);

test('Rei net travels five metres and only strikes enemies in front within its lane once',`
 P1.charIdx=1;P1.x=600;P1.dir=-1;
 const near=mkEnemy('heavy',520,GROUND_Y),edge=mkEnemy('heavy',201,GROUND_Y),far=mkEnemy('heavy',190,GROUND_Y),behind=mkEnemy('heavy',660,GROUND_Y),off=mkEnemy('heavy',400,GROUND_Y+60);
 GS.enemies=[near,edge,far,behind,off];const hp=near.hp;
 updatePlayer(P1,0,{left:true},0,2000);updatePlayer(P1,0,{},0,2000);updatePlayer(P1,0,{left:true},0,2000);
 assert.equal(P1.reiMove.kind,'net');
 for(let i=0;i<8;i++)updatePlayer(P1,0,{},0,2000);assert.equal(near.hp,hp);
 for(let i=0;i<20;i++)updatePlayer(P1,0,{},0,2000);
 assert.equal(near.hp,hp-24);assert.equal(edge.hp,hp-24);
 for(const e of [far,behind,off])assert.equal(e.hp,hp);
 for(let i=0;i<16;i++)updatePlayer(P1,0,{},0,2000);
 assert.equal(P1.reiMove,null);assert.equal(near.hp,hp-24);
`);
test('Rei bird rises, locks a forward landing point and hits once with knockdown',`
 P1.charIdx=1;P1.special=40;
 const e=mkEnemy('heavy',330,GROUND_Y);GS.enemies=[e];const hp=e.hp;
 updatePlayer(P1,0,{spinP:true},0,2000);assert.equal(P1.reiMove.kind,'bird');assert.equal(P1.special,0);
 for(let i=0;i<24;i++)updatePlayer(P1,0,{},0,2000);assert.equal(P1.z,240);assert.equal(e.hp,hp);
 e.x=340;assert.equal(P1.reiMove.targetX,330);
 for(let i=0;i<8;i++)updatePlayer(P1,0,{},0,2000);assert.equal(P1.z,240);
 for(let i=0;i<8;i++)updatePlayer(P1,0,{},0,2000);
 assert.equal(P1.x,330);assert.equal(P1.z,0);assert.equal(e.hp,0);assert.equal(e.state,'knockdown');
 for(let i=0;i<12;i++)updatePlayer(P1,0,{},0,2000);assert.equal(P1.reiMove,null);assert.equal(e.hp,0);
`);
test('Rei specials respect energy, interruption, boundaries and reset',`
 P1.charIdx=1;P1.special=39;updatePlayer(P1,0,{spinP:true},0,500);assert.equal(P1.reiMove,null);
 P1.special=40;updatePlayer(P1,0,{spinP:true},0,250);assert.equal(P1.reiMove.targetX,220);
 for(let i=0;i<15;i++)updatePlayer(P1,0,{},0,250);
 assert(damagePlayer(P1,5));assert.equal(P1.reiMove,null);assert(!P1.onGround);
 resetPlayer(P1,100);assert.equal(P1.reiMove,null);assert.equal(P1.forwardTapT,0);
`);
test('Jump plus kick input activates Rei bird while three-button super retains priority',`
 JOIN.enabled=false;P1.charIdx=1;P1.special=100;
 keys.KeyU=true;keys.KeyK=true;jp.KeyU=true;jp.KeyK=true;
 const inp=getInput(0);assert(inp.spinP);updatePlayer(P1,0,inp,0,2000);assert.equal(P1.reiMove.kind,'bird');
 resetPlayer(P1,100);keys.KeyH=true;jp.KeyH=true;const superInput=getInput(0);assert(superInput.special2P);assert(!superInput.spinP);
 for(const k of ['KeyU','KeyK','KeyH']){delete keys[k];delete jp[k];}
`);

test('Zoomed camera shows seventy percent of the original world width',`
 assert.equal(GAMEPLAY_ZOOM,1/.7);assert(Math.abs(gameplayViewWidth()-W*.7)<.001);
 cam.maxX=LEVEL_W-gameplayViewWidth();P1.x=LEVEL_W-40;updateCam(PLAYERS,LEVEL_W);
 assert(cam.tx+gameplayViewWidth()<=LEVEL_W+.001);
 GS.arena={left:1000,right:2280};P1.x=1640;updateCam(PLAYERS,2280);
 assert(cam.tx>=GS.arena.left);assert(cam.tx+gameplayViewWidth()<=GS.arena.right);
 drawGameplayScene();assert.equal(sceneWidth,W);assert.equal(sceneTop,0);assert.equal(sceneBottom,H);
`);
test('Supply drops use a single twenty-percent roll and empty containers still break',`
 const random=Math.random;let rolls=0;
 try{
  Math.random=()=>{rolls++;return .1999;};const yes={};breakSupply(yes);assert(yes.hasDrop);breakSupply(yes);assert.equal(rolls,1);
  Math.random=()=>.2;const no={x:P1.x,y:P1.y,kind:'water'};breakSupply(no);assert(!no.hasDrop);assert.equal(no.revealT,28);
  GS.supplies=[no];P1.hp=20;no.revealT=0;updateCampaignRoute();assert(no.taken);assert.equal(P1.hp,20);
 }finally{Math.random=random;}
`);
test('Gunner fires once then idles for fifteen seconds without melee damage',`
 const e=mkEnemy('gunner',350,GROUND_Y);GS.enemies=[e];const hp=P1.hp;
 updateEnemy(e);assert.equal(e.attack.weapon,'shotgun');
 for(let i=0;i<41;i++)updateEnemy(e);assert.equal(GS.projectiles.length,0);assert.equal(P1.hp,hp);
 updateEnemy(e);assert.equal(GS.projectiles.length,1);assert.equal(P1.hp,hp);
 while(e.attack)updateEnemy(e);const x=e.x;
 for(let i=0;i<900;i++){updateEnemy(e);assert.equal(e.attack,null);assert.equal(e.state,'idle');}
 assert.equal(e.x,x);assert.equal(GS.projectiles.length,1);updateEnemy(e);assert(e.attack);
`);
test('Jagi fires exactly three shots then waits fifteen seconds',`
 const b=mkBoss('Jagi',350);b.state='idle';GS.boss=b;
 updateBoss(b);assert(b.attack.weapon);
 for(let i=1;i<=78;i++){
  updateBoss(b);assert.equal(GS.projectiles.length,i<42?0:i<60?1:i<78?2:3);
 }
 while(b.attack)updateBoss(b);
 for(let i=0;i<900;i++){updateBoss(b);assert.equal(b.attack,null);assert.equal(b.state,'idle');}
 assert.equal(GS.projectiles.length,3);updateBoss(b);assert(b.attack);
`);
test('Knife releases three small knives and projectile hits can be jumped or sidestepped',`
 const e=mkEnemy('knife',250,GROUND_Y);GS.enemies=[e];updateEnemy(e);
 for(let i=0;i<30;i++)updateEnemy(e);
 assert.equal(GS.projectiles.length,3);assert(GS.projectiles.every(q=>q.kind==='knife'));assert.equal(new Set(GS.projectiles.map(q=>q.vy)).size,3);
 const hp=P1.hp;for(let i=0;i<25;i++)updateEnemyProjectiles();assert.equal(P1.hp,hp-12);
 P1.invincible=0;P1.stun=0;P1.onGround=false;P1.z=130;GS.projectiles=[];
 fireEnemyWeapon(e,{fired:0});for(let i=0;i<25;i++)updateEnemyProjectiles();assert.equal(P1.hp,hp-12);
 P1.z=0;P1.y=GROUND_Y+100;GS.projectiles=[];fireEnemyWeapon(e,{fired:0});for(let i=0;i<25;i++)updateEnemyProjectiles();assert.equal(P1.hp,hp-12);
`);
test('Interrupting a burst stops pending shots and cannot bypass its firing wait',`
 const e=mkEnemy('gunner',300,GROUND_Y);GS.enemies=[e];updateEnemy(e);
 for(let i=0;i<42;i++)updateEnemy(e);hitEnemy(P1,e,1,'#fff');assert.equal(e.attack,null);assert.equal(e.weaponWait,900);
 for(let i=0;i<50;i++)updateEnemy(e);assert.equal(GS.projectiles.length,1);assert(e.weaponWait>0);
 startLevel(0);assert.equal(GS.projectiles.length,0);
`);

test('Shield enemies block frontal hits for exactly five percent without knockdown',`
 for(const boss of [false,true]){
  const e=boss?mkBoss('Shield Captain',200):mkEnemy('shield',200,GROUND_Y);e.state='idle';e.dir=-1;e.invincible=0;
  const hit=dmg=>boss?hitBoss(P1,e,dmg):hitEnemy(P1,e,dmg,'#fff',true),hp=e.hp;
  hit(12);assert(Math.abs(e.hp-(hp-.6))<.00001);assert(e.blockT>0);assert.equal(e.stun,0);assert(!e.downT);
  e.blockT=0;P1.x=250;const rearHp=e.hp;hit(20);assert.equal(e.hp,boss?rearHp-20:0);P1.x=100;
 }
`);
test('Shield guard opens during attack and recovery and cannot block while stunned',`
 const e=mkEnemy('shield',200,GROUND_Y);e.dir=-1;e.state='attack';
 e.attack={elapsed:0,startup:10,active:4,recovery:20};assert(shieldBlocks(P1,e));
 e.attack.elapsed=10;assert(!shieldBlocks(P1,e));e.attack.elapsed=15;assert(!shieldBlocks(P1,e));
 e.attack=null;e.stun=10;assert(!shieldBlocks(P1,e));
`);
test('All enemy and boss types stay grounded for 180 ticks and award defeat score once',`
 for(const e of [...Object.keys(EDEFS).map(k=>mkEnemy(k,300,GROUND_Y)),...Object.keys(BOSS_PROFILES).map(k=>mkBoss(k,300))]){
  e.state='idle';const score=P1.score;beginEnemyFall(e,P1);beginEnemyFall(e,P1);
  assert.equal(P1.score,score+(e.profile?2000:100));assert(!canReceiveHit(e));
  let ticks=0;while(!e.onGround&&ticks++<100)updateEnemyFall(e);assert(ticks<100);
  assert.equal(e.groundDownT,180);assert(!e.dead);
  for(let i=0;i<179;i++)updateEnemyFall(e);assert(!e.dead);updateEnemyFall(e);assert(e.dead);
 }
`);
test('Boss defeat remains visible and only clears the stage after its grounded countdown',`
 startLevel(0);GS.enemies=[];const b=mkBoss('Spade',300);GS.boss=b;b.state='idle';b.hp=1;
 hitBoss(P1,b,30);assert(b.fallen);assert(!b.dead);assert.equal(GS.state,'playing');
 while(!b.onGround)updateBoss(b);
 for(let i=0;i<179;i++)updateBoss(b);assert.equal(GS.state,'playing');
 updateBoss(b);assert.equal(GS.state,'levelclear');
`);
test('Head, upper and lower hits apply 200, 100 and 70 percent damage to every fighter class',`
 for(const [zone,damage] of [['head',40],['upper',20],['lower',14]]){
  const e=mkEnemy('heavy',200,GROUND_Y),hp=e.hp;hitEnemy(P1,e,20,'#fff',false,zone);assert.equal(e.hp,hp-damage);
  const b=mkBoss('Spade',200);b.state='idle';const bhp=b.hp;hitBoss(P1,b,20,zone);assert.equal(b.hp,bhp-damage);
  resetPlayer(P1,100);P1.invincible=0;P1.hp=100;damagePlayer(P1,20,e,zone);assert.equal(P1.hp,100-damage);
 }
`);
test('Attack heights, airborne projectile zones and shield reduction compose correctly',`
 assert.equal(attackHitZone({variant:'high'}),'head');assert.equal(attackHitZone({variant:'low'}),'lower');
 assert.equal(attackHitZone({variant:'middle'}),'upper');
 const height=fighterHitHeight(P1);P1.z=30;
 assert.equal(projectileHitZone({z:30+height*.9},P1),'head');assert.equal(projectileHitZone({z:30+height*.6},P1),'upper');assert.equal(projectileHitZone({z:30+height*.3},P1),'lower');
 P1.z=0;for(const boss of [false,true]){
  const e=boss?mkBoss('Shield Captain',200):mkEnemy('shield',200,GROUND_Y);e.state='idle';e.dir=-1;const hp=e.hp;
  if(boss)hitBoss(P1,e,20,'head');else hitEnemy(P1,e,20,'#fff',false,'head');assert.equal(e.hp,hp-2);
 }
`);
test('Squad flankers change lane, move behind the player and then resume normal pursuit',`
 P1.x=300;P1.y=GROUND_Y;GS.arena={left:0,right:1280};
 const e=mkEnemy('gang',420,GROUND_Y);e.flankEnabled=true;e.flankCooldown=0;
 const y=e.y;assert(updateEnemyFlank(e,P1));assert(e.y<y);assert.equal(e.x,420);
 let steps=0;while(e.flankRoute&&steps++<300)updateEnemyFlank(e,P1);
 assert(steps<240);assert(e.x<P1.x);assert(e.flankCooldown>0);assert(e.y>=LANE_BACK&&e.y<=LANE_FRONT);
 e.attack={elapsed:0,startup:17,active:4,recovery:24,target:P1};const x=e.x;updateEnemy(e);assert.equal(e.x,x);
`);
test('Every blocking enemy takes double stun when its guard is bypassed',`
 const shield=mkEnemy('shield',200,GROUND_Y);shield.dir=1;
 hitEnemy(P1,shield,1,'#fff');assert.equal(shield.stun,COMBAT.enemyStun*2);
 for(const name of ['Shield Captain','Heart','Souther']){
  const b=mkBoss(name,200);b.state='idle';b.dir=1;hitBoss(P1,b,1);assert.equal(b.stun,42);
 }
 const normal=mkEnemy('thug',200,GROUND_Y);hitEnemy(P1,normal,1,'#fff');assert.equal(normal.stun,COMBAT.enemyStun);
 const spade=mkBoss('Spade',200);spade.state='idle';hitBoss(P1,spade,1);assert.equal(spade.stun,21);
`);
console.log(`${passed} combat checks passed.`);
