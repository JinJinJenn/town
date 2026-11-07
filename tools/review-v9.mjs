import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile,copyFile} from 'node:fs/promises';
import {spawn,execSync} from 'node:child_process';
import {setTimeout as sleep} from 'node:timers/promises';
const live=!!process.env.SITE_URL,base=process.env.SITE_URL||'http://127.0.0.1:4173/town/',out=live?'artifacts':'artifacts-v9';
await mkdir(out,{recursive:true});
const server=live?null:spawn(process.execPath,['tools/serve.mjs'],{stdio:'inherit'});
const report={commit:execSync('git rev-parse HEAD').toString().trim(),note:'Actual WebGL screenshots and functional checks in software Chromium, not physical-device FPS.',live,cases:[]};
let browser;
try{
 for(let i=0;i<40;i++){try{if((await fetch(base)).ok)break;}catch{}if(i===39)throw new Error('Server did not start');await sleep(250);}
 browser=await chromium.launch({args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 async function open(width=1280,height=800,blockArt=false){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:width<700?2:1}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',e=>{if(e.text().includes('THREE.WebGLProgram')&&e.type()==='error')errors.push(e.text());});
  if(blockArt)await page.route('**/assets/v6/*.webp',r=>r.abort());
  await page.goto(base+(live?'':'?test=1'),{waitUntil:'networkidle',timeout:60000});
  await page.waitForFunction(()=>window.townDebug?.getStats().frames>4,null,{timeout:90000});
  await page.waitForFunction(()=>window.townDebug.getStats().mixedMedia.status!=='loading',null,{timeout:30000});
  assert.equal(await page.locator('#error').isVisible(),false);
  assert.equal(await page.locator('button,input,dialog,header').count(),0,'No DOM game controls remain.');
  const text=await page.evaluate(()=>{const out=[],w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);while(w.nextNode()){const p=w.currentNode.parentElement;if(!p||['SCRIPT','STYLE','NOSCRIPT'].includes(p.tagName))continue;if(w.currentNode.textContent.trim()&&p.getClientRects().length&&getComputedStyle(p).display!=='none')out.push(w.currentNode.textContent);}return out;});assert.deepEqual(text,[],'Visible game text must be GPU-rendered.');
  assert.equal((await page.evaluate(()=>townDebug.getStats())).version,9);
  return {page,errors};
 }
 async function click(page,id){
  await page.waitForFunction(id=>townDebug.hud().controls.some(b=>b.id===id),id,{timeout:30000});
  const b=await page.evaluate(id=>townDebug.hud().controls.find(b=>b.id===id),id);assert.ok(b,`Missing GPU control ${id}`);
  await page.mouse.click(b.x+b.w/2,b.y+b.h/2);
  const frame=await page.evaluate(()=>townDebug.getStats().frames);
  await page.waitForFunction(f=>townDebug.getStats().frames>f,frame,{timeout:30000});
 }
 const {page,errors}=await open();
 const initial=await page.evaluate(()=>townDebug.getStats());assert.equal(initial.residents,32);assert.equal(initial.lots,16);assert.equal(initial.hudDrawCalls,1);assert.equal(initial.gpuHUD.glyphAtlasUploads,1);assert.ok(initial.live.inside>=6);assert.equal((await page.evaluate(()=>townDebug.getHome())).open,true);
 report.cases.push({name:'desktop',initial,errors});
 await page.screenshot({path:`${out}/TownV9-live.png`});
 await click(page,'pause');await page.waitForFunction(()=>townDebug.getStats().paused);
 const paused=await page.evaluate(()=>townDebug.residents().map(r=>r.position));await page.waitForTimeout(350);assert.deepEqual(await page.evaluate(()=>townDebug.residents().map(r=>r.position)),paused);
 await click(page,'2');await page.waitForFunction(()=>townDebug.getStats().speed===2);
 await click(page,'sit');await page.waitForFunction(()=>townDebug.getHome().state!=='sitting');
 await click(page,'gather');await page.waitForFunction(()=>townDebug.getStats().live.gathering);
 const before=await page.evaluate(()=>townDebug.residents().map(r=>r.position));const f=await page.evaluate(()=>townDebug.getStats().frames);await page.waitForFunction(f=>townDebug.getStats().frames>f+5,f);assert.notDeepEqual(await page.evaluate(()=>townDebug.residents().map(r=>r.position)),before);
 await click(page,'menu');await page.waitForFunction(()=>townDebug.hud().menu==='options');await click(page,'palette');assert.notEqual((await page.evaluate(()=>townDebug.getStats())).palette,initial.palette);await click(page,'close');
 await click(page,'roster');await page.waitForFunction(()=>townDebug.hud().menu==='residents');await click(page,'resident:2');await click(page,'follow');await page.waitForFunction(()=>townDebug.getStats().following===2);
 await page.keyboard.press('h');await page.waitForFunction(()=>townDebug.getStats().following===null);await page.keyboard.press('1');
 assert.deepEqual(errors,[]);report.cases[0].final=await page.evaluate(()=>townDebug.getStats());report.cases[0].passed=true;
 await page.close();
 if(!live){
  for(const width of[390,320,820]){
   const {page,errors}=await open(width,640);const stats=await page.evaluate(()=>townDebug.getStats());for(const b of stats.gpuHUD.controls){assert.ok(b.x>=0&&b.y>=0&&b.x+b.w<=width+1&&b.y+b.h<=641,`Control out of bounds ${b.id}`);}
   await click(page,'pause');await page.waitForFunction(()=>townDebug.getStats().paused);await page.screenshot({path:`${out}/TownV9-${width}.png`});await click(page,'3');await page.waitForFunction(()=>townDebug.getStats().speed===3);
   await page.keyboard.press('g');await page.waitForFunction(()=>townDebug.getStats().live.gathering);assert.deepEqual(errors,[]);report.cases.push({name:`width-${width}`,stats,errors});await page.close();
  }
  const {page,errors}=await open(800,650,true);assert.equal((await page.evaluate(()=>townDebug.getStats())).residents,32);assert.deepEqual(errors,[]);report.cases.push({name:'missing-art-fallback',passed:true});await page.close();
  try{await copyFile('docs/v8-captures/TownV8-cottage.png',`${out}/TownV8-before.png`);}catch{}
 }
 report.passed=true;
}finally{
 await writeFile(`${out}/review.json`,JSON.stringify(report,null,2));await browser?.close();server?.kill();
}
console.log('V9 WebGL HUD, live-mode input, resident movement and captures passed.');
