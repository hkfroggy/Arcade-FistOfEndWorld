// Playable adaptation of Fist_of_the_North_Star_Level_Design_Reference.docx.
// Dialogue is deliberately brief; timings below are prototype tuning, not lore.
const chapter=(name,kind,extra={})=>({name,kind,...extra});
const fight=(name,roles)=>chapter(name,'fight',{roles});
const rest=(name,text,extra={})=>chapter(name,'rest',{text,checkpoint:true,...extra});
const rescue=(name,roles,reward)=>chapter(name,'fight',{roles,rescue:reward});
const mini=(name)=>chapter(name,'mini',{boss:name});
const finale=(name,text)=>chapter(name,'boss',{boss:name,text,checkpoint:true});
const CAMPAIGN_LEVELS=[
  {name:'Wasteland Awakening',bossName:'Spade',theme:'wasteland',minutes:'10–12',
    objective:'Reach the settlement and follow the trail of Julia.',
    exit:['Bat and Lin meet Kenshiro at the gate.','The KING insignia points toward a village under siege.'],
    flags:{batLin:true},route:[
      fight('Road tutorial',['scavenger']),fight('Wrecked checkpoint',['thug','scavenger']),
      rescue('Water cache',['thug','spear'],'Water for the settlement'),mini('Club Enforcer'),
      rest('Quiet road to the gate',['Step out of the spear lane.','Strike after Spade commits to a thrust.']),
      finale('Spade',['SPADE — SETTLEMENT GATE','Sidestep the spear. Punish the recovery.'])]},
  {name:'Ruined Village Siege',bossName:'Heart',theme:'village',minutes:'12–15',
    objective:'Clear an evacuation route through the village.',
    exit:['A rescued messenger names Southern Cross.','The well is safe. Shin still holds the answers.'],route:[
      fight('Outer houses',['gang','knife','gang']),rescue('Market rescue',['shield','gang','knife'],'Market villagers'),
      rest('Evacuation lane',['The rescued villagers leave by a cleared route.','Optional rescues reward supplies.']),
      mini('Shield Captain'),fight('Well defense',['shield','gang','knife','gang']),
      finale('Heart',['HEART — CENTRAL SQUARE','His front is guarded. Bait the crush, then counter.'])]},
  {name:'Southern Cross City and Shin Arc',bossName:'Shin',theme:'city',minutes:'15–18',
    objective:'Break through KING and confront Shin about Julia.',
    exit:['Shin falls. Julia is nowhere on the terrace.','Her fate remains uncertain; Kenshiro keeps searching.'],
    flags:{juliaKnown:'uncertain'},route:[
      fight('Gate assault',['shield','spear','gang']),mini('Diamond'),
      rest('Ceremonial avenue',['KING guards withdraw toward the palace.','Watch the long weapons in the next passage.']),
      fight('Palace corridor',['nanto','spear']),mini('Club'),
      rest('Quiet terrace approach',['Shin waits beyond the palace.','A fast approach can hide a delayed second strike.']),
      finale('Shin',['SHIN — SOUTHERN CROSS TERRACE','Read the thrust, then the delayed follow-up.'])]},
  {name:'Desert Convoy Ambush',bossName:'Jagi',theme:'convoy',minutes:'14–17',
    objective:'Protect the refugee convoy and expose the impostor.',
    exit:['Jagi is exposed as the impostor. The convoy can leave.','Rei and Mamiya share a lead about a healer near Cassandra.'],
    flags:{reiMet:true,mamiyaMet:true,airiRescued:true},route:[
      fight('Convoy boarding',['scavenger','gunner','thug']),fight('Canyon ambush',['gunner','knife','scavenger']),
      rescue('Refugee rescue spur',['heavy','knife'],'Convoy refugees'),mini('Fang Chief'),
      rest('Convoy travel',['Rei searches for Airi; Mamiya protects the refugees.','Watch for the shotgun tell, then close during reload.']),
      finale('Jagi',['JAGI — FUEL DEPOT','Leave the marked firing lane. Attack during reload.'])]},
  {name:'Cassandra Prison',bossName:'Uighur',theme:'prison',minutes:'16–20',
    objective:'Expose the false healer and free Toki from Cassandra.',
    exit:['Toki is found alive and offers his guidance.','A later encounter with Raoh leaves Rei gravely injured.'],
    flags:{tokiRescued:true,tokiMentor:true,reiInjured:true},route:[
      mini('Amiba'),fight('Prison gate breach',['shield','whip','gang']),
      rescue('Inner cell rescue',['whip','shield'],'Cassandra prisoners'),
      rest('Inner cells',['The healer in the infirmary was Amiba.','The true Toki remains beyond the execution yard.']),
      fight('Barred galleries',['whip','gunner','shield']),
      finale('Uighur',['UIGHUR — EXECUTION YARD','Escape the whip lane. Bait the charge.'])]},
  {name:'Devil Rebirth and Cult Stronghold',bossName:'Devil Rebirth',theme:'cult',minutes:'12–15',
    objective:'Free the captives and stop Jackal at the sealed chamber.',
    exit:['The surviving captives reveal the road to Souther.','Rei is still injured. There is little time to lose.'],route:[
      rescue('Captive cells',['gang','heavy'],'Stronghold captives'),
      fight('Explosive pursuit',['bomber','gang','bomber']),mini('Jackal'),
      rest('Silent seal opening',['Jackal retreats into a colossal chamber.','Move away from marked ground before the hands fall.']),
      finale('Devil Rebirth',['DEVIL REBIRTH — SEALED CHAMBER','Avoid the marked slam. Strike the exhausted giant.'])]},
  {name:'Nanto Generals War and Souther',bossName:'Souther',theme:'pyramid',minutes:'22–28',
    objective:'Support Shu, free the work crews, and challenge Souther.',
    exit:['Rei has said his farewell. Shu is remembered.','Souther falls, and the freed crews leave the pyramid.'],
    flags:{reiFarewell:true,shuRemembered:true},route:[
      mini('Yuda'),rest('Resistance refuge',['Rei and Yuda’s conflict reaches its end.','After Rei’s farewell, Shu guides the resistance.'],{flags:{reiFarewell:true}}),
      rescue('Occupied work camp',['shield','nanto','spear'],'Pyramid work crews'),
      fight('Canal escape',['nanto','spear','gang']),
      rest('Shu’s sacrifice',['Kenshiro carries Shu’s sacrifice into the rematch.','Toki’s insight: Souther opens only after committing.']),
      fight('Pyramid terraces',['nanto','shield','spear','nanto']),
      finale('Souther',['SOUTHER — PYRAMID TERRACE','His pressure-point defense weakens during recovery.'])]},
  {name:'Capital and Raoh Territory',bossName:'Ryuga',theme:'capital',minutes:'20–25',
    objective:'Break the army’s hold and reach the final battlefield.',
    exit:['Ryuga’s duel ends in reflection, not celebration.','Julia lives. The route to Raoh is finally open.'],
    flags:{juliaKnown:'alive',juliaWhereabouts:'last-nanto-general',tokiFarewell:true},route:[
      fight('Occupied streets',['shield','gunner','knife']),
      rest('Resistance rendezvous',['Hyui, Shuren and Rihaku open a route.','Julia lives: the Last Nanto General is revealed.'],{flags:{juliaKnown:'alive',juliaWhereabouts:'last-nanto-general'}}),
      rescue('Army camp escape',['spear','gunner','shield'],'Territory refugees'),mini('Command Captain'),
      rest('The Chariot Stars',['Juza and Fudo hold the army back.','Toki’s final confrontation with Raoh follows his teaching.']),
      fight('Military yard',['nanto','shield','gunner','knife']),
      finale('Ryuga',['RYUGA — COMMAND COURTYARD','Cold, fast thrusts leave a short counter window.'])]},
  {name:'Final Battlefield and Raoh',bossName:'Raoh',theme:'plateau',minutes:'12–16',
    objective:'Face Raoh and bring Julia home.',
    exit:['Raoh raises his fist in a final, dignified farewell.','Kenshiro and Julia leave toward the survivors’ future.'],
    flags:{juliaKnown:'reunited',juliaWhereabouts:'with-kenshiro',raohDefeated:true},route:[
      fight('Quiet approach',['elite','elite']),
      rest('Julia at the battlefield',['Julia is alive. The long search reaches its end.','Recover fully. No soldiers will enter the duel.'],{fullHeal:true}),
      finale('Raoh',['RAOH — FINAL BATTLEFIELD','Three phases. Watch the fists, feet, and aura tell.'])]},
].map((l,id)=>{
  const extraNames=[
    ['Scrap road ambush','Dry river raiders','Settlement blockade'],
    ['Burned market patrol','Backstreet siege','Village barricade'],
    ['KING street patrol','Palace supply yard','Royal guard blockade'],
    ['Dust road raiders','Wrecked tanker ambush','Fuel depot blockade'],
    ['Outer prison patrol','Cell block riot','Execution yard guard'],
    ['Cult road ambush','Abandoned quarry','Sealed chamber guard'],
    ['Canal patrol','Stone quarry battle','Pyramid gate guard'],
    ['Army roadblock','Supply depot assault','Command post guard'],
    ['Last army patrol','Broken ridge battle','Final honor guard']
  ][id];
  const pool=[...new Set(l.route.flatMap(n=>n.roles||[]))];
  const groupSize=6+Math.floor(id/3);
  const reinforce=roles=>Array.from({length:groupSize},(_,i)=>roles[i]||pool[i%pool.length]);
  const route=[];let addedPatrol=false;
  l.route.forEach((node,originalIndex)=>{
    if((node.kind==='boss'&&id!==8)||(id===8&&node.fullHeal)){
      for(let j=1;j<3;j++)route.push(fight(extraNames[j],reinforce(pool.slice(j).concat(pool.slice(0,j)))));
    }
    const n={...node,originalIndex};
    if(n.roles)n.roles=id===0&&originalIndex===0?['scavenger','scavenger','thug','thug']:reinforce(n.roles);
    route.push(n);
    if(n.kind==='fight'&&!addedPatrol){route.push(fight(extraNames[0],reinforce(pool)));addedPatrol=true;}
  });
  const placed=route.map((n,i)=>({...n,x:420+i*900}));
  return {...l,id,title:`LEVEL ${id+1} — ${l.name.toUpperCase()}`,subtitle:l.objective,
    route:placed,bossX:placed.at(-1).x,bossIntro:l.route.at(-1).text,waves:[]};
});

const MOVE_LIBRARY={
  thrust:{name:'THRUST',startup:27,active:5,recovery:32,range:155,lane:17,damage:18},
  crush:{name:'CRUSH',startup:34,active:6,recovery:44,range:108,lane:28,damage:25},
  lunge:{name:'LUNGE',startup:24,active:8,recovery:32,range:95,lane:20,damage:20,advance:5},
  follow:{name:'DELAYED STRIKE',startup:39,active:5,recovery:28,range:108,lane:22,damage:18},
  shotgun:{name:'SHOTGUN — RELOAD AFTER',startup:42,active:3,recovery:72,range:350,lane:23,damage:24},
  whip:{name:'WHIP SWEEP',startup:34,active:6,recovery:38,range:210,lane:26,damage:19},
  charge:{name:'CHARGE',startup:43,active:20,recovery:55,range:78,lane:20,damage:28,advance:7},
  slam:{name:'HAND SLAM',startup:60,active:8,recovery:65,range:145,lane:26,damage:28,ground:true},
  sweep:{hitZone:'lower',name:'ARM SWEEP',startup:46,active:7,recovery:48,range:250,lane:30,damage:22},
  aerial:{hitZone:'head',name:'DIVING STRIKE',startup:38,active:12,recovery:45,range:100,lane:22,damage:23,advance:4,jump:true},
  aura:{name:'AURA BURST',startup:54,active:7,recovery:48,range:280,lane:23,damage:27},
  bomb:{name:'EXPLOSIVE',startup:55,active:4,recovery:58,range:70,lane:22,damage:20,ground:true},
};
const bossProfile=(hp,dmg,spd,moves,color,extra={})=>({hp,dmg,spd,moves,color,...extra});
const BOSS_PROFILES={
  Spade:bossProfile(320,22,2.2,['thrust','lunge'],'#694153'),
  Heart:bossProfile(500,30,1.3,['crush','charge'],'#b54839',{guard:true}),
  Shin:bossProfile(480,22,2.6,['thrust','follow','aerial'],'#a85466'),
  Jagi:bossProfile(440,24,1.8,['shotgun'],'#765b41'),
  Uighur:bossProfile(560,28,1.5,['whip','charge','whip'],'#474b68'),
  'Devil Rebirth':bossProfile(680,30,1.1,['slam','sweep','slam'],'#625a6f',{giant:true}),
  Souther:bossProfile(580,24,2.6,['thrust','follow','aerial'],'#d3be83',{guard:true}),
  Ryuga:bossProfile(540,23,2.8,['lunge','follow','thrust'],'#97b7ca'),
  Raoh:bossProfile(920,30,2.0,['crush','charge','aura','follow'],'#87674c',{final:true}),
  'Club Enforcer':bossProfile(140,17,1.4,['crush'],'#655645'),
  'Shield Captain':bossProfile(180,17,1.5,['crush','thrust'],'#616e77',{guard:true}),
  Diamond:bossProfile(175,18,2.1,['thrust'],'#b68881'),
  Club:bossProfile(190,18,1.8,['crush','lunge'],'#606a89'),
  'Fang Chief':bossProfile(210,18,1.7,['charge','crush'],'#988260'),
  Amiba:bossProfile(210,16,2.0,['follow','thrust'],'#8d80a5'),
  Jackal:bossProfile(185,17,2.2,['bomb','lunge'],'#8b765a'),
  Yuda:bossProfile(250,20,2.5,['follow','aerial'],'#b86387'),
  'Command Captain':bossProfile(240,20,1.8,['thrust','charge'],'#545968'),
  Captain:bossProfile(180,18,1.7,['thrust'],'#777777'),
};

function initCampaignEnemies() {
  const roles={spear:['thug',52,1.3,'thrust'],knife:['scavenger',36,2.5,null],
    shield:['heavy',75,1.0,null],nanto:['gang',52,2.4,'lunge'],
    gunner:['scavenger',40,1.4,'shotgun'],whip:['gang',58,1.4,'whip'],
    bomber:['scavenger',38,1.3,'bomb'],elite:['heavy',88,1.8,'follow']};
  for(const [name,[base,hp,spd,roleMove]] of Object.entries(roles))
    EDEFS[name]={...EDEFS[base],hp,spd,roleMove};
}

function resetCampaign() {
  GS.story={juliaKnown:'abducted',juliaWhereabouts:'unknown',rescues:[]};
  GS.checkpoint=null;
}
function captureCheckpoint(index,x) {
  GS.checkpoint={version:2,lvlIdx:GS.lvlIdx,nodeIndex:index,x,
    story:JSON.parse(JSON.stringify(GS.story)),mode:GS.mode,
    players:PLAYERS.map(p=>({charIdx:p.charIdx,score:p.score}))};
  try { localStorage.setItem('fist-campaign-checkpoint',JSON.stringify(GS.checkpoint)); } catch(_) {}
}
function restoreCheckpoint() {
  const cp=GS.checkpoint;if(!cp)return false;
  GS.mode=cp.mode;GS.story=JSON.parse(JSON.stringify(cp.story));
  startLevel(cp.lvlIdx,{checkpoint:cp});return true;
}
function loadCampaignSave() {
  try {
    const cp=JSON.parse(localStorage.getItem('fist-campaign-checkpoint'));
    if(![1,2].includes(cp?.version)||!Number.isInteger(cp.lvlIdx)||!CAMPAIGN_LEVELS[cp.lvlIdx]||
       !Number.isInteger(cp.nodeIndex)||!CAMPAIGN_LEVELS[cp.lvlIdx].route[cp.nodeIndex]||
       !Number.isFinite(cp.x)||cp.x<0||cp.x>LEVEL_W||!['1p','2p'].includes(cp.mode)||
       !Array.isArray(cp.players)||cp.players.length!==2||!cp.story||!Array.isArray(cp.story.rescues)||
       cp.players.some(p=>!Number.isInteger(p.charIdx)||p.charIdx<0||p.charIdx>2||!Number.isFinite(p.score)))return false;
    if(cp.version===1){
      const route=CAMPAIGN_LEVELS[cp.lvlIdx].route;
      const index=route.findIndex(n=>n.originalIndex===cp.nodeIndex);
      if(index<0)return false;
      cp.x=clmp(route[index].x+(cp.x-(420+cp.nodeIndex*590)),22,LEVEL_W-30);
      cp.nodeIndex=index;cp.version=2;
    }
    GS.checkpoint=cp;return restoreCheckpoint();
  } catch(_){return false;}
}
function activeParty(){return PLAYERS.filter(p=>!p.inactive&&!p.dying);}
function applyStory(flags){Object.assign(GS.story,flags||{});}
function completeEncounter() {
  const node=LEVELS[GS.lvlIdx].route[GS.nodeIndex];
  if(!node)return;
  if(node.rescue)GS.pickups.push({id:`${GS.lvlIdx}:${GS.nodeIndex}`,x:node.x+100,y:GROUND_Y-48,label:node.rescue});
  GS.nodeIndex++;GS.encounterActive=false;GS.arena=null;GS.bossActive=false;GS.boss=null;GS.state='playing';
  GS.routeDelay=50;cam.maxX=LEVEL_W-gameplayViewWidth();
  if(LEVELS[GS.lvlIdx].route[GS.nodeIndex])captureCheckpoint(GS.nodeIndex,P1.x);
}
function beginEncounter(node) {
  captureCheckpoint(GS.nodeIndex,P1.x);
  GS.encounterActive=true;
  if(node.kind==='rest') {
    activeParty().forEach(p=>{p.hp=node.fullHeal?p.maxHp:Math.min(p.maxHp,p.hp+25);p.special=Math.max(p.special,40);});
    applyStory(node.flags);showDialog(node.text,240);completeEncounter();
    captureCheckpoint(GS.nodeIndex,node.x+90);return;
  }
  const left=Math.max(0,node.x-430);GS.arena={left,right:left+W};
  if(node.kind==='mini'||node.kind==='boss') {
    if(node.checkpoint) {
      activeParty().forEach(p=>{p.hp=Math.max(p.hp,80);p.special=Math.max(p.special,40);});
      captureCheckpoint(GS.nodeIndex,node.x-80);
    }
    GS.boss=mkBoss(node.boss,Math.max(cam.x+gameplayViewWidth(),left+W)+220);GS.boss.entrySide=1;GS.boss.mini=node.kind==='mini';
    GS.bossActive=true;GS.state='boss';
    showDialog(node.text||[node.name.toUpperCase(), 'Read the tell. Counter the recovery.'],200);
  } else {
    node.roles.forEach((role,i)=>{
      const fromLeft=i%2===1;
      const column=Math.floor(i/2),lane=i%3;
      const x=fromLeft?Math.min(cam.x,left)-180-column*90:Math.max(cam.x+gameplayViewWidth(),left+W)+180+column*90;
      const enemy=mkEnemy(role,x,LANE_BACK+12+lane*40);
      enemy.entrySide=fromLeft?-1:1;enemy.dir=-enemy.entrySide;
      enemy.flankEnabled=i%3===1;enemy.flankCooldown=0;
      GS.enemies.push(enemy);
    });
    showDialog([node.name.toUpperCase(),node.rescue?'Clear the area; visit the upper lane to rescue survivors.':'Clear the encounter to continue.'],130);
  }
}
const SUPPLY_DROP_CHANCE=.2;
function breakSupply(item){
  if(item.broken)return;
  item.broken=true;item.revealT=28;
  combatSfx(item.container==='crate'?'wood':item.container==='urn'||item.container==='glass'?'glass':'metal');
  item.hasDrop=Math.random()<SUPPLY_DROP_CHANCE;
}
function updateCampaignRoute() {
  if(!GS.story)resetCampaign();
  for(const item of GS.supplies||[]) {
    if(!item.broken||item.taken)continue;
    if(item.revealT>0){item.revealT--;continue;}
    if(!item.hasDrop){item.taken=true;continue;}
    const p=activeParty().find(p=>p.onGround&&!p.downT&&!p.riseT&&Math.abs(p.x-item.x)<30&&Math.abs(p.y-item.y)<22);
    if(p){item.taken=true;combatSfx('pickup');p.hp=Math.min(p.maxHp,p.hp+(item.kind==='medkit'?45:25));p.special=Math.min(p.maxSpecial,p.special+(item.kind==='water'?25:10));spawnTxt(item.x,item.y-48,item.kind.toUpperCase(),'#bfffc8',14);}
  }
  for(const pickup of GS.pickups) {
    if(pickup.taken)continue;
    if(activeParty().some(p=>p.onGround&&Math.abs(p.x-pickup.x)<48&&Math.abs(p.y-pickup.y)<20)) {
      pickup.taken=true;combatSfx('recover');
      if(!GS.story.rescues.includes(pickup.id)) {
        GS.story.rescues.push(pickup.id);
        activeParty().forEach(p=>{p.hp=Math.min(p.maxHp,p.hp+30);p.special=Math.min(100,p.special+15);});
        showDialog([pickup.label.toUpperCase(),'Survivors reach safety. Health and meter restored.'],170);
      }
    }
  }
  if(GS.routeDelay>0){GS.routeDelay--;return;}
  if(GS.encounterActive) {
    if(!GS.boss&&GS.enemies.every(e=>e.dead))completeEncounter();
    return;
  }
  const node=LEVELS[GS.lvlIdx].route[GS.nodeIndex];
  if(node&&activeParty().some(p=>p.x>=node.x-100))beginEncounter(node);
}
function finishCampaignLevel() {
  applyStory(LEVELS[GS.lvlIdx].flags);GS.state='levelclear';GS.resultFr=0;
  GS.arena=null;GS.encounterActive=false;
  if(GS.lvlIdx===8){try{localStorage.removeItem('fist-campaign-checkpoint');}catch(_){}}
}

function selectBossMove(b) {
  let names=b.profile.moves;
  if(b.name==='Raoh')names=b.phase===1?['crush','charge']:b.phase===2?['crush','aura','charge']:['follow','aura','lunge'];
  return {...MOVE_LIBRARY[names[b.moveIndex++%names.length]]};
}
function updateCampaignBoss(b) {
  if(tickEnemyReaction(b))return;
  if(b.name==='Jagi'&&updateWeaponEnemy(b))return;
  b.phase=b.profile.final?(b.hp<b.maxHp*.33?3:b.hp<b.maxHp*.67?2:1):(b.hp<b.maxHp*.5?2:1);
  if(b.attack) {
    const a=b.attack;a.elapsed++;
    if(a.elapsed===a.startup)hostileActionSfx(b,a);
    if(a.jump)b.z=a.elapsed<a.startup?Math.sin(a.elapsed/a.startup*Math.PI)*65:0;
    if(a.elapsed>=a.startup&&a.elapsed<a.startup+a.active) {
      if(a.advance)b.x=clmp(b.x+b.dir*a.advance,GS.arena?.left+35||35,(GS.arena?.right||LEVEL_W)-35);
      for(const p of activeParty()) {
        if(a.hits.has(p)||p.z>42)continue;
        const inArea=a.ground?Math.abs(p.x-a.markX)<a.range*.5&&Math.abs(p.y-a.markY)<a.lane:inStrikeLane(b,p,a.range,a.lane);
        if(inArea&&damagePlayer(p,a.damage,b,attackHitZone(a)))a.hits.add(p);
      }
    }
    if(a.elapsed>=a.startup+a.active+a.recovery){b.attack=null;b.z=0;b.cooldown=22;setFighterState(b,'approach');}
    return;
  }
  b.cooldown=Math.max(0,b.cooldown-1);
  const p=nearestPlayer(b.x,b.y);if(!p)return;
  b.dir=p.x>=b.x?1:-1;
  const distance=Math.abs(p.x-b.x),dy=p.y-b.y;
  const preferred=b.name==='Jagi'?290:b.profile.giant?220:115;
  if(distance>preferred||Math.abs(dy)>20) {
    if(distance>preferred)b.x+=b.dir*b.spd*.7;
    b.y=clmp(b.y+Math.sign(dy)*Math.min(Math.abs(dy),1.0),LANE_BACK,LANE_FRONT);
    setFighterState(b,'walk');return;
  }
  setFighterState(b,'idle');
  if(!b.cooldown&&!p.downT&&!p.riseT) {
    const move=selectBossMove(b);
    b.attack={...move,elapsed:0,hits:new Set(),markX:p.x,markY:p.y,target:p};
    b.fr=0;setFighterState(b,'attack');
  }
}
function bossOpening(b) {return b.attack&&b.attack.elapsed>=b.attack.startup+b.attack.active;}
function drawCampaignBoss(b,state,fr) {
  // Fallback while the character's new PNG sheet is loading or unavailable.
  const d={...EDEFS.heavy,scale:b.profile.giant?2.8:b.name==='Raoh'?1.7:1.35,
    torsoClr:b.profile.color,legClr:'#272632',skinClr:'#bd936f',hairClr:'#c6ac79'};
  // Pass an explicit procedural-only flag, preserving every existing sprite asset.
  drawEnemy(0,0,b.dir,state,fr,d,b.hp,b.maxHp,true);
  ctx.fillStyle=b.profile.color;ctx.font='bold 11px Courier New';ctx.textAlign='center';
  ctx.fillText(b.name.toUpperCase(),0,-(b.profile.giant?350:180));ctx.textAlign='left';
}

function drawCampaignScenery(camX) {
  const theme=LEVELS[GS.lvlIdx].theme;
  const village=['village','city','prison','cult','capital'].includes(theme);
  ctx.save();
  const filters={city:'saturate(.7) contrast(1.06)',prison:'saturate(.4) brightness(.64)',cult:'hue-rotate(35deg) brightness(.55)',pyramid:'sepia(.35) brightness(1.15)',capital:'saturate(.45) brightness(.72)',plateau:'saturate(.45) brightness(.88)'};
  if(filters[theme])ctx.filter=filters[theme];
  drawArcadeBackground(camX,village);ctx.restore();
  // Layered landmark silhouettes adapt the existing painted scenery to each chapter.
  const x=950-camX*.28;
  ctx.save();ctx.globalAlpha=.62;
  if(theme==='pyramid') {
    ctx.fillStyle='#dec797';ctx.beginPath();ctx.moveTo(x-300,400);ctx.lineTo(x,95);ctx.lineTo(x+300,400);ctx.fill();
    ctx.fillStyle='#88775e';ctx.beginPath();ctx.moveTo(x,95);ctx.lineTo(x+300,400);ctx.lineTo(x+50,400);ctx.fill();
  } else if(theme==='prison'||theme==='cult') {
    ctx.fillStyle='#1d242e';for(let i=0;i<7;i++)ctx.fillRect(x-640+i*180,130,22,292);
    ctx.fillRect(0,112,sceneWidth,26);ctx.fillRect(0,390,sceneWidth,12);
  } else if(theme==='city'||theme==='capital') {
    ctx.fillStyle='#873e3b';for(let i=0;i<5;i++){const px=x-450+i*250;ctx.fillRect(px,150,34,135);ctx.fillStyle='#c9a477';ctx.fillRect(px+15,160,4,95);ctx.fillRect(px+7,185,20,4);ctx.fillStyle='#873e3b';}
  }
  ctx.restore();
}
function supplyForMap(map,index){
  return [['water','food'],['food','medkit'],['medkit','food'],['water','food'],['medkit','water'],['water','food'],['food','medkit'],['medkit','food'],['medkit','water']][map][index%2];
}
function containerForMap(map){return ['barrel','crate','cabinet','barrel','cabinet','barrel','urn','crate','crate'][map];}
// Same world-space reference as the playable fighters, before lane perspective.
const SUPPLY_CONTAINER_HEIGHT = 144 * .7;
function drawGroundShadow(x,y,width,elevation=0){
  ctx.save();ctx.translate(x,y);
  const fade=Math.max(.25,1-elevation/240), spread=Math.max(.55,1-elevation/350);
  for(let i=3;i>=0;i--){
    ctx.fillStyle=`rgba(12,9,8,${(.035+(3-i)*.025)*fade})`;
    ctx.beginPath();ctx.ellipse(5+i,2,width*spread+i*3,Math.max(3,width*.2)+i,0,0,Math.PI*2);ctx.fill();
  }
  // Tight contact shadow makes the base meet the road; airborne objects lose it.
  const contact=Math.max(0,1-elevation/24);
  if(contact>0){
    ctx.fillStyle=`rgba(10,8,6,${.28*contact})`;
    ctx.beginPath();ctx.ellipse(0,1,width*.82,Math.max(2,width*.09),0,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
}
const SALVAGE_ART = new Image();SALVAGE_ART.src='assets/props/salvage.png';
function drawSalvageArt(index,height){
  if(!SALVAGE_ART.complete||!SALVAGE_ART.naturalWidth)return false;
  const w=SALVAGE_ART.naturalWidth/4,h=SALVAGE_ART.naturalHeight/2,scale=height/(h-8);
  ctx.drawImage(SALVAGE_ART,index%4*w,Math.floor(index/4)*h,w,h,-w*scale/2,-(h-4)*scale,w*scale,h*scale);
  return true;
}
function drawSupplyBreak(item){
  const t=1-item.revealT/28;
  if(t>=1)return;
  ctx.save();
  for(let i=0;i<9;i++){
    const dir=i%2?-1:1,x=dir*t*(24+i*6),y=-35-Math.sin(t*Math.PI)*(26+i*5)+t*38;
    ctx.save();ctx.translate(x,y);ctx.rotate(dir*t*(2+i*.3));ctx.globalAlpha=1-t;
    ctx.fillStyle=item.container==='crate'?'#887052':i%2?'#73513a':'#454940';
    ctx.fillRect(-5,-3,10+i%3*3,6);ctx.strokeStyle='#b29a70';ctx.strokeRect(-5,-3,10+i%3*3,6);ctx.restore();
  }
  ctx.fillStyle=`rgba(164,140,108,${(1-t)*.3})`;
  for(let i=0;i<5;i++){ctx.beginPath();ctx.ellipse((i-2)*t*20,-8-t*12,9+t*22,5+t*9,0,0,Math.PI*2);ctx.fill();}
  ctx.restore();
}
function drawSupplyContainer(kind){
  if(drawSalvageArt(({barrel:0,crate:1,cabinet:2,urn:3})[kind]??0,SUPPLY_CONTAINER_HEIGHT))return;
  ctx.save();ctx.scale(SUPPLY_CONTAINER_HEIGHT/56,SUPPLY_CONTAINER_HEIGHT/56);
  ctx.lineWidth=1.5;ctx.strokeStyle='#241b17';
  const metal=ctx.createLinearGradient(-25,0,25,0);
  metal.addColorStop(0,'#343b38');metal.addColorStop(.3,'#929077');metal.addColorStop(.7,'#655543');metal.addColorStop(1,'#282c2b');
  ctx.fillStyle=metal;
  if(kind==='urn'){
    // Salvaged fuel canister replaces the clean pottery silhouette.
    ctx.fillRect(-19,-49,38,49);ctx.strokeRect(-19,-49,38,49);
    ctx.strokeRect(-10,-55,20,7);ctx.fillStyle='#252a27';ctx.fillRect(10,-53,8,5);
  }else if(kind==='barrel'){
    ctx.fillRect(-23,-51,46,48);ctx.strokeRect(-23,-51,46,48);
    ctx.beginPath();ctx.ellipse(0,-51,23,5,0,0,Math.PI*2);ctx.fill();ctx.stroke();
    for(const y of [-42,-12]){ctx.fillStyle='#292e2b';ctx.fillRect(-24,y,48,4);ctx.fillStyle='#aaa48b';ctx.fillRect(-24,y,48,1);}
  }else{
    ctx.fillRect(-25,-56,50,56);ctx.strokeRect(-25,-56,50,56);
    if(kind==='cabinet'){
      ctx.strokeRect(-20,-51,40,46);ctx.fillStyle='#202521';ctx.fillRect(12,-34,3,11);
      for(let y=-46;y<-35;y+=4)ctx.fillRect(-14,y,20,1);
    }else{
      ctx.fillStyle='#5a4733';for(let y=-50;y<-3;y+=11)ctx.fillRect(-21,y,42,9);
      ctx.strokeStyle='#a39773';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-20,-51);ctx.lineTo(20,-5);ctx.stroke();
      ctx.fillStyle='#2c3331';ctx.fillRect(-25,-54,7,54);ctx.fillRect(18,-54,7,54);
    }
  }
  // Fixed wear marks avoid shimmering or random changes between frames.
  ctx.fillStyle='#854a2d';for(let i=0;i<15;i++){const x=(i*17%37)-18,y=-8-(i*13%37);ctx.fillRect(x,y,3+i%4,1+i%3);}
  ctx.strokeStyle='#c3b28a';ctx.lineWidth=.6;
  for(let i=0;i<7;i++){const x=(i*11%30)-15,y=-12-i*5;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+7,y-2);ctx.stroke();}
  ctx.fillStyle='#bbb49a';for(const x of [-20,20])for(const y of [-49,-7]){ctx.beginPath();ctx.arc(x,y,1.3,0,Math.PI*2);ctx.fill();}
  // Faded hazard plate and improvised steel patch.
  ctx.fillStyle='#c6a34e';ctx.fillRect(-9,-34,18,15);ctx.strokeStyle='#332b20';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(-6,-22);ctx.lineTo(0,-31);ctx.lineTo(6,-22);ctx.closePath();ctx.stroke();
  ctx.fillStyle='#332b20';ctx.fillRect(-1,-28,2,3);ctx.fillRect(-1,-24,2,1);
  ctx.restore();
}
function drawSupplyIcon(kind){
  if(drawSalvageArt(({water:4,medkit:5,food:6})[kind]??6,38))return;
  ctx.lineWidth=2;ctx.strokeStyle='#17212a';
  if(kind==='water'){
    ctx.fillStyle='#93dfe8';ctx.fillRect(-10,-32,20,30);ctx.strokeRect(-10,-32,20,30);
    ctx.fillStyle='#456578';ctx.fillRect(-7,-40,14,8);ctx.fillStyle='#e7fcff';ctx.fillRect(-6,-27,4,18);
    ctx.fillStyle='#217aaa';ctx.fillRect(-9,-12,18,9);
  }else if(kind==='medkit'){
    ctx.fillStyle='#ebe8cf';ctx.fillRect(-21,-29,42,27);ctx.strokeRect(-21,-29,42,27);ctx.strokeRect(-8,-36,16,7);
    ctx.fillStyle='#d44240';ctx.fillRect(-4,-24,8,17);ctx.fillRect(-9,-19,18,7);
  }else{
    ctx.fillStyle='#8e9a68';ctx.fillRect(-20,-27,40,25);ctx.strokeRect(-20,-27,40,25);
    ctx.fillStyle='#edc586';ctx.beginPath();ctx.ellipse(0,-23,16,8,-.15,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.strokeStyle='#ab743e';for(let x=-8;x<=8;x+=8){ctx.beginPath();ctx.moveTo(x,-27);ctx.lineTo(x-3,-21);ctx.stroke();}
  }
}
function drawCampaignMarkers(camX) {
  for(const item of GS.supplies||[]) {
    if(item.taken||Math.abs(item.x-camX-sceneWidth/2)>sceneWidth)continue;
    const scale=fighterDepthScale(item.y),elevation=item.broken?Math.sin(item.revealT/28*Math.PI)*45:0;
    if(!item.broken||item.hasDrop)drawGroundShadow(item.x-camX,item.y,(item.broken?19:43)*scale,elevation);
    ctx.save();ctx.translate(item.x-camX,item.y);ctx.scale(scale,scale);
    if(!item.broken)drawSupplyContainer(item.container);
    else {drawSupplyBreak(item);if(item.hasDrop){ctx.translate(0,-Math.sin(item.revealT/28*Math.PI)*45);drawSupplyIcon(item.kind);}}
    ctx.restore();
  }
  for(const p of GS.pickups) {
    if(p.taken||Math.abs(p.x-camX-sceneWidth/2)>sceneWidth)continue;
    drawGroundShadow(p.x-camX,p.y,23);
    ctx.save();ctx.strokeStyle='#a7e7c4';ctx.lineWidth=2;ctx.strokeRect(p.x-camX-26,p.y-16,52,32);
    ctx.translate(p.x-camX,p.y);drawSupplyIcon('medkit');ctx.translate(-p.x+camX,-p.y);
    ctx.fillStyle='#caffdc';ctx.font='12px Courier New';ctx.textAlign='center';ctx.fillText('RESCUE + SUPPLIES',p.x-camX,p.y-42);ctx.restore();
  }
}
function drawCampaignObjective(){
  const node=LEVELS[GS.lvlIdx].route[GS.nodeIndex];
  ctx.save();ctx.fillStyle='rgba(8,10,14,.72)';ctx.fillRect(W/2-255,42,510,30);
  ctx.fillStyle='#e9d6af';ctx.font='12px Courier New';ctx.textAlign='center';
  ctx.fillText(node?`${GS.encounterActive?'CLEAR':'GO →'}  ${node.name.toUpperCase()}`:'CHAPTER COMPLETE',W/2,62);ctx.restore();
}
