// Illustrated prologue. Art is preloaded separately from gameplay sprites.
const OPENING_BEATS=[
 ['restrained','Two soldiers restrain Kenshiro.'],
 ['captive','Two more soldiers seize Julia.'],
 ['arrival','Shin walks toward Kenshiro.'],
 ['threat','You have lost, Kenshiro.'],
 ...Array.from({length:7},(_,i)=>['strike','Seven strikes. A single breath.', '',i+1]),
 ['stars','Seven wounds. The Big Dipper.'],
 ['fallen','Gravely wounded, Kenshiro falls to his knees.'],
 ['question','Julia. Tell me who you love.'],
 ['answer','To save Kenshiro, Julia gives Shin the answer he demands.'],
 ['leave','The soldiers take Julia away.'],
 ['alone','Kenshiro is left among the ruins.'],
 ['anger','Grief becomes resolve.'],
 ['black',''],['desert','One man walks into the wasteland.'],
 ['journey',"Kenshiro’s journey begins."],
];
const OPENING={beat:0,t:0,elapsed:0};
const OPENING_TIMES={restrained:210,captive:190,arrival:180,threat:95,strike:9,stars:140,fallen:210,question:160,answer:200,leave:150,alone:130,anger:120,black:65,desert:150,journey:130};
const OPENING_ART={};
const OPENING_ART_FILES={restrained:'ken-restrained.png',captive:'julia-captured.png',arrival:'shin-approaches.png',fallen:'ken-kneeling.png'};
// Normalized marks: three handle stars leading into a four-star bowl.
const OPENING_STARS=[[.257,.39],[.277,.405],[.289,.437],[.299,.478],[.325,.491],[.329,.548],[.3,.535]];
function loadOpeningArt(){
 for(const [key,file] of Object.entries(OPENING_ART_FILES)){
  const img=new Image();img.src='assets/story/intro-v2/'+file;OPENING_ART[key]=img;
 }
}
function startOpening(){startLevel(0);GS.dialog=null;GS.state='intro';OPENING.beat=0;OPENING.t=0;OPENING.elapsed=0;}
function finishOpening(){startLevel(0);clearKeys();updateGpPrev();}
function updateOpening(){
 const beat=OPENING_BEATS[OPENING.beat];if(!beat)return;
 OPENING.t++;OPENING.elapsed++;
 if(beat[0]==='strike'&&OPENING.t===2)sndHit();
 const next=press('Enter','Space','KeyH')||anyGpPress();
 if(press('KeyQ')){finishOpening();return;}
 if(OPENING.t>=OPENING_TIMES[beat[0]]||(OPENING.t>30&&next)){
  OPENING.beat++;OPENING.t=0;
  if(OPENING.beat>=OPENING_BEATS.length){finishOpening();return;}
 }
 updateGpPrev();
}
function openingArtKey(kind){
 if(['restrained','captive','arrival','fallen'].includes(kind))return kind;
 if(['threat','strike','stars','question'].includes(kind))return 'arrival';
 if(['answer','leave'].includes(kind))return 'captive';
 return 'fallen';
}
function drawOpening(){
 const beat=OPENING_BEATS[OPENING.beat];if(!beat)return;
 const kind=beat[0],t=OPENING.t,progress=Math.min(1,t/OPENING_TIMES[kind]);
 ctx.fillStyle='#090707';ctx.fillRect(0,0,W,H);
 if(kind==='black')return;
 const reduced=typeof window.matchMedia==='function'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const desert=kind==='desert'||kind==='journey';
 const img=OPENING_ART[openingArtKey(kind)];
 if(desert){
  drawArcadeBackground(OPENING.elapsed*.14,false);
  drawKen(240+progress*150,480,1,'walk',OPENING.elapsed,0);
 }else if(img?.complete&&img.naturalWidth){
  ctx.save();
  // Slow camera push. The seven strikes stay on one continuous shot.
  const zoom=reduced?1:kind==='strike'||kind==='stars'?1.045:1+progress*.045;
  ctx.translate(W/2,H*.46);ctx.scale(zoom,zoom);ctx.translate(-W/2,-H*.46);
  const scale=Math.max(W/img.naturalWidth,H/img.naturalHeight);
  ctx.drawImage(img,(W-img.naturalWidth*scale)/2,(H-img.naturalHeight*scale)/2,img.naturalWidth*scale,img.naturalHeight*scale);
  if(kind==='strike'||kind==='stars'){
   const count=kind==='stars'?7:beat[3]-(t<2?1:0);
   ctx.strokeStyle='rgba(255,204,125,.75)';ctx.lineWidth=2;
   if(kind==='stars'){
    ctx.beginPath();OPENING_STARS.forEach(([x,y],i)=>i?ctx.lineTo(x*W,y*H):ctx.moveTo(x*W,y*H));
    ctx.moveTo(OPENING_STARS[6][0]*W,OPENING_STARS[6][1]*H);ctx.lineTo(OPENING_STARS[3][0]*W,OPENING_STARS[3][1]*H);ctx.stroke();
   }
   OPENING_STARS.slice(0,count).forEach(([x,y],i)=>{
    ctx.fillStyle='#b7372f';ctx.beginPath();ctx.arc(x*W,y*H,5,0,Math.PI*2);ctx.fill();
    if(kind==='stars'||i===count-1){ctx.fillStyle='#ffe5ad';ctx.beginPath();ctx.arc(x*W,y*H,kind==='strike'?4:2,0,Math.PI*2);ctx.fill();}
   });
   if(kind==='strike'&&t>=2&&t<6&&!reduced){
    const [x,y]=OPENING_STARS[count-1];ctx.strokeStyle='#ffdf98';ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(W*.36,H*.43);ctx.lineTo(x*W,y*H);ctx.stroke();
   }
  }
  ctx.restore();
 }else{drawArcadeBackground(0,true);}
 // Letterbox and localized captions stay outside the camera transform.
 const shade=ctx.createLinearGradient(0,H*.63,0,H);shade.addColorStop(0,'transparent');shade.addColorStop(1,'rgba(0,0,0,.96)');ctx.fillStyle=shade;ctx.fillRect(0,H*.63,W,H*.37);
 ctx.fillStyle='#080707';ctx.fillRect(0,0,W,27);ctx.fillRect(0,H-100,W,100);
 ctx.textAlign='left';ctx.font='bold 14px sans-serif';ctx.fillStyle='#e1b574';ctx.fillText('PROLOGUE · SEVEN SCARS',32,52);
 ctx.textAlign='center';ctx.fillStyle='#fff0da';ctx.font='25px sans-serif';ctx.fillText(beat[1],W/2,H-55,W-90);
 if(kind==='journey'){ctx.fillStyle='#f4cf79';ctx.font='bold 46px sans-serif';ctx.fillText('STAGE 1',W/2,180);}
 ctx.textAlign='right';ctx.fillStyle='#b5aaa0';ctx.font='12px sans-serif';ctx.fillText('ENTER 下一幕   /   Q 略過',W-24,H-18);
 if(t<14&&kind!=='strike'&&kind!=='stars'){ctx.fillStyle=`rgba(0,0,0,${1-t/14})`;ctx.fillRect(0,0,W,H);}
 ctx.textAlign='left';
}
