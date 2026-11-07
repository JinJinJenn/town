import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {createPlan,sidewalkPosition} from '../src/plan.js';
import {createHousehold,makeHouseholdNavigation} from '../src/v11-life.js';
function mockWorld(seed='petalwood'){const plan=createPlan(seed),lot=plan.lots.find(l=>l.furnished),origin=new THREE.Vector3(lot.x,.376,lot.z-1);return {plan,home:{origin},setLiveController(c){this.controller=c;},residents:Array.from({length:32},(_,i)=>{const root=new THREE.Group(),head=new THREE.Group();root.scale.setScalar(1);const lot=plan.lots[Math.floor(i/2)],distance=(i*7.4)%73.76,p=sidewalkPosition(lot,distance);root.position.set(p.x,.29,p.z);return {root,head,arms:[new THREE.Group(),new THREE.Group()],legs:[new THREE.Group(),new THREE.Group()],knees:[new THREE.Group(),new THREE.Group()],lot,distance,phase:i,meta:{index:i,name:'Resident '+i}};})};}
function advance(live,seconds){for(let i=0;i<Math.ceil(seconds*30);i++)live.step(1/30);}
test('V11 resolves floor, bedroom, bathroom, front lawn and sidewalk; rejects solid furniture',()=>{
 const w=mockWorld(),nav=makeHouseholdNavigation(w.plan,w.home.origin),o=w.home.origin;
 for(const [x,z] of [[-1.2,2.9],[2.8,-.6],[3.2,2.8],[2,7.6],[0,10.22]]){const p=nav.resolve({x:o.x+x,z:o.z+z});assert.ok(p,`Missing destination ${x},${z}`);assert.ok(nav.route(nav.seat,p.node).length);}
 for(const [x,z] of [[-3,1.1],[3.15,-2.8],[4.65,2.3],[.95,-2],[-2,7.8]])assert.equal(nav.resolve({x:o.x+x,z:o.z+z}),null);
});
test('V11 Go here interrupts autonomy, reaches the exact point and holds position',()=>{
 const w=mockWorld(),l=createHousehold(w),o=w.home.origin,p={x:o.x-1.2,z:o.z+2.9};assert.equal(l.command(20,'go',p).ok,true);
 let maximumStep=0;for(let i=0;i<1200&&l.getCommands(20).length;i++){const a={...l.agents[20].pos};l.step(1/30);const b=l.agents[20].pos;maximumStep=Math.max(maximumStep,Math.hypot(a.x-b.x,a.z-b.z));}
 assert.equal(l.getCommands(20).length,0);assert.ok(Math.hypot(l.agents[20].pos.x-p.x,l.agents[20].pos.z-p.z)<.015);assert.ok(maximumStep<.06);const before={...l.agents[20].pos};advance(l,10);assert.deepEqual(l.agents[20].pos,before);
});
test('V11 queues moves before simulation and cancels without teleporting or retaining reservations',()=>{
 const w=mockWorld(),l=createHousehold(w),o=w.home.origin,points=[{x:o.x-1.2,z:o.z+2.9},{x:o.x+2.8,z:o.z-.6},{x:o.x+2,z:o.z+7.6}];
 for(const p of points)assert.ok(l.command(20,'go',p).ok);assert.equal(l.getCommands(20).length,3);const last=l.getCommands(20)[2];assert.ok(l.cancelCommand(20,last.id));assert.equal(l.getCommands(20).length,2);
 advance(l,2);const before={...l.agents[20].pos};l.cancelAll(20);assert.deepEqual(l.agents[20].pos,before);assert.equal(l.agents[20].reserved,null);advance(l,1);assert.deepEqual(l.agents[20].pos,before);
 assert.ok(l.command(20,'go',points[1]).ok);advance(l,45);assert.equal(l.getCommands(20).length,0);assert.ok(Math.hypot(l.agents[20].pos.x-points[1].x,l.agents[20].pos.z-points[1].z)<.01);
});
test('V11 queues movement then real furniture use and caps six player commands',()=>{
 const w=mockWorld(),l=createHousehold(w),o=w.home.origin;assert.ok(l.command(20,'go',{x:o.x-1.2,z:o.z+2.9}).ok);assert.ok(l.command(20,'drink').ok);let seen=false;for(let i=0;i<4500;i++){l.step(1/30);if(l.agents[20].state==='having a drink'){seen=true;break;}}assert.ok(seen);l.cancelAll(20);
 for(let i=0;i<6;i++)assert.ok(l.command(20,'go',{x:o.x-1.2,z:o.z+2.9}).ok);assert.equal(l.command(20,'drink').ok,false);assert.equal(l.getCommands(20).length,6);
});
test('V11 directed chat uses the requested partner and releases both participants',()=>{
 const l=createHousehold(mockWorld());assert.ok(l.command(20,'talk',null,6).ok);let paired=false;
 for(let i=0;i<4500;i++){l.step(1/30);if(l.agents[20].partner===6){paired=true;break;}}
 assert.ok(paired);assert.equal(l.agents[6].partner,20);l.cancelAll(20);assert.equal(l.agents[6].partner,null);
});
