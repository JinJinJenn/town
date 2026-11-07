import test from 'node:test';
import assert from 'node:assert/strict';
import {createPlan} from '../src/plan.js';
import {HOME_ID,HOME_ROUTE,HOME_SEAT,FURNITURE,advanceRoute,ROOMS} from '../src/home-plan.js';

test('exactly one single-storey furnished cottage is available for every seed',()=>{
  for(let i=0;i<100;i++){
    const lots=createPlan(String(i)).lots,homes=lots.filter(l=>l.furnished);
    assert.equal(homes.length,1);assert.equal(homes[0].id,HOME_ID);
    assert.equal(homes[0].floors,1);assert.equal(homes[0].rotation,0);
    for(const f of FURNITURE){assert.ok(Math.abs(f.x)+f.w/2<homes[0].width/2);assert.ok(Math.abs(f.z)+f.d/2<homes[0].depth/2);}
    assert.equal(ROOMS.length,4);
  }
});
test('the reserved route approaches the sofa without crossing other furniture',()=>{
  const obstacles=FURNITURE.filter(f=>f.id!=='sofa');
  for(let i=1;i<HOME_ROUTE.length;i++)for(let j=0;j<=30;j++){
    const a=HOME_ROUTE[i-1],b=HOME_ROUTE[i],t=j/30,x=a[0]+(b[0]-a[0])*t,z=a[2]+(b[2]-a[2])*t;
    for(const f of obstacles)assert.ok(Math.abs(x-f.x)>=f.w/2+.16||Math.abs(z-f.z)>=f.d/2+.16,`route intersects ${f.id}`);
  }
  const last=HOME_ROUTE.at(-1);assert.equal(last[0],HOME_SEAT.x);assert.equal(last[2],HOME_SEAT.z);
});
test('the approach crosses the front door on its centerline and floor height',()=>{
  const door=HOME_ROUTE.find(p=>p[2]===5.15),inside=HOME_ROUTE.find(p=>p[2]===4.05);
  assert.deepEqual(door,[0,.4,5.15]);assert.deepEqual(inside,[0,.4,4.05]);
});
test('route advancement is bounded, deterministic and independent of step size',()=>{
  const route=[{x:1,y:0,z:0},{x:1,y:0,z:1},{x:2,y:.3,z:1}],start={x:0,y:0,z:0};
  const once=advanceRoute(start,route,0,2.4);let parts={position:start,index:0};
  for(let i=0;i<24;i++)parts=advanceRoute(parts.position,route,parts.index,.1);
  for(const key of ['x','y','z'])assert.ok(Math.abs(parts.position[key]-once.position[key])<1e-10);
  assert.deepEqual(start,{x:0,y:0,z:0});assert.equal(once.done,false);
  assert.equal(advanceRoute(start,route,0,99).done,true);
  assert.deepEqual(advanceRoute(start,route,0,0).position,start);
  assert.deepEqual(advanceRoute(start,route,0,-5).position,start);
});
test('zero-length waypoints finish without loops or NaNs',()=>{
  const p={x:1,y:2,z:3};const done=advanceRoute(p,[p,p,p],0,0);
  assert.equal(done.done,true);assert.deepEqual(done.position,p);
});
