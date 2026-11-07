import {readFile,writeFile} from 'node:fs/promises';
async function edit(path,pairs){let s=await readFile(path,'utf8');for(const [a,b] of pairs){if(s.includes(b))continue;if(!s.includes(a))throw new Error(`Combined V7 anchor missing in ${path}: ${a.slice(0,80)}`);s=s.replace(a,b);}await writeFile(path,s);}
await edit('src/v7-detail.js',[["kit.artVersion='07-lived-in-cottage';","kit.detailVersion='07-lived-in-cottage';"]]);
await edit('src/main.js',[
 ["import {optimizeV7Kit}","import {enhanceV7Kit,createV7Atmosphere} from './v7-detail.js';\nimport {optimizeV7Kit}"],
 ["kit=optimizeV7Kit(enhanceV5Kit(enhanceV4Kit(enhanceKit(createKit()))))","kit=enhanceV7Kit(optimizeV7Kit(enhanceV5Kit(enhanceV4Kit(enhanceKit(createKit())))))"],
 ["  let ui=null;","  let atmosphere=createV7Atmosphere(kit,world,!matchMedia('(prefers-reduced-motion: reduce)').matches);\n  let ui=null;"],
 ['lighting.apply(value);media?.setEvening(value);renderer.shadowMap.needsUpdate=true;','lighting.apply(value);media?.setEvening(value);atmosphere?.setEvening(value);renderer.shadowMap.needsUpdate=true;'],
 ['createPetals(kit,world,ui?.petals??true);ui?.resetWorld();','createPetals(kit,world,ui?.petals??true);atmosphere=createV7Atmosphere(kit,world,ui?.petals??true);atmosphere.setEvening(evening);ui?.resetWorld();'],
 ['resetCamera();choose(homeMeta());setHomeOpen(true);renderer.shadowMap.needsUpdate=true;','resetCamera();choose(homeMeta());setHomeOpen(true);atmosphere.sync();renderer.shadowMap.needsUpdate=true;'],
 ['setPetals:value=>world.setPetals(value),','setPetals:value=>{world.setPetals(value);atmosphere?.setEnabled(value);},'],
 ['world.home.update(camera,paused?0:dt,world.homeActivity.doorWanted());if(frames%8','world.home.update(camera,paused?0:dt,world.homeActivity.doorWanted());atmosphere.sync();if(frames%8'],
 ['  choose(homeMeta());setHomeOpen(true);updateCamera();world.home.update(camera);',"  if(new URL(location.href).searchParams.get('view')!=='town'){choose(homeMeta());setHomeOpen(true);}\n  updateCamera();world.home.update(camera);atmosphere.sync();"],
 ['version:7,shadowRefreshHz:10,','version:7,detailVersion:kit.detailVersion,v7DetailInstances:world.home.detailInstances,v7Atmosphere:atmosphere.info(),shadowRefreshHz:10,'],
]);
await edit('src/home.js',[
 ["import {dressV7Home} from './v7-polish.js';","import {dressV7Home} from './v7-polish.js';\nimport {dressV7Home as dressV7LayeredHome} from './v7-detail.js';"],
 ['  inside.traverse(m=>','  const v7Details=dressV7LayeredHome(kit,{inside,wallRoots,lot,floor});\n  inside.traverse(m=>'],
 ['polishVersion:5,rooms:','polishVersion:7,detailInstances:v7Details.instances,rooms:'],
]);
await edit('index.html',[
 ['Show drifting blossom petals.', 'Show drifting petals, garden motes, and gentle cup steam.'],
 ['title="View the neighborhood" aria-label="Reset camera"','title="See the whole neighborhood" aria-label="Show neighborhood overview"'],
 ['and R to return to the starting view.', 'and R to see the whole neighborhood. The game opens inside Clover Cottage; Visit Clover Cottage brings you back.'],
]);
console.log('Combined V7 preserves the atlas, geometry and shadow optimizations and adds layered details and ambient motion.');
