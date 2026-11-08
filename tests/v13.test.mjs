import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {createPlan,sidewalkPosition} from '../src/plan.js';
import {createHousehold} from '../src/v11-life.js';

function makeWorld(seed='petalwood'){
  const plan=createPlan(seed),lot=plan.lots.find(l=>l.furnished),origin=new THREE.Vector3(lot.x,.376,lot.z-1);
  const residents=Array.from({length:32},(_,i)=>{
    const root=new THREE.Group(),head=new THREE.Group(),torso=new THREE.Group();root.scale.setScalar(1);
    const lot=plan.lots[Math.floor(i/2)],distance=(i*7.4)%73.76,p=sidewalkPosition(lot,distance);
    root.position.set(p.x,.29,p.z);
    return {root,head,torso,arms:[new THREE.Group(),new THREE.Group()],elbows:[new THREE.Group(),new THREE.Group()],legs:[new THREE.Group(),new THREE.Group()],knees:[new THREE.Group(),new THREE.Group()],cup:new THREE.Group(),lot,distance,phase:i,hipHeight:.87,headHeight:1.65,meta:{index:i,name:'Resident '+i}};
  });
  return {plan,home:{origin},residents,setLiveController(c){this.controller=c;}};
}
function tick(live,frames=1){for(let i=0;i<frames;i++)live.step(1/30);}
function seated(live,kind,target){
 const a=live.agents[20];live.cancelAll(20);
 const result=kind==='seat'?live.command(20,'seat',null,null,target):live.command(20,kind);
 assert.ok(result.ok,'Failed request '+kind);
 const expected=kind==='seat'?'sitting':kind==='drink'?'having a drink':'watching TV';
 let found=false;
 for(let i=0;i<7500;i++){tick(live);if(a.state===expected&&a.sit>.95){found=true;break;}}
 assert.ok(found,'Never reached seated '+kind+' '+(target||'')+': '+a.state);
 return a;
}
function finite(a){
 const r=a.actor;
 for(const o of [r.root,r.head,r.torso,...r.arms,...r.elbows,...r.legs,...r.knees,r.cup])
   for(const n of [...o.position.toArray(),...o.rotation.toArray().slice(0,3),...o.scale.toArray()])
     assert.ok(Number.isFinite(n),a.index+' '+a.state+' transform');
 assert.ok(a.sit>=0&&a.sit<=1);
}
function assertGetUp(l,a){
 const p={...a.pos},y=a.actor.root.position.y;let lastY=y;
 for(let i=0;i<24;i++){
  tick(l);assert.equal(a.state,'standing up');
  assert.ok(Math.hypot(a.pos.x-p.x,a.pos.z-p.z)<1e-8,'Walking before unseating');
  assert.ok(a.actor.root.position.y>=lastY-.004,'Pelvis sank during stand-up');
  lastY=a.actor.root.position.y;finite(a);
 }
 tick(l,2);assert.equal(a.getUpRemaining,0);assert.equal(a.exitSlot,null);
 assert.ok(Math.abs(a.actor.root.position.y-a.pos.y)<.002,'Standing floor error');assert.ok(a.getUpCount>0);
}
test('V13 sofa waits until standing before moving and feet clear the sofa',()=>{
 const l=createHousehold(makeWorld()),a=l.agents[20];
 assert.equal(a.state,'watching TV');tick(l,60);assert.ok(a.sit>.95);
 const n=l.nav.nodes[l.nav.homeSlots[0]];
 assert.equal(l.command(20,'go',{x:n.x,z:n.z}).ok,true);
 assertGetUp(l,a);tick(l,5);assert.ok(a.route.length>0);finite(a);
});
test('V13 dining chair and sofa cancellation have grounded get-up transitions',()=>{
 const l=createHousehold(makeWorld()),a=seated(l,'drink'),p={...a.pos};
 l.cancelAll(20);assert.equal(a.slot,null);assertGetUp(l,a);
 assert.deepEqual(a.pos,p);tick(l,60);assert.deepEqual(a.pos,p);
 seated(l,'tv');l.cancelAll(20);l.command(20,'seat',null,null,'home-lounger');
 assertGetUp(l,a);tick(l,2);finite(a);
});
test('V13 lounger and park chess seats use their own ground plane for standing',()=>{
 for(const seat of ['home-lounger','park-9-chess-a']){
  const l=createHousehold(makeWorld()),a=seated(l,'seat',seat);
  assert.ok(a.pos.y>a.actor.root.position.y+.05,'Pelvis was not seated');
  const n=l.nav.nodes[l.nav.homeSlots[0]];l.cancelAll(20);assert.ok(l.command(20,'go',{x:n.x,z:n.z}).ok);
  assertGetUp(l,a);for(let i=0;i<90;i++){tick(l);finite(a);}
 }
});
test('V13 group gestures, walk cycles and rapid cancellations stay finite',()=>{
 const l=createHousehold(makeWorld('festival-day'));
 l.command(20,'talk',null,6);tick(l,900);l.command(7,'talk',null,6);tick(l,900);
 for(let i=0;i<5;i++){l.command(20,'seat',null,null,'home-bistro-a');tick(l,5);l.cancelAll(20);tick(l,29);}
 for(const a of l.agents)finite(a);
 assert.ok(l.stats().getUps>=1);
});
