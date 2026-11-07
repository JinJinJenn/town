import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile,copyFile} from 'node:fs/promises';
import {spawn,execSync} from 'node:child_process';
import {setTimeout as sleep} from 'node:timers/promises';
const live=!!process.env.SITE_URL,base=process.env.SITE_URL||'http://127.0.0.1:4173/town/',out=live?'artifacts':'artifacts-v10';
await mkdir(out,{recursive:true});const server=live?null:spawn(process.execPath,['tools/serve.mjs'],{stdio:'inherit'});
const report={commit:execSync('git rev-parse HEAD').toString().trim(),note:'Actual WebGL captures. Software Chromium counters are not a physical-device FPS benchmark. V9 before image uses its previous arrival framing.',live,cases:[]};let browser;
try{
 for(let i=0;i<40;i++){try{if((await fetch(base)).ok)break;}catch{}if(i===39)throw new Error('Server did not start');await sleep(250);}
 browser=await chromium.launch({args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 async function open(width=1280,height=800,blockArt=false){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:width<700?2:1}),errors=[];page.setDefaultTimeout(60000);
  page.on('pageerror',e=>errors.push(e.message));page.on('console',e=>{if(e.text().includes('THREE.WebGLProgram')&&e.type()==='error')errors.push(e.text());});
  if(blockArt)await page.route('**/assets/v6/*.webp',r=>r.abort());
  await page.goto(base+(live?'':'?test=1'),{waitUntil:'networkidle',timeout:60000});
  await page.waitForFunction(()=>window.townDebug?.getStats().frames>4,null,{timeout:90000});
  await page.waitForFunction(()=>window.townDebug.getStats().mixedMedia.status!=='loading');
  assert.equal(await page.locator('#error').isVisible(),false);assert.equal(await page.locator('button,input,dialog,header').count(),0);
  const text=await page.evaluate(()=>{const out=[],w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);while(w.nextNode()){const p=w.currentNode.parentElement;if(!p||['SCRIPT','STYLE','NOSCRIPT'].includes(p.tagName))continue;if(w.currentNode.textContent.trim()&&p.getClientRects().length&&getComputedStyle(p).display!=='none')out.push(w.currentNode.textContent);}return out;});assert.deepEqual(text,[],'No visible HTML game text');
  assert.equal((await page.evaluate(()=>townDebug.getStats())).version,10);return {page,errors};
 }
 async function nextFrame(page){const f=await page.evaluate(()=>townDebug.getStats().frames);await page.waitForFunction(f=>townDebug.getStats().frames>f,f);}
 async function click(page,id){await page.waitForFunction(id=>townDebug.hud().controls.some(b=>b.id===id),id);const b=await page.evaluate(id=>townDebug.hud().controls.find(b=>b.id===id),id);await page.mouse.click(b.x+b.w/2,b.y+b.h/2);await nextFrame(page);}
 async function capture(page,name){await page.screenshot({path:`${out}/${name}.png`,timeout:90000});}
 const {page,errors}=await open();const initial=await page.evaluate(()=>townDebug.getStats());assert.equal(initial.residents,32);assert.equal(initial.gpuHUD.drawCalls,1);assert.equal(initial.gpuHUD.portraitCount,32);assert.equal(initial.live.drinking,2);assert.equal(initial.live.watching,1);assert.ok(initial.live.pairs>=2);
 const desktop={name:'desktop',initial,errors};report.cases.push(desktop);
 await click(page,'pause');await capture(page,'TownV10-household');
 const pos=await page.evaluate(()=>townDebug.residents().map(r=>r.position));await page.waitForTimeout(300);assert.deepEqual(await page.evaluate(()=>townDebug.residents().map(r=>r.position)),pos);
 // Real projected furniture clicks, not bypassing the hit-test logic.
 const table=await page.evaluate(()=>townDebug.objectScreen('drink'));await page.mouse.click(table.x,table.y);await click(page,'drink');
 assert.ok((await page.evaluate(()=>townDebug.hud().controls)).every(c=>c.id!=='drink'),'Object menu closes after choosing an action');
 await click(page,'1');
 if(!live){let drank=false;for(let i=0;i<30;i++){await page.evaluate(()=>townDebug.advanceSimulation(5));if(await page.evaluate(()=>townDebug.residents()[20].state==='having a drink')){drank=true;break;}}assert.ok(drank,'Selected Luca reaches a free dining chair');await click(page,'pause');await capture(page,'TownV10-drinking');await click(page,'1');}
 await page.keyboard.press('t');
 await click(page,'menu');await click(page,'palette');assert.notEqual((await page.evaluate(()=>townDebug.getStats())).palette,initial.palette);await click(page,'close');
 await click(page,'roster');await capture(page,'TownV10-portraits');await click(page,'resident:2');await click(page,'follow');assert.equal((await page.evaluate(()=>townDebug.getStats())).following,2);await page.keyboard.press('h');
 await click(page,'gather');assert.equal((await page.evaluate(()=>townDebug.getStats())).live.gathering,true);
 assert.deepEqual(errors,[]);desktop.final=await page.evaluate(()=>townDebug.getStats());desktop.passed=true;await page.close();
 if(!live){
  for(const width of[390,320,820]){const {page,errors}=await open(width,640);await click(page,'pause');let stats=await page.evaluate(()=>townDebug.getStats());for(const b of stats.gpuHUD.controls)assert.ok(b.x>=0&&b.y>=0&&b.x+b.w<=width+1&&b.y+b.h<=641,`Out-of-bounds ${b.id}`);await capture(page,`TownV10-${width}`);await click(page,'roster');await click(page,'resident:31');await click(page,'follow');assert.equal((await page.evaluate(()=>townDebug.getStats())).following,31);await page.keyboard.press('h');await page.keyboard.press('3');assert.equal((await page.evaluate(()=>townDebug.getStats())).speed,3);assert.deepEqual(errors,[]);report.cases.push({name:`width-${width}`,stats,errors,passed:true});await page.close();}
  const {page,errors}=await open(800,650,true);await click(page,'pause');const before=await page.evaluate(()=>townDebug.getStats());await page.evaluate(()=>townDebug.loadSeed('rose'));await nextFrame(page);assert.equal((await page.evaluate(()=>townDebug.getStats())).residents,32);assert.ok((await page.evaluate(()=>townDebug.getStats())).textures<=before.textures+1);assert.deepEqual(errors,[]);report.cases.push({name:'regeneration-and-missing-art',passed:true});await page.close();
  await copyFile('docs/v9-captures/TownV9-live.png',`${out}/TownV9-before.png`);
 }
 report.passed=true;
}finally{await writeFile(`${out}/review.json`,JSON.stringify(report,null,2));await browser?.close();server?.kill();}
console.log('V10 household activities, GPU portraits, object actions and phone controls passed.');
