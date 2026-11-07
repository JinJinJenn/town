import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createPlan} from '../src/plan.js';
import {planIllustratedLayers,MEDIA_FILES} from '../src/v6-media.js';
test('V6 cards are deterministic, bounded, and leave navigation unchanged',()=>{
 const plan=createPlan('petalwood'),before=JSON.stringify(plan),a=planIllustratedLayers(plan);
 assert.deepEqual(a,planIllustratedLayers(createPlan('petalwood')));assert.equal(JSON.stringify(plan),before);
 assert.equal(a.hedge.length,64);assert.equal(a.planter.length,32);assert.equal(a.sign.length,3);
 for(const group of Object.values(a))for(const p of group){const lot=plan.lots[p.lot];assert.ok(Math.max(Math.abs(p.x-lot.x),Math.abs(p.z-lot.z))<8);assert.ok(p.y>.37&&p.height>0&&p.width<3);}
 assert.notDeepEqual(a,planIllustratedLayers(createPlan('another-seed')));
});
test('V6 runtime images have valid WebP headers and their recorded checksums',()=>{
 const manifest=JSON.parse(readFileSync(new URL('../assets/v6/manifest.json',import.meta.url)));
 for(const item of Object.values(manifest.images)){
  const b=readFileSync(new URL(`../assets/v6/${item.file}`,import.meta.url));
  assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.toString('ascii',8,12),'WEBP');assert.equal(b.readUInt32LE(4)+8,b.length);
  assert.equal(createHash('sha256').update(b).digest('hex'),item.sha256);
 }
 assert.equal(Object.keys(MEDIA_FILES).length,4);
});
