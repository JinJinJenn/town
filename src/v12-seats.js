import * as THREE from '../vendor/three.module.js';
import {planV8Props} from './v8-props.js';

function rotateLocal(lot,x,z){
  const c=Math.cos(lot.rotation||0),s=Math.sin(lot.rotation||0);
  return {x:lot.x+x*c-z*s,z:lot.z+x*s+z*c};
}
function add(out,lot,id,label,x,z,facing=0,hipY=.48,kind='seat'){
  const p=rotateLocal(lot,x,z);out.push({id,label,lot:lot.id,x:p.x,z:p.z,facing:facing+(lot.rotation||0),hipY,kind});
}
export function planV12Seats(plan){
  const out=[],home=plan.lots.find(l=>l.furnished);
  if(home){
    add(out,home,'home-bistro-a','Garden bistro chair',-4.5,5.65,Math.PI/2,.49);
    add(out,home,'home-bistro-b','Garden bistro chair',-2.6,5.65,-Math.PI/2,.49);
    add(out,home,'home-lounger','Garden lounger',4.25,5.55,0,.46);
    add(out,home,'home-bench-a','Garden bench',6.65,2.15,-Math.PI/2,.48);
    add(out,home,'home-bench-b','Garden bench',6.65,2.85,-Math.PI/2,.48);
  }
  for(const lot of plan.lots.filter(l=>l.kind==='park')){
    add(out,lot,`park-${lot.id}-picnic-a`,'Picnic bench',-.72,4.98,0,.47);
    add(out,lot,`park-${lot.id}-picnic-b`,'Picnic bench',.72,4.98,0,.47);
    add(out,lot,`park-${lot.id}-picnic-c`,'Picnic bench',-.72,6.72,Math.PI,.47);
    add(out,lot,`park-${lot.id}-picnic-d`,'Picnic bench',.72,6.72,Math.PI,.47);
    add(out,lot,`park-${lot.id}-chess-a`,'Chess chair',-5.9,-1.6,Math.PI/2,.48);
    add(out,lot,`park-${lot.id}-chess-b`,'Chess chair',-3.9,-1.6,-Math.PI/2,.48);
    add(out,lot,`park-${lot.id}-bench-a`,'Park bench',-5.7,4.5,Math.PI/2,.48);
    add(out,lot,`park-${lot.id}-bench-b`,'Park bench',5.6,-4.2,-Math.PI/2,.48);
  }
  return out;
}
export function addV12SeatSlots(nav,plan,origin){
  const seats=planV12Seats(plan),slots=[];
  for(const seat of seats){
    let approach=null;
    if(seat.lot===plan.lots.find(l=>l.furnished).id){
      const r=nav.resolve({x:seat.x,z:seat.z});
      if(r)approach=r.node;
    }else{
      const ring=nav.rings.get(seat.lot)||[];
      let best=Infinity;
      for(const id of ring){const n=nav.nodes[id],d=Math.hypot(n.x-seat.x,n.z-seat.z);if(d<best){best=d;approach=id;}}
    }
    if(approach===null)continue;
    const id=nav.nodes.length;
    nav.nodes.push({id,x:seat.x,y:seat.lot===plan.lots.find(l=>l.furnished).id?origin.y-.07:.29,z:seat.z,zone:'seat',edges:[approach]});
    nav.nodes[approach].edges.push(id);
    slots.push({id:seat.id,node:id,activity:'seat',facing:seat.facing,hipY:seat.hipY,label:seat.label,seatId:seat.id,lot:seat.lot});
  }
  nav.slots.push(...slots);nav.v12Seats=slots;return nav;
}
export function mountV12SeatTargets(world){
  const geometry=new THREE.BoxGeometry(1,1,1),material=new THREE.MeshBasicMaterial({visible:false}),meshes=[];
  for(const seat of planV12Seats(world.plan)){
    const mesh=new THREE.Mesh(geometry,material);mesh.position.set(seat.x,.72,seat.z);mesh.scale.set(.8,1.25,.8);
    mesh.userData.selection={type:'furniture',activity:'seat',seatId:seat.id,name:seat.label,lot:world.plan.lots[seat.lot]};
    world.group.add(mesh);world.targets.push(mesh);meshes.push(mesh);
  }
  return {count:meshes.length,dispose(){for(const m of meshes){const i=world.targets.indexOf(m);if(i>=0)world.targets.splice(i,1);world.group.remove(m);}geometry.dispose();material.dispose();}};
}
