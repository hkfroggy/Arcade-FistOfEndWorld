// Local arcade records: each player qualifies independently after declining continue.
const ARCADE_KEY='wasteland-top20-v1';
const ARCADE_ALPHABET='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
let arcade=null;
function readArcadeScores(){
  try{return JSON.parse(localStorage.getItem(ARCADE_KEY)||'[]').filter(r=>/^[A-Z0-9]{3}$/.test(r.name)&&Number.isFinite(r.score)&&r.score>=0).sort((a,b)=>b.score-a.score).slice(0,20);}catch{return [];}
}
function startArcadeContinue(){
  arcade={ticks:600,board:readArcadeScores(),queue:[],letters:[0,0,0],cursor:0,prev:{},repeat:0};
  GS.state='gameover';GS.resultFr=0;hitStop=0;
}
function arcadeInput(){
  const inputs=[getInput(0),getInput(1)];
  const current={up:inputs.some(i=>i.up),down:inputs.some(i=>i.down),left:inputs.some(i=>i.left),right:inputs.some(i=>i.right)};
  const result={confirm:inputs.some(i=>i.punchP)||press('Enter','Space'),back:inputs.some(i=>i.kickP)};
  arcade.repeat++;
  for(const k of Object.keys(current))result[k]=current[k]&&(!arcade.prev[k]||arcade.repeat>20&&arcade.repeat%6===0);
  if(!Object.values(current).some(Boolean))arcade.repeat=0;
  arcade.prev=current;return result;
}
function qualifyArcadeScores(){
  arcade.queue=(GS.mode==='2p'?PLAYERS:[P1]).map((p,i)=>({player:i+1,score:p.score})).filter(p=>p.score>0&&(arcade.board.length<20||p.score>arcade.board.at(-1).score)).sort((a,b)=>b.score-a.score);
  arcade.letters=[0,0,0];arcade.cursor=0;
  GS.state=arcade.queue.length?'nameentry':'highscores';arcade.ticks=600;
}
function updateArcade(){
  if(!arcade)startArcadeContinue();
  const input=arcadeInput();
  if(GS.state==='gameover'){
    if(input.confirm||input.back){
      if(!restoreCheckpoint()){
        PLAYERS.forEach((p,i)=>{p.inactive=i===1&&GS.mode==='1p';p.lives=3;p.hp=p.maxHp;});startLevel(GS.lvlIdx);
      }
      arcade=null;return;
    }
    if(--arcade.ticks<=0)qualifyArcadeScores();
  }else if(GS.state==='nameentry'){
    if(input.up||input.down)arcade.letters[arcade.cursor]=(arcade.letters[arcade.cursor]+(input.up?1:-1)+ARCADE_ALPHABET.length)%ARCADE_ALPHABET.length;
    if(input.left||input.back)arcade.cursor=Math.max(0,arcade.cursor-1);
    if(input.right)arcade.cursor=Math.min(2,arcade.cursor+1);
    if(input.confirm){
      if(arcade.cursor<2){arcade.cursor++;return;}
      const entry=arcade.queue.shift();
      arcade.board.push({name:arcade.letters.map(i=>ARCADE_ALPHABET[i]).join(''),score:entry.score});
      arcade.board.sort((a,b)=>b.score-a.score);arcade.board=arcade.board.slice(0,20);
      try{localStorage.setItem(ARCADE_KEY,JSON.stringify(arcade.board));}catch{}
      arcade.queue=arcade.queue.filter(p=>arcade.board.length<20||p.score>arcade.board.at(-1).score);
      arcade.letters=[0,0,0];arcade.cursor=0;
      if(!arcade.queue.length){GS.state='highscores';arcade.ticks=600;}
    }
  }else if(input.confirm||--arcade.ticks<=0){GS.state='title';arcade=null;}
}
function drawArcadeOverlay(){
  if(!arcade)return;
  ctx.save();ctx.fillStyle='rgba(7,12,19,.45)';ctx.fillRect(0,0,W,H);
  ctx.fillStyle='rgba(13,22,31,.68)';ctx.fillRect(310,100,660,520);
  ctx.strokeStyle='rgba(229,184,108,.6)';ctx.lineWidth=1;ctx.strokeRect(310,100,660,520);
  ctx.textAlign='center';ctx.fillStyle='#f2c579';ctx.font='bold 42px Courier New';
  if(GS.state==='gameover'){
    ctx.fillText('CONTINUE?',W/2,205);ctx.font='bold 130px Courier New';ctx.fillText(Math.ceil(arcade.ticks/60),W/2,365);
    ctx.font='18px Courier New';ctx.fillStyle='#fff';ctx.fillText('PUNCH / KICK / START',W/2,445);
    ctx.font='14px Courier New';ctx.fillText('Continue from your checkpoint',W/2,480);
  }else if(GS.state==='nameentry'){
    ctx.fillText('TOP 20 SCORE',W/2,195);ctx.font='20px Courier New';ctx.fillStyle='#fff';
    const p=arcade.queue[0];ctx.fillText(`PLAYER ${p.player}   ${p.score}`,W/2,245);
    arcade.letters.forEach((v,i)=>{ctx.fillStyle=i===arcade.cursor?'#ffd17d':'#a1abb8';ctx.font='bold 76px Courier New';ctx.fillText(ARCADE_ALPHABET[v],W/2+(i-1)*90,375);if(i===arcade.cursor)ctx.fillRect(W/2+(i-1)*90-26,388,52,3);});
    ctx.fillStyle='#fff';ctx.font='15px Courier New';ctx.fillText('↑ ↓ CHANGE   ← → SELECT',W/2,460);ctx.fillText('PUNCH CONFIRM · KICK BACK',W/2,490);
  }else{
    ctx.fillText('HIGH SCORES',W/2,155);ctx.font='13px Courier New';ctx.fillStyle='#a9b5c3';ctx.fillText('LOCAL TOP 20',W/2,184);
    arcade.board.forEach((r,i)=>{const x=i<10?480:795,y=222+(i%10)*31;ctx.fillStyle=i===0?'#ffd17d':'#eee';ctx.font='17px Courier New';ctx.fillText(`${String(i+1).padStart(2,'0')} ${r.name} ${String(r.score).padStart(7,' ')}`,x,y);});
    ctx.fillStyle='#fff';ctx.font='14px Courier New';ctx.fillText('PUNCH / START TO RETURN',W/2,580);
  }
  ctx.restore();
}
