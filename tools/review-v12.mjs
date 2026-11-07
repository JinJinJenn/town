import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';

const port=4173,server=spawn(process.execPath,['tools/serve.mjs'],{stdio:'inherit',env:{...process.env,PORT:String(port)}});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
try{
  await sleep(900);
  await mkdir('artifacts-v12',{recursive:true});
  const browser=await chromium.launch({args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const page=await browser.newPage({viewport:{width:1280,height:800},deviceScaleFactor:1});
  let stage='boot';const errors=[],warnings=[];page.on('pageerror',e=>errors.push({stage,text:e.message}));page.on('console',m=>{if(m.type()!=='error')return;const item={stage,text:m.text()};if(item.text.includes('BufferGeometry.computeBoundingSphere(): Computed radius is NaN'))warnings.push(item);else errors.push(item);});
  await page.goto('http://127.0.0.1:4173/town/?test=1',{waitUntil:'networkidle',timeout:60000});
  await page.waitForFunction(()=>window.townDebug?.getStats().version===12&&window.townDebug.getStats().frames>3,null,{timeout:90000});
  const bootGeometry=await page.evaluate(()=>window.townDebug.geometryIssues());if(bootGeometry.length)console.error('V12 boot geometry issues',JSON.stringify(bootGeometry));
  stage='seat-context';const seat=await page.evaluate(()=>window.townDebug.seatScreen('home-lounger'));assert.ok(seat);
  await page.mouse.click(seat.x,seat.y);
  await page.waitForFunction(()=>window.townDebug.hud().context?.kind==='seat',null,{timeout:15000});
  await page.waitForFunction(()=>window.townDebug.hud().controls.some(c=>c.id==='seat'),null,{timeout:15000});
  const sit=await page.evaluate(()=>window.townDebug.hud().controls.find(c=>c.id==='seat'));assert.ok(sit);
  await page.mouse.click(sit.x+sit.w/2,sit.y+sit.h/2);
  stage='seat-sim';await page.evaluate(()=>window.townDebug.advanceSimulation(45));
  await page.waitForFunction(()=>window.townDebug.residents()[window.townDebug.selected()].state==='sitting',null,{timeout:15000});
  const seated=await page.evaluate(()=>window.townDebug.getStats().live.seated);assert.ok(seated>=1);
  const finiteSeat=await page.evaluate(()=>window.townDebug.residents().filter(r=>!r.position.every(Number.isFinite)));assert.deepEqual(finiteSeat,[]);stage='seat-shot';await page.screenshot({path:'artifacts-v12/TownV12-seat.png'});
  stage='group-sim';await page.evaluate(()=>{window.townDebug.action('select-target',{targetIndex:20});window.townDebug.action('chat-target',{targetIndex:6});window.townDebug.advanceSimulation(45);window.townDebug.action('select-target',{targetIndex:7});window.townDebug.action('chat-target',{targetIndex:6});window.townDebug.advanceSimulation(45);});
  const stats=await page.evaluate(()=>window.townDebug.getStats().live);assert.ok(stats.maxGroup>=3,JSON.stringify(stats));
  const finiteGroup=await page.evaluate(()=>({residents:window.townDebug.residents().filter(r=>!r.position.every(Number.isFinite)),controls:window.townDebug.hud().controls.filter(c=>![c.x,c.y,c.w,c.h].every(Number.isFinite))}));assert.deepEqual(finiteGroup,{residents:[],controls:[]});stage='group-shot';await page.screenshot({path:'artifacts-v12/TownV12-group.png'});
  if(warnings.length)console.log('V12 recorded pre-existing-style Three warning',JSON.stringify(warnings));if(errors.length)console.error('V12 staged console errors',JSON.stringify(errors));assert.deepEqual(errors,[]);
  await writeFile('artifacts-v12/review.json',JSON.stringify({stats,warnings,verifiedAt:new Date().toISOString()},null,2));
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(500);await page.screenshot({path:'artifacts-v12/TownV12-phone.png'});
  await browser.close();
  console.log('V12 browser review passed: real outdoor Sit context and 3+ Sim group conversation.');
}finally{server.kill('SIGTERM');}
