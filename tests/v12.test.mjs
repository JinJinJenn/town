import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {createPlan,sidewalkPosition} from '../src/plan.js';
import {createHousehold,makeHouseholdNavigation} from '../src/v11-life.js';
import {planV12Seats} from '../src/v12-seats.js';

function mockWorld(seed='petalwood'){
  const plan=createPlan(seed),lot=plan.lots.find(l=>l.furnished),origin=new THREE.Vector3(lot.x,.376,lot.z-1);
  return {plan,home:{origin},setLiveController(c){this.controller=c;},residents:Array.from({length:32},(_,i)=>{
    const root=new THREE.Group(),head=new THREE.Group();root.scale.setScalar(1);
    const lot=plan.lots[Math.floor(i/2)],distance=(i*7.4)%73.76,p=sidewalkPosition(lot,distance);
    root.position.set(p.x,.29,p.z);
    return {root,head,arms:[new THREE.Group(),new THREE.Group()],elbows:[new THREE.Group(),new THREE.Group()],legs:[new THREE.Group(),new THREE.Group()],knees:[new THREE.Group(),new THREE.Group()],lot,distance,phase:i,hipHeight:.87,headHeight:1.65,meta:{index:i,name:'Resident '+i}};
  })};
}
function advance(live,seconds){for(let i=0;i<Math.ceil(seconds*30);i++)live.step(1/30);}

test('V12 exposes functional seats for the home and both parks',()=>{
  const w=mockWorld(),nav=makeHouseholdNavigation(w.plan,w.home.origin),planned=planV12Seats(w.plan);
  assert.ok(planned.length>=20);
  assert.equal(nav.v12Seats.length,planned.length);
  assert.ok(nav.v12Seats.some(s=>s.id==='home-lounger'));
  assert.ok(nav.v12Seats.some(s=>s.id.includes('picnic')));
});

test('V12 selected resident can queue a real outdoor seat and later stand again',()=>{
  const w=mockWorld(),live=createHousehold(w);
  assert.ok(live.command(20,'seat',null,null,'home-lounger').ok);
  let sat=false;
  for(let i=0;i<5000;i++){live.step(1/30);if(live.agents[20].state==='sitting'){sat=true;break;}}
  assert.ok(sat);
  assert.equal(live.agents[20].slot?.seatId,'home-lounger');
  assert.ok(live.stats().seated>=1);
  live.cancelAll(20);assert.equal(live.agents[20].slot,null);
});

test('V12 conversations can grow beyond pairs and keep a rotating speaker',()=>{
  const live=createHousehold(mockWorld());
  assert.ok(live.command(20,'talk',null,6).ok);
  for(let i=0;i<5000&&live.agents[20].socialGroup.length<2;i++)live.step(1/30);
  assert.ok(live.agents[20].socialGroup.length>=2);
  assert.ok(live.command(7,'talk',null,6).ok);
  for(let i=0;i<5000&&!live.agents[6].socialGroup.includes(7);i++)live.step(1/30);
  assert.ok(live.agents[6].socialGroup.includes(7));
  assert.ok(live.stats().maxGroup>=3);
  const ids=live.agents[6].socialGroup;assert.ok(ids.includes(6)&&ids.includes(7));
});

test('V12 group cancellation removes one Sim without destroying the remaining conversation',()=>{
  const live=createHousehold(mockWorld());
  live.command(20,'talk',null,6);for(let i=0;i<5000&&live.agents[20].socialGroup.length<2;i++)live.step(1/30);
  live.command(7,'talk',null,6);for(let i=0;i<5000&&!live.agents[6].socialGroup.includes(7);i++)live.step(1/30);
  assert.ok(live.agents[6].socialGroup.includes(7));live.cancelAll(7);assert.equal(live.agents[7].socialGroup.length,0);
  assert.ok(live.agents[6].socialGroup.length>=2);
});
