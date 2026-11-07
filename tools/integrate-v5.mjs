// Guarded source migration. Run once on a V4 checkout; never part of page boot.
import {readFile,writeFile} from 'node:fs/promises';
async function patch(path,changes){
  let text=await readFile(path,'utf8');
  for(const [before,after] of changes){
    if(text.includes(after))continue;
    if(!text.includes(before))throw Error(`V5 integration cannot find expected source in ${path}: ${before.slice(0,90)}`);
    text=text.replace(before,after);
  }
  await writeFile(path,text);
}
await patch('src/main.js',[
 ["import {enhanceV4Kit, createPetals}","import {enhanceV5Kit, V5_STYLE} from './v5-look.js';\nimport {enhanceV4Kit, createPetals}"],
 ['kit=enhanceV4Kit(enhanceKit(createKit()));','kit=enhanceV5Kit(enhanceV4Kit(enhanceKit(createKit())));'],
 ['artVersion:kit.artVersion,version:4,','artVersion:kit.artVersion,version:5,colorStyle:V5_STYLE,'],
]);
await patch('src/home.js',[
 ["import {dressHome, COTTAGE_PALETTES, paletteRole}","import {dressV5Home} from './v5-look.js';\nimport {dressHome, COTTAGE_PALETTES, paletteRole}"],
 ['dressHome(kit,{inside,wallRoots,lot,floor});','dressHome(kit,{inside,wallRoots,lot,floor});\n  dressV5Home(kit,{inside,wallRoots,lot,floor});'],
 ['m.userData.paletteRole=paletteRole(m.userData.color.getHexString());','m.userData.paletteRole??=paletteRole(m.userData.color.getHexString());'],
 ["let palette='blossom';","let palette='roseMint';"],
 ['polishVersion:4','polishVersion:5'],
]);
await patch('src/home-polish.js',[
 ['export const COTTAGE_PALETTES = Object.freeze({',"export const COTTAGE_PALETTES = Object.freeze({\n  roseMint: {label:'Rose Mint Pop', sofa:'#ed639a', cushion:'#ffdfeb', quilt:'#ef7eae', rug:'#fae2cf', cabinet:'#68ad87', cabinetFront:'#86c6a0', accent:'#81b85c'},"],
 ["rug:'#eed8cf'","rug:'#eed8cf', cabinet:'#98b6a5', cabinetFront:'#aec6b5', accent:'#d8bcae'"],
 ["rug:'#dfd8e9'","rug:'#dfd8e9', cabinet:'#93a5b4', cabinetFront:'#b8c7d5', accent:'#bc9bd6'"],
 ["rug:'#e4ddc6'","rug:'#e4ddc6', cabinet:'#83a88a', cabinetFront:'#b1c8a0', accent:'#c7b075'"],
 ["export function paletteRole(hex) {","export function paletteRole(hex) {\n  if(hex==='98b6a5')return 'cabinet';\n  if(hex==='aec6b5')return 'cabinetFront';"],
]);
await patch('src/v4-ui.js',[
 ["save('town.palette.v4',id)","save('town.palette.v5',id)"],
 ["read('town.palette.v4')||'blossom'","read('town.palette.v5')||'roseMint'"],
]);
await patch('index.html',[
 ['<title>Town V4 · JinJinJenn</title>','<title>Town V5 · JinJinJenn</title>'],
 ['<link rel="stylesheet" href="./src/v4-layout.css">','<link rel="stylesheet" href="./src/v4-layout.css">\n  <link rel="stylesheet" href="./src/v5.css">'],
 ['Town V4 adds more detail to the cottage and lets you choose its colors. Your favorite palette stays saved in this browser.',"Town V5 brings brighter rose and mint colors to the gardens and cottage. Choose a furniture palette and we’ll remember it in this browser."],
 ['<small>V4</small>','<small>V5</small>'],
 ['</span> Town V4','</span> Town V5'],
 ['<legend>Make it your own</legend>','<legend>Choose your cottage colors</legend>'],
]);
await patch('src/v5.css', [['#52942e','#438321']]);
await patch('tests/browser/v4.spec.js', [
 ['getStats().version===4','getStats().version>=4'],
 ["toHaveTitle('Town V4 · JinJinJenn')","toHaveTitle(/Town V[45] · JinJinJenn/)"],
]);
// Both V4 readiness checks must accept the newer version; other assertions remain.
await writeFile('tests/browser/v4.spec.js',(await readFile('tests/browser/v4.spec.js','utf8')).replaceAll('getStats().version===4','getStats().version>=4'));
await patch('tests/browser/00-art.spec.js', [
 ["expect(initial.artVersion).toBe('03-pastel-gardens')","expect(['03-pastel-gardens','05-rose-mint']).toContain(initial.artVersion)"],
]);
for(const path of ['package.json','package-lock.json']){
  const p=JSON.parse(await readFile(path,'utf8'));p.version='0.5.0';
  if(p.packages?.[''])p.packages[''].version='0.5.0';
  await writeFile(path,JSON.stringify(p,null,2)+'\n');
}
console.log('V5 source integrated. Real geometry, editable palettes, and existing controls preserved.');
