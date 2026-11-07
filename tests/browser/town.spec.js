import {test,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
// Interaction coverage uses the supported standard renderer; 00-art tests both visual paths.
test.beforeEach(async({page})=>{await page.addInitScript(()=>localStorage.setItem('town.softRendering.v1','0'));});
const out='artifacts';
async function ready(page){
  await page.goto('/town/?seed=petalwood');
  await page.waitForFunction(()=>!!window.townDebug,{},{timeout:60000});
  await expect(page.locator('#error')).toBeHidden();
  await page.waitForFunction(()=>window.townDebug.getStats().frames>3);
}
async function nextFrames(page,count=2){
  const before=await page.evaluate(()=>window.townDebug.getStats().frames);
  await page.waitForFunction(({before,count})=>window.townDebug.getStats().frames>=before+count,{before,count},{timeout:30000});
}
const positions=page=>page.evaluate(()=>Array.from({length:window.townDebug.getStats().residents},(_,i)=>window.townDebug.residentPosition(i)));

test('desktop renders real 3D and its controls preserve the simulation',async({page})=>{
  test.setTimeout(240000);
  await mkdir(out,{recursive:true});const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await ready(page);
  const initial=await page.evaluate(()=>window.townDebug.getStats());
  expect(initial.lots).toBe(16);expect(initial.residents).toBe(32);expect(initial.triangles).toBeGreaterThan(10000);expect(initial.drawCalls).toBeLessThan(200);
  await page.screenshot({path:`${out}/Town-desktop.png`});
  await page.locator('#close-welcome').click();
  // Individuals intentionally idle. Check the population after actual rendered
  // frames rather than requiring one arbitrary person to move in 800 ms.
  const before=await positions(page);
  await nextFrames(page,3);
  expect(await positions(page)).not.toEqual(before);
  await page.locator('#pause').click();await nextFrames(page);
  const stopped=await positions(page);await nextFrames(page);
  expect(await positions(page)).toEqual(stopped);
  await page.screenshot({path:`${out}/Town-neighborhood.png`});
  const cameraBefore=await page.evaluate(()=>window.townDebug.getStats().target);
  await page.locator('#tour').click();await nextFrames(page,3);
  expect(await page.evaluate(()=>window.townDebug.getStats().target)).not.toEqual(cameraBefore);
  await page.locator('#tour').click();
  await page.evaluate(()=>window.townDebug.selectResident(10));await expect(page.locator('#inspector')).toBeVisible();
  await page.locator('#follow').click();expect(await page.evaluate(()=>window.townDebug.getStats().following)).toBe(10);
  await page.locator('#reset').click();expect(await page.evaluate(()=>window.townDebug.getStats().following)).toBeNull();
  await page.locator('#close-inspector').click();
  const h=await page.evaluate(()=>window.townDebug.getStats().viewHeight);await page.locator('#zoom-in').click();
  expect(await page.evaluate(()=>window.townDebug.getStats().viewHeight)).toBeLessThan(h);await page.locator('#reset').click();
  await page.locator('#evening').click();expect(await page.evaluate(()=>window.townDebug.getStats().evening)).toBe(true);
  await nextFrames(page);await page.screenshot({path:`${out}/Town-evening.png`});await page.locator('#evening').click();
  const plan=await page.evaluate(()=>window.townDebug.getPlan());
  for(const seed of ['test-one','test-two','petalwood']) {await page.evaluate(seed=>window.townDebug.loadSeed(seed),seed);await nextFrames(page);}
  expect(await page.evaluate(()=>window.townDebug.getPlan())).toEqual(plan);
  const final=await page.evaluate(()=>window.townDebug.getStats());expect(final.geometries).toBeLessThanOrEqual(initial.geometries+2);
  expect(errors).toEqual([]);
  await writeFile(`${out}/validation.json`,JSON.stringify({desktop:'passed',initial,final,pageErrors:errors,notes:'Software-rendered browser validation, not a real-device FPS benchmark.'},null,2));
});

test('mobile has usable controls and no horizontal overflow',async({page})=>{
  await mkdir(out,{recursive:true});await page.setViewportSize({width:390,height:844});await ready(page);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(390);
  const box=await page.locator('.toolbar').boundingBox();expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(390);
  await page.screenshot({path:`${out}/Town-mobile.png`});await page.locator('#explore').click();
  await expect(page.locator('#welcome')).toBeHidden();await page.locator('#help').click();await expect(page.locator('#help-dialog')).toBeVisible();
  await page.locator('#seed').fill('mobile-garden');await page.locator('#load-seed').click();expect(await page.evaluate(()=>window.townDebug.getStats().seed)).toBe('mobile-garden');
});

test('WebGL failure is explained instead of posing a still image as gameplay',async({page})=>{
  await page.addInitScript(()=>{
    const original=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl2'?null:original.call(this,type,...args);};
  });
  await page.goto('/town/');await expect(page.locator('#error')).toBeVisible();await expect(page.locator('#loading')).toBeHidden();
  await expect(page.locator('#error-message')).toContainText('WebGL2');
});
