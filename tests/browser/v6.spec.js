import {test,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const frame=async page=>{const n=await page.evaluate(()=>townDebug.getStats().frames);await page.waitForFunction(n=>townDebug.getStats().frames>n,n,{timeout:60000});};
async function boot(page,light=false){
 if(light)await page.addInitScript(()=>localStorage.setItem('town.softRendering.v1','0'));
 await page.goto('/town/?seed=petalwood&test=1');
 await page.waitForFunction(()=>window.townDebug?.getStats().version===6,null,{timeout:90000});
 await page.waitForFunction(()=>townDebug.getStats().mixedMedia.status==='ready',null,{timeout:90000});await frame(page);
 await expect(page.locator('#error')).toBeHidden();
}
test('V6 renders generated garden cards with the real compositor',async({page})=>{
 test.setTimeout(240000);await mkdir('artifacts-v6',{recursive:true});await page.setViewportSize({width:1280,height:800});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await boot(page);await expect(page).toHaveTitle('Town V6 · JinJinJenn');
 expect((await page.evaluate(()=>townDebug.getStats())).mixedMedia).toMatchObject({status:'ready',cards:99,batches:3,texturedPetals:true});
 await page.locator('#close-welcome').click();await page.screenshot({path:'artifacts-v6/TownV6-neighborhood.png'});
 await page.locator('#visit-home').click();await page.locator('#pause').click();await frame(page);
 await expect(page.locator('.palette-choice')).toHaveCount(4);await expect(page.locator('[data-palette="roseMint"]')).toHaveAttribute('aria-pressed','true');
 const panel=await page.locator('#inspector').boundingBox(),choices=await page.locator('#palette-options').boundingBox();expect(choices.y+choices.height).toBeLessThanOrEqual(panel.y+panel.height-5);
 await page.screenshot({path:'artifacts-v6/TownV6-cottage.png'});
 await page.locator('#evening').click();await frame(page);await page.screenshot({path:'artifacts-v6/TownV6-evening.png'});
 expect(errors).toEqual([]);await writeFile('artifacts-v6/render.json',JSON.stringify({stats:await page.evaluate(()=>townDebug.getStats()),errors},null,2));
});
test('V6 preserves the sofa round trip, palette saves, following and photo exit',async({page})=>{
 test.setTimeout(240000);await page.setViewportSize({width:960,height:720});const errors=[];page.on('pageerror',e=>errors.push(e.message));await boot(page,true);
 await page.locator('#visit-home').click();await page.locator('#home-action').click();await page.evaluate(()=>townDebug.advanceSimulation(100));expect((await page.evaluate(()=>townDebug.getHome())).state).toBe('sitting');
 await page.locator('#pause').click();const position=await page.evaluate(()=>townDebug.residentPosition(20));await page.evaluate(()=>townDebug.advanceSimulation(20));expect(await page.evaluate(()=>townDebug.residentPosition(20))).toEqual(position);
 await page.locator('#pause').click();await page.locator('#home-action').click();await page.evaluate(()=>townDebug.advanceSimulation(100));expect((await page.evaluate(()=>townDebug.getHome())).state).toBe('outside');
 await page.locator('[data-palette="lavender"]').click();await page.evaluate(()=>townDebug.loadSeed('v6-mint'));expect((await page.evaluate(()=>townDebug.getStats())).palette).toBe('lavender');
 await page.reload();await page.waitForFunction(()=>window.townDebug?.getStats().version===6);expect((await page.evaluate(()=>townDebug.getStats())).palette).toBe('lavender');
 await page.locator('#residents').click();await expect(page.locator('.resident-choice')).toHaveCount(32);await page.locator('#resident-search').fill('Luca');await page.locator('.resident-choice').click();expect((await page.evaluate(()=>townDebug.getStats())).following).toBe(20);
 await page.locator('#photo').click();await expect(page.locator('body')).toHaveClass(/photo-mode/);await page.keyboard.press('Escape');await expect(page.locator('body')).not.toHaveClass(/photo-mode/);expect(errors).toEqual([]);
});
for(const width of [390,320])test(`V6 controls fit a ${width}px phone`,async({page})=>{
 test.setTimeout(180000);await mkdir('artifacts-v6',{recursive:true});await page.setViewportSize({width,height:width===390?844:640});await boot(page,true);await page.locator('#visit-home').click();await frame(page);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(width);
 const a=await page.locator('#inspector').boundingBox(),b=await page.locator('.toolbar').boundingBox(),c=await page.locator('#palette-options').boundingBox();expect(a.y+a.height).toBeLessThanOrEqual(b.y);expect(c.y+c.height).toBeLessThanOrEqual(a.y+a.height-4);
 for(const selector of ['#home-action','#open-home','[data-palette="roseMint"]']){const box=await page.locator(selector).boundingBox();expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(width);}
 await page.locator('[data-palette="sage"]').click();await page.locator('[data-palette="roseMint"]').click();expect((await page.evaluate(()=>townDebug.getStats())).palette).toBe('roseMint');await page.screenshot({path:`artifacts-v6/TownV6-mobile-${width}.png`});
});
test('V6 media toggle, rotated views, resource reuse and gallery work',async({page})=>{
 test.setTimeout(240000);await boot(page,true);await page.locator('#visit-home').click();const before=await page.evaluate(()=>townDebug.getStats());
 await page.locator('#help').click();await page.locator('#mixed-media').uncheck();expect((await page.evaluate(()=>townDebug.getStats())).mixedMedia.enabled).toBe(false);
 await page.locator('#mixed-media').check();await page.locator('#help-dialog .close').click();
 for(const angle of [0,1.5,3,4.5]){await page.evaluate(a=>townDebug.rotateHome(a),angle);await frame(page);}
 for(const seed of ['garden-a','garden-b','garden-c']){await page.evaluate(s=>townDebug.loadSeed(s),seed);await frame(page);}
 const after=await page.evaluate(()=>townDebug.getStats());expect(after.mixedMedia.cards).toBe(99);expect(after.textures).toBeLessThanOrEqual(before.textures+1);
 await page.goto('/town/assets/v6/');await expect(page.locator('figure')).toHaveCount(5);
 expect(await page.locator('img').evaluateAll(images=>images.every(i=>i.complete&&i.naturalWidth>0))).toBe(true);
});
test('V6 keeps 3D playable when illustrated textures cannot load',async({page})=>{
 test.setTimeout(180000);await page.route('**/assets/v6/*.webp',route=>route.abort());await page.addInitScript(()=>localStorage.setItem('town.softRendering.v1','0'));
 await page.goto('/town/?test=1');await page.waitForFunction(()=>window.townDebug?.getStats().mixedMedia.status==='unavailable',null,{timeout:90000});
 await expect(page.locator('#error')).toBeHidden();await page.locator('#visit-home').click();expect((await page.evaluate(()=>townDebug.getHome())).open).toBe(true);
});
