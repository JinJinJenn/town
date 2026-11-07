import {createGardenAir} from './garden-air.js';
// Keep the interaction/navigation implementation untouched by art-only updates.
export function createArtWorld(kit, buildWorld, seed) {
  const world=buildWorld(kit,seed), root=kit.group();
  for(const lot of world.plan.lots){
    const garden=kit.group(root,lot.x,.376,lot.z,lot.rotation);
    kit.dressLot(garden,lot);
  }
  const detail=kit.compile(root);world.group.add(detail.group);
  const air=createGardenAir(kit,world.plan);world.group.add(air.group);world.air=air;
  world.stats.staticBatches+=detail.batches.length;
  world.stats.artBatches=detail.batches.length;
  const step=world.step,dispose=world.dispose;let elapsed=0;
  world.step=dt=>{elapsed+=dt;kit.artTime.value=elapsed;air.step(dt);step(dt);};
  world.dispose=()=>{air.dispose();detail.dispose();dispose();};
  return world;
}
