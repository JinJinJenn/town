import {readFile,writeFile} from 'node:fs/promises';
async function patch(path,modify){const old=await readFile(path,'utf8'),next=modify(old);if(next!==old)await writeFile(path,next);}
await patch('src/main.js',s=>{
 if(s.includes('mountIllustratedLayers'))return s;
 const replace=(a,b)=>{if(!s.includes(a))throw new Error(`Missing V6 integration anchor in main.js: ${a}`);s=s.replace(a,b);};
 replace("import {enhanceV5Kit", "import {createMediaLibrary,mountIllustratedLayers} from './v6-media.js';\nimport {enhanceV5Kit");
 replace('  let previousView=null;',`  const mediaLibrary=createMediaLibrary();let media=null;
  let illustrated=true;try{illustrated=localStorage.getItem('town.illustrated.v6')!=='0';}catch{}
  function attachMedia(){media?.dispose();media=mountIllustratedLayers(world,mediaLibrary,{enabled:illustrated,evening});}
  mediaLibrary.ready.then(attachMedia);
  $('mixed-media').checked=illustrated;
  $('mixed-media').onchange=()=>{illustrated=$('mixed-media').checked;media?.setEnabled(illustrated);save('town.illustrated.v6',illustrated?'1':'0');};
  let previousView=null;`);
 replace('    lighting.apply(value);','    lighting.apply(value);media?.setEvening(value);');
 replace('scene.remove(world.group);world.dispose();','scene.remove(world.group);media?.dispose();media=null;world.dispose();');
 replace('ui?.resetWorld();',"ui?.resetWorld();if(mediaLibrary.status!=='loading')attachMedia();");
 replace('version:5,colorStyle:',"version:6,mixedMedia:media?.info()??{status:mediaLibrary.status,cards:0,enabled:illustrated},colorStyle:");
 return s;
});
await patch('index.html',s=>{
 if(s.includes('./src/v6.css'))return s;
 s=s.replace('  <link rel="stylesheet" href="./src/v5.css">','  <link rel="stylesheet" href="./src/v5.css">\n  <link rel="stylesheet" href="./src/v6.css">');
 s=s.replaceAll('Town V5','Town V6').replace('<small>V5</small>','<small>V6</small>');
 s=s.replace('Town V6 brings brighter rose and mint colors to the gardens and cottage. Choose a furniture palette and we’ll remember it in this browser.','Town V6 mixes painted garden details with a living 3D neighborhood. Choose a cottage palette, follow a resident, or leave the camera touring the streets.');
 s=s.replace('<button id="photo"','<a class="art-nav" href="./assets/v6/">Art cards</a><button id="photo"');
 s=s.replace('    <label for="seed">',`    <p><label><input type="checkbox" id="mixed-media" checked> Show illustrated garden layers.</label> The houses, furniture, and residents remain fully 3D.</p>
    <p class="media-status"><a href="./assets/v6/">Browse the generated art cards and transparent textures.</a></p>
    <label for="seed">`);
 return s;
});
for(const file of ['package.json','package-lock.json'])await patch(file,s=>s.replaceAll('"version": "0.5.0"','"version": "0.6.0"'));
console.log('V6 illustrated gardens, particles, gallery and controls are integrated.');
