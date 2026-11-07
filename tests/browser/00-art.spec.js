import {test,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const frames=async(page,n=2)=>{
  const f=await page.evaluate(()=>townDebug.getStats().frames);
  await page.waitForFunction(({f,n})=>townDebug.getStats().frames>=f+n,{f,n},{timeout:45000});
};
test('the concept-art renderer works in both quality modes without changing the town',async({page})=>{
  test.setTimeout(240000);await mkdir('artifacts',{recursive:true});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto('/town/?seed=petalwood&test=1');
  await page.waitForFunction(()=>window.townDebug?.getStats().frames>2,null,{timeout:90000});
  await page.locator('#explore').click();await page.locator('#pause').click();await frames(page);
  const initial=await page.evaluate(()=>townDebug.getStats());
  expect(['03-pastel-gardens','05-rose-mint']).toContain(initial.artVersion);expect(initial.softRendering).toBe(true);
  expect(initial.compositeCalls).toBe(1);expect(initial.triangles).toBeGreaterThan(10000);
  await page.screenshot({path:'artifacts/Town03-neighborhood.png'});
  const clean=await page.addStyleTag({content:'#world > :not(canvas){visibility:hidden!important}'});
  await page.locator('#scene').screenshot({path:'artifacts/Town03-world.png'});await clean.evaluate(e=>e.remove());
  const plan=await page.evaluate(()=>townDebug.getPlan());
  await page.locator('#help').click();await page.locator('#soft-rendering').uncheck();
  await page.locator('[aria-label="Close help"]').click();await frames(page);
  expect((await page.evaluate(()=>townDebug.getStats())).softRendering).toBe(false);
  await page.screenshot({path:'artifacts/Town03-simple-rendering.png'});
  expect(await page.evaluate(()=>townDebug.getPlan())).toEqual(plan);
  await page.locator('#help').click();await page.locator('#soft-rendering').check();
  await page.locator('[aria-label="Close help"]').click();await frames(page);
  await page.locator('#visit-home').click();await frames(page);
  expect((await page.evaluate(()=>townDebug.getHome())).open).toBe(true);
  await page.screenshot({path:'artifacts/Town03-cottage.png'});
  const final=await page.evaluate(()=>townDebug.getStats());expect(errors).toEqual([]);
  await writeFile('artifacts/art-validation.json',JSON.stringify({initial,final,errors,notes:'Real WebGL via software Chromium. Screenshots need visual review; not a hardware FPS benchmark.'},null,2));
});

test('devices without floating-point color targets retain the ordinary renderer',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
    const original=WebGL2RenderingContext.prototype.getExtension;
    WebGL2RenderingContext.prototype.getExtension=function(name){
      if(name==='EXT_color_buffer_float')return null;
      return original.call(this,name);
    };
  });
  await page.goto('/town/?seed=petalwood');
  await page.waitForFunction(()=>window.townDebug?.getStats().frames>2,null,{timeout:90000});
  const stats=await page.evaluate(()=>townDebug.getStats());
  expect(stats.softRendering).toBe(false);expect(stats.compositeCalls).toBe(0);
  expect(stats.triangles).toBeGreaterThan(10000);expect(stats.residents).toBe(32);
  await page.locator('#help').click();await expect(page.locator('#soft-rendering')).toBeDisabled();
  expect(errors).toEqual([]);
});
