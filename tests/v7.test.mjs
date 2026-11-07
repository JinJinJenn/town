import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {createKit} from '../src/kit.js';
import {enhanceKit} from '../src/art.js';
import {enhanceV4Kit} from '../src/v4-world.js';
import {enhanceV5Kit} from '../src/v5-look.js';
import {optimizeV7Kit} from '../src/v7-polish.js';
import {createHome} from '../src/home.js';
import {createPlan} from '../src/plan.js';
function kit(){const old=globalThis.document;globalThis.document={createElement:()=>({getContext:()=>({createRadialGradient:()=>({addColorStop(){}}),fillRect(){}})})};try{return optimizeV7Kit(enhanceV5Kit(enhanceV4Kit(enhanceKit(createKit()))));}finally{globalThis.document=old;}}
test('V7 merges modest opaque assemblies and frees their owned geometry',()=>{const k=kit(),r=k.group();k.box(r,'#eebb99',[0,0,0],[1,1,1]);k.ball(r,'#aaccee',[2,0,0],[1,1,1]);const c=k.compile(r);assert.equal(c.group.children.length,1);assert.equal(c.group.children[0].name,'v7-merged-static');let disposed=0;c.group.children[0].geometry.addEventListener('dispose',()=>disposed++);c.dispose();assert.equal(disposed,1);});
test('V7 keeps dynamic meshes and palette-owned furniture instanced',()=>{const k=kit(),r=k.group();k.box(r,'#eebb99',[0,0,0],[1,1,1]);k.ball(r,'#aaccee',[2,0,0],[1,1,1]);const c=k.compile(r,true);assert.ok(c.group.children.every(x=>x.isInstancedMesh));c.update();c.dispose();const home=createHome(k,createPlan('petalwood').lots[10]);for(const p of ['roseMint','sage','lavender','blossom'])assert.equal(home.setPalette(p),true);home.dispose();});
test('V7 reduces shared rounded and tiny-bloom triangle counts',()=>{const k=kit();assert.equal(k.geometries.round.index.count/3,108);assert.equal(k.geometries.bud.attributes.position.count/3,8);});
test('V7 detail and wall cutaways do not alter the deterministic home plan',()=>{const k=kit(),p=createPlan('petalwood'),before=JSON.stringify(p);const home=createHome(k,p.lots[10]);home.setOpen(true);for(const [x,z] of [[1,1],[-1,1],[1,-1],[-1,-1]]){const c=new THREE.PerspectiveCamera();c.position.copy(home.origin).add(new THREE.Vector3(x*10,20,z*10));home.update(c);assert.deepEqual(home.visibleWalls(),{front:z<0,back:z>0,left:x>0,right:x<0});}assert.equal(JSON.stringify(p),before);home.dispose();});
