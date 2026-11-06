import test from 'node:test';
import assert from 'node:assert/strict';
import {createPlan, cleanSeed, rng, sidewalkPosition, CENTERS, CELL, LOT} from '../src/plan.js';

test('a seed reproduces the complete neighborhood plan',()=>{
  assert.deepEqual(createPlan('petalwood'),createPlan('petalwood'));
  assert.notDeepEqual(createPlan('petalwood'),createPlan('another-garden'));
});
test('seed inputs are normalized and bounded',()=>{
  assert.equal(cleanSeed('   '),'petalwood');assert.equal(cleanSeed(null),'petalwood');assert.equal(cleanSeed('x'.repeat(100)).length,48);
  assert.deepEqual(createPlan('  oak  '),createPlan('oak'));
});
test('the finite benchmark has 16 lots, two parks, one cafe, and 32 residents',()=>{
  const p=createPlan();assert.equal(p.lots.length,16);assert.equal(p.residents,32);
  assert.equal(p.lots.filter(l=>l.kind==='park').length,2);assert.equal(p.lots.filter(l=>l.kind==='cafe').length,1);
  assert.equal(new Set(p.lots.map(l=>l.id)).size,16);
});
test('streets have consistent width and building footprints fit their lots',()=>{
  assert.equal(CELL-LOT,4);
  for(let i=1;i<CENTERS.length;i++)assert.equal(CENTERS[i]-CENTERS[i-1],CELL);
  for(let s=0;s<100;s++)for(const lot of createPlan(String(s)).lots){
    assert.ok(lot.width<12 && lot.depth<10);
    assert.ok(lot.width/2+.6<8.2);
    assert.ok(lot.depth/2+2.8<8.2);
    assert.ok(Number.isFinite(lot.rotation));
  }
});
test('sidewalk paths loop and stay outside the garden fence',()=>{
  const lot={x:12,z:-12}, length=9.22*8;
  for(let d=-200;d<=200;d+=.25){
    const p=sidewalkPosition(lot,d),q=sidewalkPosition(lot,d+length);
    assert.ok(Math.abs(p.x-q.x)<1e-10&&Math.abs(p.z-q.z)<1e-10);
    assert.ok(Math.max(Math.abs(p.x-lot.x),Math.abs(p.z-lot.z))>=9.21);
    assert.ok(Math.abs(p.x-lot.x)<9.23&&Math.abs(p.z-lot.z)<9.23);
  }
});
test('independent random streams repeat and stay in [0, 1)',()=>{
  const a=rng('kit'),b=rng('kit');
  for(let i=0;i<1000;i++){const x=a();assert.equal(x,b());assert.ok(x>=0&&x<1);}
});
