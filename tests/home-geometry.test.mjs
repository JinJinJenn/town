import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {createKit} from '../src/kit.js';
import {createHome} from '../src/home.js';
import {createPlan} from '../src/plan.js';

// The kit only needs a canvas for its contact-shadow texture. These tests inspect
// real Three.js matrices/geometry; WebGL rendering remains covered by Playwright.
const oldDocument=globalThis.document;
globalThis.document={createElement:()=>({width:64,height:64,getContext:()=>({
  createRadialGradient:()=>({addColorStop(){}}),fillRect(){},
})})};
const kit=createKit();globalThis.document=oldDocument;

test('the detached home batches inherit their source lot transform',()=>{
  const lot=createPlan('petalwood').lots[10],home=createHome(kit,lot);
  const base=new THREE.Box3().setFromObject(home.group.children[0]);
  const center=base.getCenter(new THREE.Vector3());
  assert.ok(Math.abs(center.x-lot.x)<1e-6);
  assert.ok(base.min.z>lot.z-7 && base.max.z<lot.z+10);
  assert.ok(base.min.y>.3);
  const expected=home.worldPoint(-3,.85,1.1);
  assert.ok(Math.abs(expected.x-(lot.x-3))<1e-6);
  assert.ok(Math.abs(expected.z-(lot.z+.1))<1e-6);
  home.dispose();
});
test('cutaway walls switch with the camera without adding geometry',()=>{
  const home=createHome(kit,createPlan('petalwood').lots[10]);
  const count=home.group.children.length,camera=new THREE.PerspectiveCamera();
  home.setOpen(true);camera.position.copy(home.origin).add(new THREE.Vector3(10,15,10));home.update(camera);
  assert.deepEqual(home.visibleWalls(),{front:false,back:true,left:true,right:false});
  camera.position.copy(home.origin).add(new THREE.Vector3(-10,15,-10));home.update(camera);
  assert.deepEqual(home.visibleWalls(),{front:true,back:false,left:false,right:true});
  home.setOpen(false);home.update(camera);
  assert.deepEqual(home.visibleWalls(),{front:true,back:true,left:true,right:true});
  assert.equal(home.group.children.length,count);home.dispose();
});


test('the structural slab stays below the visible floorboards',()=>{
  const lot=createPlan('petalwood').lots[10],home=createHome(kit,lot);
  const matrix=new THREE.Matrix4(),position=new THREE.Vector3(),rotation=new THREE.Quaternion(),scale=new THREE.Vector3();
  let found=false;
  home.group.children[0].traverse(mesh=>{
    if(!mesh.isInstancedMesh)return;
    for(let i=0;i<mesh.count;i++){
      mesh.getMatrixAt(i,matrix);matrix.decompose(position,rotation,scale);
      if(Math.abs(scale.x-lot.width)<1e-5 && Math.abs(scale.z-lot.depth)<1e-5){
        found=true;
        assert.ok(position.y+scale.y/2 <= home.origin.y+.4-.015,'slab top must not share the floorboard surface');
      }
    }
  });
  assert.equal(found,true);home.dispose();
});
