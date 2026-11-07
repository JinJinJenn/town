import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile,copyFile} from 'node:fs/promises';
import {spawn,execSync} from 'node:child_process';
import {setTimeout as sleep} from 'node:timers/promises';
const live=!!process.env.SITE_URL,base=process.env.SITE_URL||'http://127.0.0.1:4173/town/',out=live?'artifacts':'artifacts-v11';
await mkdir(out,{recursive:true});const server=live?null:spawn(process.execPath,['tools/serve.mjs'],{stdio:'inherit'});
const report={commit:execSync('git rev-parse HEAD').toString().trim(),live,note:'Real WebGL input and screenshots. Software Chromium is not a hardware FPS benchmark.',liveProfile:live?{width:640,height:700,speed:3,quality:'Existing phone defaults; no contact-shading pass',clock:'Natural rendered frames only; no test simulation advance'}:null,cases:[]};let browser,diagnosticPage;
try{
 for(let i=0;i<40;i++){try{if((await fetch(base)).ok)break;}catch{}if(i===39)throw new Error('Server unavailable');await sleep(250);}
 browser=await chromium.launch({args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 async function frame(p){const f=await p.evaluate(()=>townDebug.getStats().frames);await p.waitForFunction(f=>townDebug.getStats().frames>f,f);}
 async function click(p,id,touch=false){await p.waitForFunction(id=>townDebug.hud().controls.some(b=>b.id===id),id);const b=await p.evaluate(id=>townDebug.hud().controls.find(b=>b.id===id),id);if(touch)await p.touchscreen.tap(b.x+b.w/2,b.y+b.h/2);else await p.mouse.click(b.x+b.w/2,b.y+b.h/2);await frame(p);}
 async function open(width=1280,height=800,block=false){const p=await browser.newPage({viewport:{width,height},hasTouch:width<700,deviceScaleFactor:width<700?2:1}),errors=[];diagnosticPage=p;p.setDefaultTimeout(60000);p.on('pageerror',e=>errors.push(e.message));p.on('console',e=>{if(e.type()==='error'&&e.text().includes('THREE.WebGLProgram'))errors.push(e.text());});if(block)await p.route('**/assets/v6/*.webp',r=>r.abort());await p.goto(base+(live?'':'?test=1'),{waitUntil:'networkidle',timeout:60000});await p.waitForFunction(()=>window.townDebug?.getStats().frames>4,null,{timeout:90000});assert.equal((await p.evaluate(()=>townDebug.getStats())).version,11);assert.equal(await p.locator('#error').isVisible(),false);assert.equal(await p.locator('button,input,dialog,header').count(),0);return {p,errors};}
 async function ground(p,x,z,touch=false){const o=await p.evaluate(()=>townDebug.getHome().origin),point={x:o[0]+x,z:o[2]+z},screen=await p.evaluate(q=>townDebug.pointScreen(q.x,q.z),point);assert.ok(screen,'Valid projected destination');assert.ok(screen.x>0&&screen.x<p.viewportSize().width&&screen.y>0&&screen.y<p.viewportSize().height,'Ground target inside viewport');if(touch)await p.touchscreen.tap(screen.x,screen.y);else await p.mouse.click(screen.x,screen.y);await p.waitForFunction(()=>townDebug.hud().controls.some(b=>b.id==='go'));return point;}
 async function capture(p,name){await p.screenshot({path:`${out}/${name}.png`,timeout:90000});}
 const {p,errors}=await open(live?640:1280,live?700:800);const desktop={name:live?'public-mobile-quality':'desktop',initial:await p.evaluate(()=>townDebug.getStats())};report.cases.push(desktop);
 await p.keyboard.press('p');await frame(p);assert.equal((await p.evaluate(()=>townDebug.getStats())).speed,0);
 const point=await ground(p,-1.2,2.9);await capture(p,'TownV11-go-here');await click(p,'go');assert.equal((await p.evaluate(()=>townDebug.commands())).length,1);
 await ground(p,2.8,-.6);await click(p,'go');const queue=await p.evaluate(()=>townDebug.commands());assert.equal(queue.length,2);await capture(p,'TownV11-queue');
 await click(p,'cancel:'+queue[1].id);assert.equal((await p.evaluate(()=>townDebug.commands())).length,1);
 const paused=await p.evaluate(()=>townDebug.residents()[20].logicalPosition);await p.waitForTimeout(250);assert.deepEqual(await p.evaluate(()=>townDebug.residents()[20].logicalPosition),paused);
 // The application caps each rendered frame's elapsed simulation time. Slow
 // software rasterization therefore advances less simulated time per wall second.
 // Use real 3x controls and the normal lighter mobile profile for the public smoke.
 // The full local review still covers desktop shading, 1x and both phone widths.
 await click(p,live?'3':'1');
 if(!live){await p.evaluate(()=>townDebug.advanceSimulation(20));await frame(p);const a=await p.evaluate(()=>townDebug.residents()[20]);assert.ok(Math.hypot(a.logicalPosition.x-point.x,a.logicalPosition.z-point.z)<.03,'Click destination reached exactly');assert.equal(a.commands.length,0);desktop.arrived=a;}
 else {
   desktop.movement=[];const start=Date.now();let complete=false;
   while(Date.now()-start<120000){const sample=await p.evaluate(()=>{const s=townDebug.getStats();return {frames:s.frames,time:s.live.time,speed:s.speed,resident:townDebug.residents()[20],queue:townDebug.commands()};});desktop.movement.push(sample);console.log('Live movement',JSON.stringify({wallSeconds:(Date.now()-start)/1000,frames:sample.frames,time:sample.time,position:sample.resident.logicalPosition,route:sample.resident.routeLength,queue:sample.queue.length}));if(sample.queue.length===0){complete=true;desktop.arrived=sample.resident;break;}await sleep(2000);}
   assert.ok(complete,'Live command did not finish; inspect movement samples');assert.ok(Math.hypot(desktop.arrived.logicalPosition.x-point.x,desktop.arrived.logicalPosition.z-point.z)<.03,'Natural live movement reached the actual clicked point');
 }
 await p.keyboard.press('p');await frame(p);await capture(p,'TownV11-arrived');
 const table=await p.evaluate(()=>townDebug.objectScreen('drink'));await p.mouse.click(table.x,table.y);await click(p,'drink');assert.equal((await p.evaluate(()=>townDebug.commands()))[0].kind,'drink');
 if(!live){await click(p,'1');let drank=false;for(let i=0;i<20;i++){await p.evaluate(()=>townDebug.advanceSimulation(5));if(await p.evaluate(()=>townDebug.residents()[20].state==='having a drink')){drank=true;break;}}assert.ok(drank,'Player-queued furniture action executes');await p.keyboard.press('p');await frame(p);}
 await p.keyboard.press('x');await frame(p);assert.equal((await p.evaluate(()=>townDebug.commands())).length,0);
 const selected=await p.evaluate(()=>townDebug.selected());await p.keyboard.press('Space');await frame(p);assert.equal(await p.evaluate(()=>townDebug.selected()),(selected+1)%32);assert.equal((await p.evaluate(()=>townDebug.getStats())).speed,0);
 await click(p,'roster');await click(p,'resident:20');
 await ground(p,-1.2,2.9);await p.keyboard.press('Escape');await frame(p);assert.equal((await p.evaluate(()=>townDebug.hud())).context,null);
 assert.deepEqual(errors,[]);desktop.final=await p.evaluate(()=>townDebug.getStats());desktop.passed=true;await p.close();
 if(!live){
  for(const width of [390,320]){const {p,errors}=await open(width,700);await click(p,'pause',true);await ground(p,-1.2,2.9,true);await click(p,'go',true);const q=await p.evaluate(()=>townDebug.commands());assert.equal(q.length,1);await capture(p,`TownV11-${width}`);for(const b of await p.evaluate(()=>townDebug.hud().controls))assert.ok(b.x>=0&&b.y>=0&&b.x+b.w<=width+1&&b.y+b.h<=701,`Bounds ${b.id}`);await click(p,'cancel:'+q[0].id,true);assert.equal((await p.evaluate(()=>townDebug.commands())).length,0);assert.deepEqual(errors,[]);report.cases.push({name:`touch-${width}`,stats:await p.evaluate(()=>townDebug.getStats()),passed:true});await p.close();}
  const {p,errors}=await open(820,700,true);await p.keyboard.press('p');await frame(p);await ground(p,-1.2,2.9);await click(p,'go');await p.evaluate(()=>townDebug.loadSeed('clover-v11'));await frame(p);assert.equal((await p.evaluate(()=>townDebug.commands())).length,0);assert.equal((await p.evaluate(()=>townDebug.getStats())).residents,32);assert.deepEqual(errors,[]);report.cases.push({name:'regeneration-missing-art',passed:true});await p.close();
  await copyFile('docs/v10-captures/TownV10-household.png',`${out}/TownV10-before.png`);
 }
 report.passed=true;
}catch(error){report.error=error.stack;try{if(diagnosticPage&&!diagnosticPage.isClosed())report.failure=await diagnosticPage.evaluate(()=>({stats:window.townDebug?.getStats(),resident:window.townDebug?.residents()[20],queue:window.townDebug?.commands()}));}catch{}throw error;
}finally{await writeFile(`${out}/review.json`,JSON.stringify(report,null,2));await browser?.close();server?.kill();}
console.log('V11 actual Go here clicks, cancellable GPU queue, player priority and touch controls passed.');
