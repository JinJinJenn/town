import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {createKit} from '../src/kit.js';
import {enhanceKit} from '../src/art.js';
import {enhanceV4Kit} from '../src/v4-world.js';
import {enhanceV5Kit,roseMintColor} from '../src/v5-look.js';
import {createHome} from '../src/home.js';
import {createPlan} from '../src/plan.js';
const old=globalThis.document;
globalThis.document={createElement:()=>({getContext:()=>({createRadialGradient:()=>({addColorStop(){}}),fillRect(){}})})};
const kit=enhanceV5Kit(enhanceV4Kit(enhanceKit(createKit())));globalThis.document=old;
test('V5 enriches pinks and foliage without mutating source colors or whites',()=>{
 for(const value of ['#e4adbf','#a1b77d']){
  const color=new THREE.Color(value),before=color.clone(),after=roseMintColor(color);
  assert.equal(color.getHexString(),before.getHexString());
  assert.ok(after.getHSL({},THREE.SRGBColorSpace).s>before.getHSL({},THREE.SRGBColorSpace).s);
 }
 assert.equal(roseMintColor('#ffffff').getHexString(),'ffffff');
});
test('V5 does not recolor dynamic resident batches and compiles are repeatable',()=>{
 const root=kit.group();kit.box(root,'#d995b1',[0,0,0],[1,1,1]);
 const a=kit.compile(root),b=kit.compile(root),dynamic=kit.compile(root,true);
 const read=compiled=>{const c=new THREE.Color();compiled.batches[0].mesh.getColorAt(0,c);return c.getHexString();};
 assert.equal(read(a),read(b));assert.equal(read(dynamic),'d995b1');assert.equal(read(a),'e8519c');
 for(const item of [a,b,dynamic])item.dispose();
});
test('V5 flower geometry and planting remain bounded and clear the gate',()=>{
 assert.equal(kit.geometries.roseFlower.attributes.position.count/3,30);
 const lot=createPlan('petalwood').lots[10],root=kit.group();kit.dressLot(root,lot);
 let flowers=0;
 root.traverse(m=>{if(m.geometry===kit.geometries.roseFlower){flowers++;assert.ok(Math.abs(m.position.x)>2.5);assert.ok(Math.abs(m.position.z)>7);}});
 assert.equal(flowers,28);
});
test('V5 Rose Mint is the default and all four cottage styles reuse geometry',()=>{
 const home=createHome(kit,createPlan('petalwood').lots[10]),meshes=[];home.group.traverse(m=>{if(m.isInstancedMesh)meshes.push(m);});
 assert.equal(home.palette,'roseMint');const ids=meshes.map(m=>m.geometry.uuid),before=meshes.map(m=>Array.from(m.instanceColor.array));
 for(const style of ['sage','lavender','blossom','roseMint'])assert.equal(home.setPalette(style),true);
 assert.deepEqual(meshes.map(m=>m.geometry.uuid),ids);assert.deepEqual(meshes.map(m=>Array.from(m.instanceColor.array)),before);
 assert.equal(home.setPalette('constructor'),false);home.dispose();
});
