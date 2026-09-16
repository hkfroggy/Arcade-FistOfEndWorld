// Illustrated prologue. Art is preloaded separately from gameplay sprites.
const SHIN_OPENING_LINE='You’re weak. You can’t protect her.';
const OPENING_BEATS=[
 ['restrained','Shin, what are you doing? Let Julia go!'],
 ['captive','Ken… run!'],
 ['arrival',SHIN_OPENING_LINE],
 ['threat',SHIN_OPENING_LINE],
 ...Array.from({length:7},(_,i)=>['strike',SHIN_OPENING_LINE,'',i+1]),
 ['stars',SHIN_OPENING_LINE],
 ['fallen','Julia… I’ll come and save you. I promise…'],
];
const OPENING={beat:0,t:0,elapsed:0};
// 60 Hz story clock: seven uninterrupted strikes in 0.58 seconds.
const OPENING_TIMES={restrained:180,captive:120,arrival:90,threat:90,strike:5,stars:45,fallen:240};
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
 if(beat[0]==='strike'&&OPENING.t===1)sndHit();
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
 if(['threat','strike','stars'].includes(kind))return 'arrival';
 return 'fallen';
}
function drawOpening(){
 const beat=OPENING_BEATS[OPENING.beat];if(!beat)return;
 const kind=beat[0],t=OPENING.t,progress=Math.min(1,t/OPENING_TIMES[kind]);
 ctx.fillStyle='#090707';ctx.fillRect(0,0,W,H);
 const reduced=typeof window.matchMedia==='function'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const img=OPENING_ART[openingArtKey(kind)];
 if(img?.complete&&img.naturalWidth){
  ctx.save();
  // Slow camera push. The seven strikes stay on one continuous shot.
  const cTicks=kind==='arrival'?t:kind==='threat'?90+t:kind==='strike'?180+(beat[3]-1)*5+t:215+t;
  const zoom=reduced?1:openingArtKey(kind)==='arrival'?1+Math.min(1,cTicks/260)*.045:1+progress*.045;
  ctx.translate(W/2,H*.46);ctx.scale(zoom,zoom);ctx.translate(-W/2,-H*.46);
  const scale=Math.max(W/img.naturalWidth,H/img.naturalHeight);
  ctx.drawImage(img,(W-img.naturalWidth*scale)/2,(H-img.naturalHeight*scale)/2,img.naturalWidth*scale,img.naturalHeight*scale);
  if(kind==='strike'||kind==='stars'){
   const count=kind==='stars'?7:beat[3]-(t<1?1:0);
   ctx.strokeStyle='rgba(255,204,125,.75)';ctx.lineWidth=2;
   if(kind==='stars'){
    ctx.beginPath();OPENING_STARS.forEach(([x,y],i)=>i?ctx.lineTo(x*W,y*H):ctx.moveTo(x*W,y*H));
    ctx.moveTo(OPENING_STARS[6][0]*W,OPENING_STARS[6][1]*H);ctx.lineTo(OPENING_STARS[3][0]*W,OPENING_STARS[3][1]*H);ctx.stroke();
   }
   OPENING_STARS.slice(0,count).forEach(([x,y],i)=>{
    ctx.fillStyle='#b7372f';ctx.beginPath();ctx.arc(x*W,y*H,5,0,Math.PI*2);ctx.fill();
    if(kind==='stars'||i===count-1){ctx.fillStyle='#ffe5ad';ctx.beginPath();ctx.arc(x*W,y*H,kind==='strike'?4:2,0,Math.PI*2);ctx.fill();}
   });
   if(kind==='strike'&&t>=1&&t<4&&!reduced){
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
 ctx.textAlign='right';ctx.fillStyle='#b5aaa0';ctx.font='12px sans-serif';ctx.fillText('ENTER 下一幕   /   Q 略過',W-24,H-18);
 if(t<14&&['restrained','captive','arrival','fallen'].includes(kind)){ctx.fillStyle=`rgba(0,0,0,${1-t/14})`;ctx.fillRect(0,0,W,H);}
 ctx.textAlign='left';
}
