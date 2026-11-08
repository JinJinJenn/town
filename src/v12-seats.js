import * as THREE from '../vendor/three.module.js';
import {planV8Props} from './v8-props.js';

function rotateLocal(lot,x,z){
  const c=Math.cos(lot.rotation||0),s=Math.sin(lot.rotation||0);
  return {x:lot.x+x*c+z*s,z:lot.z-x*s+z*c};
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
  // Every procedurally placed garden chair and every permanent bench gets a seat.
  // Keep original home and park IDs stable for saved commands and review scripts.
  for(const lot of plan.lots.filter(l=>!l.furnished&&l.kind!=='park')){
    const props=planV8Props({seed:lot.gardenSeed,lots:[lot]});
    for(const [i,p] of props.entries()){
      const place=(dx,dz)=>{
        const a=p.angle||0,c=Math.cos(a),s=Math.sin(a);
        return [p.x+p.scale*(dx*c+dz*s),p.z+p.scale*(-dx*s+dz*c)];
      };
      if(p.type==='bistro'||p.type==='chess')for(const side of [-1,1]){
        const [x,z]=place(side*.95,0);
        add(out,lot,'lot-'+lot.id+'-'+i+'-'+side,p.type==='bistro'?'Garden bistro chair':'Chess chair',x,z,(p.angle||0)+(side<0?Math.PI/2:-Math.PI/2),.49);
      }
      else if(p.type==='lounger'){
        const [x,z]=place(0,-.24);add(out,lot,'lot-'+lot.id+'-'+i,'Garden lounger',x,z,p.angle||0,.46);
      }
      else if(p.type==='picnic')for(const side of [-1,1]){
        const [x,z]=place(0,side*.87);add(out,lot,'lot-'+lot.id+'-'+i+'-'+side,'Picnic bench',x,z,(p.angle||0)+(side<0?0:Math.PI),.47);
      }
    }
    const bx=lot.kind==='cafe'?-7.1:6.8,bz=lot.kind==='cafe'?0:2.5,angle=lot.kind==='cafe'?Math.PI/2:-Math.PI/2;
    for(const side of [-1,1]){
      const x=bx+Math.cos(angle)*side*.49,z=bz-Math.sin(angle)*side*.49;
      add(out,lot,'lot-'+lot.id+'-bench-'+side,lot.kind==='cafe'?'Cafe bench':'Garden bench',x,z,angle,.56);
    }
  }
  // Original park benches can each seat two residents, without adding meshes.
  for(const lot of plan.lots.filter(l=>l.kind==='park')){
    for(const [i,[x,z,angle]] of [[-5.7,4.5,Math.PI/2],[5.6,-4.2,-Math.PI/2]].entries()){
      const side=i===0?1:-1;
      add(out,lot,'park-'+lot.id+'-bench-extra-'+i,'Park bench',x+Math.cos(angle)*side*.55,z-Math.sin(angle)*side*.55,angle,.56);
    }
  }
  return out;
}
export function addV12SeatSlots(nav,plan,origin){
  const seats=planV12Seats(plan),slots=[],home=plan.lots.find(l=>l.furnished);
  const nodes=nav.nodes;
  const addNode=(x,y,z,zone='yard')=>{
    const id=nodes.length;nodes.push({id,x,y,z,zone,edges:[]});return id;
  };
  const link=(a,b)=>{
    if(a===b)return;
    if(!nodes[a].edges.includes(b))nodes[a].edges.push(b);
    if(!nodes[b].edges.includes(a))nodes[b].edges.push(a);
  };
  const local=(lot,x,z)=>{
    const c=Math.cos(lot.rotation||0),s=Math.sin(lot.rotation||0),dx=x-lot.x,dz=z-lot.z;
    return {x:dx*c-dz*s,z:dx*s+dz*c};
  };
  // Courtyard routes enter through each lot's gate, then remain outside buildings.
  // Rotated lots share the same entrance layout in their own local coordinates.
  const corridors=new Map();
  for(const lot of plan.lots){
    const positions=[[0,8.0],[0,7.05],[-7,7.05],[7,7.05],[-7,2],[7,2],[-7,-2],[7,-2],[-7,-7],[7,-7],[0,-7]];
    const waypoints=positions.map(([x,z])=>{
      const p=rotateLocal(lot,x,z);return addNode(p.x,.33,p.z);
    });
    const gate=rotateLocal(lot,0,9.22);
    const ring=nav.rings.get(lot.id);
    let nearest=ring[0],distance=Infinity;
    for(const id of ring){const d=Math.hypot(nodes[id].x-gate.x,nodes[id].z-gate.z);if(d<distance){nearest=id;distance=d;}}
    link(nearest,waypoints[0]);
    for(const [a,b] of [[0,1],[1,2],[1,3],[2,4],[3,5],[4,6],[5,7],[6,8],[7,9],[8,10],[9,10]])link(waypoints[a],waypoints[b]);
    corridors.set(lot.id,waypoints);
  }
  function clearSegment(lot,a,b){
    const p=local(lot,a.x,a.z),q=local(lot,b.x,b.z),dist=Math.hypot(q.x-p.x,q.z-p.z),steps=Math.max(1,Math.ceil(dist/.23));
    for(let i=0;i<=steps;i++){
      const t=i/steps,x=p.x+(q.x-p.x)*t,z=p.z+(q.z-p.z)*t;
      if(Math.abs(x)>8.35||Math.abs(z)>8.4)return false;
      if(lot.kind==='park'){
        if(lot.id===9&&(x/3.5)**2+(z/4.5)**2<1)return false;
        if(lot.id!==9&&Math.hypot(x,z)<2.7)return false;
      }else if(Math.abs(x)<(lot.furnished?6:lot.width/2+.8)&&Math.abs(z-(lot.furnished?-1:0))<(lot.furnished?5.1:lot.depth/2+.8))return false;
    }
    return true;
  }
  for(const seat of seats){
    const lot=plan.lots[seat.lot];
    let approaches=corridors.get(lot.id).map(id=>({id,d:Math.hypot(nodes[id].x-seat.x,nodes[id].z-seat.z)})).sort((a,b)=>a.d-b.d);
    approaches=approaches.filter(a=>clearSegment(lot,nodes[a.id],seat)).slice(0,2);
    if(!approaches.length)continue;
    const id=addNode(seat.x,.376,seat.z,'seat');
    for(const approach of approaches)link(id,approach.id);
    slots.push({id:seat.id,node:id,activity:'seat',facing:seat.facing,hipY:seat.hipY,label:seat.label,seatId:seat.id,lot:seat.lot});
  }
  nav.slots.push(...slots);nav.v12Seats=slots;return nav;
}
export function mountV12SeatTargets(world,available=null){
  const geometry=new THREE.BoxGeometry(1,1,1),material=new THREE.MeshBasicMaterial({visible:false}),meshes=[];
  for(const seat of planV12Seats(world.plan)){
    if(available&&!available.has(seat.id))continue;
    const mesh=new THREE.Mesh(geometry,material);mesh.position.set(seat.x,.72,seat.z);mesh.scale.set(.8,1.25,.8);
    mesh.userData.selection={type:'outdoorSeat',activity:'seat',seatId:seat.id,name:seat.label,lot:world.plan.lots[seat.lot]};
    world.group.add(mesh);world.targets.push(mesh);meshes.push(mesh);
  }
  return {count:meshes.length,dispose(){for(const m of meshes){const i=world.targets.indexOf(m);if(i>=0)world.targets.splice(i,1);world.group.remove(m);}geometry.dispose();material.dispose();}};
}
