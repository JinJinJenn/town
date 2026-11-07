import test from 'node:test';
import assert from 'node:assert/strict';
import { createPlan } from '../src/plan.js';
import { enhanceKit, plantingPlan, raisedBedPlan } from '../src/art.js';
import { createKit } from '../src/kit.js';
import { createWorld } from '../src/world.js';
import { createArtWorld } from '../src/art-world.js';

test('planting is deterministic and leaves gates, sidewalks and house footprints clear',()=>{
  for(const seed of ['petalwood','rose','fern','2026'])for(const lot of createPlan(seed).lots){
    const beds=plantingPlan(lot);assert.deepEqual(beds,plantingPlan(lot));
    for(const bed of beds){
      const radius=bed.size*.85;
      assert.ok(Math.abs(bed.x)+radius<8.2 && Math.abs(bed.z)+radius<8.2);
      assert.ok(Math.abs(bed.x)-radius>1.25,'keep the central entrance route clear');
      if(lot.kind!=='park'){
        const benchX=lot.kind==='cafe'?-7.1:6.8,benchZ=lot.kind==='cafe'?0:2.5;
        assert.ok(Math.abs(bed.x-benchX)>radius+.4||Math.abs(bed.z-benchZ)>radius+1.35,'flowers must not cover the bench');
        const outsideX=Math.abs(bed.x)-radius>lot.width/2+.1;
        const outsideZ=bed.z-radius>lot.depth/2-1+.1 || bed.z+radius < -lot.depth/2-1-.1;
        assert.ok(outsideX||outsideZ,'flower beds must not occupy a house');
      }
    }
  }
});
test('the art layer preserves world plans and stays within finite geometry budgets',()=>{
  const oldDocument=globalThis.document;
  globalThis.document={createElement:()=>({width:64,height:64,getContext:()=>({
    createRadialGradient:()=>({addColorStop(){}}),fillRect(){},strokeRect(){},fillText(){},
  })})};
  try{
    const kit=enhanceKit(createKit()), expected=createPlan('petalwood');
    const world=createArtWorld(kit,createWorld,'petalwood');
    assert.deepEqual(world.plan,expected);assert.equal(world.residents.length,32);
    assert.ok(world.stats.artBatches>0 && world.stats.artBatches<16);
    let triangles=0,instances=0;
    world.group.traverse(m=>{
      if(!m.isInstancedMesh)return;
      triangles+=(m.geometry.index?.count??m.geometry.attributes.position.count)/3*m.count;
      instances+=m.count;
      assert.ok(Array.from(m.instanceMatrix.array).every(Number.isFinite));
    });
    assert.ok(triangles<1800000,`unbounded triangles: ${triangles}`);
    assert.ok(instances<45000,`unbounded instances: ${instances}`);
    world.step(.05);assert.equal(kit.artTime.value,.05);world.dispose();
    assert.equal(world.group.children.length,0);
  }finally{globalThis.document=oldDocument;}
});

test('raised planters clear both the house and the pine trunk',()=>{
  const bed=raisedBedPlan();
  for(const lot of createPlan('petalwood').lots.filter(l=>l.kind!=='park')){
    assert.ok(bed.z+.51 < -1-lot.depth/2-.1);
    assert.ok(bed.x+bed.width/2+.12 < 6.7-1.0);
    assert.ok(Math.abs(bed.z)+.51 < 8.2);
  }
});
