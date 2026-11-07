import {test,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const frame=async(page)=>{const n=await page.evaluate(()=>townDebug.getStats().frames);await page.waitForFunction(n=>townDebug.getStats().frames>n,n,{timeout:60000});};
async function boot(page,light=false){
  if(light)await page.addInitScript(()=>localStorage.setItem('town.softRendering.v1','0'));
  await page.goto('/town/?seed=petalwood&test=1');
  await page.waitForFunction(()=>window.townDebug?.getStats().version===4,null,{timeout:90000});
  await expect(page.locator('#error')).toBeHidden();await frame(page);
}
test('V4 pink UI and dressed cottage render through the production compositor',async({page})=>{
  test.setTimeout(300000);await mkdir('artifacts-v4',{recursive:true});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.setViewportSize({width:1280,height:800});await boot(page);
  await expect(page).toHaveTitle('Town V4 · JinJinJenn');
  expect(await page.locator('.topbar').evaluate(el=>getComputedStyle(el).backgroundImage)).toContain('gradient');
  await page.screenshot({path:'artifacts-v4/TownV4-welcome.png'});
  await page.locator('#visit-home').click();await frame(page);await page.locator('#pause').click();
  await page.screenshot({path:'artifacts-v4/TownV4-cottage.png'});
  await page.locator('#evening').click();await frame(page);await page.screenshot({path:'artifacts-v4/TownV4-evening.png'});
  expect((await page.evaluate(()=>townDebug.getStats())).petalInstances).toBe(96);expect(errors).toEqual([]);
  await writeFile('artifacts-v4/render.json',JSON.stringify({stats:await page.evaluate(()=>townDebug.getStats()),errors},null,2));
});
test('V4 palettes persist, neighbors can be followed, photo mode exits, and sofa roundtrip works',async({page})=>{
  test.setTimeout(300000);await page.setViewportSize({width:960,height:640});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));await boot(page,true);
  await page.locator('#visit-home').click();await frame(page);
  await page.locator('[data-palette="sage"]').click();expect((await page.evaluate(()=>townDebug.getStats())).palette).toBe('sage');
  await page.locator('#home-action').click();await page.evaluate(()=>townDebug.advanceSimulation(80));
  expect((await page.evaluate(()=>townDebug.getHome())).state).toBe('sitting');
  await page.locator('#pause').click();const position=await page.evaluate(()=>townDebug.residentPosition(20));
  await page.evaluate(()=>townDebug.advanceSimulation(10));expect(await page.evaluate(()=>townDebug.residentPosition(20))).toEqual(position);await page.locator('#pause').click();
  await page.locator('#home-action').click();await page.evaluate(()=>townDebug.advanceSimulation(80));expect((await page.evaluate(()=>townDebug.getHome())).state).toBe('outside');
  await page.locator('#residents').click();await expect(page.locator('.resident-choice')).toHaveCount(32);
  await page.locator('#resident-search').fill('Luca');await expect(page.locator('.resident-choice')).toHaveCount(1);await page.locator('.resident-choice').click();
  expect((await page.evaluate(()=>townDebug.getStats())).following).toBe(20);
  await page.locator('#photo').click();expect((await page.evaluate(()=>townDebug.getStats())).photoMode).toBe(true);
  await page.keyboard.press('Escape');expect((await page.evaluate(()=>townDebug.getStats())).photoMode).toBe(false);
  await page.evaluate(()=>townDebug.loadSeed('rose'));expect((await page.evaluate(()=>townDebug.getStats())).palette).toBe('sage');
  await page.reload();await page.waitForFunction(()=>window.townDebug?.getStats().version===4);expect((await page.evaluate(()=>townDebug.getStats())).palette).toBe('sage');
  await page.locator('#visit-home').click();await page.locator('[data-palette="blossom"]').click();expect(errors).toEqual([]);
});
for(const width of [390,320])test(`V4 controls fit a ${width}px phone without covering one another`,async({page})=>{
  test.setTimeout(180000);await mkdir('artifacts-v4',{recursive:true});await page.setViewportSize({width,height:width===390?844:640});await boot(page,true);
  await page.locator('#visit-home').click();await frame(page);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(width);
  for(const sel of ['#inspector','.toolbar','#home-action','#open-home','#palette-options']){
    const b=await page.locator(sel).boundingBox();expect(b.x).toBeGreaterThanOrEqual(0);expect(b.x+b.width).toBeLessThanOrEqual(width+.5);
  }
  const a=await page.locator('#inspector').boundingBox(),b=await page.locator('.toolbar').boundingBox();expect(a.y+a.height).toBeLessThanOrEqual(b.y);
  await page.locator('[data-palette="lavender"]').click();expect((await page.evaluate(()=>townDebug.getStats())).palette).toBe('lavender');
  await page.screenshot({path:`artifacts-v4/TownV4-mobile-${width}.png`});
});
