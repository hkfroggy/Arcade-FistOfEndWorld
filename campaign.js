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
].map((l,id)=>({...l,id,title:`LEVEL ${id+1} — ${l.name.toUpperCase()}`,subtitle:l.objective,
  route:l.route.map((n,i)=>({...n,x:420+i*590})),bossX:420+(l.route.length-1)*590,
  bossIntro:l.route.at(-1).text,waves:[]}));

const MOVE_LIBRARY={
  thrust:{name:'THRUST',startup:27,active:5,recovery:32,range:155,lane:17,damage:18},
  crush:{name:'CRUSH',startup:34,active:6,recovery:44,range:108,lane:28,damage:25},
  lunge:{name:'LUNGE',startup:24,active:8,recovery:32,range:95,lane:20,damage:20,advance:5},
  follow:{name:'DELAYED STRIKE',startup:39,active:5,recovery:28,range:108,lane:22,damage:18},
  shotgun:{name:'SHOTGUN — RELOAD AFTER',startup:42,active:3,recovery:72,range:350,lane:23,damage:24},
  whip:{name:'WHIP SWEEP',startup:34,active:6,recovery:38,range:210,lane:26,damage:19},
  charge:{name:'CHARGE',startup:43,active:20,recovery:55,range:78,lane:20,damage:28,advance:7},
  slam:{name:'HAND SLAM',startup:60,active:8,recovery:65,range:145,lane:26,damage:28,ground:true},
  sweep:{name:'ARM SWEEP',startup:46,active:7,recovery:48,range:250,lane:30,damage:22},
  aerial:{name:'DIVING STRIKE',startup:38,active:12,recovery:45,range:100,lane:22,damage:23,advance:4,jump:true},
  aura:{name:'AURA BURST',startup:54,active:7,recovery:48,range:280,lane:23,damage:27},
  bomb:{name:'EXPLOSIVE',startup:55,active:4,recovery:58,range:70,lane:22,damage:20,ground:true},
};
const bossProfile=(hp,dmg,spd,moves,color,extra={})=>({hp,dmg,spd,moves,color,...extra});
const BOSS_PROFILES={
  Spade:bossProfile(320,22,2.2,['thrust','lunge'],'#694153'),
  Heart:bossProfile(500,30,1.3,['crush','charge'],'#b54839',{guard:true}),
  Shin:bossProfile(480,22,2.6,['thrust','follow','aerial'],'#a85466'),
  Jagi:bossProfile(440,24,1.8,['shotgun','lunge','shotgun'],'#765b41'),
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
  GS.checkpoint={version:1,lvlIdx:GS.lvlIdx,nodeIndex:index,x,
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
    if(cp?.version!==1||!Number.isInteger(cp.lvlIdx)||!CAMPAIGN_LEVELS[cp.lvlIdx]||
       !Number.isInteger(cp.nodeIndex)||!CAMPAIGN_LEVELS[cp.lvlIdx].route[cp.nodeIndex]||
       !Number.isFinite(cp.x)||cp.x<0||cp.x>4800||!['1p','2p'].includes(cp.mode)||
       !Array.isArray(cp.players)||cp.players.length!==2||!cp.story||!Array.isArray(cp.story.rescues)||
       cp.players.some(p=>!Number.isInteger(p.charIdx)||p.charIdx<0||p.charIdx>2||!Number.isFinite(p.score)))return false;
    GS.checkpoint=cp;return restoreCheckpoint();
  } catch(_){return false;}
}
function activeParty(){return PLAYERS.filter(p=>!p.inactive);}
function applyStory(flags){Object.assign(GS.story,flags||{});}
function completeEncounter() {
  const node=LEVELS[GS.lvlIdx].route[GS.nodeIndex];
  if(!node)return;
  if(node.rescue)GS.pickups.push({id:`${GS.lvlIdx}:${GS.nodeIndex}`,x:node.x+100,y:GROUND_Y-48,label:node.rescue});
  GS.nodeIndex++;GS.encounterActive=false;GS.arena=null;GS.bossActive=false;GS.boss=null;GS.state='playing';
  GS.routeDelay=50;cam.maxX=LEVEL_W-W;
}
function beginEncounter(node) {
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
    GS.boss=mkBoss(node.boss,left+W-200);GS.boss.mini=node.kind==='mini';
    GS.bossActive=true;GS.state='boss';
    showDialog(node.text||[node.name.toUpperCase(), 'Read the tell. Counter the recovery.'],200);
  } else {
    node.roles.slice(0,5).forEach((role,i)=>{
      const fromLeft=GS.lvlIdx>0&&i===node.roles.length-1&&node.roles.length>2;
      GS.enemies.push(mkEnemy(role,fromLeft?left+65:left+W-170-i*75,GROUND_Y-35+(i%3)*24));
    });
    showDialog([node.name.toUpperCase(),node.rescue?'Clear the area; visit the upper lane to rescue survivors.':'Clear the encounter to continue.'],130);
  }
}
function updateCampaignRoute() {
  if(!GS.story)resetCampaign();
  for(const pickup of GS.pickups) {
    if(pickup.taken)continue;
    if(activeParty().some(p=>p.onGround&&Math.abs(p.x-pickup.x)<48&&Math.abs(p.y-pickup.y)<20)) {
      pickup.taken=true;
      if(!GS.story.rescues.includes(pickup.id)) {
        GS.story.rescues.push(pickup.id);
        activeParty().forEach(p=>{p.hp=Math.min(p.maxHp,p.hp+30);p.special=Math.min(100,p.special+15);});
        showDialog([pickup.label.toUpperCase(),'Survivors reach safety. Health and meter restored.'],170);
      }
    }
  }
  if(GS.routeDelay>0){GS.routeDelay--;return;}
  if(GS.encounterActive) {
    if(!GS.boss&&GS.enemies.every(e=>e.dead||e.dying>0))completeEncounter();
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
  b.phase=b.profile.final?(b.hp<b.maxHp*.33?3:b.hp<b.maxHp*.67?2:1):(b.hp<b.maxHp*.5?2:1);
  if(b.attack) {
    const a=b.attack;a.elapsed++;
    if(a.jump)b.z=a.elapsed<a.startup?Math.sin(a.elapsed/a.startup*Math.PI)*65:0;
    if(a.elapsed>=a.startup&&a.elapsed<a.startup+a.active) {
      if(a.advance)b.x=clmp(b.x+b.dir*a.advance,GS.arena?.left+35||35,(GS.arena?.right||LEVEL_W)-35);
      for(const p of activeParty()) {
        if(a.hits.has(p)||p.z>42)continue;
        const inArea=a.ground?Math.abs(p.x-a.markX)<a.range*.5&&Math.abs(p.y-a.markY)<a.lane:inStrikeLane(b,p,a.range,a.lane);
        if(inArea&&damagePlayer(p,a.damage,b))a.hits.add(p);
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
function drawBossTelegraph(b,camX) {
  if(!b?.attack)return;
  const a=b.attack;if(a.elapsed>=a.startup+a.active)return;
  const active=a.elapsed>=a.startup;
  const x=a.ground?a.markX-a.range*.5:b.dir>0?b.x:b.x-a.range;
  ctx.save();ctx.fillStyle=active?'rgba(255,75,35,.30)':'rgba(255,205,100,.17)';
  ctx.strokeStyle=active?'#ff6038':'#ffd47d';ctx.lineWidth=2;
  ctx.fillRect(x-camX,(a.ground?a.markY:b.y)-a.lane,a.range,a.lane*2);
  ctx.strokeRect(x-camX,(a.ground?a.markY:b.y)-a.lane,a.range,a.lane*2);
  ctx.font='bold 12px Courier New';ctx.textAlign='center';ctx.fillStyle='#ffe4ad';
  ctx.fillText(a.name,x-camX+a.range/2,(a.ground?a.markY:b.y)-a.lane-8);ctx.restore();
}
function drawCampaignBoss(b,state,fr) {
  if(b.name==='Spade')return drawSpade(0,0,b.dir,state,fr);
  if(b.name==='Heart')return drawHeart(0,0,b.dir,state,fr);
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
    ctx.fillRect(0,112,W,26);ctx.fillRect(0,390,W,12);
  } else if(theme==='city'||theme==='capital') {
    ctx.fillStyle='#873e3b';for(let i=0;i<5;i++){const px=x-450+i*250;ctx.fillRect(px,150,34,135);ctx.fillStyle='#c9a477';ctx.fillRect(px+15,160,4,95);ctx.fillRect(px+7,185,20,4);ctx.fillStyle='#873e3b';}
  }
  ctx.restore();
}
function drawCampaignMarkers(camX) {
  for(const p of GS.pickups) {
    if(p.taken||Math.abs(p.x-camX-W/2)>W)continue;
    ctx.save();ctx.strokeStyle='#a7e7c4';ctx.lineWidth=2;ctx.strokeRect(p.x-camX-26,p.y-16,52,32);
    ctx.fillStyle='#caffdc';ctx.font='12px Courier New';ctx.textAlign='center';ctx.fillText('RESCUE + SUPPLIES',p.x-camX,p.y-23);ctx.restore();
  }
  const node=LEVELS[GS.lvlIdx].route[GS.nodeIndex];
  ctx.save();ctx.fillStyle='rgba(8,10,14,.72)';ctx.fillRect(W/2-255,42,510,30);
  ctx.fillStyle='#e9d6af';ctx.font='12px Courier New';ctx.textAlign='center';
  ctx.fillText(node?`${GS.encounterActive?'CLEAR':'GO →'}  ${node.name.toUpperCase()}`:'CHAPTER COMPLETE',W/2,62);ctx.restore();
}
