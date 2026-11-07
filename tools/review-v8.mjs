import {chromium} from '@playwright/test';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const out='artifacts-v8';await mkdir(out,{recursive:true});
const servers=[spawn(process.execPath,['tools/serve.mjs'],{cwd:process.env.BASELINE_ROOT,env:{...process.env,PORT:'4174'},stdio:'inherit'}),spawn(process.execPath,['tools/serve.mjs'],{env:{...process.env,PORT:'4173'},stdio:'inherit'})];
const delay=ms=>new Promise(r=>setTimeout(r,ms));
let browser;const results={baselineCommit:'62d900bb3ec21c0487ed74f9bf98feb10c4b078e',testedCommit:process.env.TESTED_COMMIT??null,note:'Matched desktop seed, cottage camera, 1280x800 viewport, DPR 1, soft rendering on. Software Chromium counters are not hardware FPS benchmarks.',cases:[]};
async function frame(page){const n=await page.evaluate(()=>townDebug.getStats().frames);await page.waitForFunction(n=>townDebug.getStats().frames>=n+2,n,{timeout:60000});}
async function boot(port,version,width=1280,height=800){
 const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1});const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto(`http://127.0.0.1:${port}/town/?seed=petalwood&test=1`,{waitUntil:'load'});
 await page.waitForFunction(v=>window.townDebug?.getStats().version===v&&townDebug.getStats().frames>4,version,{timeout:90000});
 await page.waitForFunction(()=>townDebug.getStats().mixedMedia.status==='ready',null,{timeout:90000});
 assert.equal(await page.locator('#error').isVisible(),false);assert.equal((await page.evaluate(()=>townDebug.getHome())).open,true);
 return {page,context,errors};
}
try{
 for(const port of [4173,4174])for(let i=0;i<40;i++){try{if((await fetch(`http://127.0.0.1:${port}/town/`)).ok)break;}catch{}if(i===39)throw Error('Server did not start');await delay(250);}
 browser=await chromium.launch({args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 let before,after;
 for(const [port,version] of [[4174,7],[4173,8]]){
  const {page,context,errors}=await boot(port,version);await page.locator('#pause').click();await frame(page);
  const stats=await page.evaluate(()=>townDebug.getStats());results.cases.push({version,stats,errors});
  await page.screenshot({path:`${out}/TownV${version}-cottage.png`});
  if(version===7){before=stats;await context.close();continue;}
  after=stats;assert.equal(stats.v8Props.total,113);assert.equal(stats.v8Props.typeCount,36);assert.equal(stats.mixedMedia.batches,1);assert.equal(stats.shadowRefreshHz,10);
  assert.ok(stats.drawCalls<=before.drawCalls+8,'Do not add one draw call per prop');assert.ok(stats.triangles<before.triangles*1.15,'Simple prop geometry budget');
  await page.locator('#reset').click();await frame(page);await page.screenshot({path:`${out}/TownV8-neighborhood.png`});await page.locator('#visit-home').click();await page.locator('#pause').click();
  await page.locator('#home-action').click();await page.evaluate(()=>townDebug.advanceSimulation(100));assert.equal((await page.evaluate(()=>townDebug.getHome())).state,'sitting');
  await page.locator('#pause').click();const time=await page.evaluate(()=>townDebug.getStats().v7Atmosphere.time);await page.evaluate(()=>townDebug.advanceSimulation(10));await frame(page);assert.equal(await page.evaluate(()=>townDebug.getStats().v7Atmosphere.time),time);
  await page.locator('#pause').click();await page.locator('#home-action').click();await page.evaluate(()=>townDebug.advanceSimulation(100));assert.equal((await page.evaluate(()=>townDebug.getHome())).state,'outside');
  for(const angle of [0,1.5,3,4.5]){await page.evaluate(a=>townDebug.rotateHome(a),angle);await frame(page);}
  await page.locator('[data-palette="sage"]').click();for(const seed of ['v8-rose','v8-berry']){await page.evaluate(s=>townDebug.loadSeed(s),seed);await frame(page);}
  const regen=await page.evaluate(()=>townDebug.getStats());assert.equal(regen.palette,'sage');assert.equal((await page.evaluate(()=>townDebug.getHome())).open,true);assert.ok(regen.geometries<=stats.geometries+2);assert.ok(regen.textures<=stats.textures+1);
  await page.locator('#photo').click();await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>document.body.classList.contains('photo-mode')),false);
  await page.locator('#residents').click();await page.locator('#resident-search').fill('Luca');await page.locator('.resident-choice').click();assert.equal((await page.evaluate(()=>townDebug.getStats())).following,20);
  assert.deepEqual(errors,[]);await context.close();
 }
 for(const width of [390,320]){
  const {page,context,errors}=await boot(4173,8,width,width===390?844:640);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width);
  const panel=await page.locator('#inspector').boundingBox(),toolbar=await page.locator('.toolbar').boundingBox(),palette=await page.locator('#palette-options').boundingBox();assert.ok(panel.y+panel.height<=toolbar.y);assert.ok(palette.y+palette.height<=panel.y+panel.height);
  const stats=await page.evaluate(()=>townDebug.getStats());assert.equal(stats.pixelRatio,1);assert.equal(stats.softRendering,false);await page.locator('[data-palette="lavender"]').click();await page.locator('[data-palette="roseMint"]').click();await page.locator('#pause').click();await frame(page);await page.screenshot({path:`${out}/TownV8-mobile-${width}.png`});
  results.cases.push({version:8,width,stats,errors});assert.deepEqual(errors,[]);await context.close();
 }
 results.passed=true;results.sceneCallDelta=after.drawCalls-before.drawCalls;results.sceneTriangleDelta=after.triangles-before.triangles;
 console.log(JSON.stringify(results,null,2));
}finally{
 await writeFile(`${out}/comparison.json`,JSON.stringify(results,null,2));await browser?.close();for(const s of servers)s.kill();
}
