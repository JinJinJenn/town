import * as THREE from '../vendor/three.module.js';
import { createPlan, rng, sidewalkPosition } from './plan.js';
import {createHome} from './home.js';
import {createHomeActivity} from './home-activity.js';
import {HOME_ID} from './home-plan.js';

export function createWorld(kit, seed) {
  const plan=createPlan(seed), root=kit.group(), actors=kit.group(), group=new THREE.Group();
  const targets=[], residents=[], puffs=[];let home=null;
  const {box,part,ball,cyl}=kit;
  const pickMaterial=new THREE.MeshBasicMaterial({visible:false});
  function pick(parent,shape,p,s,meta) {
    const mesh=new THREE.Mesh(kit.geometries[shape],pickMaterial);
    mesh.position.set(...p);mesh.scale.set(...s);mesh.userData.selection=meta;parent.add(mesh);targets.push(mesh);return mesh;
  }
  // One bounded visual benchmark, not an infinite-world claim.
  box(root,'#b5c49b',[0,-.32,0],[145,.5,145]);
  box(root,'#a7b0a7',[0,-.025,0],[116,.12,116]);
  const roadLines=[-48,-24,0,24,48];
  for(const a of roadLines) {
    for(let b=-55;b<=55;b+=3.9) {
      if(roadLines.some(c=>Math.abs(c-b)<4.1))continue;
      box(root,'#d9ddcb',[a,.04,b],[.08,.014,1.6]);
      box(root,'#d9ddcb',[b,.04,a],[1.6,.014,.08]);
    }
    for(const b of roadLines)for(const side of [-1,1])for(let i=-3;i<=3;i++) {
      box(root,'#e6e6d3',[a+i*.47,.044,b+side*3.0],[.26,.015,1.18]);
      box(root,'#e6e6d3',[a+side*3.0,.044,b+i*.47],[1.18,.015,.26]);
    }
  }
  function park(g,lot,r) {
    box(g,'#ddd7bc',[0,.023,0],[18,.045,1.7]);
    if(lot.id===9) {
      part(g,'cylinder','#a0c3b1',[0,.08,0],[5.8,.17,8.0],[0,0,0],'water');
      part(g,'cylinder','#81b2a6',[0,.17,0],[5.15,.02,7.25],[0,0,0],'water');
      for(let i=0;i<28;i++) {
        const a=i/28*Math.PI*2;if(Math.abs(Math.sin(a))<.2)continue;
        const stone=part(g,'leaf',i%3?'#d4d7bb':'#e3dfc6',[Math.cos(a)*3.04,.18,Math.sin(a)*4.06],[.55+r()*.25,.35+r()*.16,.5+r()*.2]);stone.rotation.y=r()*3;
      }
      for(let i=0;i<18;i++) {
        const x=-3.8+i*.447, yy=.29+Math.sin(i/17*Math.PI)*.37;
        box(g,i%2?'#c2a280':'#d1b38e',[x,yy,0],[.41,.12,1.8]);
        if(i%3===0)for(const z of [-.85,.85])box(g,'#b79b79',[x,yy+.46,z],[.09,.91,.09]);
        if(i<17)for(const z of [-.85,.85])kit.beam(g,'#e1c9a4',[x,yy+.91,z],[x+.447,.29+Math.sin((i+1)/17*Math.PI)*.37+.91,z],.09);
      }
      for(const [x,z,s] of [[1,2,.55],[-.6,-2.5,.9],[-1.4,1.6,.35]])part(g,'ring','#b9d4c1',[x,.19,z],[s,s,s],[-Math.PI/2,0,0],'water');
    } else {
      cyl(g,'#ded7c0',[0,.18,0],[4.9,.36,4.9]);part(g,'cylinder','#99c4b3',[0,.38,0],[4.3,.07,4.3],[0,0,0],'water');
      cyl(g,'#e2d8c0',[0,.85,0],[.55,1.1,.55]);cyl(g,'#e7ddc6',[0,1.39,0],[2.3,.18,2.3]);ball(g,'#c9d6bf',[0,1.74,0],[.55,.75,.55]);
    }
    kit.bench(g,-5.7,4.5,Math.PI/2);kit.bench(g,5.6,-4.2,-Math.PI/2);
    kit.tree(g,-6.1,-5.8,r,true,1.18);kit.tree(g,5.8,5.6,r,false,1.1);kit.pine(g,6.1,-6.0,1.05);
    kit.tree(g,-5.9,6.5,r,true,.8);
    for(const side of [-1,1])for(let i=0;i<4;i++)kit.flowers(g,side*7.4,-4+i*1.8,r,4);
  }
  for(const lot of plan.lots) {
    const g=kit.group(root,lot.x,.27,lot.z,lot.rotation), r=rng(lot.gardenSeed);
    box(g,'#d5d1bb',[0,-.11,0],[20,.22,20]);
    box(g,'#e5dfcc',[0,.008,0],[19.72,.035,19.72]);
    box(g,'#b2c394',[0,.057,0],[17.5,.095,17.5]);
    // Set the kit origin on the lawn; the surrounding pavement stays lower.
    const garden=kit.group(g,0,.106,0);
    if(lot.kind==='park') park(garden,lot,r);
    else {
      if(lot.id===HOME_ID){home=createHome(kit,lot);group.add(home.group);}else kit.building(garden,lot,r);
      kit.fence(garden,[-8.2,-8.2],[8.2,-8.2]);
      kit.fence(garden,[-8.2,-8.2],[-8.2,8.2]);kit.fence(garden,[8.2,-8.2],[8.2,8.2]);
      kit.fence(garden,[-8.2,8.2],[-1.2,8.2]);kit.fence(garden,[1.2,8.2],[8.2,8.2]);
      kit.tree(garden,-6.6,-6.6,r,r()>.55,.85+r()*.2);kit.pine(garden,6.7,-6.5,.8+r()*.22);
      if(lot.kind!=='cafe') {kit.tree(garden,-6.7,5.8,r,true,.72);kit.bench(garden,6.8,2.5,-Math.PI/2);}
      else kit.bench(garden,-7.1,0,Math.PI/2);
      for(const side of [-1,1])for(let i=0;i<5;i++) {
        const x=side*(5.5+r()*.5), z=-5.2+i*1.7;
        part(garden,'leaf',['#8fa67f','#a1b78c','#b0bd8d'][i%3],[x,.36,z],[.7,.65,.8]);
        if(i%2===0)kit.flowers(garden,x+.4,z+.1,r,3);
      }
      // A working front path is kept clear of these decorations.
      kit.planter(garden,3.1,7.4,r,.9);kit.planter(garden,-3.1,7.4,r,.9);
      box(garden,'#a3aa8d',[2.0,.55,7.9],[.1,1.1,.1]);part(garden,'round','#c99799',[2,1.13,7.9],[.55,.38,.36]);
      const description=lot.furnished?'Clover Cottage has a furnished kitchen, living room, bedroom, and bathroom. Look inside and ask Luca to try the sofa.':lot.kind==='cafe'?"Jenn's cafe has a striped awning, outdoor tables, and a bicycle parked beside the window.":`This ${lot.floors===2?'two-storey house':'cottage'} combines a pitched roof, shuttered windows, a covered entrance, and a fenced garden.`;
      pick(garden,'box',[0,lot.height/2+1,-1],[lot.width,lot.height+2,lot.depth],{type:'building',name:lot.name,description,lot});
      if(lot.kind==='cafe') {
        garden.updateWorldMatrix(true,false);
        const origin=garden.localToWorld(new THREE.Vector3(lot.width*.25,lot.height+.35+2.45,-lot.depth*.18-1));
        for(let i=0;i<6;i++) {const puff=ball(actors,'#e9e6d6',origin.toArray(),[.25,.25,.25]);puffs.push({puff,origin:origin.clone(),offset:i/6});}
      }
    }
    if(lot.kind==='park')pick(garden,'box',[0,.25,0],[17,.5,17],{type:'building',name:lot.name,description:lot.id===9?'A wooden footbridge crosses the pond between the flower beds and shaded benches.':'A small fountain and a few shaded benches give this corner of the neighborhood somewhere to pause.',lot});
    kit.lamp(garden,-9.2,-9.2);
    for(let i=0;i<2;i++) residents.push(makeResident(kit,actors,lot,plan.seed,lot.id*2+i,pick));
  }
  // A soft planted boundary prevents a cut-out board-game edge at wider zooms.
  const rr=rng(`${plan.seed}:edge`);
  for(let i=0;i<38;i++) {
    const a=i/38*Math.PI*2, radius=61+rr()*5;
    kit.tree(root,Math.cos(a)*radius,Math.sin(a)*radius,rr,i%6===0,.9+rr()*.7);
  }
  const homeActivity=createHomeActivity(home,residents[HOME_ID*2]);
  const sofaRoot=kit.group(null,...home.origin.toArray());
  pick(sofaRoot,'box',[-3,.9,1.1],[2.9,1.2,1.1],{type:'furniture',name:'Clover Cottage sofa',lot:home.lot});
  sofaRoot.updateMatrixWorld(true);
  const staticBatch=kit.compile(root), dynamicBatch=kit.compile(actors,true);
  group.add(staticBatch.group,dynamicBatch.group);let elapsed=0;
  function step(dt) {
    elapsed+=dt;
    for(const r of residents) {
      if(r===homeActivity.resident&&homeActivity.step(dt))continue;
      r.nextPause-=dt;
      if(r.nextPause<=0) {r.wait=1.5+r.random()*2;r.nextPause=12+r.random()*18;}
      r.wait=Math.max(0,r.wait-dt);const moving=r.wait===0;
      if(moving)r.distance+=dt*r.speed*r.direction;
      const point=sidewalkPosition(r.lot,r.distance);
      r.root.position.set(point.x,.29,point.z);
      const angle=point.angle+(r.direction<0?Math.PI:0);
      let turn=angle-r.root.rotation.y;turn=Math.atan2(Math.sin(turn),Math.cos(turn));r.root.rotation.y+=turn*Math.min(1,dt*12);
      r.phase+=dt*(moving?6.4*r.speed:1.6);
      const walk=moving?Math.sin(r.phase):0;
      r.legs[0].rotation.x=walk*.5;r.legs[1].rotation.x=-walk*.5;
      r.arms[0].rotation.x=-walk*.42-.08;r.arms[1].rotation.x=walk*.42-.08;
      r.knees[0].rotation.x=Math.max(0,-walk)*.62;r.knees[1].rotation.x=Math.max(0,walk)*.62;
      r.head.position.y=1.48+Math.sin(r.phase*2)*(moving?.015:.009);
      r.root.position.y+=moving?Math.abs(Math.sin(r.phase))*.025:0;
      r.meta.description=moving?'Taking a walk around the neighborhood. You can follow along while they make their way past the gardens.':'Pausing for a moment on the sidewalk before continuing their walk.';
    }
    for(const {puff,origin,offset} of puffs) {
      const t=(elapsed*.22+offset)%1;puff.position.copy(origin).add(new THREE.Vector3(Math.sin(t*4)*.23+t*.6,t*2.5,0));
      const size=(.18+t*.35)*Math.sin(Math.PI*Math.min(1,t*1.15));puff.scale.setScalar(Math.max(.01,size));
    }
    dynamicBatch.update();
  }
  step(0);
  return {group,plan,targets,residents,step,home,homeActivity,
    getTargets:()=>targets.filter(t=>t.userData.selection.type==='furniture'?home.isOpen:!(t.userData.selection.lot?.furnished&&home.isOpen)),
    stats:{lots:plan.lots.length,residents:residents.length,staticBatches:staticBatch.batches.length,dynamicBatches:dynamicBatch.batches.length},
    dispose(){staticBatch.dispose();dynamicBatch.dispose();home.dispose();pickMaterial.dispose();group.clear();}
  };
}

function makeResident(kit,parent,lot,seed,index,pick) {
  const r=rng(`${seed}:resident:${index}`), root=kit.group(parent);
  const skins=['#d3a17d','#efc6a0','#9f6e54','#bf8b6c','#f1d3b5'];
  const shirts=['#bd858f','#91ada7','#bbad83','#9c9cba','#c49877','#e1d8b8','#839a82'];
  const hairs=['#695a4b','#aa8053','#4d4b43','#ba9b6e','#806154'];
  const skin=skins[Math.floor(r()*skins.length)], shirt=shirts[Math.floor(r()*shirts.length)], hair=hairs[Math.floor(r()*hairs.length)], pants=index%3?'#778785':'#a1a89b';
  const names=['Mia','Theo','June','Robin','Poppy','Alex','Nora','Finn','Lily','Sam','Hazel','Jamie','Cleo','Ollie','Ivy','Ellis','Ruby','Ben','Ada','Rowan','Luca','Mabel','Arlo','Lena','Kit','Daisy','Remy','Willow','Eden','Max','Avery','Pearl'];
  const scale=.95+r()*.16;root.scale.setScalar(scale);
  const {part,box,ball,cyl}=kit;
  part(root,'round',shirt,[0,1.01,0],[.43,.51,.28]);part(root,'round',pants,[0,.73,0],[.35,.19,.26]);
  cyl(root,skin,[0,1.3,0],[.12,.14,.12]);
  const head=kit.group(root,0,1.48,0);
  ball(head,skin,[0,0,0],[.36,.42,.35]);ball(head,skin,[0,-.025,.176],[.07,.085,.06]);
  for(const side of [-1,1]) {
    ball(head,skin,[side*.177,-.01,0],[.07,.12,.08]);
    ball(head,'#f4eee1',[side*.073,.027,.151],[.065,.054,.035]);ball(head,'#484b42',[side*.073,.025,.17],[.027,.034,.021]);
  }
  ball(head,hair,[0,.145,-.035],[.4,.22,.36]);ball(head,hair,[0,.025,-.135],[.35,.33,.14]);
  if(index%4===0)ball(head,hair,[0,.25,-.12],[.22,.23,.22]);
  if(index%4===1)for(let i=0;i<5;i++)ball(head,hair,[Math.sin(i*1.5)*.16,.14+Math.cos(i)*.04,-.02+Math.cos(i*1.5)*.11],[.21,.22,.21]);
  if(index%7===0){cyl(head,'#d7c49c',[0,.23,0],[.51,.04,.5]);cyl(head,'#d7c49c',[0,.31,0],[.33,.15,.33]);}
  if(index%6===0)for(const side of [-1,1])part(head,'ring','#7c7162',[side*.081,.025,.185],[.105,.105,.105]);
  const arms=[],legs=[],knees=[];
  for(const side of [-1,1]) {
    const arm=kit.group(root,side*.25,1.19,0);arm.rotation.z=side*.08;
    part(arm,'round',shirt,[0,-.13,0],[.15,.29,.17]);
    const elbow=kit.group(arm,0,-.26,0);elbow.rotation.x=-.1;part(elbow,'round',skin,[0,-.135,0],[.105,.27,.12]);ball(elbow,skin,[0,-.29,.005],[.12,.14,.12]);arms.push(arm);
    const leg=kit.group(root,side*.115,.73,0);part(leg,'round',pants,[0,-.155,0],[.153,.32,.18]);
    const knee=kit.group(leg,0,-.3,0);part(knee,'round',pants,[0,-.145,0],[.13,.3,.15]);part(knee,'round','#7a7365',[0,-.3,.055],[.16,.12,.27]);legs.push(leg);knees.push(knee);
  }
  if(index%5===0)part(root,'cone',shirt,[0,.73,0],[.57,.32,.48]);
  if(index%4===2){box(root,'#d6b18e',[.02,1.0,.16],[.045,.52,.025],[0,0,-.48]);part(root,'round','#c89ba0',[.27,.78,.03],[.19,.24,.23]);}
  const meta={type:'resident',name:names[index%names.length],description:'Taking a walk around the neighborhood.',index};
  const proxy=pick(root,'sphere',[0,.95,0],[1.05,2.0,1.05],meta);
  const distance=r()*73.76, point=sidewalkPosition(lot,distance);root.position.set(point.x,.29,point.z);root.rotation.y=point.angle;
  return {root,head,arms,legs,knees,proxy,meta,lot,distance,speed:.62+r()*.3,direction:r()>.5?1:-1,phase:r()*6.28,wait:0,nextPause:6+r()*18,random:r};
}
