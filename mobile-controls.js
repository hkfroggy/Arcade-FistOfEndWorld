// Touch shares keyboard bank one, including menus and first-come joining.
(() => {
  const held = window.MOBILE_INPUT = {};
  const pointers = new Map();
  const controls = document.createElement('div');
  controls.id = 'touchControls';
  controls.innerHTML = `<div id="touchStick" role="group" aria-label="Move"><div id="touchKnob"></div></div><div id="touchActions"><button class="wide" data-keys="KeyH,KeyK" aria-label="Special attack">SPECIAL</button><button class="wide" data-keys="KeyU,KeyH,KeyK" aria-label="Super attack">SUPER</button><button class="wide" data-keys="Enter" aria-label="Start or confirm">START</button><button data-keys="KeyH">PUNCH</button><button data-keys="KeyK">KICK</button><button data-keys="KeyU">JUMP</button></div>`;
  document.body.append(controls);
  const settings = document.createElement('button');
  settings.id = 'mobileSettings'; settings.textContent = '⚙';
  settings.setAttribute('aria-label', 'Language and debug settings');
  settings.setAttribute('aria-expanded', 'false');
  document.body.append(settings);
  settings.onclick = () => {
    reset();
    settings.setAttribute('aria-expanded', String(document.body.classList.toggle('mobile-settings')));
  };
  function sync() {
    const next = new Set([...pointers.values()].flatMap(p => p.codes));
    for (const code of next) if (!held[code]) window.mobileKeyPress?.(code);
    for (const code of Object.keys(held)) delete held[code];
    for (const code of next) held[code] = true;
  }
  const stick = document.getElementById('touchStick'), knob = document.getElementById('touchKnob');
  function move(e) {
    const p = pointers.get(e.pointerId); if (!p || p.element !== stick) return;
    const rect = stick.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width/2)/(rect.width/2);
    const y = (e.clientY - rect.top - rect.height/2)/(rect.height/2);
    p.codes = [];
    if(x < -.25) p.codes.push('KeyA'); if(x > .25) p.codes.push('KeyD');
    if(y < -.25) p.codes.push('KeyW'); if(y > .25) p.codes.push('KeyS');
    const length = Math.max(1, Math.hypot(x,y));
    knob.style.transform = `translate(${x/length*30}px,${y/length*30}px)`;
    sync();
  }
  for (const element of [stick, ...controls.querySelectorAll('button')]) {
    element.addEventListener('pointerdown', e => {
      e.preventDefault();
      if(element === stick && [...pointers.values()].some(p => p.element === stick)) return;
      element.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, {element, codes:(element.dataset.keys || '').split(',').filter(Boolean)});
      element.classList.add('active');
      if(element === stick) move(e); else sync();
    });
    element.addEventListener('pointermove', move);
    const release = e => {
      pointers.delete(e.pointerId);
      if(![...pointers.values()].some(p => p.element === element)) element.classList.remove('active');
      if(element === stick) knob.style.transform = '';
      sync();
    };
    for (const event of ['pointerup','pointercancel','lostpointercapture']) element.addEventListener(event, release);
    element.addEventListener('contextmenu', e => e.preventDefault());
  }
  function reset() {
    pointers.clear(); sync(); knob.style.transform = '';
    controls.querySelectorAll('.active').forEach(e => e.classList.remove('active'));
  }
  window.addEventListener('blur', reset);
  window.addEventListener('orientationchange', reset);
  document.addEventListener('visibilitychange', () => { if(document.hidden) reset(); });
})();
