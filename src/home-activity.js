import {HOME_ROUTE,HOME_SEAT,FLOOR_Y,advanceRoute} from './home-plan.js';
import {sidewalkPosition} from './plan.js';

export function createHomeActivity(home,resident){
  const r=resident,scale=r.root.scale.x,foot=.07*scale;
  let state='outside',route=[],returnRoute=[],cursor=0,startDistance=0,sitBlend=0;
  const vector=p=>({x:p.x,y:p.y,z:p.z});
  function requestSit(){
    if(state!=='outside')return false;
    startDistance=r.distance;route=[vector(r.root.position)];
    const perimeter=9.22*8,gate=9.22*5;
    const current=((r.distance%perimeter)+perimeter)%perimeter;
    const delta=((gate-current+perimeter*1.5)%perimeter)-perimeter/2;
    const count=Math.max(1,Math.ceil(Math.abs(delta)/.8));
    for(let i=1;i<=count;i++){
      const p=sidewalkPosition(r.lot,current+delta*i/count);route.push({x:p.x,y:.29,z:p.z});
    }
    for(const [x,y,z] of HOME_ROUTE){const p=home.worldPoint(x,y-foot,z);route.push(vector(p));}
    returnRoute=[...route].reverse();cursor=1;state='entering';sitBlend=0;return true;
  }
  function requestLeave(){
    if(state!=='sitting')return false;
    route=returnRoute;cursor=0;state='leaving';return true;
  }
  function step(dt){
    if(state==='outside')return false;
    const sitting=state==='sitting';r.phase+=dt*(sitting?1.5:7);
    let moving=false;
    if(!sitting){
      const before=vector(r.root.position),step=advanceRoute(before,route,cursor,dt*1.55);
      r.root.position.set(step.position.x,step.position.y,step.position.z);cursor=step.index;
      const dx=step.position.x-before.x,dz=step.position.z-before.z;
      moving=Math.hypot(dx,dz)>1e-7;
      if(moving){let turn=Math.atan2(dx,dz)-r.root.rotation.y;turn=Math.atan2(Math.sin(turn),Math.cos(turn));r.root.rotation.y+=turn*Math.min(1,dt*12);}
      if(step.done){
        if(state==='entering'){state='sitting';sitBlend=0;}
        else {state='outside';r.distance=startDistance;r.wait=0;r.nextPause=12;return false;}
      }
    }
    if(state==='sitting'){
      sitBlend=Math.min(1,sitBlend+dt*3);const blend=sitBlend*sitBlend*(3-2*sitBlend);
      const walkingY=FLOOR_Y-foot,seatedY=FLOOR_Y+HOME_SEAT.hipY-.73*scale;
      r.root.position.copy(home.worldPoint(HOME_SEAT.x,walkingY+(seatedY-walkingY)*blend,HOME_SEAT.z));
      r.root.rotation.y=HOME_SEAT.facing;
      r.legs.forEach(l=>l.rotation.x=-Math.PI/2*blend);r.knees.forEach(k=>k.rotation.x=Math.PI/2*blend);
      r.arms.forEach(a=>a.rotation.x=-.35*blend);r.head.position.y=1.48+Math.sin(r.phase)*.006;
      r.meta.description='Relaxing on the sofa in Clover Cottage. You can send Luca back outside when you are ready.';
    }else{
      const walk=moving?Math.sin(r.phase):0;
      r.legs[0].rotation.x=walk*.5;r.legs[1].rotation.x=-walk*.5;
      r.knees[0].rotation.x=Math.max(0,-walk)*.62;r.knees[1].rotation.x=Math.max(0,walk)*.62;
      r.arms[0].rotation.x=-walk*.42-.08;r.arms[1].rotation.x=walk*.42-.08;
      r.head.position.y=1.48+Math.sin(r.phase*2)*.012;
      r.meta.description=state==='entering'?'Walking through the front gate and into Clover Cottage.':'Heading back through the front door to continue the neighborhood walk.';
    }
    return true;
  }
  return {requestSit,requestLeave,step,get state(){return state;},get resident(){return r;},
    doorWanted(){return state!=='outside'&&state!=='sitting'&&r.root.position.distanceTo(home.worldPoint(0,FLOOR_Y,home.lot.depth/2))<3.2;},
    info(){return {state,resident:r.meta.name,residentIndex:r.meta.index,waypoint:cursor,waypoints:route.length,seat:{...HOME_SEAT},occupied:state!=='outside'};},
  };
}
