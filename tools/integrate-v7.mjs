import {readFile,writeFile} from 'node:fs/promises';
async function edit(file,changes){let text=await readFile(file,'utf8');for(const [old,next] of changes){if(text.includes(next))continue;if(!text.includes(old))throw new Error(`V7 integration anchor missing in ${file}: ${old.slice(0,80)}`);text=text.replace(old,next);}await writeFile(file,text);}
await edit('src/home.js',[
 ["import {dressV5Home}","import {dressV7Home} from './v7-detail.js';\nimport {dressV5Home}"],
 ['  inside.traverse(m=>','  const v7Details=dressV7Home(kit,{inside,wallRoots,lot,floor});\n  inside.traverse(m=>'],
 ['polishVersion:5,rooms:','polishVersion:7,detailInstances:v7Details.instances,rooms:'],
]);
await edit('src/main.js',[
 ["import {createMediaLibrary", "import {enhanceV7Kit,createV7Atmosphere} from './v7-detail.js';\nimport {createMediaLibrary"],
 ['kit=enhanceV5Kit(enhanceV4Kit(enhanceKit(createKit())))','kit=enhanceV7Kit(enhanceV5Kit(enhanceV4Kit(enhanceKit(createKit()))))'],
 ['  let ui=null;', "  let atmosphere=createV7Atmosphere(kit,world,!matchMedia('(prefers-reduced-motion: reduce)').matches);\n  let ui=null;"],
 ['lighting.apply(value);media?.setEvening(value);','lighting.apply(value);media?.setEvening(value);atmosphere?.setEvening(value);'],
 ['createPetals(kit,world,ui?.petals??true);ui?.resetWorld();', 'createPetals(kit,world,ui?.petals??true);atmosphere=createV7Atmosphere(kit,world,ui?.petals??true);atmosphere.setEvening(evening);ui?.resetWorld();'],
 ['resetCamera();toast(`The neighborhood', 'resetCamera();choose(homeMeta());setHomeOpen(true);atmosphere.sync();toast(`The neighborhood'],
 ['setPetals:value=>world.setPetals(value),','setPetals:value=>{world.setPetals(value);atmosphere?.setEnabled(value);},'],
 ["  compositor.render(scene,camera);$('loading').hidden=true;", "  // Show the furnished central home before the first visible render.\n  if(new URL(location.href).searchParams.get('view')!=='town'){choose(homeMeta());setHomeOpen(true);}\n  updateCamera();world.home.update(camera);atmosphere.sync();\n  compositor.render(scene,camera);$('loading').hidden=true;"],
 ['version:6,mixedMedia:', 'version:7,v7DetailInstances:world.home.detailInstances,v7Atmosphere:atmosphere.info(),mixedMedia:'],
 ["    updateCamera();world.home.update(camera,paused?0:dt,world.homeActivity.doorWanted());", "    updateCamera();world.home.update(camera,paused?0:dt,world.homeActivity.doorWanted());atmosphere.sync();"],
]);
await edit('index.html',[
 ['Town V6 · JinJinJenn','Town V7 · JinJinJenn'],
 ['<small>V6</small>','<small>V7</small>'],
 ['Town V6</p>','Town V7</p>'],
 ['Town V6 mixes painted garden details with a living 3D neighborhood.', 'Town V7 opens inside Clover Cottage, with layered room details and flowering gardens around a living 3D neighborhood.'],
 ['Show drifting blossom petals.', 'Show drifting petals, garden motes, and gentle cup steam.'],
 ['title="Return to the starting view" aria-label="Reset camera"','title="See the whole neighborhood" aria-label="Show neighborhood overview"'],
 ['and R to return to the starting view.', 'and R to see the whole neighborhood. The game opens inside Clover Cottage; Visit Clover Cottage brings you back.'],
]);
for(const file of ['package.json','package-lock.json']){const data=JSON.parse(await readFile(file,'utf8'));data.version='0.7.0';if(data.packages?.[''])data.packages[''].version='0.7.0';await writeFile(file,JSON.stringify(data,null,2)+'\n');}
console.log('V7 cottage-first arrival, details, garden layers and ambient effects are integrated.');
