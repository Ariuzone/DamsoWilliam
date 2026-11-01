/* ============================================================
   WILLIAM — moteur de l'expérience
   ============================================================ */
(function(){
'use strict';
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const DURATION = 95;            // 1:35

/* ---------- Boucle d'animation résiliente ----------
   rAF quand il vit ; si l'onglet le bride (arrière-plan, outils),
   bascule proprement sur un timer 30 fps pour que rien ne reste figé. */
function onFrame(cb){
  let rafAlive = false, rafStarted = true;
  requestAnimationFrame(()=>{ rafAlive = true; });
  function loop(){ cb(); if (rafStarted) requestAnimationFrame(loop); }
  requestAnimationFrame(loop);
  setTimeout(()=>{ if (!rafAlive){ rafStarted = false; setInterval(loop, 33); } }, 400);
}
/* GSAP : même parade si le ticker rAF est gelé — on shimme rAF et on pilote le ticker manuellement */
(function(){
  let ok = false;
  requestAnimationFrame(()=>{ ok = true; });
  setTimeout(()=>{
    if (ok) return;
    window.requestAnimationFrame = (cb) => setTimeout(()=>cb(performance.now()), 16);
    try { gsap.ticker.sleep(); gsap.ticker.add(()=>{}); } catch(e){}
    setInterval(()=>{ try { gsap.ticker.tick(); } catch(e){} }, 16);
  }, 400);
})();

/* ---------- Données : guide d'écoute (notre lecture, pas les paroles) ---------- */
const MOMENTS = [
  { t:0,  title:'Le prénom, posé',       text:'Pas d\'intro inutile : en quelques secondes, le morceau installe une atmosphère basse et serrée, comme quelqu\'un qui s\'assoit en face de toi et qui ne cherchera pas ses mots. On sait tout de suite que l\'adresse est directe.' },
  { t:20, title:'L\'adresse au frère',   text:'Le cœur du morceau : une parole adressée — à ce petit frère qui regarde grandir l\'aîné parti si loin. Damso y déploie ce qu\'il ne met nulle part ailleurs : la tendresse et la culpabilité d\'avoir réussi pendant que les siens restent.' },
  { t:48, title:'Kinshasa dans la gorge',text:'Le texte revient toujours à la même géographie : Kinshasa, la guerre, l\'exil à neuf ans, Bruxelles. Deux pays, une enfance coupée en deux — et un prénom congolais porté comme un blason dans le rap français.' },
  { t:72, title:'La dette envers la mère',text:'Rose, la sociologue devenue la figure tutélaire de toute l\'œuvre. Le morceau se referme sur ce que l\'argent ne rembourse pas : le temps, l\'absence, la distance. La voix se fait plus basse, presque à voix haute seulement.' },
  { t:88, title:'1:35 — le silence',     text:'Et puis ça s\'arrête. Pas de pont, pas d\'outro étirée : le morceau se ferme comme une lettre qu\'on plie. C\'est la dernière piste de Lithopédion — après elle, plus rien à dire sous ce nom.' }
];

/* ---------- Données : constellation ---------- */
const NODES = [
  { w:'WILLIAM',  d:'William Kalubi Mwamba — le vrai prénom de Damso, né à Kinshasa le 10 mai 1992.' },
  { w:'KINSHASA', d:'Ville natale, quartier Kasongo. Le prénom du morceau revient toujours vers elle.' },
  { w:'ROSE',     d:'Sa mère, sociologue. Figure centrale et tutélaire de toute l\'œuvre de Damso.' },
  { w:'MARCEL',   d:'Son père, cardiologue. La famille fuit la RDC en guerre quand William a 9 ans.' },
  { w:'KRAAINEM', d:'Commune de périphérie bruxelloise où la famille s\'installe en arrivant en Belgique.' },
  { w:'MATONGE',  d:'Le quartier congolais d\'Ixelles à Bruxelles, où Damso vit à 22 ans — retour symbolique.' },
  { w:'OPG',      d:'Son premier groupe, fondé en 2006 à 14 ans avec son ami d\'enfance Dolfa.' },
  { w:'BOOBA',    d:'Le repère en 2015 grâce à « Poséidon » : intégration au 92i et signature Universal.' },
  { w:'92i',      d:'Le label de Booba, qui porte Batterie faible puis Lithopédion.' },
  { w:'DJ KEN',   d:'Producteur de « William » — 1:35 de pure intimité en piste 16.' },
  { w:'LITHOPÉDION', d:'Le « bébé de pierre » : fœtus calcifié resté des décennies dans le ventre. Métaphore de l\'album porté trop longtemps. Triple platine, Victoires 2019.' },
  { w:'JULIEN',   d:'Piste 4 de Lithopédion — l\'autre prénom de l\'album. Deux prénoms, un récit qui se referme.' },
  { w:'1:35',     d:'La durée du morceau : la plus courte du tracklist, certifiée Single de Platine (30 M streams).' },
  { w:'BRUXELLES',d:'Ville d\'exil, de formation et de naturalisation. Kraainem, puis Matonge.' },
  { w:'IPSÉITÉ',  d:'« Identité propre » en phénoménologie — l\'album de 2017 qui annonce la quête d\'identité de « William ».' }
];

/* ============================================================
   0. CURSEUR
   ============================================================ */
const dot = document.getElementById('cursor-dot'), ring = document.getElementById('cursor-ring');
let mx = innerWidth/2, my = innerHeight/2, rx = mx, ry = my;
addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`; });
addEventListener('mousedown', () => ring.classList.add('is-down'));
addEventListener('mouseup',   () => ring.classList.remove('is-down'));
onFrame(() => { rx += (mx-rx)*.16; ry += (my-ry)*.16; ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`; });
document.addEventListener('mouseover', e => {
  if (e.target.closest('a,button,[data-hover],.moment,.data-cell')) ring.classList.add('is-hover');
});
document.addEventListener('mouseout', e => {
  if (e.target.closest('a,button,[data-hover],.moment,.data-cell')) ring.classList.remove('is-hover');
});

/* ============================================================
   1. MARQUEES
   ============================================================ */
const MQ = ['WILLIAM KALUBI MWAMBA','KINSHASA 1992','BRUXELLES','LITHOPÉDION — PISTE 16','1:35','PROD. DJ KEN','SINGLE DE PLATINE','OPG — 2006','92I'];
function buildMarquee(el, items, dir){
  for (let r=0;r<2;r++){
    const chunk = document.createElement('div'); chunk.className='chunk';
    items.forEach((it,i)=>{ const b=document.createElement('b'); b.textContent=it;
      const s=document.createElement('i'); s.textContent='◆';
      chunk.appendChild(b); chunk.appendChild(s); });
    el.appendChild(chunk);
  }
  const w = el.scrollWidth/2;
  gsap.to(el,{ x: dir>0 ? -w : w, duration:30, ease:'none', repeat:-1,
    modifiers:{ x: gsap.utils.unitize(x => parseFloat(x) % w) } });
}

/* ============================================================
   2. LECTEUR LOCAL (fond d'écran — vidéo fournie)
   ============================================================ */
/* ---- Lecteur : la vidéo de fond est un fichier local (celle que tu m'as envoyée) ---- */
let entered = false, mutedByChoice = false;
const video = document.getElementById('bg-video');
const hud = document.getElementById('hud');
const fill = document.getElementById('hud-fill'), knob = document.getElementById('hud-knob');
const timeEl = document.getElementById('hud-time');
const icPlay = document.getElementById('ic-play'), icPause = document.getElementById('ic-pause');
const hudMute = document.getElementById('hud-mute'), icVol = document.getElementById('ic-vol'), icVolOff = document.getElementById('ic-vol-off');
const hudPlay = document.getElementById('hud-play');

video.addEventListener('play',  ()=>syncPlayIcon(true));
video.addEventListener('pause', ()=>syncPlayIcon(false));

function syncPlayIcon(playing){
  icPlay.style.display = playing ? 'none' : 'block';
  icPause.style.display = playing ? 'block' : 'none';
}
function syncMuteIcon(m){
  icVol.style.display = m ? 'none' : 'block';
  icVolOff.style.display = m ? 'block' : 'none';
  hudMute.classList.toggle('muted-state', m);
}
function vDur(){ return (isFinite(video.duration) && video.duration > 10) ? video.duration : DURATION; }

function startPlayback(withSound){
  entered = true;
  mutedByChoice = !withSound;
  video.muted = !withSound;
  syncMuteIcon(!withSound);
  try { video.currentTime = 0; } catch(e){}
  const pr = video.play(); if (pr && pr.catch) pr.catch(()=>{});
  gsap.to('#gate',{ autoAlpha:0, duration:.9, ease:'power2.inOut', onComplete:()=>{ const g=document.getElementById('gate'); if (g) g.remove(); } });
  setTimeout(()=>hud.classList.add('on'), 500);
}

/* Boucle temps réel : HUD + timeline synchronisée sur la vidéo locale */
const momentEls = [];
function raf(){
  if (!entered) return;
  const t = video.currentTime || 0;
  const d = vDur();
  const p = Math.min(t/d, 1);
  fill.style.transform = `scaleX(${p})`;
  knob.style.left = (p*100)+'%';
  timeEl.textContent = `${fmt(t)} / 1:35`;
  momentEls.forEach((el,i)=>{
    const next = MOMENTS[i+1] ? MOMENTS[i+1].t/DURATION : 1.01;
    const on = t/DURATION >= MOMENTS[i].t/DURATION && t/DURATION < next;
    el.classList.toggle('active', on);
  });
}
function fmt(s){ s=Math.max(0,Math.floor(s)); return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`; }
onFrame(raf);

/* Zones du morceau sur la barre HUD */
const zones = document.getElementById('hud-zones');
MOMENTS.forEach(m=>{ const z=document.createElement('span'); z.className='zone'; z.style.left=(m.t/DURATION*100)+'%'; zones.appendChild(z); });

/* Contrôles HUD */
hudPlay.addEventListener('click', ()=>{ if(!entered) return; if (video.paused) { const pr = video.play(); if (pr && pr.catch) pr.catch(()=>{}); } else video.pause(); });
hudMute.addEventListener('click', ()=>{ if(!entered) return; video.muted = !video.muted; syncMuteIcon(video.muted); });
document.getElementById('hud-track').addEventListener('click', e=>{
  if(!entered) return;
  const r = e.currentTarget.getBoundingClientRect();
  const p = Math.min(Math.max((e.clientX-r.left)/r.width,0),1);
  video.currentTime = p*vDur();
});
function jumpTo(t){
  if(!entered) return;
  video.currentTime = t;
  const pr = video.play(); if (pr && pr.catch) pr.catch(()=>{});
  syncMuteIcon(false); video.muted = false;
}
document.getElementById('play-cta').addEventListener('click', ()=> jumpTo(0));
document.getElementById('replay-cta').addEventListener('click', ()=> jumpTo(0));

/* ============================================================
   3. GUIDE D'ÉCOUTE — injection des moments
   ============================================================ */
const timeline = document.getElementById('timeline');
MOMENTS.forEach((m,i)=>{
  const el = document.createElement('div');
  el.className = 'moment';
  el.innerHTML = `<div class="t"><span>${fmt(m.t)}</span><button class="jump" data-hover>Aller à ce moment</button></div>
    <h3>${m.title}</h3><p>${m.text}</p>`;
  el.querySelector('.jump').addEventListener('click', ()=>jumpTo(m.t));
  timeline.appendChild(el);
  momentEls.push(el);
});

/* ============================================================
   4. CONSTELLATION (canvas interactif)
   ============================================================ */
const stage = document.getElementById('const-stage');
const cv = document.getElementById('const-canvas');
const tip = document.getElementById('const-tip');
const ctx = cv.getContext('2d');
let W=0, H=0, dpr = Math.min(devicePixelRatio||1, 2);
let nodes = [], cmx=-9999, cmy=-9999, hovered = -1;

function initConst(){
  W = stage.clientWidth; H = stage.clientHeight;
  cv.width = W*dpr; cv.height = H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
  const n = NODES.length;
  // répartition en colonne d'or sur toute la scène, avec rebord
  const gx = W*.14, gy = H*.18, gw = W*.72, gh = H*.64;
  const GA = Math.PI*(3-Math.sqrt(5));
  nodes = NODES.map((d,i)=>{
    const t = (i+0.5)/n;
    const a = i*GA, r = Math.sqrt(t);
    return { x: gx + gw*(0.5 + 0.5*r*Math.cos(a)), y: gy + gh*(0.5 + 0.5*r*Math.sin(a)),
      ox:0, oy:0, vx:0, vy:0, r: d.w.length>8 ? 15 : d.w.length>4 ? 13 : 11, ...d };
  });
}
function drawConst(){
  ctx.clearRect(0,0,W,H);
  // liens
  for (let i=0;i<nodes.length;i++){
    for (let j=i+1;j<nodes.length;j++){
      const a=nodes[i], b=nodes[j];
      const dx=a.x-b.x, dy=a.y-b.y, dist=Math.hypot(dx,dy);
      if (dist < Math.min(W,H)*.45){
        ctx.strokeStyle = `rgba(67,56,202,${(1-dist/(Math.min(W,H)*.45))*.5})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
      }
    }
  }
  nodes.forEach((nd,i)=>{
    // répulsion souris
    const dx = nd.x-cmx, dy = nd.y-cmy, dist = Math.hypot(dx,dy);
    if (dist < 130 && dist>0){ const f=(130-dist)/130; nd.vx += (dx/dist)*f*1.4; nd.vy += (dy/dist)*f*1.4; }
    nd.vx += (nd.ox)*.012; nd.vy += (nd.oy)*.012; nd.vx*=.9; nd.vy*=.9;
    nd.ox += nd.vx; nd.oy += nd.vy;
    const x = nd.x+nd.ox, y = nd.y+nd.oy;
    // halo si hover
    const isH = hovered===i;
    if (isH){ ctx.beginPath(); ctx.arc(x,y,nd.r+16,0,7); ctx.fillStyle='rgba(34,197,94,.10)'; ctx.fill(); }
    ctx.font = `${isH?'700 ':''}${nd.r}px 'Space Mono', monospace`;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillStyle = isH ? '#22C55E' : 'rgba(248,250,252,.85)';
    ctx.fillText(nd.w, x, y);
    ctx.strokeStyle = isH ? '#22C55E' : 'rgba(148,163,184,.35)';
    ctx.lineWidth = isH ? 1.5 : 1;
    const tw = ctx.measureText(nd.w).width;
    ctx.strokeRect(x-tw/2-12, y-nd.r-4, tw+24, nd.r*2+8);
  });
}
onFrame(drawConst);
stage.addEventListener('mousemove', e=>{
  const r = stage.getBoundingClientRect();
  cmx = e.clientX-r.left; cmy = e.clientY-r.top;
  hovered = -1;
  nodes.forEach((nd,i)=>{
    const x=nd.x+nd.ox, y=nd.y+nd.oy;
    const tw = nd.w.length*nd.r*.62;
    if (Math.abs(cmx-x)<tw/2+16 && Math.abs(cmy-y)<nd.r+10) hovered = i;
  });
  if (hovered>=0){
    tip.querySelector('b').textContent = nodes[hovered].w;
    tip.querySelector('span').textContent = nodes[hovered].d;
    tip.style.left = (nodes[hovered].x+nodes[hovered].ox)+'px';
    tip.style.top  = (nodes[hovered].y+nodes[hovered].oy-16)+'px';
    tip.style.opacity = 1;
  } else tip.style.opacity = 0;
});
stage.addEventListener('mouseleave', ()=>{ cmx=cmy=-9999; hovered=-1; tip.style.opacity=0; });
stage.addEventListener('click', ()=>{
  if (hovered>=0 && MOMENTS[Math.min(1, MOMENTS.length-1)]) jumpTo(MOMENTS[Math.min(2,MOMENTS.length-1)].t);
});
addEventListener('resize', initConst);

/* ============================================================
   5. INTRO — loader puis gate
   ============================================================ */
function intro(){
  const fillEl = document.getElementById('loader-fill'), pct = document.getElementById('loader-pct');
  const prog = { v:0 };
  gsap.to(prog, { v:100, duration: REDUCED ? .3 : 2.2, ease:'power2.inOut',
    onUpdate(){ fillEl.style.transform = `scaleX(${prog.v/100})`; pct.textContent = Math.round(prog.v)+'%'; },
    onComplete(){
      gsap.to('#loader',{ autoAlpha:0, duration:.7, ease:'power2.inOut',
        onComplete(){ document.getElementById('loader').remove(); } });
      const g = document.getElementById('gate');
      g.hidden = false;
      gsap.from(g.querySelectorAll('.w-mono, h2, p, .gate-actions, .gate-note'),
        { y:40, opacity:0, duration:1, stagger:.12, ease:'expo.out' });
      document.getElementById('enter-sound').addEventListener('click', ()=>startPlayback(true));
      document.getElementById('enter-mute').addEventListener('click', ()=>startPlayback(false));
    }
  });
}

/* ============================================================
   6. ANIMATIONS DE SCROLL
   ============================================================ */
function scrollAnims(){
  gsap.registerPlugin(ScrollTrigger);

  // Rail de progression
  gsap.to('#progress-rail span', { scaleX:1, ease:'none',
    scrollTrigger:{ trigger:document.body, start:'top top', end:'bottom bottom', scrub:.3 } });

  // Hero : split des lettres
  const title = document.getElementById('hero-title');
  const chars = title.textContent.split('');
  title.innerHTML = chars.map((c,i)=>`<span class="char ${i===0?'w-accent':''}">${c}</span>`).join('');
  if (!REDUCED){
    gsap.from('#hero-title .char', { y:120, opacity:0, rotateX:-70, duration:1.2, stagger:.07, ease:'expo.out', delay:.2 });
    gsap.to('#hero-title', { yPercent:-14, ease:'none', scrollTrigger:{ trigger:'#hero', start:'top top', end:'bottom top', scrub:true } });
    gsap.to('#video-veil', { opacity:.45, ease:'none', scrollTrigger:{ trigger:'#hero', start:'top top', end:'bottom top', scrub:true } });
  }

  buildMarquee(document.getElementById('mq1'), MQ, 1);
  buildMarquee(document.getElementById('mq2'), ['W.','WILLIAM','LITHOPÉDION','KIN LA BELLE','MATONGE','TRIPLE PLATINE','VICTOIRES 2019','DJ KEN'], -1);

  // Reveals génériques
  gsap.utils.toArray('.rv').forEach(el=>{
    gsap.to(el, { opacity:1, y:0, duration:1, ease:'expo.out',
      scrollTrigger:{ trigger:el, start:'top 85%' } });
  });
  // Lignes du manifeste
  gsap.utils.toArray('.rv-line').forEach((el,i)=>{
    gsap.from(el, { yPercent:110, duration:1, ease:'expo.out', delay:i*.1,
      scrollTrigger:{ trigger:'#manifesto', start:'top 70%' },
      onStart(){ el.parentElement.querySelectorAll('.rv-line').forEach(l=>l.style.opacity=1); } });
    el.style.opacity = 0;
  });

  // Chapitres
  gsap.utils.toArray('.chapter').forEach(ch=>{
    gsap.from(ch.querySelectorAll('.num,h3,p,.where,.kw'), { y:36, opacity:0, duration:.9, stagger:.08, ease:'expo.out',
      scrollTrigger:{ trigger:ch, start:'top 82%' } });
  });

  // Timeline moments
  gsap.utils.toArray('.moment').forEach(m=>{
    gsap.from(m, { x:-40, opacity:0, duration:.9, ease:'expo.out', scrollTrigger:{ trigger:m, start:'top 84%' } });
  });

  // Data grid
  gsap.from('.data-cell', { scale:.92, opacity:0, duration:.7, stagger:.06, ease:'expo.out',
    scrollTrigger:{ trigger:'.data-grid', start:'top 80%' } });

  // Grand W
  gsap.fromTo('#paroles .big-w', { scale:.8, rotate:-6 }, { scale:1, rotate:0, ease:'none',
    scrollTrigger:{ trigger:'#paroles', start:'top bottom', end:'center center', scrub:true } });

  // Nav dots + scrollspy
  const dots = document.querySelectorAll('#nav-dots a');
  ['hero','manifesto','histoire','dissect','constellation','litho','paroles'].forEach(id=>{
    ScrollTrigger.create({ trigger:'#'+id, start:'top center', end:'bottom center',
      onToggle(self){ if (self.isActive) dots.forEach(d=>d.classList.toggle('active', d.dataset.spy===id)); } });
    dots.forEach(d=>d.addEventListener('click', e=>{ e.preventDefault(); document.getElementById(id).scrollIntoView({ behavior: REDUCED?'auto':'smooth' }); }));
  });

  // Constellation au moment où elle apparaît
  ScrollTrigger.create({ trigger:'#const-stage', start:'top 80%', once:true, onEnter: initConst });
}

/* ---------- Boot ---------- */
function boot(){
  if (boot.done) return; boot.done = true;
  intro();
  scrollAnims();
}
if (document.readyState === 'loading') addEventListener('DOMContentLoaded', boot);
else boot();

})();
