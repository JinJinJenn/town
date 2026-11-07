import test from 'node:test';
import assert from 'node:assert/strict';
import {createPlan} from '../src/plan.js';
import {createGardenAir} from '../src/garden-air.js';
import {readFile} from 'node:fs/promises';

test('petals are deterministic, bounded and independently disposable',()=>{
  const plan=createPlan('petalwood'),a=createGardenAir(null,plan),b=createGardenAir(null,plan);
  assert.ok(a.count>0&&a.count<=128);
  assert.deepEqual(Array.from(a.group.instanceMatrix.array),Array.from(b.group.instanceMatrix.array));
  assert.deepEqual(Array.from(a.group.instanceColor.array),Array.from(b.group.instanceColor.array));
  assert.equal(a.group.castShadow,false);a.step(.25);assert.equal(a.time.value,.25);
  a.setEnabled(false);assert.equal(a.group.visible,false);a.setEnabled(true);assert.equal(a.group.visible,true);
  a.dispose();b.dispose();
});
test('v4 navigation has real controls, keeps accessible names and links to the mods site',async()=>{
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  for(const id of ['residents','resident-search','resident-list','photo','photo-save','photo-exit','quality','petals','visit-home','home-action','about'])assert.match(html,new RegExp(`id="${id}"`));
  assert.match(html,/https:\/\/jinjinjenn.github.io\/mods\//);assert.doesNotMatch(html,/href="#"/);
  assert.match(html,/Town v4/);
});
