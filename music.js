// One player carries the playlist across menus, levels and retries.
const BACKGROUND_MUSIC=(()=>{
 const tracks=['assets/music/ashes-under-steel.mp3','assets/music/ashes-under-steel-2.mp3'];
 const player=new Audio();player.volume=.5;player.preload='metadata';
 let index=0,pending=false,started=false;
 player.src=tracks[index];
 function start(){
  if(pending||!player.paused)return;
  pending=true;
  Promise.resolve(player.play()).then(()=>{started=true;}).catch(()=>{
   // Browsers can reject autoplay, especially gamepad-only input; retry on a gesture.
  }).finally(()=>{pending=false;});
 }
 player.addEventListener('ended',()=>{index=(index+1)%tracks.length;player.src=tracks[index];start();});
 window.addEventListener('keydown',start);
 window.addEventListener('pointerdown',start);
 document.addEventListener('visibilitychange',()=>{
  if(document.hidden)player.pause();else if(started)start();
 });
 return {start,duck(active){player.volume=active?.2:.5;}};
})();
