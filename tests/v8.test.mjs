import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {createKit} from '../src/kit.js';
import {enhanceKit} from '../src/art.js';
import {enhanceV4Kit} from '../src/v4-world.js';
import {enhanceV5Kit} from '../src/v5-look.js';
import {optimizeV7Kit} from '../src/v7-polish.js';
import {enhanceV7Kit} from '../src/v7-detail.js';
import {createHome} from '../src/home.js';
import {createPlan} from '../src/plan.js';
import {PROP_TYPES,planV8Props,buildV8Prop,enhanceV8Kit,summarizeV8} from '../src/v8-props.js';
const old=globalThis.document;
globalThis.document={createElement:()=>({getContext:()=>({createRadialGradient:()=>({addColorStop(){}}),fillRect(){}})})};
const kit=[enhanceKit,enhanceV4Kit,enhanceV5Kit,optimizeV7Kit,enhanceV7Kit,enhanceV8Kit].reduce((k,fn)=>fn(k),createKit());globalThis.document=old;
test('V8 catalogue has distinct valid primitive assemblies, with no per-object material allocation',()=>{
 const root=new THREE.Group();const geos=new Set(Object.values(kit.geometries));const mats=new Set(Object.values(kit.materials));let parts=0,triangles=0;
 for(const type of PROP_TYPES){const g=buildV8Prop(kit,root,type);assert.ok(g.children.length>=3);assert.equal(g.userData.v8Type,type);}
 root.updateMatrixWorld(true);root.traverse(m=>{if(!m.isMesh)return;parts++;triangles+=(m.geometry.index?.count??m.geometry.attributes.position.count)/3;assert.ok(geos.has(m.geometry));assert.ok(mats.has(m.material));assert.ok([...m.matrixWorld.elements].every(Number.isFinite));});
 assert.equal(PROP_TYPES.length,36);assert.ok(parts<800);assert.ok(triangles<40000);assert.throws(()=>buildV8Prop(kit,root,'bogus'));
 console.log(JSON.stringify({catalogueParts:parts,catalogueTriangles:triangles}));
});
test('V8 lot placement is repeatable, bounded, and clear of residential buildings and gate corridor',()=>{
 for(const seed of ['petalwood','rosegarden','berry']){
  const plan=createPlan(seed),before=JSON.stringify(plan);const a=planV8Props(plan);assert.deepEqual(a,planV8Props(plan));assert.equal(JSON.stringify(plan),before);
  assert.ok(a.length>90&&a.length<130);for(const p of a){assert.ok(Math.abs(p.x)<7&&Math.abs(p.z)<8);const lot=plan.lots[p.lot];if(lot.kind!=='park'){assert.ok(Math.abs(p.x)>lot.width/2+.3||p.z>lot.depth/2+.8||p.z<-lot.depth/2-1.4);assert.ok(!(Math.abs(p.x)<1.3&&p.z>0));}}
 }
 const s=summarizeV8(createPlan());assert.ok(s.typeCount>=30);assert.ok(s.total>100);console.log(JSON.stringify(s));
});
test('V8 additions join shared batches, keep palette updates and every cutaway direction',()=>{
 const home=createHome(kit,createPlan().lots[10]),camera=new THREE.PerspectiveCamera();home.setOpen(true);
 for(const [x,z] of [[20,20],[-20,20],[20,-20],[-20,-20]]){camera.position.copy(home.origin).add(new THREE.Vector3(x,30,z));home.update(camera);assert.deepEqual(home.visibleWalls(),{front:z<0,back:z>0,left:x>0,right:x<0});}
 for(const name of ['roseMint','sage','lavender','blossom'])assert.equal(home.setPalette(name),true);
 const root=kit.group();for(const lot of createPlan().lots)for(const p of planV8Props({seed:lot.gardenSeed,lots:[lot]}))buildV8Prop(kit,root,p.type,lot.x+p.x,.376,lot.z+p.z,p.scale,p.angle,p.tint);
 const batch=kit.compile(root);assert.ok(batch.batches.length<=6);batch.dispose();home.dispose();
});
