import {chromium} from '@playwright/test';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const out='artifacts-v7';await mkdir(out,{recursive:true});
const servers=[spawn(process.execPath,['tools/serve.mjs'],{cwd:process.env.BASELINE_ROOT,env:{...process.env,PORT:'4174'},stdio:'inherit'}),spawn(process.execPath,['tools/serve.mjs'],{env:{...process.env,PORT:'4173'},stdio:'inherit'})];
let browser;
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function frame(page,count=3){const n=await page.evaluate(()=>townDebug.getStats().frames);await page.waitForFunction(({n,count})=>townDebug.getStats().frames>=n+count,{n,count},{timeout:90000,polling:100});}
function instrument(){
  window.__drawFrames=[];let counter={calls:0,triangles:0};
  for(const name of ['drawElements','drawArrays','drawElementsInstanced','drawArraysInstanced']){
    const original=WebGL2RenderingContext.prototype[name];
    WebGL2RenderingContext.prototype[name]=function(...args){counter.calls++;if(args[0]===4){const count=name.includes('Elements')?args[1]:args[2];const instances=name==='drawElementsInstanced'?args[4]:name==='drawArraysInstanced'?args[3]:1;counter.triangles+=count/3*instances;}return original.apply(this,args);};
  }
  const raf=window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame=fn=>raf(fn.name==='frame'?t=>{counter={calls:0,triangles:0};const start=performance.now();fn(t);window.__drawFrames.push({...counter,cpuSubmitMs:performance.now()-start});if(window.__drawFrames.length>180)window.__drawFrames.shift();}:fn);
}
function summarize(samples){return {samples:samples.length,meanCalls:samples.reduce((n,x)=>n+x.calls,0)/samples.length,meanTriangles:samples.reduce((n,x)=>n+x.triangles,0)/samples.length,minCalls:Math.min(...samples.map(x=>x.calls)),maxCalls:Math.max(...samples.map(x=>x.calls))};}
const results={note:'Identical 1280x800 viewport, DPR 1, seed petalwood and cottage camera. Counters include shadows, scene and compositor. Software Chromium is not a real-device FPS benchmark.',baselineCommit:'01441198963c9ddc9ebdc7ba9fe92a021b7ae56b',cases:[]};
async function capture(port,version,width,height){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:width<700?2:1});await context.addInitScript(instrument);
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto(`http://127.0.0.1:${port}/town/?seed=petalwood&test=1`,{waitUntil:'networkidle',timeout:60000});
  await page.waitForFunction(v=>window.townDebug?.getStats().version===v&&townDebug.getStats().mixedMedia.status==='ready',version,{timeout:90000,polling:100});
  if(version===7)assert.equal((await page.evaluate(()=>townDebug.getHome())).open,true,'V7 must open inside the cottage without a click');
  else await page.evaluate(()=>townDebug.openHome());
  await page.locator('#pause').click();await frame(page,8);
  const paused=await page.evaluate(()=>window.__drawFrames.slice(-6));
  const file=`TownV${version}-${width<700?'phone':'cottage'}.png`;await page.screenshot({path:`${out}/${file}`});
  const stats=await page.evaluate(()=>townDebug.getStats());
  await page.locator('#pause').click();await frame(page,8);
  const moving=await page.evaluate(()=>window.__drawFrames.slice(-6));
  const entry={version,width,height,image:file,stats,paused:summarize(paused),moving:summarize(moving),errors};results.cases.push(entry);
  if(version===7){
    assert.equal(stats.mixedMedia.batches,1);assert.equal(stats.mixedMedia.cards,99);assert.equal(stats.mixedMedia.textureCount,2);
    if(width<700){assert.equal(stats.pixelRatio,1);assert.equal(stats.softRendering,false);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width);}
    const panel=await page.locator('#inspector').boundingBox(),choices=await page.locator('#palette-options').boundingBox();assert.ok(choices.y+choices.height<=panel.y+panel.height+1);
    if(width>=700){
      await page.locator('#home-action').click();await page.evaluate(()=>townDebug.advanceSimulation(100));assert.equal((await page.evaluate(()=>townDebug.getHome())).state,'sitting');
      await page.locator('#home-action').click();await page.evaluate(()=>townDebug.advanceSimulation(100));assert.equal((await page.evaluate(()=>townDebug.getHome())).state,'outside');
      for(const angle of [0,1.5,3,4.5]){await page.evaluate(a=>townDebug.rotateHome(a),angle);await frame(page,1);}
      await page.locator('[data-palette="sage"]').click();await page.evaluate(()=>townDebug.loadSeed('v7-regeneration'));await frame(page,2);assert.equal((await page.evaluate(()=>townDebug.getStats())).palette,'sage');assert.equal((await page.evaluate(()=>townDebug.getHome())).open,true);
      assert.ok((await page.evaluate(()=>townDebug.getStats())).textures<=stats.textures+1);
      await page.locator('#photo').click();await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>document.body.classList.contains('photo-mode')),false);
    }
    assert.deepEqual(errors,[],'No JavaScript or shader errors');
  }
  await context.close();await writeFile(`${out}/comparison.json`,JSON.stringify(results,null,2));return entry;
}
try{
  for(const port of [4173,4174]){for(let i=0;i<40;i++){try{if((await fetch(`http://127.0.0.1:${port}/town/`)).ok)break;}catch{}if(i===39)throw Error('Server did not start');await sleep(250);}}
  browser=await chromium.launch({args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const before=await capture(4174,6,1280,800),after=await capture(4173,7,1280,800);
  assert.ok(after.stats.drawCalls<before.stats.drawCalls,'Geometry merge and atlas must reduce scene draw calls');
  assert.ok(after.stats.triangles<before.stats.triangles,'Added art must stay below the V6 submitted triangle count');
  await capture(4174,6,320,640);await capture(4173,7,320,640);
  results.passed=true;await writeFile(`${out}/comparison.json`,JSON.stringify(results,null,2));
  console.log(JSON.stringify(results,null,2));
}finally{await browser?.close();for(const server of servers)server.kill();}
