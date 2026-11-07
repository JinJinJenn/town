// One-time, checked source migration used by the V4 review workflow.
// The workflow commits the resulting application files; this is not run in browsers.
import {readFile,writeFile} from 'node:fs/promises';
function change(text,from,to){
  if(text.split(from).length!==2)throw new Error(`Expected exactly one source anchor: ${from.slice(0,90)}`);
  return text.replace(from,to);
}
let main=await readFile('src/main.js','utf8');
if(!main.includes("import {mountV4UI}")){
  main="import {enhanceV4Kit, createPetals} from './v4-world.js';\nimport {mountV4UI} from './v4-ui.js';\n"+main;
  main=change(main,'kit=enhanceKit(createKit())','kit=enhanceV4Kit(enhanceKit(createKit()))');
  main=change(main,'scene.add(world.group);\n  let viewHeight',"scene.add(world.group);createPetals(kit,world,!matchMedia('(prefers-reduced-motion: reduce)').matches);\n  let ui=null;\n  let viewHeight");
  main=change(main,'const isHome=selected?.lot?.furnished===true;','const isHome=selected?.lot?.furnished===true;\n    ui?.syncSelection(isHome);');
  main=change(main,'if(innerWidth<700){target.x+=Math.sin(yaw)*4.8;target.z+=Math.cos(yaw)*4.8;}','if(innerWidth<700){target.x+=Math.sin(yaw)*4.8;target.z+=Math.cos(yaw)*4.8;}\n      else{const offset=2.2;target.x+=Math.cos(yaw)*offset;target.z-=Math.sin(yaw)*offset;}');
  main=change(main,"scene.add(world.group);\n    $('resident-count')","scene.add(world.group);createPetals(kit,world,ui?.petals??true);ui?.resetWorld();\n    $('resident-count')");
  main=change(main,"  canvas.addEventListener('contextmenu'",`  ui=mountV4UI({
    residents:()=>world.residents,home:()=>world.home,clearKeys:()=>keys.clear(),
    setPetals:value=>world.setPetals(value),
    followResident:index=>{setHomeOpen(false);choose(world.residents[index].meta);following=index;$('follow').textContent='Stop following';target.copy(world.residents[index].root.position);target.y=0;},
  });
  canvas.addEventListener('contextmenu' `);
  main=change(main,"e.target.closest('input,button,a,dialog')||$('help-dialog').open","e.target.closest('input,button,a,dialog')||document.querySelector('dialog[open]')");
  main=change(main,'artVersion:kit.artVersion,','artVersion:kit.artVersion,version:4,palette:world.home.palette,photoMode:ui?.photo,');
  await writeFile('src/main.js',main);
}
let home=await readFile('src/home.js','utf8');
if(!home.includes("from './home-polish.js'")){
  home=change(home,'import {FLOOR_Y',"import {dressHome, COTTAGE_PALETTES, paletteRole} from './home-polish.js';\nimport {FLOOR_Y");
  home=change(home,'  source.updateMatrixWorld(true);','  dressHome(kit,{inside,wallRoots,lot,floor});\n  inside.traverse(m=>{if(m.userData.part)m.userData.paletteRole=paletteRole(m.userData.color.getHexString());});\n  source.updateMatrixWorld(true);');
  home=change(home,'  setOpen(false);',`  let palette='blossom';
  function setPalette(value){
    if(!Object.hasOwn(COTTAGE_PALETTES,value))return false;
    palette=value;const colors=COTTAGE_PALETTES[value];
    for(const {mesh,sources} of batches.inside.batches){
      let changed=false;
      sources.forEach((m,i)=>{const role=m.userData.paletteRole;if(role){m.userData.color.set(colors[role]);mesh.setColorAt(i,m.userData.color);changed=true;}});
      if(changed&&mesh.instanceColor)mesh.instanceColor.needsUpdate=true;
    }
    return true;
  }
  setPalette(palette);setOpen(false);`);
  home=change(home,'return {group:model,origin,lot,rooms:ROOMS',"return {group:model,origin,lot,setPalette,get palette(){return palette;},polishVersion:4,rooms:ROOMS");
  await writeFile('src/home.js',home);
}
for(const path of ['package.json','package-lock.json']){
  const text=await readFile(path,'utf8');await writeFile(path,text.replaceAll('"0.3.0"','"0.4.0"'));
}
let pages=await readFile('.github/workflows/pages.yml','utf8');
if(!pages.includes("- '*.css'"))pages=change(pages,"- 'style.css'","- '*.css'");
if(pages.includes('cp index.html style.css _site/'))pages=change(pages,'cp index.html style.css _site/','cp index.html *.css _site/');
if(!pages.includes('assert.equal(initial.version, 4);'))pages=change(pages,'assert.equal(initial.lots, 16);','assert.equal(initial.lots, 16);\n            assert.equal(initial.version, 4);');
await writeFile('.github/workflows/pages.yml',pages);
console.log('V4 application sources integrated. Run syntax, unit, and browser checks before release.');
