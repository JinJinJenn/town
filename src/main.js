import {enhanceV7Kit,createV7Atmosphere} from './v7-detail.js';
import {createMediaLibrary,mountIllustratedLayers} from './v6-media.js';
import {enhanceV5Kit, V5_STYLE} from './v5-look.js';
import {enhanceV4Kit, createPetals} from './v4-world.js';
import {mountV4UI} from './v4-ui.js';
import { enhanceKit } from './art.js';
import { createArtWorld } from './art-world.js';
import { createArtLighting, createDioramaRenderer } from './render-style.js';
import * as THREE from '../vendor/three.module.js';
import { createKit } from './kit.js';
import { createWorld } from './world.js';
import { cleanSeed } from './plan.js';

export function start() {
  const $=id=>document.getElementById(id), canvas=$('scene'), host=$('world');
  const context=canvas.getContext('webgl2',{antialias:true,alpha:false,powerPreference:'high-performance'});
  if(!context)throw new Error('This browser did not provide a WebGL2 context. Enable hardware acceleration or try another WebGL2-capable browser.');
  const renderer=new THREE.WebGLRenderer({canvas,context,antialias:true,alpha:false});
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  const scene=new THREE.Scene();scene.background=new THREE.Color('#e6eadb');scene.fog=new THREE.Fog('#e6eadb',145,245);
  const camera=new THREE.OrthographicCamera(-40,40,25,-25,.1,350);
  const target=new THREE.Vector3(0,0,-2), kit=enhanceV7Kit(enhanceV5Kit(enhanceV4Kit(enhanceKit(createKit()))));
  const lighting=createArtLighting(scene,renderer,kit), compositor=createDioramaRenderer(renderer);
  let seed=cleanSeed(new URL(location.href).searchParams.get('seed'));
  let world=createArtWorld(kit,createWorld,seed);scene.add(world.group);createPetals(kit,world,!matchMedia('(prefers-reduced-motion: reduce)').matches);
  let atmosphere=createV7Atmosphere(kit,world,!matchMedia('(prefers-reduced-motion: reduce)').matches);
  let ui=null;
  let viewHeight=innerWidth<700?55:44, yaw=.76, elevation=.69, paused=false, touring=false, following=null, selected=null, evening=false;
  const mediaLibrary=createMediaLibrary();let media=null;
  let illustrated=true;try{illustrated=localStorage.getItem('town.illustrated.v6')!=='0';}catch{}
  function attachMedia(){media?.dispose();media=mountIllustratedLayers(world,mediaLibrary,{enabled:illustrated,evening});}
  mediaLibrary.ready.then(attachMedia);
  $('mixed-media').checked=illustrated;
  $('mixed-media').onchange=()=>{illustrated=$('mixed-media').checked;media?.setEnabled(illustrated);save('town.illustrated.v6',illustrated?'1':'0');};
  let previousView=null;
  let last=performance.now(), clock=0, tourClock=0, raf=0, toastTimer=0, frames=0;
  const keys=new Set(), raycaster=new THREE.Raycaster(), pointer=new THREE.Vector2();
  const ring=new THREE.Mesh(new THREE.RingGeometry(.55,.62,32),new THREE.MeshBasicMaterial({color:'#f4deb0',side:THREE.DoubleSide,transparent:true,opacity:.85,depthWrite:false}));
  ring.rotation.x=-Math.PI/2;ring.visible=false;scene.add(ring);
  const pointers=new Map();let pointerStart=null,pointerMoved=false,pinchDistance=0;
  const clamp=THREE.MathUtils.clamp;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function save(key,value){try{localStorage.setItem(key,value);}catch{}}
  function load(key){try{return localStorage.getItem(key);}catch{return null;}}
  function toast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,3600);}
  function dismissWelcome(){ $('welcome').hidden=true;save('town.welcomeDismissed.v1','1'); }
  function refreshProjection(){const width=host.clientWidth,height=Math.max(1,host.clientHeight),aspect=width/height;camera.left=-viewHeight*aspect/2;camera.right=-camera.left;camera.top=viewHeight/2;camera.bottom=-viewHeight/2;camera.updateProjectionMatrix();}
  function updateCamera(){
    target.x=clamp(target.x,-43,43);target.z=clamp(target.z,-43,43);
    const radius=115,horizontal=Math.cos(elevation)*radius;
    camera.position.set(target.x+Math.sin(yaw)*horizontal,Math.sin(elevation)*radius,target.z+Math.cos(yaw)*horizontal);camera.lookAt(target);camera.updateMatrixWorld();
  }
  function resize(){renderer.setPixelRatio(Math.min(devicePixelRatio||1,innerWidth<700?1.25:1.5));renderer.setSize(host.clientWidth,host.clientHeight,false);refreshProjection();}
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);resize();updateCamera();
  function setTour(value){touring=value;$('tour').setAttribute('aria-pressed',String(value));if(value){setHomeOpen(false,false);following=null;tourClock=0;$('follow').textContent='Follow this resident';}}
  function manual(){setTour(false);following=null;$('follow').textContent='Follow this resident';}
  function resetCamera(){setHomeOpen(false,false);manual();target.set(0,0,-2);viewHeight=innerWidth<700?55:44;yaw=.76;elevation=.69;refreshProjection();}
  function zoom(factor){manual();viewHeight=clamp(viewHeight*factor,12,100);refreshProjection();}
  function pan(dx,dy){
    const units=viewHeight/Math.max(1,host.clientHeight),rightX=Math.cos(yaw),rightZ=-Math.sin(yaw),forwardX=Math.sin(yaw),forwardZ=Math.cos(yaw);
    target.x-=dx*units*rightX+dy*units/Math.sin(elevation)*forwardX;
    target.z-=dx*units*rightZ+dy*units/Math.sin(elevation)*forwardZ;
  }
  function homeMeta(){return world.targets.find(t=>t.userData.selection.type==='building'&&t.userData.selection.lot?.furnished).userData.selection;}
  function syncHomeUI(){
    const isHome=selected?.lot?.furnished===true;
    ui?.syncSelection(isHome);
    $('open-home').hidden=!isHome;$('open-home').textContent=world.home.isOpen?'Put the roof back':'Look inside';
    $('open-home').setAttribute('aria-pressed',String(world.home.isOpen));
    $('home-controls').hidden=!isHome||!world.home.isOpen;
    const state=world.homeActivity.state;
    const text={outside:'Luca is out for a walk. Invite them inside to try the sofa.',entering:'Luca is walking through the front gate and into the living room.',sitting:'Luca is relaxing on the sofa. The seat is now occupied.',leaving:'Luca is heading back to the sidewalk.'}[state]+(paused&&state!=='outside'?' The simulation is paused.':'');
    if($('home-status').textContent!==text)$('home-status').textContent=text;
    $('home-action').disabled=state==='entering'||state==='leaving';
    $('home-action').textContent=state==='sitting'?'Send Luca outside':state==='entering'?'Luca is coming home':state==='leaving'?'Luca is heading out':'Ask Luca to sit';
  }
  function setHomeOpen(value,focus=true){
    if(value===world.home.isOpen){syncHomeUI();return;}
    world.home.setOpen(value);host.classList.toggle('home-view',value);
    if(value){
      manual();previousView={target:target.clone(),viewHeight,yaw,elevation};
      yaw=.7;elevation=.94;viewHeight=innerWidth<700?35:19;
      target.copy(world.home.origin);target.y=.8;
      if(innerWidth<700){target.x+=Math.sin(yaw)*4.8;target.z+=Math.cos(yaw)*4.8;}
      else{const offset=2.2;target.x+=Math.cos(yaw)*offset;target.z-=Math.sin(yaw)*offset;}
    }else if(focus&&previousView){target.copy(previousView.target);viewHeight=previousView.viewHeight;yaw=previousView.yaw;elevation=previousView.elevation;}
    if(!value)previousView=null;
    refreshProjection();syncHomeUI();
  }
  function choose(meta){
    if(!meta||meta.type==='building'&&!meta.lot.furnished)setHomeOpen(false);
    selected=meta;following=null;setTour(false);$('follow').textContent='Follow this resident';
    if(!meta){$('inspector').hidden=true;ring.visible=false;syncHomeUI();return;}
    dismissWelcome();$('selection-type').textContent=meta.type==='resident'?'Around the neighborhood':meta.lot.furnished?'The first furnished home':meta.lot.kind==='park'?'A place to unwind':meta.lot.kind==='cafe'?"Jenn's neighborhood cafe":'A generated home';
    $('selection-name').textContent=meta.name;$('selection-description').textContent=meta.description;$('follow').hidden=meta.type!=='resident';$('inspector').hidden=false;
    ring.visible=meta.type==='resident';syncHomeUI();
  }
  function homeAction(){
    if(paused){toast('Resume the simulation to let Luca walk.');return;}
    const accepted=world.homeActivity.state==='sitting'?world.homeActivity.requestLeave():world.homeActivity.requestSit();
    if(accepted)syncHomeUI();
  }
  function selectAt(x,y){
    const rect=canvas.getBoundingClientRect();pointer.set((x-rect.left)/rect.width*2-1,-(y-rect.top)/rect.height*2+1);
    raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(world.getTargets(),false)[0];
    const meta=hit?.object.userData.selection;
    if(meta?.type==='furniture'){choose(homeMeta());homeAction();}else choose(meta||null);
  }
  function setEvening(value){
    evening=value;$('evening').setAttribute('aria-pressed',String(value));$('time-label').textContent=value?'The evening is settling in':'A quiet afternoon';
    lighting.apply(value);media?.setEvening(value);atmosphere?.setEvening(value);
  }
  function loadWorld(value){
    seed=cleanSeed(value);choose(null);scene.remove(world.group);media?.dispose();media=null;world.dispose();world=createArtWorld(kit,createWorld,seed);scene.add(world.group);createPetals(kit,world,ui?.petals??true);atmosphere=createV7Atmosphere(kit,world,ui?.petals??true);atmosphere.setEvening(evening);ui?.resetWorld();if(mediaLibrary.status!=='loading')attachMedia();
    $('resident-count').textContent=String(world.residents.length);$('seed').value=seed;
    try{const url=new URL(location.href);url.searchParams.set('seed',seed);history.replaceState(null,'',url);}catch{}
    resetCamera();choose(homeMeta());setHomeOpen(true);atmosphere.sync();toast(`The neighborhood is ready. Its seed is ${seed}.`);
  }
  $('soft-rendering').checked=compositor.supported&&load('town.softRendering.v1')!=='0';
  $('soft-rendering').disabled=!compositor.supported;
  if(!compositor.supported)$('soft-rendering').title='This device uses the standard renderer because floating-point render targets are unavailable.';
  compositor.setEnabled($('soft-rendering').checked);
  $('soft-rendering').onchange=()=>{compositor.setEnabled($('soft-rendering').checked);save('town.softRendering.v1',compositor.enabled?'1':'0');};
  $('resident-count').textContent=String(world.residents.length);$('seed').value=seed;
  $('visit-home').onclick=()=>{choose(homeMeta());setHomeOpen(true);};
  $('open-home').onclick=()=>setHomeOpen(!world.home.isOpen);
  $('home-action').onclick=homeAction;
  if(load('town.welcomeDismissed.v1')==='1')$('welcome').hidden=true;
  $('close-welcome').onclick=dismissWelcome;$('explore').onclick=()=>{dismissWelcome();canvas.focus({preventScroll:true});};
  $('help').onclick=()=>{$('seed').value=seed;$('help-dialog').showModal();keys.clear();};
  $('load-seed').onclick=()=>{loadWorld($('seed').value);$('help-dialog').close();};
  $('seed').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('load-seed').click();}});
  $('tour').onclick=()=>{dismissWelcome();setTour(!touring);};
  $('pause').onclick=()=>{paused=!paused;$('pause').setAttribute('aria-pressed',String(paused));$('pause').innerHTML=paused?'<span aria-hidden="true">▷</span> Resume':'<span aria-hidden="true">Ⅱ</span> Pause';syncHomeUI();};
  $('evening').onclick=()=>setEvening(!evening);
  $('zoom-in').onclick=()=>zoom(.82);$('zoom-out').onclick=()=>zoom(1.22);$('reset').onclick=resetCamera;
  $('new-town').onclick=()=>{const values=new Uint32Array(1);crypto.getRandomValues(values);loadWorld(values[0].toString(36));};
  $('close-inspector').onclick=()=>choose(null);
  $('follow').onclick=()=>{if(selected?.type!=='resident')return;setTour(false);following=following===selected.index?null:selected.index;$('follow').textContent=following===null?'Follow this resident':'Stop following';};
  ui=mountV4UI({
    residents:()=>world.residents,home:()=>world.home,clearKeys:()=>keys.clear(),
    setPetals:value=>{world.setPetals(value);atmosphere?.setEnabled(value);},
    followResident:index=>{setHomeOpen(false);choose(world.residents[index].meta);following=index;$('follow').textContent='Stop following';target.copy(world.residents[index].root.position);target.y=0;},
  });
  canvas.addEventListener('contextmenu' ,e=>e.preventDefault());
  canvas.addEventListener('wheel',e=>{e.preventDefault();zoom(Math.exp(clamp(e.deltaY,-160,160)*.0015));},{passive:false});
  canvas.addEventListener('pointerdown',e=>{
    manual();canvas.focus({preventScroll:true});canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    pointerStart={x:e.clientX,y:e.clientY,button:e.button};pointerMoved=false;canvas.classList.add('dragging');
    if(pointers.size===2){const [a,b]=[...pointers.values()];pinchDistance=Math.hypot(a.x-b.x,a.y-b.y);pointerMoved=true;}
  });
  canvas.addEventListener('pointermove',e=>{
    const previous=pointers.get(e.pointerId);if(!previous)return;
    const dx=e.clientX-previous.x,dy=e.clientY-previous.y;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pointers.size===2){const [a,b]=[...pointers.values()],d=Math.hypot(a.x-b.x,a.y-b.y);if(d>1&&pinchDistance>1)zoom(pinchDistance/d);pinchDistance=d;pointerMoved=true;return;}
    if(!pointerStart)return;
    if(Math.hypot(e.clientX-pointerStart.x,e.clientY-pointerStart.y)>5)pointerMoved=true;
    if(!pointerMoved)return;
    if(pointerStart.button===2){yaw-=dx*.006;elevation=clamp(elevation+dy*.003,.42,1.15);}else pan(dx,dy);
  });
  function pointerEnd(e){
    const tap=!pointerMoved&&pointers.size===1&&pointerStart?.button===0;
    pointers.delete(e.pointerId);if(pointers.size===0){canvas.classList.remove('dragging');pointerStart=null;}
    else{const [p]=pointers.values();pointerStart={...p,button:0};pointerMoved=true;}
    if(tap)selectAt(e.clientX,e.clientY);
  }
  canvas.addEventListener('pointerup',pointerEnd);canvas.addEventListener('pointercancel',()=>{pointers.clear();pointerStart=null;pointerMoved=true;canvas.classList.remove('dragging');});
  window.addEventListener('keydown',e=>{
    if(e.target.closest('input,button,a,dialog')||document.querySelector('dialog[open]'))return;
    const key=e.key.toLowerCase();if(['w','a','s','d','q','e','r','arrowup','arrowdown','arrowleft','arrowright'].includes(key)){e.preventDefault();manual();keys.add(key);if(key==='r')resetCamera();}
  });
  window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>keys.clear());
  function frame(now){
    const dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;clock+=dt;
    if(!paused)world.step(dt);
    if(touring){tourClock+=dt;const speed=reduced?.45:1;target.x=Math.sin(tourClock*.065*speed)*11;target.z=-2+Math.sin(tourClock*.046*speed)*10;yaw=.76+Math.sin(tourClock*.035*speed)*.1;}
    if(following!==null){const actor=world.residents[following];if(actor)target.lerp(new THREE.Vector3(actor.root.position.x,0,actor.root.position.z),1-Math.exp(-dt*3));}
    const move=dt*180;
    if(keys.has('w')||keys.has('arrowup'))pan(0,move);if(keys.has('s')||keys.has('arrowdown'))pan(0,-move);
    if(keys.has('a')||keys.has('arrowleft'))pan(move,0);if(keys.has('d')||keys.has('arrowright'))pan(-move,0);
    if(keys.has('q'))yaw+=dt*.6;if(keys.has('e'))yaw-=dt*.6;
    if(selected?.type==='resident') {const actor=world.residents[selected.index];ring.visible=true;ring.position.set(actor.root.position.x,actor.root.position.y+.013,actor.root.position.z);if(frames%45===0)$('selection-description').textContent=actor.meta.description;}
    updateCamera();world.home.update(camera,paused?0:dt,world.homeActivity.doorWanted());atmosphere.sync();if(frames%8===0)syncHomeUI();compositor.render(scene,camera);frames++;raf=requestAnimationFrame(frame);
  }
  document.addEventListener('visibilitychange',()=>{
    keys.clear();if(document.hidden){cancelAnimationFrame(raf);raf=0;}else if(!raf){last=performance.now();raf=requestAnimationFrame(frame);}
  });
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(raf);raf=0;toast('The graphics context was interrupted. Reload the page to restart the neighborhood.');});
  // Show the furnished central home before the first visible render.
  if(new URL(location.href).searchParams.get('view')!=='town'){choose(homeMeta());setHomeOpen(true);}
  updateCamera();world.home.update(camera);atmosphere.sync();
  compositor.render(scene,camera);$('loading').hidden=true;raf=requestAnimationFrame(frame);
  // Small inspection API for regression tests and future performance work.
  window.townDebug={
    getStats:()=>({...world.stats,artVersion:kit.artVersion,version:7,v7DetailInstances:world.home.detailInstances,v7Atmosphere:atmosphere.info(),mixedMedia:media?.info()??{status:mediaLibrary.status,cards:0,enabled:illustrated},colorStyle:V5_STYLE,palette:world.home.palette,photoMode:ui?.photo,softRendering:compositor.enabled,seed,frames,drawCalls:compositor.stats.drawCalls,triangles:compositor.stats.triangles,compositeCalls:compositor.enabled?1:0,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,paused,touring,following,evening,viewHeight,target:target.toArray()}),
    getPlan:()=>JSON.parse(JSON.stringify(world.plan)),
    getHome:()=>({...world.homeActivity.info(),open:world.home.isOpen,walls:world.home.visibleWalls(),origin:world.home.origin.toArray(),residentPosition:world.homeActivity.resident.root.position.toArray()}),
    selectHome:()=>choose(homeMeta()),
    openHome:()=>{choose(homeMeta());setHomeOpen(true);},
    sofaScreenPosition:()=>{const p=world.home.worldPoint(-3,.85,1.1).project(camera),r=canvas.getBoundingClientRect();return{x:r.left+(p.x+1)*r.width/2,y:r.top+(1-p.y)*r.height/2};},
    rotateHome:angle=>{yaw=angle;updateCamera();world.home.update(camera);},
    residentPosition:i=>world.residents[i].root.position.toArray(),
    residentScreenPosition:i=>{const p=world.residents[i].root.position.clone();p.y+=1;p.project(camera);const r=canvas.getBoundingClientRect();return{x:r.left+(p.x+1)*r.width/2,y:r.top+(1-p.y)*r.height/2};},
    selectResident:i=>choose(world.residents[i].meta),
    loadSeed:loadWorld,
  };
  if(new URL(location.href).searchParams.has('test'))window.townDebug.advanceSimulation=seconds=>{
    if(paused)return;const bounded=Math.min(120,Math.max(0,Number(seconds)||0));
    for(let t=0;t<bounded;t+=.05)world.step(Math.min(.05,bounded-t));
    syncHomeUI();
  };
}
