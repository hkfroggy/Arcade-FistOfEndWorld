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
   if(['Spade','Heart'].includes(name))continue;
   const key=name.toLowerCase().replaceAll(' ','-');assert(CHARACTER_IMAGES[key],name);
   const b=mkBoss(name,400);b.state='idle';assert(tryDrawCharacterArt(b),name);
 }
 for(const type of Object.keys(EDEFS)){assert(CHARACTER_IMAGES[type],type);assert(tryDrawCharacterArt(mkEnemy(type,400)),type);}
 for(const [key,s] of Object.entries(CHARACTER_IMAGES))if(s.poses===1)assert(drawStoryArt(key,200,300,150),key);
`,env);
console.log('PASS Every boss, enemy role, and story cutout is connected to the renderer');
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
