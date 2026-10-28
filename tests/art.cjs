// Verify actual art files and their connection to the production renderer.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),meta=JSON.parse(fs.readFileSync(path.join(root,'assets/characters/manifest.json')));
const noop=()=>{},draws=[];
const ctx=new Proxy({drawImage:(...args)=>draws.push(args),createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop}),measureText:()=>({width:10})},{get:(o,k)=>k in o?o[k]:noop});
const canvas={getContext:()=>ctx,style:{},addEventListener:noop};
const env={console,Math,Uint8Array,Set,assert,draws,performance:{now:()=>0},window:{CHARACTER_ART:meta,addEventListener:noop},
  document:{getElementById:()=>canvas,createElement:()=>canvas},navigator:{},Image:class {complete=true;naturalWidth=1536;},requestAnimationFrame:noop,setTimeout:noop,
  localStorage:{getItem:()=>null,setItem:noop,removeItem:noop}};
vm.createContext(env);
vm.runInContext(fs.readFileSync(path.join(root,'assets/characters/knockdown-v1/manifest.js'),'utf8'),env);
vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../arcade.js'),'utf8'),env);
for(const file of ['i18n.js','i18n-story.js'])vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../'+file),'utf8'),env);
vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../opening.js'),'utf8'),env);
vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../fighter-select.js'),'utf8'),env);
vm.runInContext(fs.readFileSync(path.join(root,'campaign.js'),'utf8'),env);
vm.runInContext(fs.readFileSync(path.join(root,'index.html'),'utf8').split('<script>').at(-1).split('</script>')[0],env);
for(const [key,s] of Object.entries(meta)){
  const png=fs.readFileSync(path.join(root,s.path));assert.equal(png.toString('hex',0,8),'89504e470d0a1a0a');
  assert.equal(png.readUInt32BE(16),s.cellW*(s.poses===6?3:1),key);
  assert.equal(png.readUInt32BE(20),s.cellH*(s.poses===6?2:1),key);
  assert.equal(png[25],6,`${key} must preserve RGBA`);
}
console.log('PASS All character PNG dimensions and alpha formats match the manifest');
vm.runInContext(`
 for(const name of Object.keys(BOSS_PROFILES)) {
   const key=name.toLowerCase().replaceAll(' ','-');assert(CHARACTER_IMAGES[key],name);
   const b=mkBoss(name,400);b.state='idle';assert(tryDrawCharacterArt(b),name);
 }
 for(const type of Object.keys(EDEFS)){assert(CHARACTER_IMAGES[type],type);assert(tryDrawCharacterArt(mkEnemy(type,400)),type);}
 for(const [key,s] of Object.entries(CHARACTER_IMAGES))if(s.poses===1)assert(drawStoryArt(key,200,300,150),key);
`,env);
console.log('PASS Every boss, enemy role, and story cutout is connected to the renderer');
vm.runInContext(`
 for(const name of ['Spade','Heart']) {
   const b=mkBoss(name,400);GS.boss=b;b.state='idle';draws.length=0;
   drawFighter(b,0);
   assert.equal(draws.at(-1)[0],CHARACTER_IMAGES[name.toLowerCase()].img);
   b.state='attack';b.attack={elapsed:12,startup:12,active:4,recovery:20};
   draws.length=0;drawFighter(b,0);
   assert.equal(draws.at(-1)[1],CHARACTER_IMAGES[name.toLowerCase()].cellW);
   assert.equal(draws.at(-1)[2],CHARACTER_IMAGES[name.toLowerCase()].cellH);
 }
`,env);
console.log('PASS Spade and Heart gameplay uses new combat sheets, including impact poses');
vm.runInContext(`
 const r={name:'Shin',state:'attack',dir:1,fr:0,attack:{elapsed:0,startup:20,active:4,recovery:30}};
 assert.equal(characterArtPose(r),0);r.attack.elapsed=10;assert.equal(characterArtPose(r),3);
 r.attack.elapsed=20;assert.equal(characterArtPose(r),4);r.attack.elapsed=24;assert.equal(characterArtPose(r),3);
 r.attack.elapsed=50;assert.equal(characterArtPose(r),0);r.state='stunned';assert.equal(characterArtPose(r),5);
 r.state='attack';delete r.attack.active;r.attack.elapsed=20;assert.equal(characterArtPose(r),4);
 r.attack=null;r.state='walk';r.fr=0;assert.equal(characterArtPose(r),1);r.fr=16;assert.equal(characterArtPose(r),2);
 const image=CHARACTER_IMAGES.shin.img;image.complete=false;assert.equal(tryDrawCharacterArt(r),false);image.complete=true;
 assert(draws.every(args=>args.slice(1).every(Number.isFinite)));
`,env);
console.log('PASS Attack poses follow combat windows, reactions override attacks, and missing art falls back');

const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const inline=JSON.parse(html.match(/window\.SPRITE_MANIFEST\s*=\s*(\{.*?\});/s)[1]);
const json=JSON.parse(fs.readFileSync(path.join(root,'assets/sprites/manifest.json')));
const js=JSON.parse(fs.readFileSync(path.join(root,'assets/sprites/sprites.js'),'utf8').match(/window\.SPRITE_MANIFEST\s*=\s*(\{.*?\});/s)[1]);
for(const hero of ['toki','rei'])for(const state of ['idle','walk','punch','kick','jump','jumpkick','special','stunned']) {
  const key=hero+'_'+state,s=inline.sprites[key];
  assert.deepEqual(s,json.sprites[key]);assert.deepEqual(s,js.sprites[key]);
  const png=fs.readFileSync(path.join(root,s.sheet)),w=png.readUInt32BE(16),h=png.readUInt32BE(20);
  s.regions.forEach(([x,y,rw,rh],i)=>{assert(x>=0&&y>=0&&x+rw<=w&&y+rh<=h);assert(s.anchors[i]>=x&&s.anchors[i]<=x+rw);});
}
vm.runInContext(`
 for(const state of ['idle','punch','stunned'])SPR['toki_'+state]={dh:176,scale:1,poses:Array.from({length:6},(_,i)=>({width:100,height:176,anchorX:50,pose:i}))};
 draws.length=0;drawToki(0,0,1,'punch',6,0);assert.equal(draws.at(-1)[0].pose,2);
 drawToki(0,0,1,'punch',300,0);assert.equal(draws.at(-1)[0].pose,5);
 drawToki(0,0,1,'stunned',0,0);assert.equal(draws.at(-1)[0],SPR.toki_stunned.poses[0]);
 assert(drawStoryArt('toki',200,300,150));assert.equal(draws.at(-1)[0],SPR.toki_idle.poses[0]);
`,env);
console.log('PASS Toki manifests agree; atlas bounds, attack timing, recoil and story artwork are valid');

vm.runInContext(`
 for(const state of ['idle','punch','stunned'])SPR['rei_'+state]={dh:176,scale:1,poses:Array.from({length:6},(_,i)=>({width:100,height:176,anchorX:50,pose:i}))};
 draws.length=0;drawRei(0,0,1,'punch',6,0);assert.equal(draws.at(-1)[0].pose,2);
 drawRei(0,0,1,'punch',300,0);assert.equal(draws.at(-1)[0].pose,5);
 drawRei(0,0,1,'stunned',0,0);assert.equal(draws.at(-1)[0],SPR.rei_stunned.poses[0]);
 assert(drawStoryArt('rei',200,300,150));assert.equal(draws.at(-1)[0],SPR.rei_idle.poses[0]);
`,env);
console.log('PASS Rei uses new attack, recoil and story poses at the correct timing');
vm.runInContext(`
 const enemy=mkEnemy('scavenger',400);enemy.state='walk';enemy.walkBlend=1;
 SCAVENGER_WALK_IMAGE.naturalWidth=1412;SCAVENGER_WALK_IMAGE.naturalHeight=832;
 for(let i=0;i<8;i++){
  enemy.stride=(i+.1)/8*ENEMY_MOTION.strideDistance;draws.length=0;
  assert(tryDrawCharacterArt(enemy));const d=draws.at(-1);
  assert.equal(d[0],SCAVENGER_WALK_IMAGE);assert.equal(d[1],i%4*353);assert.equal(d[2],Math.floor(i/4)*416);
 }
 enemy.state='attack';enemy.attack={elapsed:17,startup:17,active:4,recovery:24};draws.length=0;
 tryDrawCharacterArt(enemy);assert.equal(draws.at(-1)[0],CHARACTER_IMAGES.scavenger.img);
`,env);
console.log('PASS Opening scavenger renders all 8 corrected walk frames and retains attack artwork');
for(const name of ['scavenger','thug','gang','heavy','spear','knife','shield','nanto','gunner','whip','bomber','elite']){
 const png=fs.readFileSync(path.join(root,`assets/characters/${name}-walk-v3.png`));
 const width=png.readUInt32BE(16),height=png.readUInt32BE(20);
 assert.equal(width%4,0);assert.equal(height,832);
 env.walkTest={name,width,height};
 vm.runInContext(`{
  const {name,width,height}=walkTest,image=ENEMY_WALK_IMAGES[name];image.naturalWidth=width;image.naturalHeight=height;
  const e=mkEnemy(name,400);e.state='walk';e.walkBlend=1;
  for(let i=0;i<8;i++){e.stride=(i+.1)/8*ENEMY_MOTION.strideDistance;draws.length=0;assert(tryDrawCharacterArt(e));assert.equal(draws.at(-1)[0],image);assert.equal(draws.at(-1)[1],i%4*width/4);}
  e.state='stunned';draws.length=0;tryDrawCharacterArt(e);assert.equal(draws.at(-1)[0],CHARACTER_IMAGES[name].img);
 }`,env);
}
console.log('PASS All 12 enemy types use eight-frame walks and preserve hit reactions');
const reiMoves=JSON.parse(fs.readFileSync(path.join(root,'assets/sprites/rei-moves-v1/geometry.json')));
const reiMovePng=fs.readFileSync(path.join(root,'assets/sprites/rei-moves-v1/moves.png'));
assert.equal(reiMovePng.readUInt32BE(16),reiMoves.w*4);
assert.equal(reiMovePng.readUInt32BE(20),reiMoves.h*3);
assert.equal(reiMovePng[25],6);
vm.runInContext(`
 P1.charIdx=1;
 for(const [kind,t,frame] of [['net',0,0],['net',8,1],['net',10,2],['net',12,3],['bird',0,4],['bird',5,5],['bird',14,6],['bird',24,7],['bird',32,8],['bird',35,9],['bird',38,10],['bird',40,11]]){
  P1.reiMove={kind,t};draws.length=0;assert(drawReiMove(P1));
  const d=draws.at(-1);assert.equal(d[0],REI_MOVE_IMAGE);assert.equal(d[1],frame%4*389);assert.equal(d[2],Math.floor(frame/4)*267);
 }
 P1.reiMove=null;assert.equal(drawReiMove(P1),false);
`,env);
console.log('PASS Rei net and bird moves render all twelve new authored poses');
for(const name of ['gunner','jagi','knife']){
 const png=fs.readFileSync(path.join(root,`assets/characters/${name}-weapon-v1.png`));
 const width=png.readUInt32BE(16),height=png.readUInt32BE(20);assert.equal(width%4,0);assert.equal(height%2,0);assert.equal(png[25],6);
 env.weaponArtTest={name,width,height};
 vm.runInContext(`{
 const {name,width,height}=weaponArtTest,img=WEAPON_IMAGES[name];img.naturalWidth=width;img.naturalHeight=height;
 const e=name==='jagi'?mkBoss('Jagi',400):mkEnemy(name,400,GROUND_Y),c=ENEMY_WEAPONS[name];e.state='attack';
 const times=[0,c.startup*.4,c.startup*.8,c.startup,c.startup+4,c.startup+(c.shots-1)*c.gap+14,c.startup+(c.shots-1)*c.gap+24,c.startup+(c.shots-1)*c.gap+40];
 const frames=new Set();
 for(const elapsed of times){e.attack={weapon:c.kind,startup:c.startup,elapsed};draws.length=0;assert(drawEnemyWeapon(e,CHARACTER_IMAGES[name]));const d=draws[0];assert.equal(d[0],img);assert(Number.isFinite(d[7]));frames.add(d[2]/(height/2)*4+d[1]/(width/4));}
 assert.equal(frames.size,8);
 e.state='stunned';e.invincible=0;draws.length=0;tryDrawCharacterArt(e);assert.notEqual(draws[0][0],img);
 }`,env);
}
console.log('PASS Gunner, Jagi and Knife use eight weapon poses and preserve damage reactions');

vm.runInContext(`
 for(const [key,bounds] of Object.entries(NPC_DOWN_BOUNDS)){
  const s=CHARACTER_IMAGES[key];assert(s);const e={type:key,fallen:true,fr:30,dir:-1,onGround:true,groundDownT:180};
  KNOCKDOWN_IMAGES[key].img.complete=false;draws.length=0;assert(drawEnemyFall(e));KNOCKDOWN_IMAGES[key].img.complete=true;const d=draws[0];assert.equal(d[0],s.img);assert.equal(d[3],bounds[2]);assert.equal(d[4],bounds[3]);
  assert(d.slice(1).every(Number.isFinite));
 }
`,env);
console.log('PASS Every enemy injury silhouette supports the grounded fall renderer');

vm.runInContext(`
 assert.equal(Object.keys(KNOCKDOWN_IMAGES).length,31);
 for(const key of Object.keys(NPC_DOWN_BOUNDS)){
  const s=KNOCKDOWN_IMAGES[key];assert(s,key);
  const e={type:key,fallen:true,dir:1};
  for(const [air,fr,remaining,pose] of [[true,0,0,0],[true,30,0,1],[false,30,180,2],[false,90,100,3],[false,210,1,3]]){
   Object.assign(e,{onGround:!air,fr,groundDownT:remaining});draws.length=0;
   assert(drawEnemyFall(e));assert.equal(draws[0][0],s.img);assert.equal(draws[0][1],pose*s.cellW);
   assert(draws[0].slice(1).every(Number.isFinite));
  }
 }
 for(let i=0;i<3;i++){
  P1.charIdx=i;const hero=PLAYER_ART_KEYS[i];
  for(const state of ['stunned','knockdown','getup'])SPR[hero+'_'+state]={scale:1,poses:Array.from({length:state==='getup'?3:2},(_,pose)=>({width:120,height:176,anchorX:60,state,pose}))};
  for(const [state,onGround,fr,riseT,expected,pose] of [
   ['knockdown',false,0,0,'stunned',0],['knockdown',false,40,0,'knockdown',0],
   ['knockdown',true,40,0,'knockdown',1],['dying',true,100,0,'knockdown',1],
   ['getup',true,0,COMBAT.rise,'getup',0],['getup',true,0,COMBAT.rise/2,'getup',1],['getup',true,0,1,'getup',2]]){
   Object.assign(P1,{state,onGround,fr,riseT});draws.length=0;assert(drawPlayerFall(P1));
   assert.equal(draws[0][0].state,expected);assert.equal(draws[0][0].pose,pose);
  }
 }
`,env);
console.log('PASS All 34 fighters select recoil, fall, grounded and recovery poses correctly');

vm.runInContext(`
 for(const [key,ratio] of Object.entries({'heart':1.3,'devil-rebirth':1.8,'uighur':1.5,'spade':1.15,'raoh':1.1,'fang-chief':1.2})){
  const s=CHARACTER_IMAGES[key];assert(Math.abs(s.height-144*ratio)<.001,key);
  const boss={type:key,state:'idle',dir:1,fr:0,y:GROUND_Y};
  draws.length=0;assert(tryDrawCharacterArt(boss));
  assert(Math.abs(draws[0][8]/s.cellH*s.referenceHeight-144*ratio)<.001,key+' standing height');
  P1.y=GROUND_Y;assert(Math.abs(fighterHitHeight(boss)/fighterHitHeight(P1)-ratio)<.001,key+' hit-zone height');
  const down=KNOCKDOWN_IMAGES[key];boss.fallen=true;boss.onGround=true;boss.groundDownT=100;
  draws.length=0;assert(drawEnemyFall(boss));
  assert(Math.abs(draws[0][8]/down.cellH*down.referenceHeight-144*ratio)<.001,key+' knockdown scale');
 }
`,env);
console.log('PASS Six boss standing, hit-zone and knockdown sizes match the requested Ken ratios');

vm.runInContext(`
 roadSurface={width:2172,height:724};
 let previous;
 for(const camera of [0,.5,50,809.5,810,1500]){
  draws.length=0;drawStableGround(camera,null);
  assert(draws.length>0&&draws.length<10);
  for(let i=0;i<draws.length;i++){
   const d=draws[i];assert.equal(d[0],roadSurface);
   assert.equal(d[2],0);assert.equal(d[4],724);
   assert.equal(d[6],450);assert.equal(d[7]/d[8],3);
   if(i)assert(Math.abs(draws[i-1][5]+draws[i-1][7]-d[5])<.001);
  }
  if(camera===.5)assert.equal(draws[0][5],previous-.5);
  previous=draws[0][5];
 }
 roadSurface=null;
`,env);
console.log('PASS Ground scrolls as full undistorted tiles with seamless placement and fractional camera movement');

const gallery=JSON.parse(fs.readFileSync(path.join(root,'assets/sprites/player-animations.js'),'utf8').match(/window.PLAYER_ANIMATIONS\s*=\s*(\{.*?\});/s)[1]);
for(const hero of ['ken','rei']){
 const s=inline.sprites[hero+'_walk'];assert.equal(s.regions.length,8);
 assert.deepEqual(gallery[hero+'_walk'],s);assert(s.sheet.includes('walk-v3'));
}
console.log('PASS Ken and Rei gameplay and preview use the same eight-phase rebuilt walk cycles');
