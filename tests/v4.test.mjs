import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {createKit} from '../src/kit.js';
import {enhanceKit} from '../src/art.js';
import {enhanceV4Kit,createPetals} from '../src/v4-world.js';
import {createHome} from '../src/home.js';
import {createPlan} from '../src/plan.js';
const old=globalThis.document;
globalThis.document={createElement:()=>({width:64,height:64,getContext:()=>({createRadialGradient:()=>({addColorStop(){}}),fillRect(){}})})};
const kit=enhanceV4Kit(enhanceKit(createKit()));globalThis.document=old;
test('V4 palettes update instance colors without allocating geometry',()=>{
  const home=createHome(kit,createPlan('petalwood').lots[10]);
  const meshes=[];home.group.traverse(m=>{if(m.isInstancedMesh)meshes.push(m);});
  const ids=meshes.map(m=>m.geometry.uuid),before=meshes.map(m=>Array.from(m.instanceColor.array));
  assert.equal(home.setPalette('sage'),true);assert.equal(home.palette,'sage');
  assert.notDeepEqual(meshes.map(m=>Array.from(m.instanceColor.array)),before);
  for(let i=0;i<30;i++)home.setPalette(i%2?'lavender':'blossom');
  assert.deepEqual(meshes.map(m=>m.geometry.uuid),ids);
  assert.equal(home.setPalette('__proto__'),false);assert.equal(home.palette,'lavender');home.dispose();
});
test('V4 petal allocation is bounded and releases all owned GPU resources',()=>{
  let disposed=0;const world={plan:createPlan('petalwood'),group:new THREE.Group(),stats:{},dispose(){disposed++;this.group.clear();}};
  const petals=createPetals(kit,world);assert.equal(petals.count,96);
  assert.ok([...petals.instanceMatrix.array].every(Number.isFinite));
  petals.geometry.addEventListener('dispose',()=>disposed++);petals.material.addEventListener('dispose',()=>disposed++);
  world.setPetals(false);assert.equal(petals.visible,false);world.dispose();assert.equal(disposed,3);
});
test('V4 wall dressing preserves all four cutaway directions',()=>{
  const home=createHome(kit,createPlan('petalwood').lots[10]),camera=new THREE.PerspectiveCamera();
  home.setOpen(true);
  for(const [x,z] of [[10,10],[-10,10],[10,-10],[-10,-10]]){
    camera.position.copy(home.origin).add(new THREE.Vector3(x,15,z));home.update(camera);
    assert.deepEqual(home.visibleWalls(),{front:z<0,back:z>0,left:x>0,right:x<0});
  }
  home.dispose();
});
