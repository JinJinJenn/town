import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {createKit} from '../src/kit.js';
import {enhanceKit} from '../src/art.js';
import {enhanceV4Kit} from '../src/v4-world.js';
import {enhanceV5Kit} from '../src/v5-look.js';
import {enhanceV7Kit,planV7Garden,createV7Atmosphere} from '../src/v7-detail.js';
import {createHome} from '../src/home.js';
import {createPlan} from '../src/plan.js';
const old=globalThis.document;
globalThis.document={createElement:()=>({getContext:()=>({createRadialGradient:()=>({addColorStop(){}}),fillRect(){}})})};
const kit=enhanceV7Kit(enhanceV5Kit(enhanceV4Kit(enhanceKit(createKit()))));globalThis.document=old;
test('V7 garden detail is deterministic, bounded, and outside house and gate corridors',()=>{
 const plan=createPlan('petalwood'),before=JSON.stringify(plan),a=planV7Garden(plan);
 assert.deepEqual(a,planV7Garden(plan));assert.equal(JSON.stringify(plan),before);assert.equal(a.length,436);
 for(const p of a){assert.ok(Math.abs(p.x)>=7.65&&Math.abs(p.x)<8);assert.ok(Math.abs(p.z)<=7.46);assert.ok(Number.isFinite(p.height));}
 assert.notDeepEqual(a,planV7Garden(createPlan('another-seed')));
});
test('V7 cottage details remain palette-compatible and follow all cutaway directions',()=>{
 const home=createHome(kit,createPlan().lots[10]);assert.equal(home.polishVersion,7);assert.ok(home.detailInstances>200&&home.detailInstances<900);
 const meshes=[];home.group.traverse(m=>{if(m.isInstancedMesh)meshes.push(m);});const ids=meshes.map(m=>m.geometry.uuid);
 for(const id of ['sage','blossom','lavender','roseMint'])assert.equal(home.setPalette(id),true);
 assert.deepEqual(meshes.map(m=>m.geometry.uuid),ids);
 const camera=new THREE.PerspectiveCamera();home.setOpen(true);
 for(const [x,z] of [[20,20],[-20,20],[20,-20],[-20,-20]]){camera.position.copy(home.origin).add(new THREE.Vector3(x,30,z));home.update(camera);assert.deepEqual(home.visibleWalls(),{front:z<0,back:z>0,left:x>0,right:x<0});}
 for(const mesh of meshes)assert.ok([...mesh.instanceMatrix.array].every(Number.isFinite));home.dispose();
});
test('V7 atmosphere is bounded, responds to motion settings and releases resources',()=>{
 let disposed=0,steps=0;const world={plan:createPlan(),home:{origin:new THREE.Vector3(12,.376,11),isOpen:true},group:new THREE.Group(),stats:{},step(){steps++;},dispose(){disposed++;this.group.clear();}};
 const fx=createV7Atmosphere(kit,world);assert.equal(fx.info().instances,56);assert.equal(world.stats.v7Effects,56);assert.equal(fx.info().steamVisible,true);
 const meshes=[...world.group.children];const matrix=Array.from(meshes[0].instanceMatrix.array);
 world.step(.5);assert.equal(steps,1);assert.deepEqual(Array.from(meshes[0].instanceMatrix.array),matrix);
 fx.setEnabled(false);assert.equal(fx.info().steamVisible,false);fx.setEnabled(true);world.home.isOpen=false;fx.sync();assert.equal(fx.info().steamVisible,false);
 fx.setEvening(true);assert.equal(meshes[0].material.uniforms.night.value,1);
 meshes[0].geometry.addEventListener('dispose',()=>disposed++);for(const m of meshes)m.material.addEventListener('dispose',()=>disposed++);
 world.dispose();world.dispose();assert.equal(disposed,4);
});
