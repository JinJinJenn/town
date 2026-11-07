import {test,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const frame=async page=>{const n=await page.evaluate(()=>townDebug.getStats().frames);await page.waitForFunction(n=>townDebug.getStats().frames>n,n,{timeout:60000});};
async function boot(page,light=false,extra=''){
 if(light)await page.addInitScript(()=>localStorage.setItem('town.softRendering.v1','0'));
 await page.goto(`/town/?seed=petalwood&test=1${extra}`);
 await page.waitForFunction(()=>window.townDebug?.getStats().version===7,null,{timeout:90000});await frame(page);
 await expect(page.locator('#error')).toBeHidden();
}
test('V7 arrives inside the detailed central cottage before interaction',async({page})=>{
 test.setTimeout(240000);await mkdir('artifacts-v7',{recursive:true});await page.setViewportSize({width:1280,height:800});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await boot(page);await page.waitForFunction(()=>townDebug.getStats().mixedMedia.status==='ready');
 await expect(page).toHaveTitle('Town V7 · JinJinJenn');await expect(page.locator('#welcome')).toBeHidden();await expect(page.locator('#inspector')).toBeVisible();
 expect((await page.evaluate(()=>townDebug.getHome())).open).toBe(true);
 expect((await page.evaluate(()=>townDebug.getStats())).touring).toBe(false);
 const initial=await page.evaluate(()=>townDebug.getStats());expect(initial.shadowRefreshHz).toBe(10);expect(initial.mixedMedia.batches).toBe(1);expect(initial.v7DetailInstances).toBeGreaterThan(200);
 await page.locator('#pause').click();await frame(page);await page.screenshot({path:'artifacts-v7/TownV7-cottage.png'});
 await page.locator('#evening').click();await frame(page);await page.screenshot({path:'artifacts-v7/TownV7-evening.png'});
 await page.locator('#reset').click();await frame(page);expect((await page.evaluate(()=>townDebug.getHome())).open).toBe(false);await page.screenshot({path:'artifacts-v7/TownV7-neighborhood.png'});
 expect(errors).toEqual([]);await writeFile('artifacts-v7/render.json',JSON.stringify({stats:await page.evaluate(()=>townDebug.getStats()),errors},null,2));
});
test('V7 preserves sofa, palettes and pause and returns to the home after regeneration',async({page})=>{
 test.setTimeout(240000);await page.setViewportSize({width:960,height:720});await boot(page,true);
 await page.locator('#home-action').click();await page.evaluate(()=>townDebug.advanceSimulation(100));expect((await page.evaluate(()=>townDebug.getHome())).state).toBe('sitting');
 await page.locator('#pause').click();const time=await page.evaluate(()=>townDebug.getStats().v7Atmosphere.time);await page.evaluate(()=>townDebug.advanceSimulation(10));await frame(page);expect(await page.evaluate(()=>townDebug.getStats().v7Atmosphere.time)).toBe(time);
 await page.locator('#pause').click();await page.locator('#home-action').click();await page.evaluate(()=>townDebug.advanceSimulation(100));expect((await page.evaluate(()=>townDebug.getHome())).state).toBe('outside');
 await page.locator('[data-palette="lavender"]').click();await page.evaluate(()=>townDebug.loadSeed('v7-second-home'));await frame(page);expect((await page.evaluate(()=>townDebug.getHome())).open).toBe(true);expect((await page.evaluate(()=>townDebug.getStats())).palette).toBe('lavender');
 await page.reload();await page.waitForFunction(()=>window.townDebug?.getStats().version===7);expect((await page.evaluate(()=>townDebug.getHome())).open).toBe(true);expect((await page.evaluate(()=>townDebug.getStats())).palette).toBe('lavender');
 await page.locator('#residents').click();await page.locator('#resident-search').fill('Luca');await page.locator('.resident-choice').click();expect((await page.evaluate(()=>townDebug.getStats())).following).toBe(20);
 await page.locator('#photo').click();await page.keyboard.press('Escape');await expect(page.locator('body')).not.toHaveClass(/photo-mode/);
});
for(const width of [390,320])test(`V7 starts inside on a ${width}px phone without covering the controls`,async({page})=>{
 test.setTimeout(180000);await mkdir('artifacts-v7',{recursive:true});await page.setViewportSize({width,height:width===390?844:640});await boot(page,true);
 expect((await page.evaluate(()=>townDebug.getHome())).open).toBe(true);expect((await page.evaluate(()=>townDebug.getStats())).pixelRatio).toBe(1);expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(width);
 const panel=await page.locator('#inspector').boundingBox(),toolbar=await page.locator('.toolbar').boundingBox(),palette=await page.locator('#palette-options').boundingBox();
 expect(panel.y+panel.height).toBeLessThanOrEqual(toolbar.y);expect(palette.y+palette.height).toBeLessThanOrEqual(panel.y+panel.height-4);
 await page.locator('[data-palette="sage"]').click();await page.locator('[data-palette="roseMint"]').click();await page.screenshot({path:`artifacts-v7/TownV7-mobile-${width}.png`});
});
test('V7 rotation, reduced motion, regeneration and missing-art fallback remain safe',async({page})=>{
 test.setTimeout(240000);await page.emulateMedia({reducedMotion:'reduce'});await boot(page,true);expect((await page.evaluate(()=>townDebug.getStats())).v7Atmosphere.enabled).toBe(false);
 await page.waitForFunction(()=>townDebug.getStats().mixedMedia.status==='ready');const before=await page.evaluate(()=>townDebug.getStats());
 for(const a of [0,1.5,3,4.5]){await page.evaluate(a=>townDebug.rotateHome(a),a);await frame(page);}
 for(const seed of ['detail-a','detail-b','detail-c']){await page.evaluate(s=>townDebug.loadSeed(s),seed);await frame(page);}
 const after=await page.evaluate(()=>townDebug.getStats());expect(after.geometries).toBeLessThanOrEqual(before.geometries+2);expect(after.textures).toBeLessThanOrEqual(before.textures+1);
 await page.route('**/assets/v6/*.webp',r=>r.abort());await page.reload();await page.waitForFunction(()=>window.townDebug?.getStats().mixedMedia.status==='unavailable');await expect(page.locator('#error')).toBeHidden();expect((await page.evaluate(()=>townDebug.getHome())).open).toBe(true);
});
