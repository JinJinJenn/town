import {test,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
// Interaction coverage uses the supported standard renderer; 00-art tests both visual paths.
test.beforeEach(async({page})=>{await page.addInitScript(()=>localStorage.setItem('town.softRendering.v1','0'));});
async function ready(page){
  await page.goto('/town/?seed=petalwood&test=1');
  await page.waitForFunction(()=>!!window.townDebug,{},{timeout:60000});
  await expect(page.locator('#error')).toBeHidden();
  await page.locator('#visit-home').click();
  await page.waitForFunction(()=>window.townDebug.getHome().open);
}
async function frames(page,n=2){
  const f=await page.evaluate(()=>window.townDebug.getStats().frames);
  await page.waitForFunction(({f,n})=>window.townDebug.getStats().frames>=f+n,{f,n},{timeout:30000});
}
test('furnished home has camera-aware cutaways and a usable sofa round trip',async({page})=>{
  test.setTimeout(240000);await mkdir('artifacts',{recursive:true});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await ready(page);await frames(page);
  const initial=await page.evaluate(()=>window.townDebug.getStats());
  const home=await page.evaluate(()=>window.townDebug.getHome());
  expect(home.walls).toEqual({front:false,back:true,left:true,right:false});
  await page.screenshot({path:'artifacts/Town02-interior.png'});
  await page.evaluate(()=>window.townDebug.rotateHome(3.8));await frames(page);
  expect((await page.evaluate(()=>window.townDebug.getHome())).walls).toEqual({front:true,back:false,left:false,right:true});
  await page.evaluate(()=>window.townDebug.rotateHome(.7));await frames(page);
  // Exercise a real screen-space click on the furniture, not a command shortcut.
  const sofa=await page.evaluate(()=>window.townDebug.sofaScreenPosition());
  await page.mouse.click(sofa.x,sofa.y);await frames(page);
  expect((await page.evaluate(()=>window.townDebug.getHome())).state).toBe('entering');
  const before=await page.evaluate(()=>window.townDebug.residentPosition(20));await frames(page,3);
  expect(await page.evaluate(()=>window.townDebug.residentPosition(20))).not.toEqual(before);
  await page.locator('#pause').click();await frames(page);
  const frozen=await page.evaluate(()=>window.townDebug.residentPosition(20));
  await page.evaluate(()=>window.townDebug.advanceSimulation(10));await frames(page);
  expect(await page.evaluate(()=>window.townDebug.residentPosition(20))).toEqual(frozen);
  await page.locator('#pause').click();
  // Fixed-step advancement runs the same production movement loop. It avoids
  // a one-minute wall-clock wait in software-rendered CI; it does not teleport.
  await page.evaluate(()=>window.townDebug.advanceSimulation(80));await frames(page);
  const seated=await page.evaluate(()=>window.townDebug.getHome());expect(seated.state).toBe('sitting');
  expect(seated.residentPosition[0]).toBeCloseTo(seated.origin[0]-3,4);
  expect(seated.residentPosition[2]).toBeCloseTo(seated.origin[2]+1.1,4);
  await page.locator('#pause').click();await frames(page);
  await page.screenshot({path:'artifacts/Town02-seated.png'});
  await page.locator('#evening').click();await frames(page);await page.screenshot({path:'artifacts/Town02-evening.png'});await page.locator('#evening').click();
  await page.locator('#pause').click();await page.locator('#home-action').click();
  await page.evaluate(()=>window.townDebug.advanceSimulation(80));await frames(page);
  expect((await page.evaluate(()=>window.townDebug.getHome())).state).toBe('outside');
  await page.locator('#open-home').click();await frames(page);expect((await page.evaluate(()=>window.townDebug.getHome())).open).toBe(false);
  await page.screenshot({path:'artifacts/Town02-neighborhood.png'});
  for(let i=0;i<10;i++){await page.locator('#open-home').click();await frames(page,1);}
  const final=await page.evaluate(()=>window.townDebug.getStats());expect(final.geometries).toBeLessThanOrEqual(initial.geometries+1);expect(final.drawCalls).toBeLessThan(100);
  expect(errors).toEqual([]);
  await writeFile('artifacts/checkpoint02-validation.json',JSON.stringify({test:'cutaway and sofa round trip passed',initial,final,seated,pageErrors:errors,fixedStepNote:'Full production movement at 0.05-second steps; not a hardware FPS benchmark.'},null,2));
});
test('regenerating during a home visit releases its state and GPU resources',async({page})=>{
  await ready(page);await frames(page);const initial=await page.evaluate(()=>window.townDebug.getStats());
  const plan=await page.evaluate(()=>window.townDebug.getPlan());
  await page.locator('#home-action').click();
  for(const seed of ['oak','rose','petalwood']){
    await page.evaluate(s=>window.townDebug.loadSeed(s),seed);await frames(page);
    const home=await page.evaluate(()=>window.townDebug.getHome());expect(home.state).toBe('outside');expect(home.open).toBe(false);
    await page.locator('#visit-home').click();await frames(page);
  }
  expect(await page.evaluate(()=>window.townDebug.getPlan())).toEqual(plan);
  expect((await page.evaluate(()=>window.townDebug.getStats())).geometries).toBeLessThanOrEqual(initial.geometries+1);
});
for(const width of [390,320])test(`the house remains usable on a ${width}px mobile viewport`,async({page})=>{
  await mkdir('artifacts',{recursive:true});await page.setViewportSize({width,height:width===390?844:640});await ready(page);await frames(page);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(width);
  for(const selector of ['#inspector','#home-action','#open-home','.toolbar']){
    const box=await page.locator(selector).boundingBox();expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(width);
  }
  const panel=await page.locator('#inspector').boundingBox(),tools=await page.locator('.toolbar').boundingBox();expect(panel.y+panel.height).toBeLessThanOrEqual(tools.y);
  await page.screenshot({path:`artifacts/Town02-mobile-${width}.png`});
  await page.locator('#home-action').click();await page.evaluate(()=>window.townDebug.advanceSimulation(80));expect((await page.evaluate(()=>window.townDebug.getHome())).state).toBe('sitting');
});
