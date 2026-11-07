import {test,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
async function ready(page) {
  await page.goto('/town/?seed=petalwood&test=1');
  await page.waitForFunction(()=>window.townDebug?.getStats().frames>2,null,{timeout:90000});
  await expect(page.locator('#error')).toBeHidden();
}
test('pink interface, resident browsing, photo export and saved settings work',async({page})=>{
  test.setTimeout(300000);await mkdir('artifacts',{recursive:true});
  await page.setViewportSize({width:1280,height:800});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await ready(page);expect((await page.evaluate(()=>townDebug.getStats())).version).toBe(4);
  await page.screenshot({path:'artifacts/Town04-welcome.png'});
  await page.locator('#residents').click();await expect(page.locator('.resident-entry')).toHaveCount(32);
  await page.locator('#resident-search').fill('Luca');await expect(page.locator('.resident-entry')).toHaveCount(1);
  await page.locator('.resident-entry').click();await expect(page.locator('#selection-name')).toHaveText('Luca');
  await page.locator('#follow').click();expect((await page.evaluate(()=>townDebug.getStats())).following).toBe(20);
  await page.locator('#visit-home').click();await page.locator('#home-action').click();
  await page.evaluate(()=>townDebug.advanceSimulation(80));await expect(page.locator('#home-status')).toContainText('relaxing');
  await page.locator('#pause').click();await page.screenshot({path:'artifacts/Town04-cottage.png'});
  await page.locator('#photo').click();await expect(page.locator('.topbar')).toBeHidden();
  const downloadPromise=page.waitForEvent('download');await page.locator('#photo-save').click();const download=await downloadPromise;
  await download.saveAs('artifacts/Town04-photo.png');expect(download.suggestedFilename()).toContain('petalwood');
  const bytes=await (await import('node:fs/promises')).readFile('artifacts/Town04-photo.png');expect(bytes.length).toBeGreaterThan(20000);
  await page.keyboard.press('Escape');await expect(page.locator('.topbar')).toBeVisible();
  await page.locator('#help').click();await page.locator('#quality').selectOption('light');await page.locator('#petals').uncheck();
  await page.locator('[aria-label="Close help"]').click();
  expect((await page.evaluate(()=>townDebug.getStats())).pixelRatio).toBe(.75);
  await page.reload();await page.waitForFunction(()=>window.townDebug?.getStats().frames>2);
  expect((await page.evaluate(()=>townDebug.getStats())).quality).toBe('light');expect((await page.evaluate(()=>townDebug.getStats())).petals).toBe(false);
  await page.locator('#about').click();await expect(page.locator('#about-title')).toHaveText("Hi, I'm Jenn.");await page.keyboard.press('Escape');
  expect(errors).toEqual([]);await writeFile('artifacts/v4-ui-validation.json',JSON.stringify({passed:true,errors,stats:await page.evaluate(()=>townDebug.getStats())},null,2));
});
for(const width of [390,320])test(`v4 pink navigation and dialogs fit ${width}px`,async({page})=>{
  await mkdir('artifacts',{recursive:true});await page.setViewportSize({width,height:width===390?844:640});await ready(page);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(width);
  for(const id of ['residents','photo','help','visit-home']){const r=await page.locator('#'+id).boundingBox();expect(r.x).toBeGreaterThanOrEqual(0);expect(r.x+r.width).toBeLessThanOrEqual(width);}
  await page.locator('#visit-home').click();await page.screenshot({path:`artifacts/Town04-mobile-${width}.png`});
  const panel=await page.locator('#inspector').boundingBox(),toolbar=await page.locator('.toolbar').boundingBox();expect(panel.y+panel.height).toBeLessThanOrEqual(toolbar.y);
  await page.locator('#residents').click();await page.locator('#resident-search').fill('zzzz');await expect(page.locator('.resident-entry')).toHaveCount(0);
  await page.locator('[aria-label="Close residents"]').click();await page.locator('#photo').click();await page.locator('#photo-exit').click();
});
