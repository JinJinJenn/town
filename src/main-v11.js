import * as THREE from '../vendor/three.module.js';
import {createKit} from './kit.js';
import {createWorld} from './world.js';
import {createArtWorld} from './art-world.js';
import {enhanceKit} from './art.js';
import {enhanceV4Kit,createPetals} from './v4-world.js';
import {enhanceV5Kit} from './v5-look.js';
import {optimizeV7Kit} from './v7-polish.js';
import {enhanceV7Kit,createV7Atmosphere} from './v7-detail.js';
import {enhanceV8Kit,summarizeV8} from './v8-props.js';
import {createMediaLibrary,mountIllustratedLayers} from './v7-media.js';
import {createArtLighting,createDioramaRenderer} from './render-style.js';
import {cleanSeed} from './plan.js';
import {createHousehold as createLiveMode} from './v11-life.js';
import {installHouseholdCharacters} from './v10-characters.js';
import {createHouseholdFixtures} from './v10-fixtures.js';
import {createLiveHUD} from './v11-hud.js';
import {mountV12SeatTargets,planV12Seats} from './v12-seats.js';

export function start(){
  const canvas=document.getElementById('scene'),context=canvas.getContext('webgl2',{antialias:true,alpha:false,powerPreference:'high-performance'});
  if(!context)throw new Error('WebGL2 is unavailable. Enable browser hardware acceleration and reload.');
  const renderer=new THREE.WebGLRenderer({canvas,context,antialias:true,alpha:false});renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
  const scene=new THREE.Scene();scene.background=new THREE.Color('#e6eadb');scene.fog=new THREE.Fog('#e6eadb',145,245);
  const camera=new THREE.OrthographicCamera(-40,40,25,-25,.1,350),target=new THREE.Vector3();
  const kit=enhanceV8Kit(enhanceV7Kit(optimizeV7Kit(enhanceV5Kit(enhanceV4Kit(enhanceKit(createKit()))))));
  installHouseholdCharacters(kit);
  const lighting=createArtLighting(scene,renderer,kit),compositor=createDioramaRenderer(renderer),mediaLibrary=createMediaLibrary();
  const load=(key,fallback=null)=>{try{return localStorage.getItem(key)??fallback;}catch{return fallback;}};
  const save=(key,value)=>{try{localStorage.setItem(key,value);}catch{}};
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let seed=cleanSeed(new URL(location.href).searchParams.get('seed')),world,life,media,atmosphere,fixtures,seatTargets;
  let speed=1,lastSpeed=1,selected=20,following=false,evening=false,ambient=!reduced&&load('town.petals.v4','1')!=='0',illustrated=load('town.illustrated.v6','1')!=='0';
  let yaw=.72,elevation=.94,viewHeight=19,frames=0,last=performance.now(),lastShadow=0,lastWalls='',raf=0,notice='',noticeUntil=0,goal=null,goalUntil=0;
  const keys=new Set(),pointers=new Map(),ray=new THREE.Raycaster(),ndc=new THREE.Vector2();let gesture=null;
  const marker=new THREE.Mesh(new THREE.OctahedronGeometry(.19),new THREE.MeshBasicMaterial({color:'#76cf6c'}));marker.scale.set(.75,1.7,.75);scene.add(marker);
  const hud=createLiveHUD(renderer,canvas,action);compositor.setEnabled(compositor.supported&&load('town.softRendering.v1',innerWidth<700?'0':'1')!=='0');
  function projection(){const r=canvas.getBoundingClientRect(),aspect=r.width/Math.max(1,r.height);camera.left=-viewHeight*aspect/2;camera.right=-camera.left;camera.top=viewHeight/2;camera.bottom=-viewHeight/2;camera.updateProjectionMatrix();}
  function resize(){renderer.setPixelRatio(Math.min(devicePixelRatio||1,innerWidth<700?1:1.5));renderer.setSize(innerWidth,innerHeight,false);projection();hud.resize();}
  function updateCamera(){const horizontal=Math.cos(elevation)*115;camera.position.set(target.x+Math.sin(yaw)*horizontal,target.y+Math.sin(elevation)*115,target.z+Math.cos(yaw)*horizontal);camera.lookAt(target);camera.updateMatrixWorld();}
  function homeView(){following=false;world.home.setOpen(true);target.copy(world.home.origin);target.y=.8;yaw=.72;elevation=.79;viewHeight=innerWidth<700?27:17.7;const shift=innerWidth<700?4.6:.9;target.x+=Math.sin(yaw)*shift;target.z+=Math.cos(yaw)*shift;projection();renderer.shadowMap.needsUpdate=true;}
  function overview(){following=false;target.set(0,0,-2);viewHeight=innerWidth<700?61:48;elevation=.72;projection();}
  function attachMedia(){if(!world)return;media?.dispose();media=mountIllustratedLayers(world,mediaLibrary,{enabled:illustrated,evening});}mediaLibrary.ready.then(attachMedia);
  function loadWorld(value){seed=cleanSeed(value);fixtures?.dispose();seatTargets?.dispose();life?.dispose();media?.dispose();media=null;if(world){scene.remove(world.group);world.dispose();}world=createArtWorld(kit,createWorld,seed);world.stats.v8Props=summarizeV8(world.plan);scene.add(world.group);createPetals(kit,world,ambient);atmosphere=createV7Atmosphere(kit,world,ambient);atmosphere.setEvening(evening);world.home.setPalette(load('town.palette.v5','roseMint'));life=createLiveMode(world);seatTargets=mountV12SeatTargets(world,new Set(life.nav.v12Seats.map(s=>s.seatId)));fixtures=createHouseholdFixtures(world,life);world.step(0);selected=20;following=false;if(mediaLibrary.status!=='loading')attachMedia();homeView();try{const u=new URL(location.href);u.searchParams.set('seed',seed);history.replaceState(null,'',u);}catch{}}
  function notify(text){notice=text;noticeUntil=performance.now()+2800;}
  function action(id,payload={}){
    if(id.startsWith('cancel:')){life.cancelCommand(selected,Number(id.split(':')[1]));return;}
    if(id==='cancel-all'){life.cancelAll(selected);notify('Actions cancelled.');return;}
    if(id==='next-resident'){selected=(selected+1)%life.agents.length;following=false;return;}
    if(id==='select-target'){selected=payload.targetIndex;following=false;return;}
    if(id==='go'){const result=life.command(selected,'go',payload.point);if(!result.ok)notify(result.reason);else {goal=life.nav.resolve(payload.point);goalUntil=performance.now()+3500;}return;}
    if(id==='chat-target'){const result=life.command(selected,'talk',null,payload.targetIndex);if(!result.ok)notify(result.reason);return;}
    if(id==='seat'){const result=life.command(selected,'seat',null,null,payload.seatId);if(!result.ok)notify(result.reason);return;}
if(id==='panel')return;if(id.startsWith('resident:')){selected=Math.max(0,Math.min(31,Number(id.split(':')[1])));following=false;return;}if(['1','2','3'].includes(id)){speed=Number(id);lastSpeed=speed;return;}
    switch(id){case 'pause':if(speed){lastSpeed=speed;speed=0;}else speed=lastSpeed;break;case 'home':homeView();break;case 'overview':overview();break;case 'follow':following=!following;break;case 'sit':case 'tv':{const r=life.command(selected,'tv');if(!r.ok)notify(r.reason);} break;case 'drink':{const r=life.command(selected,'drink');if(!r.ok)notify(r.reason);} break;case 'talk':{const r=life.command(selected,'talk');if(!r.ok)notify(r.reason);} break;case 'gather':life.gather();notify('Neighbors are coming over in small groups.');break;case 'roof':world.home.setOpen(!world.home.isOpen);renderer.shadowMap.needsUpdate=true;break;case 'evening':evening=!evening;lighting.apply(evening);media?.setEvening(evening);atmosphere.setEvening(evening);renderer.shadowMap.needsUpdate=true;break;case 'palette':{const ids=['roseMint','blossom','lavender','sage'],id=ids[(ids.indexOf(world.home.palette)+1)%ids.length];if(world.home.setPalette(id)){save('town.palette.v5',id);renderer.shadowMap.needsUpdate=true;}break;}case 'quality':compositor.setEnabled(compositor.supported&&!compositor.enabled);save('town.softRendering.v1',compositor.enabled?'1':'0');break;case 'ambient':ambient=!ambient;world.setPetals(ambient);atmosphere.setEnabled(ambient);save('town.petals.v4',ambient?'1':'0');break;case 'new':{const a=new Uint32Array(1);crypto.getRandomValues(a);loadWorld(a[0].toString(36));break;}}
  }
  function selectAt(x,y,right=false){
    hud.dismiss();const r=canvas.getBoundingClientRect();ndc.set((x-r.left)/r.width*2-1,1-(y-r.top)/r.height*2);ray.setFromCamera(ndc,camera);
    const selections=ray.intersectObjects(world.getTargets(),false),m=selections[0]?.object.userData.selection;
    if(m?.type==='resident'){
      if(right||m.index===selected){selected=m.index;following=false;}
      else hud.openContext('resident',x-r.left,y-r.top,{targetIndex:m.index,title:world.residents[m.index].meta.name});
      return;
    }
    if(right)return;
    if(m?.type==='furniture'||m?.type==='outdoorSeat'){hud.openContext(m.activity||'tv',x-r.left,y-r.top,m);return;}
    const o=world.home.origin,ground=new THREE.Vector3(),floor=new THREE.Vector3();
    ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),-(o.y+.4-.07)),floor);
    let point;
    if(Math.abs(floor.x-o.x)<5.7&&Math.abs(floor.z-o.z)<4.7){
      if(!world.home.isOpen){notify('Open the roof to choose a floor destination.');return;}point=floor;
    }else {ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),-.29),ground);point=ground;}
    const destination=life.nav.resolve(point);
    if(!destination){notify('That spot is blocked. Choose clear floor or sidewalk.');goal=null;return;}
    goal=destination;goalUntil=performance.now()+3500;
    hud.openContext('ground',x-r.left,y-r.top,{point:{x:destination.x,z:destination.z}});
  }
  function pan(dx,dy){const u=viewHeight/Math.max(1,canvas.clientHeight);target.x-=dx*u*Math.cos(yaw)+dy*u/Math.sin(elevation)*Math.sin(yaw);target.z-=dx*u*-Math.sin(yaw)+dy*u/Math.sin(elevation)*Math.cos(yaw);target.x=THREE.MathUtils.clamp(target.x,-52,52);target.z=THREE.MathUtils.clamp(target.z,-52,52);}
  function zoom(factor){following=false;viewHeight=THREE.MathUtils.clamp(viewHeight*factor,12,100);projection();}
  canvas.addEventListener('contextmenu',e=>e.preventDefault());canvas.addEventListener('wheel',e=>{e.preventDefault();zoom(Math.exp(THREE.MathUtils.clamp(e.deltaY,-160,160)*.0015));},{passive:false});
  canvas.addEventListener('pointerdown',e=>{canvas.focus({preventScroll:true});canvas.setPointerCapture(e.pointerId);const r=canvas.getBoundingClientRect(),hit=hud.hit(e.clientX-r.left,e.clientY-r.top);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});gesture={x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,button:e.button,ui:hit?.id,moved:false};if(!hit)following=false;if(pointers.size===2){const[a,b]=[...pointers.values()];gesture.pinch=Math.hypot(a.x-b.x,a.y-b.y);gesture.moved=true;}});
  canvas.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();hud.hover(e.clientX-r.left,e.clientY-r.top);if(!pointers.has(e.pointerId)||!gesture)return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2){const[a,b]=[...pointers.values()],d=Math.hypot(a.x-b.x,a.y-b.y);if(gesture.pinch&&d>1)zoom(gesture.pinch/d);gesture.pinch=d;gesture.moved=true;return;}if(gesture.ui)return;const dx=e.clientX-gesture.lastX,dy=e.clientY-gesture.lastY;gesture.lastX=e.clientX;gesture.lastY=e.clientY;if(Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y)>5)gesture.moved=true;if(!gesture.moved)return;if(gesture.button===2){yaw-=dx*.006;elevation=THREE.MathUtils.clamp(elevation+dy*.003,.42,1.15);}else pan(dx,dy);});
  canvas.addEventListener('pointerup',e=>{if(gesture&&!gesture.moved&&pointers.size===1){const r=canvas.getBoundingClientRect(),hit=hud.hit(e.clientX-r.left,e.clientY-r.top);if(gesture.ui){if(hit?.id===gesture.ui)hud.activate(gesture.ui);}else if(e.button===0||e.button===2)selectAt(e.clientX,e.clientY,e.button===2);}pointers.delete(e.pointerId);if(!pointers.size)gesture=null;else if(gesture)gesture.moved=true;});
  canvas.addEventListener('pointercancel',()=>{pointers.clear();gesture=null;});
  window.addEventListener('keydown',e=>{if(hud.key(e.key)){e.preventDefault();return;}const k=e.key.toLowerCase(),map={' ':'next-resident','n':'next-resident','p':'pause','0':'pause','delete':'cancel-all','h':'home','g':'gather','f':'follow','x':'cancel-all','t':'tv','b':'drink','r':'overview','v':'roof','c':'palette','1':'1','2':'2','3':'3'};if(map[k]){e.preventDefault();if(!e.repeat)action(map[k]);return;}if(['w','a','s','d','q','e','arrowup','arrowdown','arrowleft','arrowright'].includes(k)){e.preventDefault();following=false;keys.add(k);}});
  window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>{keys.clear();pointers.clear();gesture=null;});
  function model(now){
    const a=life.agents[selected],stats=life.stats(),near=life.agents.filter(a=>a.slot&&!a.route.length),roster=[a,...near.filter(b=>b!==a),...life.agents.filter(b=>b!==a&&!near.includes(b))].slice(0,6),bubbles=[];
    for(const b of near){const activity=b.state==='talking'?'chat':b.state==='watching TV'?'tv':b.state==='having a drink'?'cup':null;if(!activity)continue;const p=b.actor.root.position.clone();p.y+=2.12;p.project(camera);if(p.z>=-1&&p.z<=1)bubbles.push({x:(p.x+1)*canvas.clientWidth/2,y:(1-p.y)*canvas.clientHeight/2,icon:activity});}
    const person=a=>({name:a.actor.meta.name,index:a.index,appearance:a.actor.meta.appearance});
    const current=life.getCommands(selected).find(c=>c.kind==='go'),dest=current?.destination??(now<goalUntil?goal:null);let projectedGoal=null;if(dest){const v=new THREE.Vector3(dest.x,dest.y+.07,dest.z).project(camera);projectedGoal={x:(v.x+1)*canvas.clientWidth/2,y:(1-v.y)*canvas.clientHeight/2};}
    return {seed,queue:life.getCommands(selected),goal:projectedGoal,selected:{...person(a),state:a.state[0].toUpperCase()+a.state.slice(1),partner:a.partner===null?'':life.agents[a.partner].actor.meta.name},inside:stats.inside,speed,open:world.home.isOpen,evening,soft:compositor.enabled,ambient,following,residents:roster.map(person),allResidents:life.agents.map(person),bubbles,notice:now<noticeUntil?notice:''};
  }
  function simulate(dt){let remaining=dt;while(remaining>1e-8){const d=Math.min(1/30,remaining);world.step(d);remaining-=d;}}
  function frame(now){const dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;if(speed)simulate(dt*speed);if(following){const p=world.residents[selected].root.position;target.x+=(p.x-target.x)*(1-Math.exp(-dt*3));target.z+=(p.z-target.z)*(1-Math.exp(-dt*3));}const m=dt*180;if(keys.has('w')||keys.has('arrowup'))pan(0,m);if(keys.has('s')||keys.has('arrowdown'))pan(0,-m);if(keys.has('a')||keys.has('arrowleft'))pan(m,0);if(keys.has('d')||keys.has('arrowright'))pan(-m,0);if(keys.has('q'))yaw+=dt*.6;if(keys.has('e'))yaw-=dt*.6;updateCamera();world.home.update(camera,speed?dt*speed:0,life.doorWanted());atmosphere.sync();fixtures.update();marker.position.copy(world.residents[selected].root.position);marker.position.y+=2.3;marker.rotation.y=life.stats().time*.7;const mask=String(world.home.isOpen)+Object.values(world.home.visibleWalls()).join('');if(mask!==lastWalls||(speed&&now-lastShadow>100)){renderer.shadowMap.needsUpdate=true;lastShadow=now;lastWalls=mask;}compositor.render(scene,camera);hud.update(model(now),now);hud.render();frames++;raf=requestAnimationFrame(frame);}
  loadWorld(seed);resize();if(new URL(location.href).searchParams.get('view')==='town')overview();updateCamera();window.addEventListener('resize',resize);
  document.addEventListener('visibilitychange',()=>{keys.clear();if(document.hidden){cancelAnimationFrame(raf);raf=0;}else if(!raf){last=performance.now();raf=requestAnimationFrame(frame);}});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(raf);raf=0;const error=document.getElementById('error');error.hidden=false;error.textContent='The graphics context was interrupted. Reload to return to Town.';});
  window.townDebug={geometryIssues:()=>{const bad=[];scene.traverse(o=>{const a=o.geometry?.attributes?.position?.array;if(!a)return;let count=0;for(const v of a)if(!Number.isFinite(v))count++;if(count)bad.push({name:o.name||o.type,type:o.type,count});});return bad;},getStats:()=>({...world.stats,version:12,frames,seed,speed,paused:speed===0,pixelRatio:renderer.getPixelRatio(),softRendering:compositor.enabled,shadowRefreshHz:10,drawCalls:compositor.stats.drawCalls,triangles:compositor.stats.triangles,hudDrawCalls:1,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,mixedMedia:media?.info()??{status:mediaLibrary.status},live:life.stats(),gpuHUD:hud.info(),following:following?selected:null,palette:world.home.palette}),commands:()=>life.getCommands(selected),selected:()=>selected,resolvePoint:p=>life.nav.resolve(p),pointScreen:(x,z)=>{const g=life.nav.resolve({x,z});if(!g)return null;const p=new THREE.Vector3(x,g.y,z).project(camera);return {x:(p.x+1)*canvas.clientWidth/2,y:(1-p.y)*canvas.clientHeight/2};},getView:()=>({yaw,elevation,viewHeight,target:target.toArray()}),getHome:()=>({open:world.home.isOpen,walls:world.home.visibleWalls(),origin:world.home.origin.toArray(),state:life.agents[20].state}),residents:()=>life.agents.map(a=>({index:a.index,name:a.actor.meta.name,state:a.state,visits:a.visits,node:a.node,destination:a.reserved,position:a.actor.root.position.toArray(),routeLength:a.route.length,speed:a.speed,partner:a.partner,activity:a.slot?.activity,appearance:a.actor.meta.appearance,commands:life.getCommands(a.index),error:a.commandError,logicalPosition:{...a.pos}})),residentPosition:i=>world.residents[i].root.position.toArray(),hud:()=>hud.info(),objectScreen:kind=>{const p=world.home.worldPoint(kind==='drink'?-3.3:.4,kind==='drink'?.9:1.55,kind==='drink'?-1.15:2.1).project(camera);return {x:(p.x+1)*canvas.clientWidth/2,y:(1-p.y)*canvas.clientHeight/2};},seatScreen:id=>{const s=planV12Seats(world.plan).find(s=>s.id===id);if(!s)return null;const p=new THREE.Vector3(s.x,.7,s.z).project(camera);return {x:(p.x+1)*canvas.clientWidth/2,y:(1-p.y)*canvas.clientHeight/2};},action,openHome:homeView,loadSeed:loadWorld,rotateHome:angle=>{yaw=angle;updateCamera();}};
  if(new URL(location.href).searchParams.has('test'))window.townDebug.advanceSimulation=seconds=>{if(speed)simulate(Math.min(900,Math.max(0,Number(seconds)||0)));};
  raf=requestAnimationFrame(frame);
}
