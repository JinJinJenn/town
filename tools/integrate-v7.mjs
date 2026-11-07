import {readFile,writeFile} from 'node:fs/promises';
async function patch(path,steps){let text=await readFile(path,'utf8');for(const [before,after] of steps){if(text.includes(after))continue;if(!text.includes(before))throw new Error(`V7 integration guard: ${path}: ${before.slice(0,90)}`);text=text.replace(before,after);}await writeFile(path,text);}
await patch('src/main.js',[
 ["from './v6-media.js';","from './v7-media.js';\nimport {optimizeV7Kit} from './v7-polish.js';"],
 ["kit=enhanceV5Kit(enhanceV4Kit(enhanceKit(createKit())));","kit=optimizeV7Kit(enhanceV5Kit(enhanceV4Kit(enhanceKit(createKit()))));"],
 ["let seed=cleanSeed(","renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;let lastShadow=0,lastWallMask='';\n  let seed=cleanSeed("],
 ["innerWidth<700?1.25:1.5","innerWidth<700?1:1.5"],
 ["lighting.apply(value);media?.setEvening(value);","lighting.apply(value);media?.setEvening(value);renderer.shadowMap.needsUpdate=true;"],
 ["resetCamera();toast(`The neighborhood is ready. Its seed is ${seed}.`);","resetCamera();choose(homeMeta());setHomeOpen(true);renderer.shadowMap.needsUpdate=true;toast(`The neighborhood is ready. Its seed is ${seed}.`);"],
 ["$('soft-rendering').checked=compositor.supported&&load('town.softRendering.v1')!=='0';","$('soft-rendering').checked=compositor.supported&&(load('town.softRendering.v1')===null?innerWidth>=700:load('town.softRendering.v1')!=='0');"],
 ["if(frames%8===0)syncHomeUI();compositor.render(scene,camera);","if(frames%8===0)syncHomeUI();\n    const wallMask=String(world.home.isOpen)+Object.values(world.home.visibleWalls()).join('');\n    if(wallMask!==lastWallMask||(!paused&&now-lastShadow>=100)){renderer.shadowMap.needsUpdate=true;lastShadow=now;lastWallMask=wallMask;}\n    compositor.render(scene,camera);"],
 ["  compositor.render(scene,camera);$('loading').hidden=true;","  choose(homeMeta());setHomeOpen(true);updateCamera();world.home.update(camera);\n  compositor.render(scene,camera);$('loading').hidden=true;"],
 ["version:6,mixedMedia:","version:7,shadowRefreshHz:10,pixelRatio:renderer.getPixelRatio(),mixedMedia:"]
]);
await patch('src/home.js',[
 ["import {dressV5Home}","import {dressV7Home} from './v7-polish.js';\nimport {dressV5Home}"],
 ["  dressV5Home(kit,{inside,wallRoots,lot,floor});","  dressV5Home(kit,{inside,wallRoots,lot,floor});\n  if(kit.artVersion==='07-cottage-detail')dressV7Home(kit,{inside,wallRoots,lot,floor});"]
]);
let html=await readFile('index.html','utf8');html=html.replaceAll('Town V6','Town V7').replace('<small>V6</small>','<small>V7</small>').replace('title="Return to the starting view"','title="View the neighborhood"');await writeFile('index.html',html);
for(const path of ['package.json','package-lock.json']){const p=JSON.parse(await readFile(path,'utf8'));p.version='0.7.0';if(p.packages?.[''])p.packages[''].version='0.7.0';await writeFile(path,JSON.stringify(p,null,2)+'\n');}
console.log('V7 source integrated. No runtime dependencies or generated-image replacement for gameplay.');
