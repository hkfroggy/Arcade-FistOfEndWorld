// Arcade selection screen; uses the same authored sprites as gameplay.
function drawCharSelect(fr) {
 ctx.save();
 drawArcadeBackground(fr*.12,false);
 const shade=ctx.createLinearGradient(0,0,0,H);shade.addColorStop(0,'rgba(5,9,17,.96)');shade.addColorStop(.55,'rgba(9,13,24,.84)');shade.addColorStop(1,'rgba(3,6,13,.98)');
 ctx.fillStyle=shade;ctx.fillRect(0,0,W,H);
 ctx.fillStyle='#dfa653';ctx.fillRect(60,32,45,3);ctx.fillRect(W-105,32,45,3);
 ctx.textAlign='center';ctx.font='bold 13px Courier New';ctx.fillText('北斗の拳  /  WASTELAND BRAWLER',W/2,36);
 ctx.font='bold 44px sans-serif';ctx.fillStyle='#f4e8d3';ctx.fillText('SELECT YOUR FIGHTER',W/2,91);
 ctx.font='14px sans-serif';ctx.fillStyle='#b4bcca';ctx.fillText(GS.mode==='2p'?'TWO WARRIORS. ONE ROAD THROUGH THE WASTELAND.':'CHOOSE YOUR MARTIAL ART',W/2,118);
 const colors=['#479bf5','#51d5ba','#b694ee'];
 const titles=['北斗神拳','南斗水鳥拳','北斗有情拳'];
 const traits=['Relentless combinations','Swift cutting strikes','Precise pressure points'];
 const cardW=368,cardH=398,top=146,start=68,gap=20;
 CHAR_DEFS.forEach((cd,i)=>{
  const x=start+i*(cardW+gap),p1=!!JOIN.sources[0]&&CS.cursors[0]===i,p2=GS.mode==='2p'&&CS.cursors[1]===i,selected=p1||p2;
  const ready=(p1&&CS.confirmed[0])||(p2&&CS.confirmed[1]);
  ctx.save();ctx.beginPath();ctx.rect(x,top,cardW,cardH);ctx.clip();
  const g=ctx.createLinearGradient(x,top,x+cardW,top+cardH);g.addColorStop(0,selected?'#293647':'#18202e');g.addColorStop(1,'#080e19');ctx.fillStyle=g;ctx.fillRect(x,top,cardW,cardH);
  ctx.globalAlpha=selected?.15:.07;ctx.fillStyle=colors[i];ctx.beginPath();ctx.moveTo(x+230,top);ctx.lineTo(x+350,top);ctx.lineTo(x+140,top+cardH);ctx.lineTo(x+20,top+cardH);ctx.fill();ctx.globalAlpha=1;
  ctx.font='bold 80px serif';ctx.fillStyle=selected?'rgba(237,224,200,.09)':'rgba(237,224,200,.04)';ctx.fillText(titles[i],x+cardW/2,top+125,cardW-32);
  ctx.fillStyle='rgba(0,0,0,.55)';ctx.beginPath();ctx.ellipse(x+cardW/2,top+294,108,13,0,0,Math.PI*2);ctx.fill();
  ctx.save();ctx.translate(x+cardW/2-12,top+294);ctx.scale(1.48,1.48);if(!selected)ctx.globalAlpha=.72;
  // Authored portraits all face right; never mirror Rei's right-facing atlas.
  const portraitDirection=1;
  if(i!==0 || !tryDrawSpr('ken_portrait',0,0,portraitDirection,0,fr,aStep('idle')))
    cd.drawFn(0,0,portraitDirection,'idle',fr+i*11,0);
  ctx.restore();
  const fade=ctx.createLinearGradient(0,top+292,0,top+cardH);fade.addColorStop(0,'rgba(7,12,20,0)');fade.addColorStop(.35,'rgba(7,12,20,.94)');fade.addColorStop(1,'#070c14');ctx.fillStyle=fade;ctx.fillRect(x,top+292,cardW,106);
  ctx.font='bold 28px sans-serif';ctx.fillStyle=selected?'#fff1d7':'#9ba8b8';ctx.fillText(cd.name,x+cardW/2,top+340);
  ctx.font='14px sans-serif';ctx.fillStyle=colors[i];ctx.fillText(cd.style,x+cardW/2,top+365);
  ctx.font='12px sans-serif';ctx.fillStyle='#a6b3c3';ctx.fillText(traits[i],x+cardW/2,top+385);
  ctx.textAlign='left';ctx.font='bold 12px Courier New';ctx.fillStyle='#7e8c9f';ctx.fillText('0'+(i+1),x+16,top+25);ctx.textAlign='center';
  [p1,p2].forEach((here,pi)=>{if(!here)return;const bx=x+cardW-100-pi*100;ctx.fillStyle=CS.confirmed[pi]?'#e6b75f':pi===0?'#347bd3':'#25856c';ctx.fillRect(bx,top+12,88,26);ctx.fillStyle='#fff';ctx.font='bold 12px sans-serif';ctx.fillText(`P${pi+1} ${CS.confirmed[pi]?'READY':'SELECT'}`,bx+44,top+30);});
  ctx.restore();ctx.lineWidth=selected?3:1;ctx.strokeStyle=ready?'#e8b965':selected?colors[i]:'#354153';ctx.strokeRect(x,top,cardW,cardH);
  if(selected){ctx.fillStyle=ready?'#e8b965':colors[i];ctx.fillRect(x,top,cardW,4);}
 });
 const allReady=!!JOIN.sources[0]&&CS.confirmed[0]&&(GS.mode==='1p'||CS.confirmed[1]);
 ctx.fillStyle='#101b29';ctx.fillRect(68,564,1144,82);ctx.strokeStyle='#344558';ctx.lineWidth=1;ctx.strokeRect(68,564,1144,82);
 if(allReady){ctx.font='bold 26px sans-serif';ctx.fillStyle='#f1c378';ctx.fillText('THE JOURNEY BEGINS',W/2,599);ctx.fillStyle='#425365';ctx.fillRect(390,618,500,4);ctx.fillStyle='#f1c378';ctx.fillRect(390,618,500*Math.min(1,CS.readyTimer/60),4);}
 else {
  const count=GS.mode==='2p'?2:1;
  for(let pi=0;pi<count;pi++){const x=count===1?W/2:pi===0?W*.28:W*.72;ctx.font='bold 19px sans-serif';ctx.fillStyle=pi===0?'#72b5ff':'#74e5be';ctx.fillText(JOIN.sources[pi]?`P${pi+1}  ${CHAR_DEFS[CS.cursors[pi]].name}  ${CS.confirmed[pi]?'✓ READY':''}`:'PRESS PUNCH / KICK TO JOIN',x,597);ctx.font='13px sans-serif';ctx.fillStyle='#b1becb';ctx.fillText(CS.confirmed[pi]?'Punch + kick to change selection':'Move to choose · Attack to confirm',x,626);}
 }
 ctx.font='13px sans-serif';ctx.fillStyle='#a7b3c0';ctx.fillText('PUNCH / KICK TO JOIN · MOVE TO CHOOSE · PUNCH / KICK TO CONFIRM',W/2,680);
 ctx.font='11px Courier New';ctx.fillStyle='#637386';ctx.fillText('JOIN IN PRESS ORDER · SECOND PLAYER CAN JOIN DURING PLAY',W/2,705);
 ctx.restore();
}
